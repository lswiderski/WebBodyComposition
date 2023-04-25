import { BodyCompositionProvider } from '../contexts/bodycomposition.context';
import { NotificationsProvider } from '@/contexts/notifications.context';
import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <NotificationsProvider>
      <BodyCompositionProvider>
        <Component {...pageProps} />
      </BodyCompositionProvider>
    </NotificationsProvider>
  )
}
