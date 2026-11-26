/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import Image from 'next/image'
export default function Faq() {

    return (
        <>
            <div className='max-w-md p-5 mb-5'>
                <ol>
                    <li className='mb-5'>
                        <div className='font-bold'>1. iOS / iPadOS</div>
                        <div >On iOS and iPadOS please use <code>Bluefy - Web BLE Browser</code>. It does not work on Safari or Chrome</div>
                        <a href="https://apps.apple.com/us/app/bluefy-web-ble-browser/id1492822055" target="_blank" >
                            <Image src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                                alt="Download Bluefy browser on the App Store"
                                height="40"
                                width="135"
                                className="ml-auto mr-auto" /></a>
                    </li>
                    <li className='mb-5'>
                        <div className='font-bold'>2. Android</div>
                        <div>On Android use Chrome, which supports Web Bluetooth.</div>
                    </li>
                    <li className='mb-5'>
                        <div className='font-bold'>3. Credits</div>
                        <div>This app is based on <a href="https://github.com/lswiderski/WebBodyComposition" target="_blank" className="underline">WebBodyComposition</a> and uses <a href="https://github.com/lswiderski/yet-another-garmin-connect-client" target="_blank" className="underline">YAGCC</a> to upload to Garmin Connect, both by Łukasz Świderski. If they are useful to you, you can support him.</div>
                        <a href="https://www.buymeacoffee.com/lukaszswiderski" target="_blank" >
                            <img src="https://cdn.buymeacoffee.com/buttons/default-orange.png"
                                alt="Buy Me A Coffee"
                                height="41"
                                width="174"
                                className="mr-auto ml-auto" />
                        </a>
                    </li>
                    <li className='mb-5'>
                        <div className='font-bold'>4. How to connect to the scale</div>
                        <div>Set your height, age, sex and athlete mode as in the Vitafit app. Step on the scale barefoot, tap &quot;Connect to scale&quot; and pick &quot;Vitafit Body Fat&quot;. The Vitafit app must not have Bluetooth access, or it will connect to the scale first.</div>
                    </li>
                    <li className='mb-5'>
                        <div className='font-bold'>5. How it works</div>
                        <div>The app reads the weight and impedance from the scale and computes the body composition in your browser. Garmin Connect uploads go through a YAGCC server (the instance configured for this deployment), which receives your values, your Garmin email and password and logs your email address. Intervals.icu is called directly from your browser with your API key. Apple Health is written by an iOS Shortcut on your iPhone. Only what you choose to remember (email, Garmin tokens, Intervals API key, profile) is kept, in your browser.</div>
                    </li>
                    <li className='mb-5'>
                        <div className='font-bold'>6. Results different from the Vitafit app</div>
                        <div>Check that height, age, sex and athlete mode are identical in both apps. This app uses regression formulas equivalent to those of the Vitafit app, validated against real measurements, so the results should match.</div>
                    </li>
                    <li className='mb-5'>
                        <div className='font-bold'>7. Garmin upload fails</div>
                        <div>If your account has two-step verification, the app asks for the code: enter it and submit again. &quot;429 (Too Many Requests)&quot; means Garmin is limiting logins: wait a few hours and try once. Check &quot;remember me&quot; so the app saves the Garmin token and does not log in on every upload.</div>
                    </li>
                    <li className='mb-5'>
                        <div className='font-bold'>8. Garmin and Vitafit</div>
                        <div>This application is an open source community project with no affiliation with Garmin or Vitafit. You use it at your own risk. You can always check out the source code on Github.</div>
                    </li>
                    <li className='mb-5'>
                        <div className='font-bold'>9. Feedback & Contact</div>
                        <div>If you found a bug, need a feature or have an idea, open an issue in the project repository.</div>
                        <Link href="https://github.com/capitantrueno/VitafitBodyComposition" target='_blank' className='m-5 w-full mr-auto ml-auto'>
                            <button
                                type="submit"
                                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
                            > Github repository
                            </button>
                        </Link>
                    </li>

                </ol>
            </div>
        </>
    )
}