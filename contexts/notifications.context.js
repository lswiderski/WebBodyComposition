import { createContext, useContext, useState } from 'react';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
    let sharedState = {
        status: ''
    }
    const [notification, setNotification] = useState(sharedState);

    return (
        <NotificationsContext.Provider value={{ notification, setNotification }}>
            {children}
        </NotificationsContext.Provider>
    );
}
export function useNotificationsContext() {
    return useContext(NotificationsContext);
}