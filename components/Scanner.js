import { useState } from 'react'
import { useBodyCompositionContext } from '../contexts/bodycomposition.context';

export default function Scanner() {
    const { bodyComposition, setBodyComposition } = useBodyCompositionContext();
    const { status, setStatus } = useState('-');

    var myCharacteristic;

    async function onStartButtonClick() {
        let serviceUuid = 'body_composition';
        if (serviceUuid.startsWith('0x')) {
            serviceUuid = parseInt(serviceUuid);
        }

        let characteristicUuid = 'body_composition_measurement';
        if (characteristicUuid.startsWith('0x')) {
            characteristicUuid = parseInt(characteristicUuid);
        }

        try {
            setStatus('Requesting Bluetooth Device...');
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [serviceUuid] }]
            });

            setStatus('Connecting to GATT Server...');
            const server = await device.gatt.connect();

            setStatus('Getting Service...');
            const service = await server.getPrimaryService(serviceUuid);

            setStatus('Getting Characteristic...');
            myCharacteristic = await service.getCharacteristic(characteristicUuid);

            await myCharacteristic.startNotifications();

            setStatus('> Notifications started');
            myCharacteristic.addEventListener('characteristicvaluechanged',
                handleNotifications);
        } catch (error) {
            setStatus('Argh! ' + error);
        }
    }

    async function onStopButtonClick() {
        if (myCharacteristic) {
            try {
                await myCharacteristic.stopNotifications();
                setStatus('> Notifications stopped');
                myCharacteristic.removeEventListener('characteristicvaluechanged',
                    handleNotifications);
            } catch (error) {
                setStatus('Argh! ' + error);
            }
        }
    }

    function handleNotifications(event) {
        let value = event.target.value;
        setStatus(new TextDecoder().decode(new Uint8Array(value)))
        computeData(value);
    }

    const computeData = (data) => {
        const buffer = new Uint8Array(data.buffer)
        const ctrlByte1 = buffer[1]
        const stabilized = ctrlByte1 & (1 << 5)
        const weight = ((buffer[12] << 8) + buffer[11]) / 200
        const impedance = (buffer[10] << 8) + buffer[9]

        console.log('Impedance: ' + impedance);
        console.log('weight: ' + weight);
        setBodyComposition({
            ...bodyComposition,
            weight: weight
        })
        if (impedance > 0 && impedance < 3000 && stabilized) {
            scan.stop()
        }
    }

    return (

        <div>
            <button onClick={onStartButtonClick}>Start </button>

            <button onClick={onStopButtonClick}>Stop</button>
            status: {status}
        </div>
    )

}

