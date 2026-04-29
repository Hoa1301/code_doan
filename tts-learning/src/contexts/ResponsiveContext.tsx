import { ReactNode, useEffect, useMemo, useState } from 'react';
import { getResponsiveState, ResponsiveContext } from './responsive-context';

interface ResponsiveProviderProps {
    children: ReactNode;
}

export const ResponsiveProvider = ({ children }: ResponsiveProviderProps) => {
    const [width, setWidth] = useState<number>(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const value = useMemo(() => getResponsiveState(width), [width]);

    return <ResponsiveContext.Provider value={value}>{children}</ResponsiveContext.Provider>;
};
