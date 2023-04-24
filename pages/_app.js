import { BodyCompositionProvider } from '../contexts/bodycomposition.context';
import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <BodyCompositionProvider>
      <Component {...pageProps} />
    </BodyCompositionProvider>
  )
}
