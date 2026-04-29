import { http } from '../../utils/http';
import { ResponseListSuccess, ResponseDetailSuccess } from '../../utils/types/ServiceResponse';

export interface ModuleContent {
    id: string;
    moduleId: string;
    title: string;
    type: 'video' | 'pdf' | 'article' | 'link';
    url: string;
    duration?: number;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}

export const getContentsByModule = async (moduleId: string): Promise<ResponseListSuccess<ModuleContent>> => {
    const result = await http.get<ResponseListSuccess<ModuleContent>>(`/training-content/contents/${moduleId}`);
    return {
        errorCode: result.errorCode,
        data: result.data || []
    };
};

export const createContent = async (data: Partial<ModuleContent>): Promise<ResponseDetailSuccess<ModuleContent>> => {
    const result = await http.post<ResponseDetailSuccess<ModuleContent>>('/training-content/contents', data);
    return result;
};
