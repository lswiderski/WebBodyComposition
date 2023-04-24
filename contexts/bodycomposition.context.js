import { createContext, useContext, useState } from 'react';

const BodyCompositionContext = createContext();

export function BodyCompositionProvider({ children }) {
    let sharedState = {
        value: 42

    }
    const [bodyComposition, setBodyComposition] = useState(sharedState);



    return (
        <BodyCompositionContext.Provider value={{ bodyComposition, setBodyComposition }}>
            {children}
        </BodyCompositionContext.Provider>
    );
}
export function useBodyCompositionContext() {
    return useContext(BodyCompositionContext);
}