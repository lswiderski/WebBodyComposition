import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link';
import useLocalStorageState from 'use-local-storage-state'
import { useBodyCompositionContext } from '../contexts/bodycomposition.context';
import { useNotificationsContext } from '../contexts/notifications.context';
import Metrics from '@/services/metrics';

export default function Scanner() {

    const { bodyComposition, setBodyComposition } = useBodyCompositionContext();
    const { notification, setNotification } = useNotificationsContext();
    const router = useRouter();
    const [scanning, setScanning] = useState(false);
    const [age, setAge] = useLocalStorageState('age', {
        defaultValue: 25
    });
    const [height, setHeight] = useLocalStorageState('height', {
        defaultValue: 180
    });
    const [gender, setGender] = useLocalStorageState('gender', {
        defaultValue: 'male'
    });

    var myCharacteristic;

    async function startScan() {
        let serviceUuid = 'body_composition';
        if (serviceUuid.startsWith('0x')) {
            serviceUuid = parseInt(serviceUuid);
        }

        let characteristicUuid = 'body_composition_measurement';
        if (characteristicUuid.startsWith('0x')) {
            characteristicUuid = parseInt(characteristicUuid);
        }

        try {
            setScanning(true);
            setNotification({
                ...notification,
                status: 'Requesting Bluetooth Device...'
            });

            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [serviceUuid] }]
            });
            setNotification({
                ...notification,
                status: 'Connecting to GATT Server...'
            });
            const server = await device.gatt.connect();
            setNotification({
                ...notification,
                status: 'Getting Service....'
            });
            const service = await server.getPrimaryService(serviceUuid);
            setNotification({
                ...notification,
                status: 'Getting Characteristic...'
            });
            myCharacteristic = await service.getCharacteristic(characteristicUuid);

            await myCharacteristic.startNotifications();
            setNotification({
                ...notification,
                status: '> Notifications started'
            });
            myCharacteristic.addEventListener('characteristicvaluechanged',
                handleNotifications);
        } catch (error) {
            console.log('Argh! ' + error);
            setScanning(false);
            setNotification({
                ...notification,
                status: 'Argh! ' + error
            });
            setScanning(false);
        }
    }

    async function onStartButtonClick() {
        await startScan();
    }

    async function stopScan() {
        if (myCharacteristic) {
            try {
                await myCharacteristic.stopNotifications();
                setNotification({
                    ...notification,
                    status: '> Notifications stopped'
                });
                setScanning(false);
                myCharacteristic.removeEventListener('characteristicvaluechanged',
                    handleNotifications);
            } catch (error) {
                console.log('Argh! ' + error);
                setNotification({
                    ...notification,
                    status: 'Argh! ' + error
                });
                setScanning(false);
            }
        }
    }
    async function onStopButtonClick() {
        await stopScan();
    }

    async function handleNotifications(event) {
        let value = event.target.value;
        let notification = new Uint8Array(value.buffer).toString();
        setNotification({
            ...notification,
            status: notification
        });
        await computeData(value);
    }

    const computeData = async (data) => {
        const buffer = new Uint8Array(data.buffer)
        const ctrlByte1 = buffer[1]
        const stabilized = ctrlByte1 & (1 << 5)
        const weight = ((buffer[12] << 8) + buffer[11]) / 200
        const impedance = (buffer[10] << 8) + buffer[9]

        console.log('Impedance: ' + impedance);
        console.log('weight: ' + weight);
        setBodyComposition({
            ...bodyComposition,
            weight: weight,
            impedance: impedance
        })
        if (impedance > 0 && impedance < 3000 && stabilized) {
            const metrics = new Metrics(weight, impedance, height, age, gender);
            const { bmi,
                idealWeight,
                metabolicAge,
                proteinPercentage,
                lbmCoefficient,
                mbr,
                fat,
                muscleMass,
                boneMass,
                visceralFat,
                waterPercentage,
                bodyType } = metrics.getResult();

            setBodyComposition({
                ...bodyComposition,
                weight: weight,
                impedance: impedance,
                bmi: bmi.value.toFixed(2),
                idealWeight: idealWeight.value.toFixed(2),
                metabolicAge: metabolicAge.value.toFixed(2),
                proteinPercentage: proteinPercentage.value.toFixed(2),
                lbmCoefficient: lbmCoefficient.value.toFixed(2),
                mbr: mbr.value.toFixed(2),
                fat: fat.value.toFixed(2),
                muscleMass: muscleMass.value.toFixed(2),
                boneMass: boneMass.value.toFixed(2),
                visceralFat: visceralFat.value.toFixed(2),
                waterPercentage: waterPercentage.value.toFixed(2),
                bodyType: bodyType.value
            });

            await stopScan();
        }
    }

    return (

        <div>
            <div>
                <label className="block">
                    <span className="text-gray-700">Age</span>
                    <input
                        type="number"
                        name="age"
                        min={0}
                        value={age}
                        onChange={e => setAge(e.target.value)}
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
                    <span className="text-gray-700">Height (cm)</span>
                    <input
                        type="number"
                        name="height"
                        min={0}
                        value={height}
                        onChange={e => setHeight(e.target.value)}
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
                    <span className="text-gray-700">Gender</span>
                    <select
                        name="gender"
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="
                    block
                    w-full
                    mt-1
                    rounded-md
                    border-gray-300
                    shadow-sm
                    focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                  "
                    >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                    </select>
                </label>
            </div>
            <div className='flex flex-wrap'>
                <Link href="/" passHref>
                    <button
                        type="button"
                        className='bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mt-5 mr-auto'
                    >  &lt; Back
                    </button>
                </Link>
                <button
                    onClick={onStartButtonClick}
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5 ml-auto'
                > Start Scan
                </button>
                <button
                    onClick={onStopButtonClick}
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5 ml-auto'
                > Stop Scan
                </button>
                <button
                    onClick={() => {
                        router.push('/sync/garmin')
                    }}
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5 ml-auto'
                > Go To Garmin Form
                </button>
            </div>
            {
                scanning && <div>
                    status: {notification.status}
                    <div role="status" className="ml-auto mr-auto">
                        <svg aria-hidden="true" className="ml-auto mr-auto w-8 h-8  text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                    </div></div>
            }

        </div>
    )
}
