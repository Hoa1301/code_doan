import { useState, useEffect, useCallback } from 'react';
import * as mentorRequestsService from '../../services/Recruitment/mentorRequests';
import {
    GetMentorRequestsParams,
    CreateMentorRequestParams,
    UpdateMentorRequestParams
} from '../../services/Recruitment/mentorRequests';

export const useMentorRequests = (params?: GetMentorRequestsParams) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const paramsString = JSON.stringify(params);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await mentorRequestsService.getMentorRequests(params);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [paramsString]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
};

export const useMentorRequest = (id: string) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const result = await mentorRequestsService.getMentorRequest(id);
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

export const useCreateMentorRequest = (options?: { onSuccess?: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: CreateMentorRequestParams) => {
        setIsLoading(true);
        try {
            const result = await mentorRequestsService.createMentorRequest(params);
            setError(null);
            options?.onSuccess?.();
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate, mutate: mutate, isLoading, isLoading: isLoading, error };
};

export const useUpdateMentorRequest = (options?: { onSuccess?: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: UpdateMentorRequestParams) => {
        setIsLoading(true);
        try {
            const result = await mentorRequestsService.updateMentorRequest(params);
            setError(null);
            options?.onSuccess?.();
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

export const useDeleteMentorRequest = (options?: { onSuccess?: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (id: string) => {
        setIsLoading(true);
        try {
            const result = await mentorRequestsService.deleteMentorRequest(id);
            setError(null);
            options?.onSuccess?.();
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
