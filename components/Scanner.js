import { useBodyCompositionContext } from '../contexts/bodycomposition.context';

export default function Scanner() {
    const { bodyComposition, setBodyComposition } = useBodyCompositionContext();

    async function handleConnect() {
        try {
            console.log('Getting existing permitted Bluetooth devices...');
            const devices = await navigator.bluetooth.getDevices();
            debugger;
            console.log('> Got ' + devices.length + ' Bluetooth devices.');
            // These devices may not be powered on or in range, so scan for
            // advertisement packets from them before connecting.
            for (const device of devices) {
                console.log(device);
                connectToBluetoothDevice(device);
            }
        }
        catch (error) {
            console.log('Argh! ' + error);
        }
    }

    async function connectToBluetoothDevice(device) {
        const abortController = new AbortController();

        device.addEventListener('advertisementreceived', async (event) => {
            console.log('> Received advertisement from "' + device.name + '"...');
            // Stop watching advertisements to conserve battery life.
            abortController.abort();
            console.log('Connecting to GATT Server from "' + device.name + '"...');
            console.log(device);
            console.log(event);
            try {
                await device.gatt.connect();
                console.log(device);
                debugger;
                console.log('> Bluetooth device "' + device.name + ' connected.');
            }
            catch (error) {
                console.log('Argh! ' + error);
            }
        }, { once: true });

        try {
            console.log('Watching advertisements from "' + device.name + '"...');
            await device.watchAdvertisements({ signal: abortController.signal });
        }
        catch (error) {
            console.log('Argh! ' + error);
        }
    }

    async function handleRequestDevice() {
        try {
            console.log('Requesting any Bluetooth device...');
            const device = await navigator.bluetooth.requestDevice({
                // filters: [...] <- Prefer filters to save energy & show relevant devices.
                acceptAllDevices: true
            });

            console.log('> Requested ' + device.name);
        }
        catch (error) {
            console.log('Argh! ' + error);
        }

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

    async function onWatchAdvertisementsButtonClick() {
        try {
            log('Requesting any Bluetooth device...');
            const device = await navigator.bluetooth.requestDevice({
                // filters: [...] <- Prefer filters to save energy & show relevant devices.
                acceptAllDevices: true
            });

            log('> Requested ' + device.name);

            device.addEventListener('advertisementreceived', (event) => {
                console.log('Advertisement received.');
                console.log('  Device Name: ' + event.device.name);
                console.log('  Device ID: ' + event.device.id);
                console.log('  RSSI: ' + event.rssi);
                console.log('  TX Power: ' + event.txPower);
                console.log('  UUIDs: ' + event.uuids);
                event.manufacturerData.forEach((valueDataView, key) => {
                    console.log('Manufacturer ' + key + ' - ' + valueDataView);
                });
                event.serviceData.forEach((valueDataView, key) => {
                    console.log('Service', + key + ' - ' + valueDataView);
                    computeData(valueDataView);
                });
                console.log(event);
            });

            log('Watching advertisements from "' + device.name + '"...');
            await device.watchAdvertisements();
        } catch (error) {
            log('Argh! ' + error);
        }
    }


    return (

        <div>
            <button onClick={handleConnect}>Get data</button>
            <button onClick={handleRequestDevice}>Pair with scale</button>

            <button onClick={onWatchAdvertisementsButtonClick}>Watch Advertisements</button>
        </div>
    )

}

