import { Outlet } from 'react-router-dom';
import { NotificationProvider } from '../../components/Notification/Notification';

const RootLayout = () => {
    return (
        <NotificationProvider>
            <Outlet />
        </NotificationProvider>
    );
};

export default RootLayout;
