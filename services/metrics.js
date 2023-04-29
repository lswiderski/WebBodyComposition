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
}
