import { useBodyCompositionContext } from '../contexts/bodycomposition.context';

export default function Scanner() {
    const { bodyComposition, setBodyComposition } = useBodyCompositionContext();



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
            console.log('Requesting Bluetooth Device...');
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [serviceUuid] }]
            });

            console.log('Connecting to GATT Server...');
            const server = await device.gatt.connect();

            console.log('Getting Service...');
            const service = await server.getPrimaryService(serviceUuid);

            console.log('Getting Characteristic...');
            myCharacteristic = await service.getCharacteristic(characteristicUuid);

            await myCharacteristic.startNotifications();

            console.log('> Notifications started');
            myCharacteristic.addEventListener('characteristicvaluechanged',
                handleNotifications);
        } catch (error) {
            console.log('Argh! ' + error);
        }
    }

    async function onStopButtonClick() {
        if (myCharacteristic) {
            try {
                await myCharacteristic.stopNotifications();
                console.log('> Notifications stopped');
                myCharacteristic.removeEventListener('characteristicvaluechanged',
                    handleNotifications);
            } catch (error) {
                console.log('Argh! ' + error);
            }
        }
    }

    function handleNotifications(event) {
        let value = event.target.value;
        let a = [];
        // Convert raw data bytes to hex values just for the sake of showing something.
        // In the "real" world, you'd use data.getUint8, data.getUint16 or even
        // TextDecoder to process raw data bytes.
        console.log(new Uint8Array(value));
        computeData(value);
        for (let i = 0; i < value.byteLength; i++) {
            a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
        }
        console.log('> ' + a.join(' '));
    }

    let scan;

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

    async function onScan() {
        let filters = [];

        let filterName = 'MIBCS'
        filters.push({ name: filterName });

        let options = {};
        options.filters = filters;

        try {
            console.log('Requesting Bluetooth Scan with options: ' + JSON.stringify(options));
            scan = await navigator.bluetooth.requestLEScan(options);

            console.log('Scan started with:');
            console.log(' acceptAllAdvertisements: ' + scan.acceptAllAdvertisements);
            console.log(' active: ' + scan.active);
            console.log(' keepRepeatedDevices: ' + scan.keepRepeatedDevices);
            console.log(' filters: ' + JSON.stringify(scan.filters));

            navigator.bluetooth.addEventListener('advertisementreceived', event => {
                console.log('Advertisement received.');
                console.log('  Device Name: ' + event.device.name);
                console.log('  Device ID: ' + event.device.id);
                console.log('  RSSI: ' + event.rssi);
                console.log('  TX Power: ' + event.txPower);
                console.log('  UUIDs: ' + event.uuids);
                event.manufacturerData.forEach((valueDataView, key) => {
                    console.log('Manufacturer: ' + key + ' - ' + valueDataView);
                });
                event.serviceData.forEach((valueDataView, key) => {
                    console.log('Service: ' + key + ' - ' + valueDataView);
                    computeData(valueDataView);
                });
            });
            debugger;
            setTimeout(stopScan, 10000);
            function stopScan() {
                console.log('Stopping scan...');
                scan.stop();
                console.log('Stopped.  scan.active = ' + scan.active);
            }
        } catch (error) {
            debugger;
            console.log('Argh! ' + error);
        }
    }



    return (

        <div>
            <button onClick={onScan}>Get data</button>
            <button onClick={onStartButtonClick}>Start </button>

            <button onClick={onStopButtonClick}>Stop</button>
        </div>
    )

}

