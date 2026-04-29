import { http } from '../../utils/http';
import { ResponseListSuccess, ResponseDetailSuccess } from '../../utils/types/ServiceResponse';

export interface Permission {
    id: string;
    name: string;
    description: string;
    module: string;
}

export interface Role {
    id: string;
    name: string;
    displayName: string;
    description: string;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
}

export const getRoles = async (): Promise<ResponseListSuccess<Role>> => {
    const result = await http.get<ResponseListSuccess<Role>>('/roles');
    return {
        errorCode: result.errorCode,
        data: result.data || []
    };
};

export const getRole = async (id: string): Promise<ResponseDetailSuccess<Role>> => {
    const result = await http.get<ResponseDetailSuccess<Role>>(`/roles/${id}`);
    return result;
};

export const createRole = async (data: any): Promise<ResponseDetailSuccess<Role>> => {
    const result = await http.post<ResponseDetailSuccess<Role>>('/roles', data);
    return result;
};

export const updateRole = async (id: string, data: any): Promise<ResponseDetailSuccess<Role>> => {
    const result = await http.patch<ResponseDetailSuccess<Role>>(`/roles/${id}`, data);
    return result;
};

export const getPermissions = async (): Promise<ResponseListSuccess<Permission>> => {
    const result = await http.get<ResponseListSuccess<Permission>>('/roles/permissions');
    return {
        errorCode: result.errorCode,
        data: result.data || []
    };
};
