import Head from 'next/head'
import Link from 'next/link'
import { Inter } from 'next/font/google'

export default function Home() {
  return (
    <>
      <Head>
        <title>Web Body Composition</title>
        <meta name="description" content="Web Body Composition App" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='flex items-center min-h-screen'>

        <div className='ml-auto mr-auto content-center'>
          <div>
            <h1 className='text-3xl font-bold'>Web Body Composition</h1>
          </div>

          <div className='flex flex-wrap'>
            <Link href="/scale/xiaomi" passHref className='m-5 w-full mr-auto ml-auto'>
              <button
                type="button"
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              >  Mi Scale Scanner
              </button>
            </Link>
            <Link href="/sync/garmin" passHref className='m-5 w-full mr-auto ml-auto'>
              <button
                type="submit"
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              > Garmin Connect Form
              </button>
            </Link>
          </div>
        </div>

      </main>
    </>
  )
}
