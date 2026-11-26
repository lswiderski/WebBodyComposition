// Web Bluetooth client for the Vitafit VT7018 scale ("Vitafit Body Fat").
// Protocol used by the scale:
//   scale -> host (notify FFF1): 5A LEN TOKEN CMD DATA... XOR AA
//   host -> scale (write  FFF2): A5 LEN TOKEN CMD DATA... XOR AA
//   LEN = bytes between header and AA (LEN..XOR); XOR = xor from LEN to the last data byte.
//   0x33 handshake (sets TOKEN), 0x10 weight, 0x11 impedance, 0x15 body metrics (sent empty).

const DEVICE_NAME = 'Vitafit Body Fat';
// The scale advertises its name with a non-printable character in front (shown as "□Vitafit Body Fat" by Bluefy),
// so a { name } or { namePrefix } filter never matches; its advertisement has no service UUIDs either.
// Ask for any device and check the name after the user picks one.
export const isVitafitName = (name) => (name ?? '').includes(DEVICE_NAME);
// Full 128-bit UUIDs, the most portable form (instead of the 16-bit integer aliases like 0xfff0).
const SERVICE = '0000fff0-0000-1000-8000-00805f9b34fb';
const NOTIFY_CHAR = '0000fff1-0000-1000-8000-00805f9b34fb';
const WRITE_CHAR = '0000fff2-0000-1000-8000-00805f9b34fb';

const CMD_WEIGHT = 0x10;
const CMD_IMPEDANCE = 0x11;
const CMD_RESULT = 0x15;
const CMD_HANDSHAKE = 0x33;
const TOKEN = 0x26;
// The app sends this (zeroed metrics) after the first impedance frame; without it the scale may drop the link.
const RESULT_EMPTY = [0x01, 0, 0, 0, 0, 0, 0, 0, 0, 0x40, 0xdc];

const ST_MEASURING = 0x01;
const ST_STABLE = 0x02;

const xor = (bytes) => bytes.reduce((a, b) => a ^ b, 0);

function build(token, cmd, payload = []) {
    const body = [payload.length + 4, token, cmd, ...payload];
    return new Uint8Array([0xa5, ...body, xor(body), 0xaa]);
}

// Extracts complete 5A..AA frames from buf (array of numbers, mutated); returns [{token, cmd, payload}].
function splitFrames(buf) {
    const out = [];
    for (;;) {
        const start = buf.indexOf(0x5a);
        if (start < 0) { buf.length = 0; break; }
        buf.splice(0, start);
        if (buf.length < 2) break;
        const total = buf[1] + 2;
        if (buf.length < total) break;
        const frame = buf.splice(0, total);
        if (frame[total - 1] !== 0xaa || frame[1] < 4 || xor(frame.slice(1, -2)) !== frame[total - 2]) continue;
        out.push({ token: frame[2], cmd: frame[3], payload: frame.slice(4, -2) });
    }
    return out;
}

const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(' ');

const errorText = (e) => e?.message ?? String(e);

// Reconnecting to a known scale can hang while it is asleep (iOS waits for the device indefinitely).
const KNOWN_DEVICE_TIMEOUT_MS = 8000;
// After a failed reconnection, the next attempt goes straight to the device list.
let skipKnownDevice = false;

// getDevices() returns the devices this site was already allowed to use (Bluefy can remember them),
// so the scale can be reconnected without the device list. Not every browser has it.
async function findKnownScale(onStatus) {
    if (skipKnownDevice || typeof navigator.bluetooth.getDevices !== 'function') return null;
    try {
        const devices = await navigator.bluetooth.getDevices();
        return devices.find((d) => isVitafitName(d.name)) ?? null;
    } catch (e) {
        onStatus(`getDevices failed: ${errorText(e)}`);
        return null;
    }
}

function connectWithTimeout(device, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
            device.gatt.disconnect();
            reject(new Error(`no answer in ${ms / 1000} s`));
        }, ms);
    });
    return Promise.race([device.gatt.connect(), timeout]).finally(() => clearTimeout(timer));
}

