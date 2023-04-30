// Credit: https://github.com/wiecosystem/Bluetooth

export default class Metrics {

    constructor(weight, impedance, height, age, sex) {
        this.weight = weight;
        this.impedance = impedance;
        this.height = height;
        this.age = age;
        this.sex = sex;
    }

    getResult = () => {
        const bodyComposition = {
            bmi: { name: 'BMI', value: this.getBMI() },
            idealWeight: { name: 'Ideal Weight', value: this.getIdealWeight() },
            metabolicAge: { name: 'Metabolic Age', value: this.getMetabolicAge() },
            proteinPercentage: { name: 'Protein Percentage', value: this.getProteinPercentage() },
            lbmCoefficient: { name: 'LBM Coefficient', value: this.getLBMCoefficient() },
            mbr: { name: 'BMR', value: this.getBMR() },
            fat: { name: 'Fat', value: this.getFatPercentage() },
            muscleMass: { name: 'Muscle Mass', value: this.getMuscleMass() },
            boneMass: { name: 'Bone Mass', value: this.getBoneMass() },
            visceralFat: { name: 'Visceral Fat', value: this.getVisceralFat() },
            waterPercentage: { name: 'Water Percentage', value: this.getWaterPercentage() },
            bodyType: { name: 'Body Type', value: this.getBodyType() },
        }

        return bodyComposition;
    }

    checkValueOverflow = (value, minimum, maximum) => {
        if (value < minimum) return minimum
        else if (value > maximum) return maximum
        return value
    }

    getIdealWeight = () => {
        if (this.sex == 'female') return (this.height - 70) * 0.6
        return (this.height - 80) * 0.7
    }

    getMetabolicAge = () => {
        let metabolicAge = (this.height * -0.7471) + (this.weight * 0.9161) + (this.age * 0.4184) + (this.impedance * 0.0517) + 54.2267
        if (this.sex == 'female') {
            metabolicAge = (this.height * -1.1165) + (this.weight * 1.5784) + (this.age * 0.4615) + (this.impedance * 0.0415) + 83.2548
        }
        return this.checkValueOverflow(metabolicAge, 15, 80)
    }

    getVisceralFat = () => {
        let subsubcalc, subcalc, vfal
        if (this.sex === 'female') {
            if (this.weight > (13 - (this.height * 0.5)) * -1) {
                subsubcalc = ((this.height * 1.45) + (this.height * 0.1158) * this.height) - 120
                subcalc = this.weight * 500 / subsubcalc
                vfal = (subcalc - 6) + (this.age * 0.07)
            } else {
                subcalc = 0.691 + (this.height * -0.0024) + (this.height * -0.0024)
                vfal = (((this.height * 0.027) - (subcalc * this.weight)) * -1) + (this.age * 0.07) - this.age
            }
        } else if (this.height < this.weight * 1.6) {
            subcalc = ((this.height * 0.4) - (this.height * (this.height * 0.0826))) * -1
            vfal = ((this.weight * 305) / (subcalc + 48)) - 2.9 + (this.age * 0.15)
        } else {
            subcalc = 0.765 + this.height * -0.0015
            vfal = (((this.height * 0.143) - (this.weight * subcalc)) * -1) + (this.age * 0.15) - 5.0
        }
        return this.checkValueOverflow(vfal, 1, 50)
    }

    getProteinPercentage = () => {
        let proteinPercentage = (this.getMuscleMass() / this.weight) * 100
        proteinPercentage -= this.getWaterPercentage()

        return this.checkValueOverflow(proteinPercentage, 5, 32)
    }

    getWaterPercentage = () => {
        let waterPercentage = (100 - this.getFatPercentage()) * 0.7
        let coefficient = 0.98
        if (waterPercentage <= 50) coefficient = 1.02
        if (waterPercentage * coefficient >= 65) waterPercentage = 75
        return this.checkValueOverflow(waterPercentage * coefficient, 35, 75)
    }

    getBMI = () => {
        return this.checkValueOverflow(this.weight / ((this.height / 100) * (this.height / 100)), 10, 90)
    }

    getBMR = () => {
        let bmr
        if (this.sex === 'female') {
            bmr = 864.6 + this.weight * 10.2036
            bmr -= this.height * 0.39336
            bmr -= this.age * 6.204
        } else {
            bmr = 877.8 + this.weight * 14.916
            bmr -= this.height * 0.726
            bmr -= this.age * 8.976
        }

        if (this.sex === 'female' && bmr > 2996) bmr = 5000
        else if (this.sex === 'male' && bmr > 2322) bmr = 5000
        return this.checkValueOverflow(bmr, 500, 10000)
    }

