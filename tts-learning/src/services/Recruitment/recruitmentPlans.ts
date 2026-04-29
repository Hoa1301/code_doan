import { http } from '../../utils/http';
import {
    ResponseListSuccess,
    ResponseDetailSuccess,
    SearchParams,
    PaginateParams
} from '../../utils/types/ServiceResponse';

export interface RecruitmentPlan {
    id: string;
    name: string;
    batch: string;
    department: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'draft' | 'pending_approval' | 'active' | 'on_hold' | 'closed';
    createdBy: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
    jobPositions?: any[];
    createdAt: string;
    updatedAt: string;
    details?: {
        positions: any[];
    };
}

export interface GetRecruitmentPlansParams {
    pagination?: PaginateParams;
    searcher?: SearchParams;
}

export const getRecruitmentPlans = async (
    params?: GetRecruitmentPlansParams
): Promise<ResponseListSuccess<RecruitmentPlan>> => {
    const result = await http.get<any>('/recruitment-plans', { params });

    return {
        errorCode: result.errorCode,
        data: result.data || [],
        pagination: result.pagination
    };
};

export const getRecruitmentPlan = async (id: string): Promise<ResponseDetailSuccess<RecruitmentPlan>> => {
    const result = await http.get<ResponseDetailSuccess<RecruitmentPlan>>(`/recruitment-plans/${id}`);
    return result;
};

export interface CreateRecruitmentPlanParams {
    name: string;
    batch: string;
    department: string;
    startDate: string;
    endDate: string;
    description?: string;
    status?: 'draft' | 'pending_approval' | 'active' | 'on_hold' | 'closed' | 'rejected';
}

export const createRecruitmentPlan = async (
    params: CreateRecruitmentPlanParams
): Promise<ResponseDetailSuccess<RecruitmentPlan>> => {
    const result = await http.post<ResponseDetailSuccess<RecruitmentPlan>>('/recruitment-plans', params);
    return result;
};

export interface UpdateRecruitmentPlanParams {
    id: string;
    name?: string;
    batch?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    status?: 'draft' | 'pending_approval' | 'active' | 'on_hold' | 'closed' | 'rejected';
}

export const updateRecruitmentPlan = async (
    params: UpdateRecruitmentPlanParams
): Promise<ResponseDetailSuccess<RecruitmentPlan>> => {
    const { id, ...data } = params;
    const result = await http.patch<ResponseDetailSuccess<RecruitmentPlan>>(`/recruitment-plans/${id}`, data);
    return result;
};

export interface DeleteRecruitmentPlanParams {
    id: string;
}

export const deleteRecruitmentPlan = async (
    params: DeleteRecruitmentPlanParams
): Promise<ResponseDetailSuccess<null>> => {
    const result = await http.delete<ResponseDetailSuccess<null>>(`/recruitment-plans/${params.id}`);
    return result;
};
