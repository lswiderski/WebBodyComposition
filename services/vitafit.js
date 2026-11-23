// Web Bluetooth client for the Vitafit VT7018 scale ("Vitafit Body Fat").
// Protocol used by the scale:
//   scale -> host (notify FFF1): 5A LEN TOKEN CMD DATA... XOR AA
//   host -> scale (write  FFF2): A5 LEN TOKEN CMD DATA... XOR AA
//   LEN = bytes between header and AA (LEN..XOR); XOR = xor from LEN to the last data byte.
//   0x33 handshake (sets TOKEN), 0x10 weight, 0x11 impedance, 0x15 body metrics (sent empty).

const DEVICE_NAME = 'Vitafit Body Fat';
const SERVICE = 0xfff0;
const NOTIFY_CHAR = 0xfff1;
const WRITE_CHAR = 0xfff2;

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

// Connects, waits for a weighing and resolves with {weight, impedance} (impedance null if not measured,
// e.g. with socks). onStatus(text) receives progress messages and the raw frames.
export async function readVitafit({ onStatus = () => {}, timeoutMs = 90000 } = {}) {
    onStatus('Requesting Bluetooth device...');
    const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: DEVICE_NAME }],
        optionalServices: [SERVICE],
    });

    onStatus('Connecting...');
    const server = await device.gatt.connect();
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
