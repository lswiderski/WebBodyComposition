import { BodyCompositionProvider } from '../contexts/bodycomposition.context';
import Layout, { layout } from '../components/layout';
import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <BodyCompositionProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </BodyCompositionProvider>
  )
}
