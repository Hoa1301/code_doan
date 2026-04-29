import { http } from '../../utils/http';
import {
    ResponseListSuccess,
    ResponseDetailSuccess,
    SearchParams,
    PaginateParams
} from '../../utils/types/ServiceResponse';

export interface MentorRequest {
    id: string;
    mentorId: string;
    mentor?: {
        id: string;
        fullName: string;
    };
    title: string;
    department: string;
    position: string;
    quantity: number;
    requiredSkills: string;
    expectedStartDate: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'approved' | 'rejected' | 'in_progress';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetMentorRequestsParams {
    pagination?: PaginateParams;
    searcher?: SearchParams;
    status?: string;
    priority?: string;
    department?: string;
}

export const getMentorRequests = async (
    params?: GetMentorRequestsParams
): Promise<ResponseListSuccess<MentorRequest>> => {
    const result = await http.get<any>('/mentor-requests', { params });

    return {
        errorCode: result.errorCode,
        data: result.data || [],
        pagination: result.pagination
    };
};

export const getMentorRequest = async (id: string): Promise<ResponseDetailSuccess<MentorRequest>> => {
    const result = await http.get<ResponseDetailSuccess<MentorRequest>>(`/mentor-requests/${id}`);
    return result;
};

export interface CreateMentorRequestParams {
    title: string;
    department: string;
    position: string;
    quantity?: number;
    requiredSkills?: string;
    expectedStartDate?: string;
    priority?: 'high' | 'medium' | 'low';
    notes?: string;
}

export const createMentorRequest = async (
    params: CreateMentorRequestParams
): Promise<ResponseDetailSuccess<MentorRequest>> => {
    const result = await http.post<ResponseDetailSuccess<MentorRequest>>('/mentor-requests', params);
    return result;
};

export interface UpdateMentorRequestParams {
    id: string;
    title?: string;
    department?: string;
    position?: string;
    priority?: 'high' | 'medium' | 'low';
    status?: 'pending' | 'approved' | 'rejected' | 'in_progress';
    quantity?: number;
    requiredSkills?: string;
    expectedStartDate?: string;
    notes?: string;
}

export const updateMentorRequest = async (
    params: UpdateMentorRequestParams
): Promise<ResponseDetailSuccess<MentorRequest>> => {
    const { id, ...data } = params;
    const result = await http.patch<ResponseDetailSuccess<MentorRequest>>(`/mentor-requests/${id}`, data);
    return result;
};

export const deleteMentorRequest = async (id: string): Promise<ResponseDetailSuccess<null>> => {
    const result = await http.delete<ResponseDetailSuccess<null>>(`/mentor-requests/${id}`);
    return result;
};
