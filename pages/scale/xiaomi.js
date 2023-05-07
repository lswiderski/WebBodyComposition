import Link from 'next/link';
import Scanner from '@/components/scanner';
import { useBodyCompositionContext } from '../../contexts/bodycomposition.context';
export default function Xiaomi() {
    const { bodyComposition } = useBodyCompositionContext();


    return (
        <>
            <div className='flex flex-wrap'>
                <div className='w-full max-w-sm ml-auto mr-auto'>

                    <h1 className='text-2xl font-bold text-center mb-5'>Mi Body Composition Scale Scanner</h1>
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
                        <div className='ml-auto mr-auto w-8/12'>
                            <div className='flex justify-between '> <div>BMI: </div><div className='font-bold' >{bodyComposition.bmi}</div> </div>
                            <div className='flex justify-between '> <div> Ideal Weight: </div><div className='font-bold' >{bodyComposition.idealWeight} </div> </div>
                            <div className='flex justify-between '> <div> Metabolic Age: </div><div className='font-bold' >{bodyComposition.metabolicAge} </div> </div>
                            <div className='flex justify-between '> <div> Water (%): </div><div className='font-bold' >{bodyComposition.waterPercentage}</div> </div>
                            <div className='flex justify-between '> <div> Protein Percentage: </div><div className='font-bold' >{bodyComposition.proteinPercentage}</div> </div>
                            <div className='flex justify-between '> <div> Basal Metabolism (kCal): </div><div className='font-bold' >{bodyComposition.mbr} </div> </div>
                            <div className='flex justify-between '> <div> Fat: </div><div className='font-bold' >{bodyComposition.fat} </div> </div>
                            <div className='flex justify-between '> <div> Muscle Mass: </div><div className='font-bold' >{bodyComposition.muscleMass}</div> </div>
                            <div className='flex justify-between '> <div> Bone Mass: </div><div className='font-bold' >{bodyComposition.boneMass} </div> </div>
                            <div className='flex justify-between '> <div> Visceral Fat: </div><div className='font-bold' >{bodyComposition.visceralFat}</div> </div>
                            <div className='flex justify-between '> <div> Body Type: </div><div className='font-bold' >{bodyComposition.bodyType} </div> </div>
                        </div>
                    }
                    <div className='flex flex-wrap mt-10'>
                        <Link href="/" passHref className='mr-auto'>
                            <button
                                type="button"
                                className='bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mt-5'
                            >  &lt; Back
                            </button>
                        </Link>
                        <Link href="/sync/garmin" passHref className='ml-auto'>
                            <button
                                type="button"
                                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5'
                            > Go To Garmin Form
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </>)
}