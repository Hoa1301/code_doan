import { createContext } from 'react';

export interface ResponsiveState {
    width: number;
    isMobile: boolean;
    isTablet: boolean;
    isLaptop: boolean;
    isDesktop: boolean;
}

const MOBILE_MAX = 991;
const TABLET_MAX = 1199;
const LAPTOP_MAX = 1439;

export const getResponsiveState = (width: number): ResponsiveState => ({
    width,
    isMobile: width <= MOBILE_MAX,
    isTablet: width > MOBILE_MAX && width <= TABLET_MAX,
    isLaptop: width > TABLET_MAX && width <= LAPTOP_MAX,
    isDesktop: width > LAPTOP_MAX
});

export const ResponsiveContext = createContext<ResponsiveState>(getResponsiveState(1440));
