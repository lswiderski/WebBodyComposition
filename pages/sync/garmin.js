import { useState } from 'react'
import Link from 'next/link'
import axios from 'axios';
import { useBodyCompositionContext } from '../../contexts/bodycomposition.context';

export default function Garmin() {
    const { bodyComposition, setBodyComposition } = useBodyCompositionContext();
    const [weight, setWeight] = useState(bodyComposition.weight ?? 0);
    const [bmi, setBmi] = useState(bodyComposition.bmi ?? 0);
    const [fat, setFat] = useState(bodyComposition.fat ?? 0);
    const [muscleMass, setMuscleMass] = useState(bodyComposition.muscleMass ?? 0);
    const [waterPercentage, setWaterPercentage] = useState(bodyComposition.waterPercentage ?? 0);
    const [boneMass, setBoneMass] = useState(bodyComposition.boneMass ?? 0);
    const [visceralFat, setVisceralFat] = useState(bodyComposition.visceralFat ?? 0);
    const [metabolicAge, setMetabolicAge] = useState(bodyComposition.metabolicAge ?? 0);
    const [bodyType, setBodyType] = useState(bodyComposition.bodyType ?? 0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const submitGarminForm = async (event) => {
        event.preventDefault();

        const payload =
        {
            timeStamp: -1,
            weight: parseFloat(weight),
            percentFat: parseFloat(fat ?? 0),
            percentHydration: parseFloat(waterPercentage ?? 0),
            boneMass: parseFloat(boneMass ?? 0),
            muscleMass: parseFloat(muscleMass ?? 0),
            visceralFatRating: parseFloat(visceralFat ?? 0),
            physiqueRating: parseFloat(bodyType ?? 0),
            metabolicAge: parseFloat(metabolicAge ?? 0),
            bodyMassIndex: parseFloat(bmi ?? 0),
            email,
            password,
        }

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
                    alert("Success");
                })
                .catch(error => {
                    console.log(error);
                    alert("Error, check console");
                });

        }
        catch (err) {
            console.log(err);
            alert("Error, check console");
        }

    };

    return (
        <>
            <div className='flex flex-wrap'>
                <div className='w-full max-w-md ml-auto mr-auto'>
                    <h1 className='text-3xl font-bold text-center mb-5'> Garmin Body Composition Form</h1>
                    <form onSubmit={submitGarminForm}
                        className=''>
                        <label className="block">
                            <span className="text-gray-700">Weight (Kg)</span>
                            <input
                                type="number"
                                name="weight"
                                step="0.01"
                                min={0}
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          "
                                placeholder=""
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">BMI</span>
                            <input
                                type="number"
                                name="bmi"
                                step="0.01"
                                min={0}
                                value={bmi}
                                onChange={(e) => setBmi(e.target.value)}
                                className="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          "
                                placeholder=""
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Body Fat (%)</span>
                            <input
                                type="number"
                                name="fat"
                                step="0.01"
                                min={0}
                                value={fat}
                                onChange={(e) => setFat(e.target.value)}
                                className="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          "
                                placeholder=""
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Skeletal Muscle Mass (kg)</span>
                            <input
                                type="number"
                                name="muscleMass"
                                step="0.01"
                                min={0}
                                value={muscleMass}
                                onChange={(e) => setMuscleMass(e.target.value)}
                                className="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          "
                                placeholder=""
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Body Water (%)</span>
                            <input
                                type="number"
                                name="waterPercentage"
                                step="0.01"
                                min={0}
                                value={waterPercentage}
                                onChange={(e) => setWaterPercentage(e.target.value)}
                                className="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          "
                                placeholder=""
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Bone Mass (Kg)</span>
                            <input
                                type="number"
                                name="boneMass"
                                step="0.01"
                                min={0}
                                value={boneMass}
                                onChange={(e) => setBoneMass(e.target.value)}
                                className="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          "
                                placeholder=""
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Visceral Fat</span>
                            <input
                                type="number"
                                name="visceralFat"
                                step="0.01"
                                min={0}
                                value={visceralFat}
                                onChange={(e) => setVisceralFat(e.target.value)}
                                className="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          "
                                placeholder=""
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Metabolic Age (years)</span>
                            <input
                                type="number"
                                name="metabolicAge"
                                step="0.01"
                                min={0}
                                value={metabolicAge}
                                onChange={(e) => setMetabolicAge(e.target.value)}
                                className="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          "
                                placeholder=""
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700">Physique Raiting</span>
                            <input
                                type="number"
                                name="bodyType"
                                min={0}
                                value={bodyType}
                                onChange={(e) => setBodyType(e.target.value)}
                                className="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          "
                                placeholder=""
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700">Email address</span>
                            <input
                                type="email"
                                name="password"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="
                        mt-1
                        block
                        w-full
                        rounded-md
                        border-gray-300
                        shadow-sm
                        focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                      "
                                placeholder="john@example.com"
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Password</span>
                            <input
                                type="password"
                                name='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="
                      mt-1
                      block
                      w-full
                      rounded-md
                      border-gray-300
                      shadow-sm
                      focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                    "
                                placeholder="********"
                            />
                        </label>
                        <div className='flex flex-wrap'>
                            <Link href="/" passHref>
                                <button
                                    type="button"
                                    className='bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mt-5 mr-auto'
                                >  &lt; Back
                                </button>
                            </Link>
                            <button
                                type="submit"
                                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5 ml-auto'
                            > Send to Garmin Connect
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}