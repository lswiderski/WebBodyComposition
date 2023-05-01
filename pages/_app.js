import { BodyCompositionProvider } from '../contexts/bodycomposition.context';
import { NotificationsProvider } from '@/contexts/notifications.context';
import Layout, { layout } from '../components/layout';
import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <NotificationsProvider>
      <BodyCompositionProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </BodyCompositionProvider>
    </NotificationsProvider>
  )
}
