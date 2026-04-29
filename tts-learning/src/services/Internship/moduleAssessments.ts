import { http } from '../../utils/http';
import { ResponseDetailSuccess } from '../../utils/types/ServiceResponse';

export interface FileResource {
    fileName: string;
    originalName?: string | null;
    url?: string | null;
}

export interface ModuleFinalTest {
    id: string;
    moduleId: string;
    description?: string | null;
    materialLink?: string | null;
    materialFile?: FileResource | null;
}

export interface ModuleFinalTestSubmission {
    id: string;
    moduleId: string;
    internId: string;
    description?: string | null;
    submissionLink?: string | null;
    status?: string;
    submittedAt?: string | null;
    submissionFile?: FileResource | null;
}

export interface Phase1ModuleEvaluationItem {
    id: string;
    score?: number | null;
    feedback?: string | null;
    status?: string;
    evaluatedAt?: string | null;
    mentor?: {
        id?: string;
        fullName?: string;
    } | null;
}

export interface Phase1ModuleDetail {
    moduleId: string;
    moduleTitle: string;
    moduleDescription?: string | null;
    orderIndex: number;
    finalTest?: ModuleFinalTest | null;
    submission?: ModuleFinalTestSubmission | null;
    evaluation?: Phase1ModuleEvaluationItem | null;
}

export interface Phase1ModuleEvaluationSummary {
    internId: string;
    phaseType: string;
    totalModules: number;
    gradedModules: number;
    isAverageReady: boolean;
    averageScore?: number | null;
    learningPath?: {
        id: string;
        title: string;
        track: string;
    } | null;
    summaryEvaluation?: {
        id: string;
        type: string;
        status?: string;
        overallScore?: number | null;
        evaluationDate?: string;
        mentor?: {
            id?: string;
            fullName?: string;
        } | null;
    } | null;
    modules: Phase1ModuleDetail[];
}

export interface UpsertModuleFinalTestParams {
    materialFileName?: string;
    materialOriginalName?: string;
    materialLink?: string;
    description?: string;
}

export interface SubmitModuleFinalTestParams {
    submissionFileName?: string;
    submissionOriginalName?: string;
    submissionLink?: string;
    description?: string;
}

export interface UpsertPhase1ModuleEvaluationParams {
    score?: number;
    feedback?: string;
    status?: string;
    submissionId?: string;
}

export const getModuleFinalTest = async (
    moduleId: string
): Promise<ResponseDetailSuccess<{ moduleId: string; finalTest?: ModuleFinalTest | null; submission?: ModuleFinalTestSubmission | null }>> => {
    return http.get(`/module-final-tests/module/${moduleId}`);
};

export const upsertModuleFinalTest = async (
    moduleId: string,
    params: UpsertModuleFinalTestParams
): Promise<ResponseDetailSuccess<ModuleFinalTest>> => {
    return http.put(`/module-final-tests/module/${moduleId}`, params);
};

export const submitMyModuleFinalTest = async (
    moduleId: string,
    params: SubmitModuleFinalTestParams
): Promise<ResponseDetailSuccess<ModuleFinalTestSubmission>> => {
    return http.put(`/module-final-tests/module/${moduleId}/submission/me`, params);
};

export const getPhase1ModuleEvaluations = async (
    internId: string
): Promise<ResponseDetailSuccess<Phase1ModuleEvaluationSummary>> => {
    return http.get(`/evaluations/intern/${internId}/phase1/modules`);
};

export const upsertPhase1ModuleEvaluation = async (
    internId: string,
    moduleId: string,
    params: UpsertPhase1ModuleEvaluationParams
): Promise<ResponseDetailSuccess<Phase1ModuleEvaluationSummary>> => {
    return http.put(`/evaluations/intern/${internId}/phase1/modules/${moduleId}`, params);
};
