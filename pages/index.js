
import Link from 'next/link'

export default function Home() {
  return (
    <>

      <div>
        <h1 className='text-3xl font-bold'>Web Body Composition</h1>
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
          > Garmin Connect Form
          </button>
        </Link>
      </div>
    </>
  )
}
