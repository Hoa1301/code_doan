import { useState, useEffect, useCallback } from 'react';
import * as recruitmentPlansService from '../../services/Recruitment/recruitmentPlans';
import {
    GetRecruitmentPlansParams,
    CreateRecruitmentPlanParams,
    UpdateRecruitmentPlanParams
} from '../../services/Recruitment/recruitmentPlans';

export const useRecruitmentPlans = (params?: GetRecruitmentPlansParams) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const paramsString = JSON.stringify(params);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await recruitmentPlansService.getRecruitmentPlans(params);
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

export const useRecruitmentPlan = (id: string) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const result = await recruitmentPlansService.getRecruitmentPlan(id);
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

export const useCreateRecruitmentPlan = (options?: { onSuccess?: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: CreateRecruitmentPlanParams) => {
        setIsLoading(true);
        try {
            const result = await recruitmentPlansService.createRecruitmentPlan(params);
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

export const useUpdateRecruitmentPlan = (options?: { onSuccess?: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: UpdateRecruitmentPlanParams) => {
        setIsLoading(true);
        try {
            const result = await recruitmentPlansService.updateRecruitmentPlan(params);
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

export const useDeleteRecruitmentPlan = (options?: { onSuccess?: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (id: string) => {
        setIsLoading(true);
        try {
            const result = await recruitmentPlansService.deleteRecruitmentPlan({ id });
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
