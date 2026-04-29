import { Navigate, Outlet } from 'react-router-dom';
import { RouteConfig } from '../../constants';
import Cookies from 'js-cookie';

export const AuthLayout = () => {
    const token = Cookies.get('accessToken');

    if (token) {
        return <Navigate to={RouteConfig.ModuleSelection.path} />;
    }

    return <Outlet />;
};
