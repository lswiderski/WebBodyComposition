// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appleHealthShortcutUrl } from './appleHealth.js';

test('shortcut URL carries weight, BMI, body fat and lean body mass', () => {
    const url = new URL(appleHealthShortcutUrl({ weightKg: 68.95, bmi: 22.2591, fatPercentage: 12.5432 }));
    assert.equal(url.protocol, 'shortcuts:');
    assert.equal(url.searchParams.get('name'), 'Vitafit to Health');
    assert.equal(url.searchParams.get('input'), 'text');
    assert.deepEqual(JSON.parse(url.searchParams.get('text')),
        { weight: 68.95, bmi: 22.26, bodyFat: 12.54, leanBodyMass: 60.3 });
});