// Returns {device, server}: the known scale if it answers, otherwise the one picked in the device list.
async function connectScale(onStatus) {
    const known = await findKnownScale(onStatus);
    if (known) {
        onStatus('Connecting to the known scale...');
        try {
            return { device: known, server: await connectWithTimeout(known, KNOWN_DEVICE_TIMEOUT_MS) };
        } catch (e) {
            skipKnownDevice = true;
            onStatus(`Could not reconnect (${errorText(e)}), opening the device list`);
        }
    }

    onStatus('Requesting Bluetooth device...');
    const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SERVICE],
    });
    if (!isVitafitName(device.name)) {
        throw new Error(`"${device.name ?? 'unnamed device'}" is not the scale: pick "${DEVICE_NAME}" in the list`);
    }
    onStatus('Connecting...');
    const server = await device.gatt.connect();
    skipKnownDevice = false;
    return { device, server };
}

// Connects, waits for a weighing and resolves with {weight, impedance} (impedance null if not measured,
// e.g. with socks). onStatus(text) receives progress messages and the raw frames.
export async function readVitafit({ onStatus = () => {}, timeoutMs = 90000 } = {}) {
    const { device, server } = await connectScale(onStatus);
    const service = await server.getPrimaryService(SERVICE);
    const notifyChar = await service.getCharacteristic(NOTIFY_CHAR);
    const writeChar = await service.getCharacteristic(WRITE_CHAR);

    // GATT operations must not overlap: queue the writes.
    let queue = Promise.resolve();
    const send = (frame) => {
        queue = queue.then(() => {
            onStatus(`TX ${hex(frame)}`);
            return writeChar.writeValueWithResponse ? writeChar.writeValueWithResponse(frame) : writeChar.writeValue(frame);
        }).catch((e) => onStatus(`Write error: ${e}`));
    };

    return new Promise((resolve, reject) => {
        const buf = [];
        let token = 0x00; // the scale uses 00 until the handshake
        let handshakeSent = false;
        let resultSent = false;
        let live = false; // a live (status 01) or fresh impedance frame was seen in this connection
        let weight = null;
        let impedance = null;
        let done = false;

        const finish = (err) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            notifyChar.removeEventListener('characteristicvaluechanged', onData);
            device.removeEventListener('gattserverdisconnected', onDisconnect);
            queue.then(() => { if (device.gatt.connected) device.gatt.disconnect(); });
            if (err) reject(err);
            else if (weight === null) reject(new Error('No weighing received (did you step on the scale?)'));
            else resolve({ weight, impedance });
        };

        const onDisconnect = () => { onStatus('Scale disconnected'); finish(); };
        const timer = setTimeout(() => finish(), timeoutMs);

        const onData = (event) => {
            const value = new Uint8Array(event.target.value.buffer);
            onStatus(`RX ${hex(value)}`);
            buf.push(...value);
            for (const { cmd, payload } of splitFrames(buf)) {
                if (cmd === CMD_WEIGHT && payload.length >= 6) {
                    const status = payload[0];
                    const decimals = (payload[3] >> 4) & 0x0f;
                    const w = ((payload[4] << 8) | payload[5]) / 10 ** decimals;
                    if (status === ST_MEASURING) live = true;
                    // the cached weight of a previous session arrives with impedance FFFF: only trust it if live
                    if (status === ST_STABLE && (live || impedance !== null)) weight = w;
                    onStatus(`Weight ${w.toFixed(2)} kg (status ${status})`);
                    send(build(token, CMD_WEIGHT, [status]));
                } else if (cmd === CMD_IMPEDANCE && payload.length >= 7) {
                    const z = (payload[5] << 8) | payload[6];
                    send(build(token, CMD_IMPEDANCE, [payload[2]]));
                    if (handshakeSent && !resultSent) {
                        send(build(token, CMD_RESULT, RESULT_EMPTY));
                        resultSent = true;
                    }
                    if (z !== 0xffff) {
                        impedance = z;
                        live = true;
                        onStatus(`Impedance ${z}`);
                    }
                }
                if (!handshakeSent) {
                    send(build(TOKEN, CMD_HANDSHAKE, [0x00]));
                    token = TOKEN;
                    handshakeSent = true;
                }
                if (weight !== null && impedance !== null) {
                    // a stable weight after a real impedance is final
                    finish();
                    return;
                }
            }
        };

        device.addEventListener('gattserverdisconnected', onDisconnect);
        notifyChar.addEventListener('characteristicvaluechanged', onData);
        notifyChar.startNotifications()
            .then(() => onStatus('Listening... step on the scale barefoot'))
            .catch(finish);
    });
}
