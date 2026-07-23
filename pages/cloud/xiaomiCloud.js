import { useRef, useState } from 'react';
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
    { value: 'yunmai.scales.ms103', label: 'S400 - yunmai.scales.ms103' },
    { value: 'yunmai.scales.ms107', label: 'S400 - yunmai.scales.ms107' },
    { value: 'yunmai.scales.ms106', label: 'S200 - yunmai.scales.ms106' },
    { value: 'xiaomi.scales.ms116', label: 'S800 - xiaomi.scales.ms116' },


];

const defaultModel = modelOptions[0].value;

//const serverUrl = 'https://localhost:7046';
const serverUrl = 'http://grzegorz366.mikrus.xyz:20366';
const weightEndpoint = `${serverUrl}/weights`;
const loginEndpoint = `${serverUrl}/login`;

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
        defaultValue: defaultModel,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGettingPassToken, setIsGettingPassToken] = useState(false);
    const [isPollingPassToken, setIsPollingPassToken] = useState(false);
    const [message, setMessage] = useState('');
    const [loginSessionId, setLoginSessionId] = useState('');
    const [loginUrl, setLoginUrl] = useState('');
    const [qrCodeBase64, setQrCodeBase64] = useState('');
    const [pollingEndpoint, setPollingEndpoint] = useState('');
    const [weightRecords, setWeightRecords] = useState([]);
    const loginPollingControllerRef = useRef(null);

    const isGetMeasurementsEnabled = userId.trim() !== '' && passToken.trim() !== '';

    const sleep = (delayMs, signal) => new Promise((resolve, reject) => {
        if (signal?.aborted) {
            const abortError = new Error('Login polling cancelled.');
            abortError.name = 'AbortError';
            reject(abortError);
            return;
        }

        const timeoutId = setTimeout(() => {
            signal?.removeEventListener('abort', handleAbort);
            resolve();
        }, delayMs);

        const handleAbort = () => {
            clearTimeout(timeoutId);
            const abortError = new Error('Login polling cancelled.');
            abortError.name = 'AbortError';
            reject(abortError);
        };

        signal?.addEventListener('abort', handleAbort, { once: true });
    });

    const clearLoginChallenge = () => {
        setLoginSessionId('');
        setLoginUrl('');
        setQrCodeBase64('');
        setPollingEndpoint('');
    };

    const cancelPassTokenPolling = () => {
        loginPollingControllerRef.current?.abort();
    };

    const readJsonResponse = async (response) => {
        const responseText = await response.text();

        if (!responseText) {
            return {};
        }

        try {
            return JSON.parse(responseText);
        } catch {
            return responseText;
        }
    };

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

    const normalizeLoginChallenge = (loginResponse) => ({
        sessionId: loginResponse?.sessionid ?? loginResponse?.sessionId ?? '',
        loginUrl: loginResponse?.loginUrl ?? '',
        qrCodeBase64: loginResponse?.qrCodeBase64 ?? loginResponse?.qrCode ?? '',
        pollingEndpoint: loginResponse?.pollingEndpoint ?? '',
    });

    const pollForPassToken = async (endpoint, signal) => {
        for (let attempt = 1; attempt <= 10; attempt += 1) {
            if (signal?.aborted) {
                const abortError = new Error('Login polling cancelled.');
                abortError.name = 'AbortError';
                throw abortError;
            }

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
                signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Polling failed with status ${response.status}`);
            }

            const pollResponse = await readJsonResponse(response);
            const pollStatus = pollResponse?.status ?? '';

            if (pollStatus && pollStatus !== 'pending') {
                return pollResponse;
            }

            if (attempt < 10) {
                await sleep(2000, signal);
            }
        }

        throw new Error('Timed out waiting for Xiaomi login to complete.');
    };

    const getPassToken = async () => {
        const controller = new AbortController();

        loginPollingControllerRef.current?.abort();
        loginPollingControllerRef.current = controller;

        setIsGettingPassToken(true);
        setIsPollingPassToken(true);
        setMessage('');
        clearLoginChallenge();

        try {
            const response = await fetch(loginEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    UserId: Number(userId),
                    Region: region,
                    Model: model,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Request failed with status ${response.status}`);
            }

            const loginResponse = normalizeLoginChallenge(await readJsonResponse(response));
            setLoginSessionId(loginResponse.sessionId);
            setLoginUrl(loginResponse.loginUrl);
            setQrCodeBase64(loginResponse.qrCodeBase64);
            setPollingEndpoint(loginResponse.pollingEndpoint);

            const pollResponse = await pollForPassToken(`${serverUrl}${loginResponse.pollingEndpoint}`, controller.signal);

            if (pollResponse?.status === 'completed') {
                if (pollResponse.userId !== undefined && pollResponse.userId !== null) {
                    setUserId(String(pollResponse.userId));
                }

                if (pollResponse.passToken !== undefined && pollResponse.passToken !== null) {
                    setPassToken(String(pollResponse.passToken));
                }

                setMessage('Pass token retrieved successfully.');
            } else {
                setMessage(`Login finished with status: ${pollResponse?.status ?? 'unknown'}`);
            }
        } catch (error) {
            setMessage(error?.name === 'AbortError'
                ? 'Login polling cancelled.'
                : error.message || 'Unable to get pass token.');
        } finally {
            clearLoginChallenge();
            setIsGettingPassToken(false);
            setIsPollingPassToken(false);
            if (loginPollingControllerRef.current === controller) {
                loginPollingControllerRef.current = null;
            }
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

                    {!isPollingPassToken ? (
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

                            <div>
                                <button
                                    type='button'
                                    onClick={getPassToken}
                                    disabled={isGettingPassToken || isSubmitting}
                                    className='bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-2 px-4 rounded'
                                >
                                    {isGettingPassToken ? 'Getting pass token...' : 'Get Pass Token'}
                                </button>
                            </div>

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
                                <select
                                    name='model'
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                                >
                                    {!modelOptions.some((option) => option.value === model) && model && (
                                        <option value={model}>
                                            {model} (saved)
                                        </option>
                                    )}
                                    {modelOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {message && (
                                <div className='text-sm text-center text-gray-700 whitespace-pre-wrap'>
                                    {message}
                                </div>
                            )}
                        </form>
                    ) : (
                        <div className='mt-10 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4'>
                            <div className='flex items-center justify-between gap-4'>
                                <div>
                                    <h2 className='text-lg font-semibold text-gray-900'>Waiting for Xiaomi login</h2>
                                    <p className='text-sm text-gray-600'>Scan the QR code or open the login link, then wait for polling to finish.</p>
                                </div>
                            </div>

                            {loginSessionId && (
                                <div className='text-xs text-gray-500'>Session ID: {loginSessionId}</div>
                            )}
                            {qrCodeBase64 && (
                                <div className='flex justify-center'>
                                    <img
                                        src={`data:image/png;base64,${qrCodeBase64}`}
                                        alt='Xiaomi login QR code'
                                        className='max-w-full rounded-lg border border-gray-200 bg-white p-2'
                                    />
                                </div>
                            )}
                            {loginUrl && (
                                <div className='break-all text-center text-sm'>
                                    <a
                                        href={loginUrl}
                                        target='_blank'
                                        rel='noreferrer'
                                        className='font-semibold text-blue-700 underline'
                                    >
                                        {loginUrl}
                                    </a>
                                </div>
                            )}
                            {pollingEndpoint && (
                                <div className='text-xs text-gray-500'>Polling endpoint: {pollingEndpoint}</div>
                            )}
                            <div className='text-sm text-center text-gray-700 whitespace-pre-wrap'>
                                {message || 'Polling for pass token...'}
                            </div>
                        </div>
                    )}

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

                        {isPollingPassToken ? (
                            <button
                                type='button'
                                onClick={cancelPassTokenPolling}
                                className='bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-5 ml-3'
                            >
                                Cancel Login
                            </button>
                        ) : (
                            <button
                                form='xiaomi-cloud-form'
                                type='submit'
                                disabled={!isGetMeasurementsEnabled || isSubmitting || isGettingPassToken}
                                className='bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded mt-5 ml-auto'
                            >
                                {isSubmitting ? 'Getting measurements...' : 'Get Measurements'}
                            </button>
                        )}

                    </div>
                </div>
            </div>
        </>)
}