    getFatPercentage = () => {
        let value = 0.8
        if (this.sex === 'female' && this.age <= 49) value = 9.25
        else if (this.sex === 'female' && this.age > 49) value = 7.25

        const LBM = this.getLBMCoefficient()
        let coefficient = 1.0

        if (this.sex == 'male' && this.weight < 61) coefficient = 0.98
        else if (this.sex == 'female' && this.weight > 60) {
            if (this.height > 160) {
                coefficient *= 1.03
            } else {
                coefficient = 0.96
            }
        }
        else if (this.sex == 'female' && this.weight < 50) {
            if (this.height > 160) {
                coefficient *= 1.03
            } else {
                coefficient = 1.02
            }
        }
        let fatPercentage = (1.0 - (((LBM - value) * coefficient) / this.weight)) * 100

        if (fatPercentage > 63) fatPercentage = 75
        return this.checkValueOverflow(fatPercentage, 5, 75)
    }

    getMuscleMass = () => {
        let muscleMass = this.weight - ((this.getFatPercentage() * 0.01) * this.weight) - this.getBoneMass()
        if (this.sex == 'female' && muscleMass >= 84) muscleMass = 120
        else if (this.sex == 'male' && muscleMass >= 93.5) muscleMass = 120
        return this.checkValueOverflow(muscleMass, 10, 120)
    }

    getBoneMass = () => {
        let base = 0.18016894
        if (this.sex == 'female') base = 0.245691014

        let boneMass = (base - (this.getLBMCoefficient() * 0.05158)) * -1

        if (boneMass > 2.2) boneMass += 0.1
        else boneMass -= 0.1

        if (this.sex == 'female' && boneMass > 5.1) boneMass = 8
        else if (this.sex == 'male' && boneMass > 5.2) boneMass = 8

        return this.checkValueOverflow(boneMass, 0.5, 8)
    }

    getLBMCoefficient = () => {
        let lbm = (this.height * 9.058 / 100) * (this.height / 100)
        lbm += this.weight * 0.32 + 12.226
        lbm -= this.impedance * 0.0068
        lbm -= this.age * 0.0542
        return lbm
    }

    getBodyType = () => {

        let factor;
        if (this.getFatPercentage() > this.getFatPercentageScale()[2]) {
            factor = 0;
        }
        else if (this.getFatPercentage() < this.getFatPercentageScale()[1]) {
            factor = 2;
        }
        else {
            factor = 1;
        }


        if (this.getMuscleMass() > this.getMuscleMassScale()[1]) {
            return 2 + (factor * 3);
        }
        else if (this.getMuscleMass() < this.getMuscleMassScale()[0]) {
            return (factor * 3);
        }
        else {
            return 1 + (factor * 3);
        }
    }

    getFatPercentageScale = () => {
        const scales = [
            { 'min': 0, 'max': 12, 'female': [12.0, 21.0, 30.0, 34.0], 'male': [7.0, 16.0, 25.0, 30.0] },
            { 'min': 12, 'max': 14, 'female': [15.0, 24.0, 33.0, 37.0], 'male': [7.0, 16.0, 25.0, 30.0] },
            { 'min': 14, 'max': 16, 'female': [18.0, 27.0, 36.0, 40.0], 'male': [7.0, 16.0, 25.0, 30.0] },
            { 'min': 16, 'max': 18, 'female': [20.0, 28.0, 37.0, 41.0], 'male': [7.0, 16.0, 25.0, 30.0] },
            { 'min': 18, 'max': 40, 'female': [21.0, 28.0, 35.0, 40.0], 'male': [11.0, 17.0, 22.0, 27.0] },
            { 'min': 40, 'max': 60, 'female': [22.0, 29.0, 36.0, 41.0], 'male': [12.0, 18.0, 23.0, 28.0] },
            { 'min': 60, 'max': 100, 'female': [23.0, 30.0, 37.0, 42.0], 'male': [14.0, 20.0, 25.0, 30.0] },
        ];

        for (const scale in scales) {
            if (this.age >= scales[scale].min && this.age < scales[scale].max) {
                return scales[scale][this.sex]
            }
        }
        return [7.0, 16.0, 25.0, 30.0];

    }

    getMuscleMassScale = () => {

        const scales = [
            { 'min': { 'male': 170, 'female': 160 }, 'female': [36.5, 42.6], 'male': [49.4, 59.5] },
            { 'min': { 'male': 160, 'female': 150 }, 'female': [32.9, 37.6], 'male': [44.0, 52.5] },
            { 'min': { 'male': 0, 'female': 0 }, 'female': [29.1, 34.8], 'male': [38.5, 46.6] },
        ];

        for (const scale in scales) {
            if (this.height >= scales[scale].min[this.sex]) {
                return scales[scale][this.sex]
            }
        }

        return [49.4, 59.5];

    }
}
