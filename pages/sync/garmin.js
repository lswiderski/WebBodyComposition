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
            timeStamp: Date.now(),
            weight: weight,
            //percentFat: fat ?? null,
            //percentHydration: waterPercentage ?? null,
            //boneMass: boneMass ?? null,
            //muscleMass: muscleMass ?? null,
            //visceralFatRating: visceralFat ?? null,
            ////physiqueRating: event.target.weight.value?? null,
            //metabolicAge: metabolicAge ?? null,
            //bodyMassIndex: bmi ?? null,
            email,
            password,
        }

        debugger;
        try {

            /*
            const res = await fetch('http://localhost:8080/upload', {
                body: JSON.stringify(payload),
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            });
            debugger
            const result = await res.json();
            debugger;
            console.log(result)*/

            await axios
                .post('https://frog01-20364.wykr.es/upload', payload)
                .then(response => {
                    console.log(response);
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
                        <input name="weight" type="number" required
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>BMI</label>
                        <input name="bmi" type="number"
                            value={bmi}
                            onChange={(e) => setBmi(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Body Fat (%)</label>
                        <input name="fat" type="number"
                            value={fat}
                            onChange={(e) => setFat(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Muscle Mass (kg)</label>
                        <input name="muscleMass" type="number"
                            value={muscleMass}
                            onChange={(e) => setMuscleMass(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Water (%)</label>
                        <input name="waterPercentage" type="number"
                            value={waterPercentage}
                            onChange={(e) => setWaterPercentage(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Bone Mass (Kg)</label>
                        <input name="boneMass" type="number"
                            value={boneMass}
                            onChange={(e) => setBoneMass(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Visceral Fat</label>
                        <input name="visceralFat" type="number"
                            value={visceralFat}
                            onChange={(e) => setVisceralFat(e.target.value)} />
                    </div>
                    <div className="input">
                        <label>Body age (years)</label>
                        <input name="metabolicAge" type="number"
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