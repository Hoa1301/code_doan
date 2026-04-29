import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import './index.css';
import './i18n';
import { App } from './App';
import { ResponsiveProvider } from './contexts/ResponsiveContext';

import 'dayjs/locale/vi';

dayjs.locale('vi');

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ResponsiveProvider>
            <App />
        </ResponsiveProvider>
    </StrictMode>
);
