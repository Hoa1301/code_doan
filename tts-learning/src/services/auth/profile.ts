import { http } from '../../utils/http';
import { ResponseDetailSuccess } from '../../utils/types/ServiceResponse';

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    roles: Array<{
        name: string;
        displayName: string;
    }>;
    avatarUrl?: string;
    department?: string;
    phone?: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export const getProfile = async (): Promise<ResponseDetailSuccess<UserProfile>> => {
    const result = await http.get<ResponseDetailSuccess<UserProfile>>('/auth/profile');
    return result;
};

export const uploadAvatar = async (userId: string, file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const result = await http.post(`/users/${userId}/avatar`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return result;
};

export const updateProfile = async (data: Partial<UserProfile>): Promise<ResponseDetailSuccess<UserProfile>> => {
    const result = await http.patch<ResponseDetailSuccess<UserProfile>>('/auth/profile', data);
    return result;
};

export const register = async (data: any): Promise<ResponseDetailSuccess<UserProfile>> => {
    const result = await http.post<ResponseDetailSuccess<UserProfile>>('/auth/register', data);
    return result;
};

export const changePassword = async (
    payload: ChangePasswordPayload
): Promise<ResponseDetailSuccess<{ message: string }>> => {
    const result = await http.patch<ResponseDetailSuccess<{ message: string }>>('/auth/change-password', payload);
    return result;
};
