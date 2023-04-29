import { useState } from 'react'
import axios from 'axios';
import { useBodyCompositionContext } from '../../contexts/bodycomposition.context';

export default function Garmin() {
    const { bodyComposition, setBodyComposition } = useBodyCompositionContext();
    const [weight, setWeight] = useState(bodyComposition.weight);
    const [bmi, setBmi] = useState(bodyComposition.bmi);
    const [fat, setFat] = useState(bodyComposition.fat);
    const [muscleMass, setMuscleMass] = useState(bodyComposition.muscleMass);
    const [waterPercentage, setWaterPercentage] = useState(bodyComposition.waterPercentage);
    const [boneMass, setBoneMass] = useState(bodyComposition.boneMass);
    const [visceralFat, setVisceralFat] = useState(bodyComposition.visceralFat);
    const [metabolicAge, setMetabolicAge] = useState(bodyComposition.metabolicAge);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const submitGarminForm = async (event) => {
        event.preventDefault();

        const payload =
        {
            timeStamp: -1,
            weight: parseFloat(weight),
            percentFat: parseFloat(0),//fat ?? null,
            percentHydration: parseFloat(0),//waterPercentage ?? null,
            boneMass: parseFloat(0),//boneMass ?? null,
            muscleMass: parseFloat(0),//muscleMass ?? null,
            visceralFatRating: parseFloat(0),//visceralFat ?? null,
            //physiqueRating: event.target.weight.value?? null,
            metabolicAge: parseFloat(0),//metabolicAge ?? null,
            bodyMassIndex: parseFloat(0),//bmi ?? null,
            email,
            password,
        }

        debugger;
        try {
            let axiosConfig = {
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            };

            await axios
                .post('https://frog01-20364.wykr.es/upload', payload, axiosConfig)
                .then(response => {
                    console.log(response);
                })
                .catch(error => {
                    console.log(error);
                });

        }
        catch (err) {
            console.log(err);
        }

    };


    return (
        <div>
            <h1>Garmin Body Composition Form</h1>
            <div>
                <form onSubmit={submitGarminForm}>
                    <div className="input">
                        <label>Weight (Kg)</label>
                        <input name="weight" type="number" step="0.01" required
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>BMI</label>
                        <input name="bmi" type="number" step="0.01"
                            value={bmi}
                            onChange={(e) => setBmi(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Body Fat (%)</label>
                        <input name="fat" type="number" step="0.01"
                            value={fat}
                            onChange={(e) => setFat(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Muscle Mass (kg)</label>
                        <input name="muscleMass" type="number" step="0.01"
                            value={muscleMass}
                            onChange={(e) => setMuscleMass(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Water (%)</label>
                        <input name="waterPercentage" type="number" step="0.01"
                            value={waterPercentage}
                            onChange={(e) => setWaterPercentage(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Bone Mass (Kg)</label>
                        <input name="boneMass" type="number" step="0.01"
                            value={boneMass}
                            onChange={(e) => setBoneMass(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Visceral Fat</label>
                        <input name="visceralFat" type="number" step="0.01"
                            value={visceralFat}
                            onChange={(e) => setVisceralFat(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Body age (years)</label>
                        <input name="metabolicAge" type="number" step="0.01"
                            value={metabolicAge}
                            onChange={(e) => setMetabolicAge(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Email</label>
                        <input name="email" type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Password</label>
                        <input name="password" type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <button
                        type="submit"
                    > Send to Connect
                    </button>

                </form>
            </div>
        </div>
    )
}