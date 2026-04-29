import { http } from '../../utils/http';
import { ResponseDetailSuccess, ResponseListSuccess } from '../../utils/types/ServiceResponse';

export interface StudentProgress {
    id: string;
    internId: string;
    learningPathId: string;
    learningPath?: {
        id: string;
        track: string;
        title: string;
    };
    currentModuleId: string | null;
    currentModule?: {
        id: string;
        title: string;
    };
    modulesCompleted: string[];
    overallProgress: number;
    createdAt: string;
    updatedAt: string;
}

export const getMyProgress = async (): Promise<ResponseDetailSuccess<StudentProgress>> => {
    const result = await http.get<ResponseDetailSuccess<StudentProgress>>('/interns/me/progress');
    return result;
};

export const getInternProgress = async (internId: string): Promise<ResponseDetailSuccess<StudentProgress>> => {
    // Backend doesn't have a direct /interns/:id/progress yet,
    // but we can assume it might be needed or handled via intern detail.
    // For now, let's keep it as a placeholder or use a query if the backend supports it.
    const result = await http.get<ResponseDetailSuccess<StudentProgress>>(`/interns/${internId}/progress`);
    return result;
};

export const updateInternProgress = async (id: string, data: any): Promise<ResponseDetailSuccess<StudentProgress>> => {
    const result = await http.patch<ResponseDetailSuccess<StudentProgress>>(`/interns/${id}`, data);
    return result;
};
