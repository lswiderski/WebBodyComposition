import Head from 'next/head'
import Scanner from '../../components/Scanner'
import { useBodyCompositionContext } from '../../contexts/bodycomposition.context';
export default function Xiaomi() {
    const { bodyComposition } = useBodyCompositionContext();


    return (
        <>
            <Head>
                <title>Web Body Composition</title>
                <meta name="description" content="Web Body Composition App" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className='flex flex-wrap'>
                <div className='w-full max-w-lg ml-auto mr-auto'>

                    <h1 className='text-3xl font-bold text-center mb-5'>Mi Scale Body Composition Scanner</h1>
                    <div>



                        <p>The Web Bluetooth API lets websites discover and communicate with devices over the Bluetooth 4 wireless standard using the Generic Attribute Profile (GATT). It is currently partially implemented in Android M, Chrome OS, Mac, and Windows 10/11.
                        </p>
                        <p className='mt-5'>On iOS and iPadOS please use <code>Bluefy - Web BLE Browser</code></p>
                    </div>

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