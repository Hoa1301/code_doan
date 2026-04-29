import { http } from '../../utils/http';
import { ResponseListSuccess, ResponseDetailSuccess } from '../../utils/types/ServiceResponse';

export interface User {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    avatarUrl?: string;
    role?: string;
    status: 'active' | 'inactive' | 'suspended';
    roles?: Array<{
        id: string;
        name: string;
        displayName?: string;
    }>;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
}

export const getUsers = async (): Promise<ResponseListSuccess<User>> => {
    const result = await http.get<ResponseListSuccess<User>>('/users');
    return {
        errorCode: result.errorCode,
        data: result.data || []
    };
};

export const getUser = async (id: string): Promise<ResponseDetailSuccess<User>> => {
    const result = await http.get<ResponseDetailSuccess<User>>(`/users/${id}`);
    return result;
};

export const createUser = async (data: any): Promise<ResponseDetailSuccess<User>> => {
    const result = await http.post<ResponseDetailSuccess<User>>('/users', data);
    return result;
};

export const updateUser = async (id: string, data: any): Promise<ResponseDetailSuccess<User>> => {
    const result = await http.patch<ResponseDetailSuccess<User>>(`/users/${id}`, data);
    return result;
};

export const deleteUser = async (id: string): Promise<ResponseDetailSuccess<null>> => {
    const result = await http.delete<ResponseDetailSuccess<null>>(`/users/${id}`);
    return result;
};
