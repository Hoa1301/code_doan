import { useState, useEffect, useCallback } from 'react';
import * as interviewsService from '../../services/Recruitment/interviews';
import {
    GetInterviewsParams,
    CreateInterviewParams,
    UpdateInterviewParams
} from '../../services/Recruitment/interviews';
import { MOCK_DATA } from '../../constants/MockData';

export const useInterviews = (params?: GetInterviewsParams) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const paramsString = JSON.stringify(params);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await interviewsService.getInterviews(params);
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

export const useInterview = (id: string) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const result = await interviewsService.getInterview(id);
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

export const useCreateInterview = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: CreateInterviewParams) => {
        setIsLoading(true);
        try {
            const result = await interviewsService.createInterview(params);
            setError(null);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate, isLoading: isLoading, error };
};

export const useUpdateInterview = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: UpdateInterviewParams) => {
        setIsLoading(true);
        try {
            const result = await interviewsService.updateInterview(params);
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

export const useDeleteInterview = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (id: string) => {
        setIsLoading(true);
        try {
            const result = await interviewsService.deleteInterview(id);
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
