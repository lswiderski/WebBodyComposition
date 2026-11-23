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
                        <div className='font-bold'>3. Coffee</div>
                        <div>Keep in mind that this is my hobby project. It was created for my inner needs and I believe it may be useful to others as well. I do not receive any compensation for creating and maintaining this project. If you want to support the development or thank me, you can buy me a coffee.</div>
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
                        <div className='font-bold'>5. How It works</div>
                        <div>This App pass your data, email and password to Garmin Cloud via external API server. The API does not store or log anything, it&apos;s just a middleware between this App and Garmin services.</div>
                    </li>
                    <li className='mb-5'>
                        <div className='font-bold'>6. Results different from the Vitafit app</div>
                        <div>Check that height, age, sex and athlete mode are identical in both apps. This app uses the same algorithm as the Vitafit app, so the results should match.</div>
                    </li>
                    <li className='mb-5'>
                        <div className='font-bold'>7. Cannot Sync. Missing Cookies</div>
                        <div>You probably have 2FA enabled. It&apos;s not supported. Please turn it off if you want to use this application.</div>
                    </li>
                    <li className='mb-5'>
                        <div className='font-bold'>8. Garmin and Vitafit</div>
                        <div>This application is an open source community project with no affiliation with Garmin or Vitafit. You use it at your own risk. You can always check out the source code on Github.</div>
                    </li>
                    <li className='mb-5'>
                        <div className='font-bold'>9. Feedback & Contact</div>
                        <div>If you found a bug, need a feature or have an idea, share it with me at the project repository.</div>
                        <Link href="https://github.com/lswiderski/WebBodyComposition" target='_blank' className='m-5 w-full mr-auto ml-auto'>
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