import { http } from '../../utils/http';
import { ResponseDetailSuccess, ResponseListSuccess } from '../../utils/types/ServiceResponse';

export interface QuizQuestion {
    id: string;
    questionText: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export interface Quiz {
    id: string;
    moduleId: string;
    learningPathId?: string;
    title: string;
    description: string;
    type: 'module' | 'final_assessment';
    passingScore: number;
    timeLimitMinutes?: number;
    totalQuestions?: number;
    questions?: QuizQuestion[];
    createdAt: string;
    updatedAt: string;
}

export const getQuizzes = async (): Promise<ResponseListSuccess<Quiz>> => {
    const result = await http.get<ResponseListSuccess<Quiz>>('/quizzes');
    return {
        errorCode: result.errorCode,
        data: result.data || []
    };
};

export const getQuiz = async (id: string): Promise<ResponseDetailSuccess<Quiz>> => {
    const result = await http.get<ResponseDetailSuccess<Quiz>>(`/quizzes/${id}`);
    return result;
};

export const createQuiz = async (data: any): Promise<ResponseDetailSuccess<Quiz>> => {
    const result = await http.post<ResponseDetailSuccess<Quiz>>('/quizzes', data);
    return result;
};

export const updateQuiz = async (id: string, data: any): Promise<ResponseDetailSuccess<Quiz>> => {
    const result = await http.patch<ResponseDetailSuccess<Quiz>>(`/quizzes/${id}`, data);
    return result;
};

export const submitQuiz = async (
    quizId: string,
    answers: Record<string, string>
): Promise<ResponseDetailSuccess<any>> => {
    const result = await http.post<ResponseDetailSuccess<any>>(`/quizzes/${quizId}/submit`, { answers });
    return result;
};
