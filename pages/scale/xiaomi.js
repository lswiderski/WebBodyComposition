
import Scanner from '@/components/scanner';
import { useBodyCompositionContext } from '../../contexts/bodycomposition.context';
export default function Xiaomi() {
    const { bodyComposition } = useBodyCompositionContext();


    return (
        <>
            <div className='flex flex-wrap'>
                <div className='w-full max-w-sm ml-auto mr-auto'>

                    <h1 className='text-3xl font-bold text-center mb-5'>Mi Body Composition Scale Scanner</h1>
                    <div className='flex mb-5'>

                        <p className=''>On iOS and iPadOS please use <code>Bluefy - Web BLE Browser</code>. It does not work on Safari or Chrome </p>

                        <div className=' w-screen mr-auto'>
                            <a href="https://apps.apple.com/us/app/bluefy-web-ble-browser/id1492822055" target="_blank" >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                                    alt="Download Bluefy browser on the App Store"
                                    height="40"
                                    width="135"
                                    className="ml-auto" /></a>
                        </div>

                    </div>
                    <p className='mb-5'>After click on &quot;Start Scan&quot; connect with your scale. Probably called MIBCS  </p>

                    <Scanner></Scanner>
                    {
                        bodyComposition.weight &&
                        <div className='text-center font-bold '>
                            <span className='text-9xl'> {bodyComposition.weight}</span>
                            <span className='text-3xl '>kg</span>
                        </div>

                    }

                    {
                        bodyComposition.bmi &&
                        <div>
                            <p> BMI: {bodyComposition.bmi} </p>
                            <p> Ideal Weight: {bodyComposition.idealWeight} </p>
                            <p> Metabolic Age: {bodyComposition.metabolicAge} </p>
                            <p> Water (%): {bodyComposition.waterPercentage} </p>
                            <p> Protein Percentage: {bodyComposition.proteinPercentage} </p>
                            <p> Basal Metabolism (kCal): {bodyComposition.mbr} </p>
                            <p> Fat: {bodyComposition.fat} </p>
                            <p> Muscle Mass: {bodyComposition.muscleMass} </p>
                            <p> Bone Mass: {bodyComposition.boneMass} </p>
                            <p> Visceral Fat: {bodyComposition.visceralFat} </p>
                            <p> Body Type: {bodyComposition.bodyType} </p>
                        </div>
                    }

                </div>
            </div>
        </>)
}