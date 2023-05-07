# Web Body Composition

Web App to export data from Mi Body Composition Scale and upload it to Garmin Connect Cloud. It also allows you to upload manually entered body composition data to the Garmin cloud. The Application works on any browser that support Web Bluetooth API. You can get rid off Mi Fit / Zepp Life for Xiaomi Body Composition Scale 2.

Application URL: https://web-body-composition.vercel.app/

## iOS / iPadOS (iPhone/iPad)

Unfortunately, neither Safari nor Chrome support the Web Bluetooth API on Apple devices (only on macOS does it work). The solution to this is alternative browsers. One of them is:

- [Bluefy - Web BLE Browser](https://apps.apple.com/us/app/bluefy-web-ble-browser/id1492822055)

Find it in the App Store and install it. Then open the Apps page in it.

On any other system it should works on chromium based browsers.

## Android Native Application

- https://github.com/lswiderski/mi-scale-exporter/

## Instruction

- Stand on your scale. Click Start Scan and connect with your scale via Bluetooth (modal should pop up). Measure yourself. Complete the user form data, address and get data from the scale.

- If your scale supports "Weigh small object" - turn it off

- Then you can review your data and upload it to Garmin Cloud. If you do not have Mi Body Composition Scale and just want to manually insert the data to Garmin Connect, you can so.

- The unofficial Garmin API does not support 2FA. To use this application, you must disable it.

- This App pass your data, email and password to Garmin Connect Cloud via proxy API server and then it sends to Garmin Cloud.

- The Proxy API does not store or log anything, it's just a middleware between this App and Garmin services.

- Proxy API repository: https://github.com/lswiderski/bodycomposition-webapi

Tested with Mi Body Composition Scale 1 and:

- iPhone 13 pro / iPad pro 11 gen 3 (Bluefy Browser)
- Oneplus 5T (Android 10) (Chrome)
- Windows PC (Chrome/Edge)

## If you like my work, you can buy me a coffee

<a href="https://www.buymeacoffee.com/lukaszswiderski" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

## Screenshots

![Web Application index](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/1_index.png)
![Scanner](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/2_xiaomi_scanner.png)
![Scale request](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/3_request.png)
![Scanning](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/4_scanning.png)
![Result](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/5_result.png)
![Garmin Form](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/6_garmin_form.png)
![FAQ](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/7_faq.png)
![Garmin Connect](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/8_garmin_result.png)