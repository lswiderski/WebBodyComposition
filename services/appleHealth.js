// A web page cannot write to Apple Health, so the values are handed to an iOS Shortcut that logs
// them with "Log Health Sample" (see README). The shortcut receives this JSON as text input.
export const APPLE_HEALTH_SHORTCUT = 'Vitafit to Health';

const round2 = (x) => Math.round(x * 100) / 100;

export function appleHealthShortcutUrl({ weightKg, bmi, fatPercentage }) {
    const data = {
        weight: round2(weightKg),
        bmi: round2(bmi),
        bodyFat: round2(fatPercentage),
        leanBodyMass: round2(weightKg * (1 - fatPercentage / 100)),
    };
    return `shortcuts://run-shortcut?name=${encodeURIComponent(APPLE_HEALTH_SHORTCUT)}`
        + `&input=text&text=${encodeURIComponent(JSON.stringify(data))}`;
}
