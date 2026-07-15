import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useLocalStorageState from 'use-local-storage-state';
import { useBodyCompositionContext } from '../../contexts/bodycomposition.context';

const regionOptions = [
    { value: 'cn', label: 'China' },
    { value: 'de', label: 'Europe' },
    { value: 'ru', label: 'Russia' },
    { value: 'sg', label: 'Singapur' },
    { value: 'us', label: 'USA' },
    { value: 'i2', label: 'India' },
];

const modelOptions = [
    { value: 'yunmai.scales.ms104', label: 'S400 - yunmai.scales.ms104' },
];
const weightEndpoint = 'https://localhost:7046/weights';

export default function XiaomiCloud() {
    const router = useRouter();
    const { setBodyComposition } = useBodyCompositionContext();
    const [userId, setUserId] = useLocalStorageState('xiaomiCloud.userId', {
        defaultValue: '',
    });
    const [passToken, setPassToken] = useLocalStorageState('xiaomiCloud.passToken', {
        defaultValue: '',
    });
    const [region, setRegion] = useLocalStorageState('xiaomiCloud.region', {
        defaultValue: 'de',
    });
    const [model, setModel] = useLocalStorageState('xiaomiCloud.model', {
        defaultValue: modelOptions[0].value,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [weightRecords, setWeightRecords] = useState([]);

    const parseWeightRecords = (responseValue) => {
        if (typeof responseValue !== 'string') {
            return Array.isArray(responseValue) ? responseValue : [];
        }

        const trimmedValue = responseValue.trim();

        if (!trimmedValue) {
            return [];
        }

        const normalizedValue = trimmedValue.startsWith("'") && trimmedValue.endsWith("'")
            ? trimmedValue.slice(1, -1)
            : trimmedValue;

        try {
            const parsedValue = JSON.parse(normalizedValue);
            return Array.isArray(parsedValue) ? parsedValue : [];
        } catch {
            return [];
        }
    };

    const submitMeasurements = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        setWeightRecords([]);

        try {
            const response = await fetch(weightEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    UserId: Number(userId),
                    PassToken: passToken,
                    Region: region,
                    Model: model,
                }),
            });
            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || `Request failed with status ${response.status}`);
            }

            const parsedRecords = parseWeightRecords(responseText);
            const latestRecords = parsedRecords
                .slice()
                .sort((left, right) => new Date(right.date) - new Date(left.date))
                .slice(0, 10);

            setWeightRecords(latestRecords);
            setMessage(latestRecords.length
                ? `Loaded ${latestRecords.length} latest weight record${latestRecords.length === 1 ? '' : 's'}.`
                : responseText || 'Measurements request sent successfully.');
        } catch (error) {
            setMessage(error.message || 'Unable to get measurements.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const mapRecordToBodyComposition = (record) => ({
        weight: record.weightKg ?? 0,
        bmi: record.bmi ?? 0,
        fat: record.bodyFat ?? 0,
        muscleMass: record.muscleMass ?? 0,
        waterPercentage: record.bodyWater ?? 0,
        boneMass: record.boneMass ?? 0,
        visceralFat: record.visceralFat ?? 0,
        metabolicAge: record.metabolicAge ?? 0,
        bodyType: record.bodyScore ?? 0,
        idealWeight: 0,
        proteinPercentage: record.proteinMass ?? 0,
        lbmCoefficient: 0,
        mbr: record.basalMetabolism ?? 0,
    });

    const goToGarminWithRecord = async (record) => {
        setBodyComposition(mapRecordToBodyComposition(record));
        await router.push('/sync/garmin');
    };

    const formatDate = (value) => {
        if (!value) {
            return '-';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
    };

    const formatValue = (value) => {
        if (value === null || value === undefined || value === '') {
            return '-';
        }

        return typeof value === 'number' ? value.toLocaleString('en-US') : value;
    };

    const metricFields = [
        { key: 'weightKg', label: 'Weight (kg)' },

        { key: 'bmi', label: 'BMI' },
        { key: 'bodyFat', label: 'Body Fat %' },
        { key: 'bodyWater', label: 'Body Water %' },
        { key: 'boneMass', label: 'Bone Mass' },
        { key: 'metabolicAge', label: 'Metabolic Age' },
        { key: 'muscleMass', label: 'Muscle Mass' },
        { key: 'proteinMass', label: 'Protein Mass' },
        { key: 'visceralFat', label: 'Visceral Fat' },
        { key: 'basalMetabolism', label: 'Basal Metabolism' },
        { key: 'bodyScore', label: 'Body Score' },
        { key: 'heartRate', label: 'Heart Rate' },
        { key: 'skeletalMuscleMass', label: 'Skeletal Muscle Mass' },
        { key: 'source', label: 'Source' },
        { key: 'user', label: 'User' },
        { key: 'height', label: 'Height (cm)' },
    ];

    return (
        <>
            <div className='flex flex-wrap'>
                <div className='w-full max-w-7xl px-4 ml-auto mr-auto'>

                    <h1 className='text-2xl font-bold text-center mb-5'>Mi Cloud Connector</h1>

                    <form id='xiaomi-cloud-form' onSubmit={submitMeasurements} className='space-y-4 mt-10'>
                        <label className='block'>
                            <span className='text-gray-700'>User ID</span>
                            <input
                                type='number'
                                name='userId'
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                                placeholder='123456789'
                            />
                        </label>

                        <label className='block'>
                            <span className='text-gray-700'>Pass Token</span>
                            <textarea
                                name='passToken'
                                rows={4}
                                value={passToken}
                                onChange={(e) => setPassToken(e.target.value)}
                                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                                placeholder='Paste pass token here'
                            />
                        </label>

                        <label className='block'>
                            <span className='text-gray-700'>Region</span>
                            <select
                                name='region'
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                            >
                                {regionOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.value} - {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className='block'>
                            <span className='text-gray-700'>Model</span>
                            <input
                                type='text'
                                name='model'
                                list='xiaomi-model-options'
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                                placeholder='Select a model or type your own'
                            />
                            <datalist id='xiaomi-model-options'>
                                {modelOptions.map((option) => (
                                    <option key={option.value} value={option.value} label={option.label} />
                                ))}
                            </datalist>
                        </label>

                        {message && (
                            <div className='text-sm text-center text-gray-700 whitespace-pre-wrap'>
                                {message}
                            </div>
                        )}
                    </form>

                    {weightRecords.length > 0 && (
                        <div className='mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
                            <div className='overflow-x-auto'>
                                <table className='min-w-full divide-y divide-gray-200 text-sm'>
                                    <thead className='bg-gray-50'>
                                        <tr>
                                            <th className='px-4 py-3 text-left font-semibold text-gray-700'>Actions</th>
                                            <th className='px-4 py-3 text-left font-semibold text-gray-700'>Date</th>
                                            {metricFields.map((field) => (
                                                <th key={field.key} className='px-4 py-3 text-left font-semibold text-gray-700'>
                                                    {field.label}
                                                </th>
                                            ))}

                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100 bg-white'>
                                        {weightRecords.map((record, index) => (
                                            <tr key={`${record.date || 'record'}-${index}`} className='hover:bg-gray-50'>
                                                <td className='whitespace-nowrap px-4 py-3'>
                                                    <button
                                                        type='button'
                                                        onClick={() => goToGarminWithRecord(record)}
                                                        className='rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700'
                                                    >
                                                        Select
                                                    </button>
                                                </td>
                                                <td className='whitespace-nowrap px-4 py-3 font-medium text-gray-900'>
                                                    {formatDate(record.date)}
                                                </td>
                                                {metricFields.map((field) => (
                                                    <td key={field.key} className='whitespace-nowrap px-4 py-3 text-gray-700'>
                                                        {formatValue(record[field.key])}
                                                    </td>
                                                ))}

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {weightRecords.length === 0 && message && !isSubmitting && (
                        <div className='mt-10 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500'>
                            No parsed records to display yet.
                        </div>
                    )}

                    <div className='flex flex-wrap mt-10'>
                        <Link href="/" passHref className='mr-auto'>
                            <button
                                type="button"
                                className='bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mt-5'
                            >  &lt; Back
                            </button>
                        </Link>

                        <button
                            form='xiaomi-cloud-form'
                            type='submit'
                            disabled={isSubmitting}
                            className='bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded mt-5 ml-auto'
                        >
                            {isSubmitting ? 'Getting measurements...' : 'Get Measurements'}
                        </button>

                    </div>
                </div>
            </div>
        </>)
}