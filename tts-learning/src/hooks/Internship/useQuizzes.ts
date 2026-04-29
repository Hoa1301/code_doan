import { useState, useEffect, useCallback } from 'react';
import * as quizzesService from '../../services/Internship/quizzes';
import { Quiz } from '../../services/Internship/quizzes';
import { ResponseDetailSuccess, ResponseListSuccess } from '../../utils/types/ServiceResponse';

export const useQuizzes = () => {
    const [data, setData] = useState<ResponseListSuccess<Quiz> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await quizzesService.getQuizzes();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
};

export const useQuiz = (id: string) => {
    const [data, setData] = useState<ResponseDetailSuccess<Quiz> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const result = await quizzesService.getQuiz(id);
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

export const useCreateQuiz = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const mutate = async (params: unknown) => {
        setIsLoading(true);
        try {
            const result = await quizzesService.createQuiz(params);
            setError(null);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate, isLoading, error };
};

export const useUpdateQuiz = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const mutate = async ({ id, data }: { id: string; data: unknown }) => {
        setIsLoading(true);
        try {
            const result = await quizzesService.updateQuiz(id, data);
            setError(null);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate, isLoading, error };
};

export const useSubmitQuiz = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const mutate = async (quizId: string, answers: Record<string, string>) => {
        setIsLoading(true);
        try {
            const result = await quizzesService.submitQuiz(quizId, answers);
            setError(null);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate, isLoading, error };
};
