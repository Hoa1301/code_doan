import { http } from '../../utils/http';
import {
    ResponseListSuccess,
    ResponseDetailSuccess,
    SearchParams,
    PaginateParams
} from '../../utils/types/ServiceResponse';

export interface Evaluation {
    id: string;
    internId: string;
    intern?: {
        id: string;
        fullName: string;
    };
    mentorId: string;
    mentor?: {
        id: string;
        fullName: string;
    };
    type: 'phase1' | 'phase2' | 'final';
    evaluationDate: string;
    technicalScore?: number;
    attitudeScore?: number;
    teamworkScore?: number;
    progressScore?: number;
    overallScore?: number;
    strengths?: string;
    weaknesses?: string;
    feedback: string;
    decision?: string;
    decisionReason?: string;
    status: 'draft' | 'completed';
    createdAt: string;
    updatedAt: string;
}

export interface GetEvaluationsParams {
    pagination?: PaginateParams;
    searcher?: SearchParams;
    internId?: string;
    mentorId?: string;
}

export const getEvaluations = async (params?: GetEvaluationsParams): Promise<ResponseListSuccess<Evaluation>> => {
    const result = await http.get<ResponseListSuccess<Evaluation>>('/evaluations');

    return {
        errorCode: result.errorCode,
        data: result.data || []
    };
};

export const getEvaluation = async (id: string): Promise<ResponseDetailSuccess<Evaluation>> => {
    const result = await http.get<ResponseDetailSuccess<Evaluation>>(`/evaluations/${id}`);
    return result;
};

export interface CreateEvaluationParams {
    internId: string;
    mentorId: string;
    type: string;
    technicalScore?: number;
    attitudeScore?: number;
    teamworkScore?: number;
    progressScore?: number;
    overallScore?: number;
    strengths?: string;
    weaknesses?: string;
    feedback?: string;
    status?: 'draft' | 'completed';
}

export const createEvaluation = async (params: CreateEvaluationParams): Promise<ResponseDetailSuccess<Evaluation>> => {
    const result = await http.post<ResponseDetailSuccess<Evaluation>>('/evaluations', params);
    return result;
};

export const finalDecision = async (
    id: string,
    decision: string,
    reason: string
): Promise<ResponseDetailSuccess<Evaluation>> => {
    const result = await http.patch<ResponseDetailSuccess<Evaluation>>(`/evaluations/${id}/decision`, {
        decision,
        decisionReason: reason
    });
    return result;
};
