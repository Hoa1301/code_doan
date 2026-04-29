import { useContext } from 'react';
import { ResponsiveContext } from '../contexts/responsive-context';

export const useResponsive = () => useContext(ResponsiveContext);
