import Metrics from '@/services/metrics';
var myCharacteristic;

const logDataView = (labelOfDataSource, key, valueDataView) => {
    const hexString = [...new Uint8Array(valueDataView.buffer)].map(b => {
        return b.toString(16).padStart(2, '0');
    }).join(' ');
    console.log(valueDataView);
    log(`  ${labelOfDataSource} Data: ` + key +
        '\n    (Hex) ' + hexString);
};

const log = (message) => {
    console.log(message);
    document.querySelector('#log').textContent += message + '\n';
}

export async function startS400Scan({ age, height, gender, setBodyComposition, setNotification, setScanning, setSerrorMessage, }) {


    setSerrorMessage('');


    try {
        setScanning(false);
        setNotification({
            status: 'Requesting Bluetooth Device...'
        });

        let filters = [];
        filters.push({ namePrefix: 'Xiaomi' });
        let options = {};
        options.filters = filters;

        log('Requesting Bluetooth Scan with options: ' + JSON.stringify(options));
        const scan = await navigator.bluetooth.requestLEScan(options);

        log('Scan started with:');
        log(' acceptAllAdvertisements: ' + scan.acceptAllAdvertisements);
        log(' active: ' + scan.active);
        log(' keepRepeatedDevices: ' + scan.keepRepeatedDevices);
        log(' filters: ' + JSON.stringify(scan.filters));

        navigator.bluetooth.addEventListener('advertisementreceived', event => {
            log('Advertisement received.');
            log('  Device Name: ' + event.device.name);
            log('  Device ID: ' + event.device.id);
            log('  RSSI: ' + event.rssi);
            log('  TX Power: ' + event.txPower);
            log('  UUIDs: ' + event.uuids);
            debugger;
            log(event);
            console.log(event);
            event.manufacturerData.forEach((valueDataView, key) => {
                logDataView('Manufacturer', key, valueDataView);
            });
            event.serviceData.forEach((valueDataView, key) => {
                logDataView('Service', key, valueDataView);
            });
        });

        setTimeout(stopScan, 10000);
        function stopScan() {
            log('Stopping scan...');
            scan.stop();
            log('Stopped.  scan.active = ' + scan.active);
        }
    } catch (error) {
        log('Argh! ' + error);
        console.log('Argh! ' + error);
        setScanning(false);
        setSerrorMessage(error.toString());
    }
}

export async function stopS400Scan({ setScanning, setSerrorMessage }) {
    setScanning(false);
    if (myCharacteristic) {
        try {

            await myCharacteristic.stopNotifications();
            myCharacteristic.removeEventListener('advertisementreceived',
                handleNotifications);
        } catch (error) {
            console.log('Argh! ' + error);
            setScanning(false);
            setSerrorMessage(error.toString());
        }
    }
}

export async function handleNotifications(event, age, height, gender, setBodyComposition, setNotification, setScanning, setSerrorMessage) {


    let value = event.target.value;
    let notification = new Uint8Array(value.buffer).toString();
    setNotification({
        status: `received: ${notification}`
    });
    await computeData(value, age, height, gender, setBodyComposition, setScanning, setSerrorMessage);
}

const computeData = async (data, age, height, gender, setBodyComposition, setScanning, setSerrorMessage) => {
    const buffer = new Uint8Array(data.buffer)
    const ctrlByte1 = buffer[1]
    const stabilized = ctrlByte1 & (1 << 5)
    const weight = ((buffer[12] << 8) + buffer[11]) / 200
    const impedance = (buffer[10] << 8) + buffer[9]

    setBodyComposition({
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

        await stopScan({ setScanning, setSerrorMessage });
    }
}