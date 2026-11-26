// Replays the frames captured from the real scale on 2026-11-23 (vitafit_reader.py, captura2.log)
// against a fake Web Bluetooth device. Run with: node --test services/vitafit.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readVitafit, isVitafitName } from './vitafit.js';

const bytes = (s) => new Uint8Array(s.split(' ').map((h) => parseInt(h, 16)));

const RX = [
    '5a 0a 00 10 02 00 00 21 1a d6 f5 aa',     // cached/initial weight, token 00
    '5a 04 26 33 11 aa',                       // handshake reply
    '5a 0a 26 10 02 00 00 21 1a d6 d3 aa',     // stable 68.70 kg
    '5a 0a 26 10 02 00 00 21 1a d6 d3 aa',
    '5a 0b 26 11 00 00 00 ff ff 01 e7 da aa',  // impedance 0x01e7 = 487
    '5a 0a 26 10 02 00 00 21 1a d6 d3 aa',     // stable weight after the impedance
];

function fakeBluetooth(rxFrames, name = '\u0001Vitafit Body Fat') {
    const written = [];
    const listeners = {};
    const notifyChar = {
        addEventListener: (t, f) => { listeners[t] = f; },
        removeEventListener: () => {},
        startNotifications: async () => {
            // deliver the frames asynchronously, one per tick
            for (const f of rxFrames) {
                await new Promise((r) => setTimeout(r, 1));
                listeners.characteristicvaluechanged?.({ target: { value: { buffer: bytes(f).buffer } } });
            }
        },
    };
    const writeChar = { writeValueWithResponse: async (v) => { written.push(Array.from(v, (b) => b.toString(16).padStart(2, '0')).join(' ')); } };
    const device = {
        name,
        gatt: {
            connected: true,
            connect: async () => ({ getPrimaryService: async () => ({ getCharacteristic: async (u) => (u === '0000fff1-0000-1000-8000-00805f9b34fb' ? notifyChar : writeChar) }) }),
            disconnect() { this.connected = false; },
        },
        addEventListener: () => {},
        removeEventListener: () => {},
    };
    Object.defineProperty(globalThis, 'navigator', { value: { bluetooth: { requestDevice: async () => device } }, configurable: true });
    return written;
}

test('replay of a real weighing gives weight + impedance and the same TX as the Python reader', async () => {
    const written = fakeBluetooth(RX);
    const result = await readVitafit({ timeoutMs: 2000 });
    assert.deepEqual(result, { weight: 68.7, impedance: 487 });
    await new Promise((r) => setTimeout(r, 10)); // let the write queue drain
    assert.deepEqual(written.slice(0, 2), ['a5 05 00 10 02 17 aa', 'a5 05 26 33 00 10 aa']);
    assert.ok(written.includes('a5 05 26 10 02 31 aa'));
    assert.ok(written.includes('a5 05 26 11 00 32 aa'));
    assert.ok(written.includes('a5 0f 26 15 01 00 00 00 00 00 00 00 00 40 dc a1 aa'));
});

test('a weighing without impedance (socks) resolves with impedance null on timeout', async () => {
    fakeBluetooth(['5a 0a 26 10 01 00 00 21 1a d6 d0 aa', '5a 0a 26 10 02 00 00 21 1a d6 d3 aa']);
    const result = await readVitafit({ timeoutMs: 100 });
    assert.deepEqual(result, { weight: 68.7, impedance: null });
});

test('the scale name is recognised despite the non-printable character in front', () => {
    assert.ok(isVitafitName('Vitafit Body Fat'));
    assert.ok(isVitafitName('\u0001Vitafit Body Fat'));
    assert.ok(!isVitafitName('Fridge'));
    assert.ok(!isVitafitName(undefined));
});

test('picking another device in the list rejects without connecting', async () => {
    fakeBluetooth([], 'Fridge');
    await assert.rejects(readVitafit({ timeoutMs: 100 }), /"Fridge" is not the scale/);
});

test('a scale the site already knows is reconnected without opening the device list', async () => {
    fakeBluetooth(RX);
    const device = await navigator.bluetooth.requestDevice();
    let listOpened = false;
    navigator.bluetooth.requestDevice = async () => { listOpened = true; return device; };
    navigator.bluetooth.getDevices = async () => [{ name: 'Fridge' }, device];
    const result = await readVitafit({ timeoutMs: 2000 });
    assert.deepEqual(result, { weight: 68.7, impedance: 487 });
    assert.equal(listOpened, false);
});

test('if the known scale does not answer, the device list is opened', async () => {
    fakeBluetooth(RX);
    const device = await navigator.bluetooth.requestDevice();
    const asleep = { name: device.name, gatt: { connect: async () => { throw new Error('not in range'); }, disconnect() {} } };
    let listOpened = false;
    navigator.bluetooth.requestDevice = async () => { listOpened = true; return device; };
    navigator.bluetooth.getDevices = async () => [asleep];
    const status = [];
    const result = await readVitafit({ timeoutMs: 2000, onStatus: (s) => status.push(s) });
    assert.deepEqual(result, { weight: 68.7, impedance: 487 });
    assert.ok(listOpened);
    assert.ok(status.includes('Could not reconnect (not in range), opening the device list'));
});
