
let scan;

const computeData = (data) => {
    const buffer = new Uint8Array(data.buffer)
    const ctrlByte1 = buffer[1]
    const stabilized = ctrlByte1 & (1 << 5)
    const weight = ((buffer[12] << 8) + buffer[11]) / 200
    const impedance = (buffer[10] << 8) + buffer[9]

    console.log('Impedance: ' + impedance);
    console.log('weight: ' + weight);
    if (impedance > 0 && impedance < 3000 && stabilized) {
        scan.stop()
    }
}

export default async function onScan() {
    let filters = [];

    let filterName = document.querySelector('#name').value;
    if (filterName) {
        filters.push({ name: filterName });
    }

    let filterNamePrefix = document.querySelector('#namePrefix').value;
    if (filterNamePrefix) {
        filters.push({ namePrefix: filterNamePrefix });
    }

    let options = {};
    if (document.querySelector('#allAdvertisements').checked) {
        options.acceptAllAdvertisements = true;
    } else {
        options.filters = filters;
    }

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

/* Utils */

const logDataView = (labelOfDataSource, key, valueDataView) => {
    const hexString = [...new Uint8Array(valueDataView.buffer)].map(b => {
        return b.toString(16).padStart(2, '0');
    }).join(' ');
    const textDecoder = new TextDecoder('ascii');
    const asciiString = textDecoder.decode(valueDataView.buffer);
    log(`  ${labelOfDataSource} Data: ` + key +
        '\n    (Hex) ' + hexString +
        '\n    (ASCII) ' + asciiString);
};