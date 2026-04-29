import { Navigate } from 'react-router-dom';
import { RouteConfig } from '../../constants';
import Cookies from 'js-cookie';
import { ReactNode, useEffect, useState } from 'react';
import { getProfile } from '../../services/auth/profile';

interface ProtectRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

export const ProtectRoute = ({ children, allowedRoles }: ProtectRouteProps) => {
    const token = Cookies.get('accessToken');
    const [isCheckingRole, setIsCheckingRole] = useState<boolean>(!!allowedRoles?.length);
    const [hasRoleAccess, setHasRoleAccess] = useState<boolean>(true);

    useEffect(() => {
        if (!token || !allowedRoles?.length) {
            setIsCheckingRole(false);
            setHasRoleAccess(true);
            return;
        }

        let isMounted = true;
        const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

        const checkRoleAccess = async () => {
            try {
                const profileResponse = await getProfile();
                const profileData = (profileResponse as any)?.data || {};

                const roleFromSingleField = String(profileData.role || '').toLowerCase();
                const rolesFromArray = Array.isArray(profileData.roles)
                    ? profileData.roles.map((role: any) => String(role?.name || '').toLowerCase())
                    : [];

                const currentRoles = [roleFromSingleField, ...rolesFromArray].filter(Boolean);
                const isAllowed = currentRoles.some((role) => normalizedAllowedRoles.includes(role));

                if (isMounted) {
                    setHasRoleAccess(isAllowed);
                }
            } catch {
                if (isMounted) {
                    setHasRoleAccess(false);
                }
            } finally {
                if (isMounted) {
                    setIsCheckingRole(false);
                }
            }
        };

        void checkRoleAccess();

        return () => {
            isMounted = false;
        };
    }, [token, allowedRoles]);

    if (!token) {
        return <Navigate to={RouteConfig.LoginPage.path} />;
    }

    if (isCheckingRole) {
        return null;
    }

    if (allowedRoles?.length && !hasRoleAccess) {
        return <Navigate to={RouteConfig.ForbiddenPage.path} replace />;
    }

    return <>{children}</>;
};
