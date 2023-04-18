import Head from 'next/head'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })
console.log("test")
export default function Home() {
  return (
    <>
      <Head>
        <title>Web Body Composition</title>
        <meta name="description" content="Web Body Composition App" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>

        <div className={styles.center}>
          <div>
            <h1>Web Body Composition</h1>
          </div>
          <div>
            <ul>
              <li><Link href="/scale/xiaomi">Mi Scale Scanner</Link></li>
              <li><Link href="/sync/garmin">Garmin Connect Form</Link></li>
            </ul>
          </div>
        </div>

      </main>
    </>
  )
}
