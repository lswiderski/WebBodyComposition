// Body composition for the Vitafit VT7018 scale: regression formulas equivalent to those of the
// Vitafit app, validated against real measurements.
// Inputs: height (cm), weight (kg), age (years, integer), impedance (raw value sent by the scale).

const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
// lround: nearest integer, halves away from zero
const lround = (x) => Math.sign(x) * Math.round(Math.abs(x));

// Constants per profile. Female (non athlete) is not validated against the app yet.
const PROFILES = {
    male: {
        bone: [0.0154, 0.0155, 0.002, -0.9253], boneDiv: 1,
        muscle: [0.000853, 0.37776, -0.008446, -0.0019619, 0.110402, 1.300029], muscleDiv: 1,
        water: 0.7133, waterMin: 0.30, waterFloor: 0.30,
        skeletal: 0.595, bmr: 21.37, bmrDiv: 1,
        visceral: [-0.0012, 0.4758, 0.1456, 5.6141], visceralDiv: 1,
        ageRef: 1500, ageDiv: 1,
    },
    female: {
        bone: [0.0324, 0.0114, 0.0007, -3.274], boneDiv: 1,
        muscle: [0.000779, 0.358478, -0.007998, -0.0018561, 0.0869, -1.374156], muscleDiv: 1,
        // below 0.30·W the water is set to 0.35·W (matches the Vitafit app)
        water: 0.7759, waterMin: 0.30, waterFloor: 0.35,
        skeletal: 0.575, bmr: 22.39, bmrDiv: 1,
        visceral: [-0.001, 0.4111, 0.0595, 4.2008], visceralDiv: 1,
        ageRef: 1200, ageDiv: 1,
    },
    maleAthlete: {
        bone: [0.0154, 0.0155, 0.002, -0.9253], boneDiv: 0.93,
        muscle: [0.000853, 0.37776, -0.008446, -0.0019619, 0.110402, 1.300029], muscleDiv: 0.923,
        water: 0.6583759, waterMin: 0.30, waterFloor: 0.30,
        skeletal: 0.595, bmr: 21.37, bmrDiv: 0.923,
        visceral: [-0.0012, 0.4758, 0.1456, 5.6141], visceralDiv: 1.18,
        ageRef: 1500, ageDiv: 1.27,
    },
    femaleAthlete: {
        bone: [0.0324, 0.0114, 0.0007, -3.274], boneDiv: 0.941,
        muscle: [0.000779, 0.358478, -0.007998, -0.0018561, 0.0869, -1.374156], muscleDiv: 0.96,
        water: 0.744864, waterMin: 0.30, waterFloor: 0.35,
        skeletal: 0.575, bmr: 22.39, bmrDiv: 0.97,
        visceral: [-0.001, 0.4111, 0.0595, 4.2008], visceralDiv: 1.087,
        ageRef: 1200, ageDiv: 1.099,
    },
};

export function profileKey(sex, athlete) {
    if (sex === 'female') return athlete ? 'femaleAthlete' : 'female';
    return athlete ? 'maleAthlete' : 'male';
}

// Valid input ranges (outside them the Vitafit app shows no body composition); returns an error string or null.
export function checkInput({ height, weight, age, impedance }) {
    if (height < 50 || height > 220) return 'height out of range (50-220 cm)';
    if (age > 99) return 'age out of range (max 99)';
    if (weight < 10 || weight > 200) return 'weight out of range (10-200 kg)';
    if (impedance < 200 || impedance > 1200) return 'impedance out of range (200-1200)';
    return null;
}

export function computeBodyComposition({ height, weight, age, impedance, sex = 'male', athlete = false }) {
    const p = PROFILES[profileKey(sex, athlete)];
    const H = height, W = weight, A = Math.trunc(age), Z = Math.trunc(impedance);

    const bone = clamp((p.bone[0] * H + p.bone[1] * W + p.bone[2] * A + p.bone[3]) / p.boneDiv, 0.5, 8);

    const [m0, m1, m2, m3, m4, m5] = p.muscle;
    const muscleRaw = (m0 * H * H + m1 * W + m2 * A + m3 * Z + m4 * bone + m5) / p.muscleDiv;
    let muscle = muscleRaw;
    if (muscle + bone > 0.95 * W) muscle = 0.95 * W - bone;
    if (muscle + bone < 0.25 * W) muscle = 0.25 * W - bone;

    // the athlete variant computes water from the muscle before the 0.25·W-0.95·W adjustment
    let water = p.water * (p.muscleDiv === 1 ? muscle : muscleRaw);
    if (water < p.waterMin * W) water = p.waterFloor * W;
    water = Math.min(water, 0.75 * W);

    const protein = muscle - water;
    const fat = clamp(W - muscle - bone, 0.05 * W, 0.75 * W);
    const bmr = lround((370 + p.bmr * muscle) / p.bmrDiv);

    const [v0, v1, v2, v3] = p.visceral;
    const visceralFat = lround(clamp((v0 * H * H + v1 * W + v2 * A + v3) / p.visceralDiv, 1, 60));

    const fatRate = fat / W;
    const div = fatRate < 0.25 ? 2.05 : (fatRate >= 0.26 && fatRate <= 0.32 ? 3.2 : 4.1);
    let bodyAge = ((100 * fatRate - 25) / div + A + (p.ageRef - bmr) / 390) / p.ageDiv;
    const gap = Math.abs(bodyAge - A);
    if (gap >= 3) bodyAge += (bodyAge <= A ? 1 : -1) * (gap - 3) / 2;
    const metabolicAge = lround(clamp(bodyAge, 6, 99));

    return {
        weightKg: W,
        impedance: Z,
        bmi: W / ((H / 100) ** 2),
        fatPercentage: 100 * fatRate,
        fatKg: fat,
        boneKg: bone,
        musclePercentage: 100 * muscle / W,
        muscleKg: muscle,
        skeletalMuscleKg: p.skeletal * muscle,
        waterPercentage: 100 * water / W,
        proteinPercentage: 100 * protein / W,
        bmr,
        visceralFat,
        metabolicAge,
    };
}
