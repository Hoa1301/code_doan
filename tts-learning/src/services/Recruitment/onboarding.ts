import { http } from '../../utils/http';
import {
    ResponseListSuccess,
    ResponseDetailSuccess,
    SearchParams,
    PaginateParams
} from '../../utils/types/ServiceResponse';

export interface OnboardingStep {
    id: string;
    title: string;
    status: 'finish' | 'process' | 'wait' | 'error';
    order: number;
}

export interface Onboarding {
    id: string;
    candidateId: string;
    candidate?: {
        id: string;
        fullName: string;
        avatarUrl: string;
    };
    internId?: string;
    track: string;
    mentorId: string;
    mentor?: {
        id: string;
        fullName: string;
    };
    department: string;
    currentStep: number;
    startDate: string;
    completedAt?: string;
    status: 'in_progress' | 'completed' | 'delayed' | 'cancelled';
    steps: OnboardingStep[];
    createdAt: string;
    updatedAt: string;
}

export interface GetOnboardingParams {
    pagination?: PaginateParams;
    searcher?: SearchParams;
    status?: string;
}

export const getOnboardingList = async (params?: GetOnboardingParams): Promise<ResponseListSuccess<Onboarding>> => {
    const result = await http.get<ResponseListSuccess<Onboarding>>('/onboardings');

    return {
        errorCode: result.errorCode,
        data: result.data || []
    };
};

export const getOnboarding = async (id: string): Promise<ResponseDetailSuccess<Onboarding>> => {
    const result = await http.get<ResponseDetailSuccess<Onboarding>>(`/onboardings/${id}`);
    return result;
};

export interface CreateOnboardingParams {
    candidateId: string;
    name: string;
    avatar?: string;
    email?: string;
    phone?: string;
    track: string;
    mentor?: string;
    department?: string;
    startDate: string;
    endDate?: string;
}

export const createOnboarding = async (params: CreateOnboardingParams): Promise<ResponseDetailSuccess<Onboarding>> => {
    const result = await http.post<ResponseDetailSuccess<Onboarding>>('/onboardings', {
        candidateId: params.candidateId,
        track: params.track,
        department: params.department,
        startDate: params.startDate,
        endDate: params.endDate,
        mentorId: params.mentor
    });
    return result;
};

export interface UpdateOnboardingParams {
    id: string;
    currentStep?: number;
    status?: string;
    steps?: OnboardingStep[];
}

export const updateOnboarding = async (params: UpdateOnboardingParams): Promise<ResponseDetailSuccess<Onboarding>> => {
    const { id, ...data } = params;
    const result = await http.patch<ResponseDetailSuccess<Onboarding>>(`/onboardings/${id}`, data);
    return result;
};

export const updateOnboardingStepStatus = async (
    stepId: string,
    status: string
): Promise<ResponseDetailSuccess<any>> => {
    const result = await http.patch<ResponseDetailSuccess<any>>(`/onboarding-steps/${stepId}/status`, { status });
    return result;
};
