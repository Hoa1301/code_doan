import { http } from '../../utils/http';
import {
    ResponseListSuccess,
    ResponseDetailSuccess,
    SearchParams,
    PaginateParams
} from '../../utils/types/ServiceResponse';

export interface Report {
    id: string;
    internId: string;
    intern?: {
        id: string;
        fullName: string;
    };
    type: 'weekly' | 'monthly';
    period: string;
    title: string;
    content: string;
    challenges: string;
    nextPlan: string;
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected' | 'draft';
    score?: number;
    feedback?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetReportsParams {
    pagination?: PaginateParams;
    searcher?: SearchParams;
    internId?: string;
    status?: string;
    type?: string;
}

export const getReports = async (params?: GetReportsParams): Promise<ResponseListSuccess<Report>> => {
    const result = await http.get<ResponseListSuccess<Report>>('/reports');

    return {
        errorCode: result.errorCode,
        data: result.data || []
    };
};

export const getReport = async (id: string): Promise<ResponseDetailSuccess<Report>> => {
    const result = await http.get<ResponseDetailSuccess<Report>>(`/reports/${id}`);
    return result;
};

export interface CreateReportParams {
    internId: string;
    type: 'weekly' | 'monthly';
    period: string;
    title: string;
    content: string;
    challenges: string;
    nextPlan: string;
}

export const createReport = async (params: CreateReportParams): Promise<ResponseDetailSuccess<Report>> => {
    const result = await http.post<ResponseDetailSuccess<Report>>('/reports', params);
    return result;
};

export interface UpdateReportParams {
    id: string;
    status?: string;
    score?: number;
    feedback?: string;
    content?: string;
}

export const updateReport = async (params: UpdateReportParams): Promise<ResponseDetailSuccess<Report>> => {
    const { id, ...data } = params;
    const result = await http.patch<ResponseDetailSuccess<Report>>(`/reports/${id}`, data);
    return result;
};

export const deleteReport = async (id: string): Promise<ResponseDetailSuccess<null>> => {
    const result = await http.delete<ResponseDetailSuccess<null>>(`/reports/${id}`);
    return result;
};
