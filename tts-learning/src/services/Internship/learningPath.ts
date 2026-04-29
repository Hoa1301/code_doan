import { http } from '../../utils/http';
import { ResponseListSuccess, ResponseDetailSuccess } from '../../utils/types/ServiceResponse';

export interface LearningModule {
    id: string;
    title: string;
    description: string;
    orderIndex: number;
    status: 'ready' | 'in_progress' | 'locked';
    passingScore: number;
    isRequired: boolean;
    contents?: any[];
    quizzes?: any[];
}

export interface LearningPath {
    id: string;
    track: string;
    title: string;
    description: string;
    isActive: boolean;
    modules: LearningModule[];
    createdAt: string;
    updatedAt: string;
}

export const getLearningPaths = async (): Promise<ResponseListSuccess<LearningPath>> => {
    const result = await http.get<ResponseListSuccess<LearningPath>>('/learning-paths');
    return {
        errorCode: result.errorCode,
        data: result.data || []
    };
};

export const getLearningPathByTrack = async (track: string): Promise<ResponseDetailSuccess<LearningPath>> => {
    const result = await http.get<ResponseDetailSuccess<LearningPath>>(`/learning-paths/track/${track}`);
    return result;
};

export const updateLearningPath = async (
    id: string,
    data: Partial<LearningPath>
): Promise<ResponseDetailSuccess<LearningPath>> => {
    const result = await http.patch<ResponseDetailSuccess<LearningPath>>(`/learning-paths/${id}`, data);
    return result;
};
