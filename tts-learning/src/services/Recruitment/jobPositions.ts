import { http } from '../../utils/http';
import {
    ResponseListSuccess,
    ResponseDetailSuccess,
    SearchParams,
    PaginateParams
} from '../../utils/types/ServiceResponse';

export interface JobPosition {
    id: string;
    code: string;
    title: string;
    department: string;
    level: string;
    requiredQuantity: number;
    filledQuantity: number;
    description: string;
    requirements: string;
    benefits?: string;
    location: string;
    salaryRange?: string;
    postedDate: string;
    deadline?: string;
    status: 'draft' | 'open' | 'closed' | 'on_hold' | 'Draft' | 'Open' | 'Closed' | 'On Hold';
    recruitmentPlanId: string;
    recruitmentPlan?: {
        id: string;
        title: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface GetJobPositionsParams {
    pagination?: PaginateParams;
    searcher?: SearchParams;
    department?: string;
    status?: string;
    publicOnly?: boolean;
}

export const getJobPositions = async (params?: GetJobPositionsParams): Promise<ResponseListSuccess<JobPosition>> => {
    const queryParams: any = {};
    if (params?.status) queryParams.status = params.status;
    if (params?.department) queryParams.department = params.department;
    if (params?.searcher?.keyword) queryParams.q = params.searcher.keyword;
    if (params?.publicOnly) queryParams.public = 1;
    if (params?.pagination) {
        queryParams.page = params.pagination.page;
        queryParams.pageSize = params.pagination.pageSize;
    }

    const result = await http.get<ResponseListSuccess<JobPosition>>('/job-positions', { params: queryParams });

    return {
        errorCode: result.errorCode,
        data: result.data || []
    };
};

export const getJobPosition = async (id: string, publicOnly?: boolean): Promise<ResponseDetailSuccess<JobPosition>> => {
    const result = await http.get<ResponseDetailSuccess<JobPosition>>(`/job-positions/${id}`, {
        params: publicOnly ? { public: 1 } : undefined
    });
    return result;
};

export interface CreateJobPositionParams {
    title: string;
    department: string;
    level: string;
    requiredQuantity: number;
    description?: string;
    requirements?: string;
    location?: string;
    salaryRange?: string;
    recruitmentPlanId: string;
}

export const createJobPosition = async (
    params: CreateJobPositionParams
): Promise<ResponseDetailSuccess<JobPosition>> => {
    const result = await http.post<ResponseDetailSuccess<JobPosition>>('/job-positions', params);
    return result;
};

export interface UpdateJobPositionParams {
    id: string;
    title?: string;
    campaign?: string;
    campaignId?: string;
    department?: string;
    level?: string;
    required?: number;
    filled?: number;
    status?: string;
    description?: string;
    requirements?: string;
    location?: string;
    salary?: string;
}

export const updateJobPosition = async (
    params: UpdateJobPositionParams
): Promise<ResponseDetailSuccess<JobPosition>> => {
    const { id, ...data } = params;
    const { campaign, campaignId, required, filled, salary, ...rest } = data;
    const mappedData: any = { ...rest };
    if (required !== undefined) mappedData.requiredQuantity = required;
    if (filled !== undefined) mappedData.filledQuantity = filled;
    if (salary !== undefined) mappedData.salaryRange = salary;
    if (campaignId !== undefined) mappedData.recruitmentPlanId = campaignId;
    const result = await http.patch<ResponseDetailSuccess<JobPosition>>(`/job-positions/${id}`, mappedData);
    return result;
};

export interface DeleteJobPositionParams {
    id: string;
}

export const deleteJobPosition = async (params: DeleteJobPositionParams): Promise<ResponseDetailSuccess<null>> => {
    const result = await http.delete<ResponseDetailSuccess<null>>(`/job-positions/${params.id}`);
    return result;
};
