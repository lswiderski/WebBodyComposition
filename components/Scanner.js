import { useState } from 'react'
import { useBodyCompositionContext } from '../contexts/bodycomposition.context';
import { useNotificationsContext } from '../contexts/notifications.context';

export default function Scanner() {
    const { bodyComposition, setBodyComposition } = useBodyCompositionContext();
    const { notification, setNotification } = useNotificationsContext();

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

    async function onStopButtonClick() {
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

    function handleNotifications(event) {
        let value = event.target.value;
        let notification = new Uint8Array(value.buffer).toString();
        setNotification({
            ...notification,
            status: notification
        });
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
            weight: weight,
            impedance: impedance
        })
        if (impedance > 0 && impedance < 3000 && stabilized) {
        }
    }

    return (

        <div>
            <button onClick={onStartButtonClick}>Start </button>

            <button onClick={onStopButtonClick}>Stop</button>
            status: {notification.status}
        </div>
    )

}

