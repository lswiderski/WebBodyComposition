import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useLocalStorageState from 'use-local-storage-state';
import { useBodyCompositionContext } from '../../contexts/bodycomposition.context';
import { readVitafit } from '../../services/vitafit';
import { computeBodyComposition, checkInput } from '../../services/bodyComposition';

const inputClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50';

export default function VitafitScanner() {
    const router = useRouter();
    const { setBodyComposition } = useBodyCompositionContext();
    const [height, setHeight] = useLocalStorageState('vitafitHeight', { defaultValue: 170 });
    const [age, setAge] = useLocalStorageState('vitafitAge', { defaultValue: 30 });
    const [sex, setSex] = useLocalStorageState('vitafitSex', { defaultValue: 'male' });
    const [athlete, setAthlete] = useLocalStorageState('vitafitAthlete', { defaultValue: false });
    const [scanning, setScanning] = useState(false);
    const [log, setLog] = useState([]);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const onStatus = (text) => setLog((l) => [...l.slice(-30), text]);

    async function scan() {
        setError('');
        setResult(null);
        setLog([]);
        if (!navigator.bluetooth) {
            setError('This browser has no Web Bluetooth. On iPhone use Bluefy.');
            return;
        }
        setScanning(true);
        try {
            const { weight, impedance } = await readVitafit({ onStatus });
            const profile = { height: Number(height), age: Number(age), sex, athlete };
            const inputError = impedance === null ? 'no impedance measured (step on barefoot)'
                : checkInput({ ...profile, weight, impedance });
            if (inputError) {
                setResult({ weightKg: weight });
                setError(`Only weight available: ${inputError}`);
                setBodyComposition({ weightKg: weight });
            } else {
                const r = computeBodyComposition({ ...profile, weight, impedance });
                setResult(r);
                setBodyComposition({
                    weightKg: r.weightKg,
                    bmi: r.bmi.toFixed(1),
                    fatPercentage: r.fatPercentage.toFixed(1),
                    skeletalMuscleKg: r.skeletalMuscleKg.toFixed(1),
                    waterPercentage: r.waterPercentage.toFixed(1),
                    boneKg: r.boneKg.toFixed(2),
                    visceralFat: r.visceralFat,
                    metabolicAge: r.metabolicAge,
                });
            }
        } catch (e) {
            setError(e.message || String(e));
        } finally {
            setScanning(false);
        }
    }

    const rows = result && result.bmi !== undefined ? [
        ['Impedance', result.impedance],
        ['BMI', result.bmi.toFixed(1)],
        ['Body fat', `${result.fatPercentage.toFixed(1)} %`],
        ['Muscle', `${result.musclePercentage.toFixed(1)} % (${result.muscleKg.toFixed(1)} kg)`],
        ['Skeletal muscle', `${result.skeletalMuscleKg.toFixed(1)} kg`],
        ['Body water', `${result.waterPercentage.toFixed(1)} %`],
        ['Protein', `${result.proteinPercentage.toFixed(1)} %`],
        ['Bone mass', `${result.boneKg.toFixed(2)} kg`],
        ['Visceral fat', result.visceralFat],
        ['BMR', `${result.bmr} kcal`],
        ['Metabolic age', result.metabolicAge],
    ] : [];

    return (
        <div className='flex flex-wrap'>
            <div className='w-full max-w-sm ml-auto mr-auto'>
                <h1 className='text-2xl font-bold text-center mb-5'>Vitafit Scale Scanner</h1>

                <div className='flex justify-between gap-2'>
                    <label className='block'>
                        <span className='text-gray-700'>Height (cm)</span>
                        <input type='number' min={50} max={220} value={height} onChange={(e) => setHeight(e.target.value)} className={inputClass} />
                    </label>
                    <label className='block'>
                        <span className='text-gray-700'>Age</span>
                        <input type='number' min={1} max={99} value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} />
                    </label>
                </div>
                <div className='flex justify-between gap-2 items-end'>
                    <label className='block'>
                        <span className='text-gray-700'>Sex</span>
                        <select value={sex} onChange={(e) => setSex(e.target.value)} className={inputClass}>
                            <option value='male'>Male</option>
                            <option value='female'>Female</option>
                        </select>
                    </label>
                    <label className='block mb-2'>
                        <input type='checkbox' checked={athlete} onChange={(e) => setAthlete(e.target.checked)} />
                        <span className='ml-2'>Athlete</span>
                    </label>
                </div>

                <button
                    type='button'
                    onClick={scan}
                    disabled={scanning}
                    className='bg-blue-500 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded mt-5 w-full'
                >
                    {scanning ? 'Waiting for the scale...' : 'Connect to scale'}
                </button>
                <p className='text-sm text-gray-600 mt-2'>
                    Step on the scale barefoot, then tap the button and pick &quot;Vitafit Body Fat&quot;.
                    The Vitafit app must not have Bluetooth access, or it will take the scale first.
                </p>

                {error && <div className='text-red-600 mt-3'>{error}</div>}

                {result && (
                    <div className='mt-5'>
                        <div className='text-center font-bold'>
                            <span className='text-7xl'>{result.weightKg}</span>
                            <span className='text-3xl'> kg</span>
                        </div>
                        {rows.map(([k, v]) => (
                            <div key={k} className='flex justify-between'><div>{k}</div><div className='font-bold'>{v}</div></div>
                        ))}
                        <button
                            type='button'
                            onClick={() => router.push('/sync/bodycomposition')}
                            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5 w-full'
                        >
                            Sync to Garmin and/or Intervals
                        </button>
                    </div>
                )}

                {log.length > 0 && (
                    <details className='mt-5'>
                        <summary className='text-sm text-gray-600'>Bluetooth log</summary>
                        <pre className='text-xs whitespace-pre-wrap'>{log.join('\n')}</pre>
                    </details>
                )}

                <Link href='/' passHref>
                    <button type='button' className='bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mt-5'>&lt; Back</button>
                </Link>
            </div>
        </div>
    );
}
