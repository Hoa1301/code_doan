import { useState, useEffect, useCallback } from 'react';
import * as tasksService from '../../services/Internship/tasks';
import { GetTasksParams, CreateTaskParams, UpdateTaskParams, Task } from '../../services/Internship/tasks';
import { ResponseDetailSuccess, ResponseListSuccess } from '../../utils/types/ServiceResponse';

export const useTasks = (params?: GetTasksParams) => {
    const [data, setData] = useState<ResponseListSuccess<Task> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await tasksService.getTasks(params);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
};

export const useTask = (id: string) => {
    const [data, setData] = useState<ResponseDetailSuccess<Task> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const result = await tasksService.getTask(id);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
};

export const useCreateTask = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const mutate = async (params: CreateTaskParams) => {
        setIsLoading(true);
        try {
            const result = await tasksService.createTask(params);
            setError(null);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate: mutate, isLoading: isLoading, error };
};

export const useUpdateTask = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const mutate = async (params: UpdateTaskParams) => {
        setIsLoading(true);
        try {
            const result = await tasksService.updateTask(params);
            setError(null);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate: mutate, isLoading: isLoading, error };
};

export const useDeleteTask = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const mutate = async (id: string) => {
        setIsLoading(true);
        try {
            const result = await tasksService.deleteTask(id);
            setError(null);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate: mutate, isLoading: isLoading, error };
};

export const useAddTaskComment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const mutate = async (taskId: string, content: string) => {
        setIsLoading(true);
        try {
            const result = await tasksService.addTaskComment(taskId, content);
            setError(null);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate: mutate, isLoading: isLoading, error };
};
