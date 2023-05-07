/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <div className='max-w-sm'>
        <div>
          <h1 className='text-3xl font-bold text-center'>Web Body Composition</h1>
        </div>
        <div className='text-justify '>
          <p className='p-3'> This app allows you to get weight and body composition data from the Mi Body Composition Scale and send it to the Garmin Connect cloud.</p>
          <p className='p-3'> You can also manually add the body composition data to Garmin Connect</p>
        </div>
        <div className='flex flex-wrap'>
          <Link href="/scale/xiaomi" passHref className='m-5 w-full mr-auto ml-auto'>
            <button
              type="button"
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
            >  Mi Scale Scanner
            </button>
          </Link>
          <Link href="/sync/garmin" passHref className='m-5 w-full mr-auto ml-auto'>
            <button
              type="submit"
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
            > Manual Garmin Connect Import
            </button>
          </Link>
          <Link href="/faq" passHref className='m-5 w-full mr-auto ml-auto'>
            <button
              type="submit"
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
            > FAQ
            </button>
          </Link>
          <Link href="https://play.google.com/store/apps/details?id=com.lukaszswiderski.MiScaleExporter" target='_blank' className='m-5 w-full mr-auto ml-auto'>
            <button
              type="submit"
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
            > Android Application
            </button>
          </Link>
          <Link href="https://github.com/lswiderski/WebBodyComposition" target='_blank' className='m-5 w-full mr-auto ml-auto'>
            <button
              type="submit"
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
            > Github Project Repository
            </button>
          </Link>
          <div className="mr-auto ml-auto mt-5" >
            <a href="https://www.buymeacoffee.com/lukaszswiderski" target="_blank" >
              <img src="https://cdn.buymeacoffee.com/buttons/default-orange.png"
                alt="Buy Me A Coffee"
                height="41"
                width="174"
              />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
