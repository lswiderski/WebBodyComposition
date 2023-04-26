import { useState } from 'react'
import { useBodyCompositionContext } from '../contexts/bodycomposition.context';
import { useNotificationsContext } from '../contexts/notifications.context';
import Metrics from '@/services/metrics';

export default function Scanner() {
    const { bodyComposition, setBodyComposition } = useBodyCompositionContext();
    const { notification, setNotification } = useNotificationsContext();
    const [age, setAge] = useState(25);
    const [height, setHeight] = useState(180);
    const [gender, setGender] = useState('male');
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
            setNotification({
                ...notification,
                status: 'Argh! ' + error
            });
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
                myCharacteristic.removeEventListener('characteristicvaluechanged',
                    handleNotifications);
            } catch (error) {
                console.log('Argh! ' + error);
                setNotification({
                    ...notification,
                    status: 'Argh! ' + error
                });
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
                visceralFat } = metrics.getResult();

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
            });

            await stopScan();
        }
    }

    return (

        <div>
            <div>
                <div className="input">
                    <label>Age</label>
                    <input name="age" type="number" required
                        value={age}
                        onChange={e => setAge(e.target.value)} />
                </div>
                <div className="input">
                    <label>Height (cm)</label>
                    <input name="height" type="number" required
                        value={height}
                        onChange={e => setHeight(e.target.value)} />
                </div>
                <div className="input">
                    <label>Gender</label>
                    <select name="gender"
                        value={gender}
                        onChange={e => setGender(e.target.value)} >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                    </select>
                </div>
            </div>

            <button onClick={onStartButtonClick}>Start </button>

            <button onClick={onStopButtonClick}>Stop</button>
            status: {notification.status}
        </div>
    )

}

