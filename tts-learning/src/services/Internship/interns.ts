import { http } from '../../utils/http';
import {
    ResponseListSuccess,
    ResponseDetailSuccess,
    SearchParams,
    PaginateParams
} from '../../utils/types/ServiceResponse';

export interface Intern {
    id: string;
    code: string;
    userId: string;
    user?: {
        email: string;
        fullName: string;
        avatarUrl?: string;
    };
    mentorId?: string;
    mentor?: {
        fullName: string;
    };
    track: string | null;
    startDate: string;
    endDate?: string;
    progress: number;
    status: 'active' | 'on_hold' | 'completed' | 'terminated' | 'Active' | 'On_hold' | 'Completed' | 'Terminated';
    createdAt: string;
    updatedAt: string;
}

export interface GetInternsParams {
    pagination?: PaginateParams;
    searcher?: SearchParams;
    track?: string;
    status?: string;
}

export const getInterns = async (params?: GetInternsParams): Promise<ResponseListSuccess<Intern>> => {
    return http.get<ResponseListSuccess<Intern>>('/interns', { params });
};

export const getIntern = async (id: string): Promise<ResponseDetailSuccess<Intern>> => {
    const result = await http.get<ResponseDetailSuccess<Intern>>(`/interns/${id}`);
    return result;
};

export const getMe = async (): Promise<ResponseDetailSuccess<Intern>> => {
    const result = await http.get<ResponseDetailSuccess<Intern>>('/interns/me');
    return result;
};

export interface UpdateInternParams {
    id: string;
    progress?: number;
    status?: string;
    userId?: string;
    mentorId?: string;
    learningPathId?: string;
    track?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
}

export interface MentorUpdateInternParams {
    id: string;
    learningPathId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}

export const updateIntern = async (params: UpdateInternParams): Promise<ResponseDetailSuccess<Intern>> => {
    const { id, ...data } = params;
    const result = await http.patch<ResponseDetailSuccess<Intern>>(`/interns/${id}`, data);
    return result;
};

export const updateInternByMentor = async (params: MentorUpdateInternParams): Promise<ResponseDetailSuccess<Intern>> => {
    const { id, ...data } = params;
    const result = await http.patch<ResponseDetailSuccess<Intern>>(`/interns/${id}/mentor-management`, data);
    return result;
};

export const deleteIntern = async (id: string): Promise<ResponseDetailSuccess<null>> => {
    const result = await http.delete<ResponseDetailSuccess<null>>(`/interns/${id}`);
    return result;
};

export const createIntern = async (params: any): Promise<ResponseDetailSuccess<Intern>> => {
    const result = await http.post<ResponseDetailSuccess<Intern>>('/interns', params);
    return result;
};
