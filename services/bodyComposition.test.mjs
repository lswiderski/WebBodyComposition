// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeBodyComposition, checkInput } from './bodyComposition.js';

const round1 = (x) => Math.round(x * 10) / 10;

// Reference: Vitafit app, 2026-11-23 11:35:49, male athlete 176 cm / 46 years, 68.95 kg.
// The impedance was not visible in the app; the reader measured 487 and 507 that morning.
for (const impedance of [487, 507]) {
    test(`male athlete matches the Vitafit app (impedance ${impedance})`, () => {
        const r = computeBodyComposition({ height: 176, weight: 68.95, age: 46, impedance, sex: 'male', athlete: true });
        assert.equal(round1(r.bmi), 22.3);
        assert.equal(round1(r.fatPercentage), 12.5);
        assert.equal(Math.round(r.boneKg * 100) / 100, 3.17);
        assert.equal(round1(r.musclePercentage), 82.9);
        assert.equal(round1(r.waterPercentage), 54.6);
        assert.equal(round1(r.proteinPercentage), 28.3);
        assert.ok(Math.abs(r.bmr - 1724) <= 1, `bmr ${r.bmr}`);
        assert.equal(r.metabolicAge, 37);
        assert.equal(r.visceralFat, 7);
    });
}

test('male (non athlete) matches the hand-checked values', () => {
    const r = computeBodyComposition({ height: 176, weight: 68.7, age: 46, impedance: 487, sex: 'male' });
    assert.equal(round1(r.fatPercentage), 19.1);
    assert.equal(round1(r.waterPercentage), 54.7);
    assert.equal(r.bmr, 1495);
    assert.equal(r.visceralFat, 8);
    assert.equal(r.metabolicAge, 43);
});

test('input check rejects impedance outside 200-1200', () => {
    assert.match(checkInput({ height: 176, weight: 68, age: 46, impedance: 0 }), /impedance/);
    assert.equal(checkInput({ height: 176, weight: 68, age: 46, impedance: 487 }), null);
});

// Reference: Vitafit app, 2026-11-23, female athlete 160 cm / 46 years, 60.55 kg. The impedance was not
// measured: every app value matches for impedances 580-587, so the middle of that range is used.
test('female athlete matches the Vitafit app (impedance inferred)', () => {
    const r = computeBodyComposition({ height: 160, weight: 60.55, age: 46, impedance: 583, sex: 'female', athlete: true });
    assert.equal(round1(r.bmi), 23.7);
    assert.equal(round1(r.fatPercentage), 28.2);
    assert.equal(Math.round(r.boneKg * 100) / 100, 2.8);
    assert.equal(round1(r.musclePercentage), 67.2);
    assert.equal(round1(r.waterPercentage), 50.1);
    assert.equal(round1(r.proteinPercentage), 17.1);
    assert.equal(r.bmr, 1321);
    assert.equal(r.visceralFat, 6);
    assert.equal(r.metabolicAge, 43);
});
