import Head from 'next/head'
import Navbar from './navbar'
import Footer from './footer'

export default function Layout({ children }) {
    return (
        <>
            <Head>
                <title>Web Body Composition</title>
                <meta name="description" content="Web Body Composition App" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className='flex flex-col h-screen justify-between'>
                <Navbar />
                <main className='flex items-center'>
                    <div className='ml-auto mr-auto'>
                        {children}
                    </div>
                </main>

                <Footer />
            </div>
        </>
    )
}