import { httpPublic } from '../../utils/http';

interface LoginData {
    access_token: string;
    user: {
        id: string;
        email: string;
        fullName: string;
        role?: string;
        roles?: Array<{
            name: string;
            displayName: string;
        }>;
    };
}

export const login = async (email: string, password: string): Promise<any> => {
    const data = await httpPublic.post<LoginData>('/auth/login', { email, password });
    const loginData = data as unknown as LoginData;

    return {
        accessToken: loginData.access_token,
        userInfo: {
            userId: loginData.user.id,
            email: loginData.user.email,
            fullName: loginData.user.fullName,
            role: loginData.user.role || loginData.user.roles?.[0]?.name || ''
        }
    };
};
