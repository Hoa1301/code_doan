import { http } from '../../utils/http';
import {
    ResponseListSuccess,
    ResponseDetailSuccess,
    SearchParams,
    PaginateParams
} from '../../utils/types/ServiceResponse';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'to_do' | 'in_progress' | 'under_review' | 'completed' | 'need_rework';
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string;
    internId: string;
    intern?: {
        id: string;
        fullName: string;
        avatarUrl: string;
        user?: {
            fullName?: string;
        };
    };
    internAvatar?: string;
    internName?: string;
    mentorId: string;
    mentor?: {
        id: string;
        fullName: string;
    };
    attachments?: string[];
    revisionRequest?: string;
    comments?: Array<{
        id: string;
        userId: string;
        comment: string;
        attachments?: string[];
        createdAt: string;
        user?: {
            fullName: string;
            avatarUrl: string;
        };
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface GetTasksParams {
    pagination?: PaginateParams;
    searcher?: SearchParams;
    internId?: string;
    status?: string;
}

export const getTasks = async (params?: GetTasksParams): Promise<ResponseListSuccess<Task>> => {
    return http.get<ResponseListSuccess<Task>>('/tasks', { params });
};

export const getTask = async (id: string): Promise<ResponseDetailSuccess<Task>> => {
    const result = await http.get<ResponseDetailSuccess<Task>>(`/tasks/${id}`);
    return result;
};

export interface CreateTaskParams {
    title: string;
    internId: string;
    mentorId: string;
    priority: 'high' | 'medium' | 'low';
    dueDate: string;
    description?: string;
    attachments?: string[];
}

export const createTask = async (params: CreateTaskParams): Promise<ResponseDetailSuccess<Task>> => {
    const result = await http.post<ResponseDetailSuccess<Task>>('/tasks', params);
    return result;
};

export interface UpdateTaskParams {
    id: string;
    title?: string;
    priority?: string;
    dueDate?: string;
    status?: string;
    description?: string;
    attachments?: string[];
    revisionRequest?: string;
}

export const updateStatus = async (id: string, status: string): Promise<ResponseDetailSuccess<Task>> => {
    const result = await http.patch<ResponseDetailSuccess<Task>>(`/tasks/${id}/status`, { status });
    return result;
};

export const updateTask = async (params: UpdateTaskParams): Promise<ResponseDetailSuccess<Task>> => {
    const { id, ...data } = params;
    const result = await http.patch<ResponseDetailSuccess<Task>>(`/tasks/${id}`, data);
    return result;
};

export const deleteTask = async (id: string): Promise<ResponseDetailSuccess<null>> => {
    const result = await http.delete<ResponseDetailSuccess<null>>(`/tasks/${id}`);
    return result;
};

export const addTaskComment = async (
    taskId: string,
    content: string,
    attachments?: string[],
): Promise<ResponseDetailSuccess<any>> => {
    const result = await http.post<ResponseDetailSuccess<any>>(`/tasks/${taskId}/comments`, { content, attachments });
    return result;
};
