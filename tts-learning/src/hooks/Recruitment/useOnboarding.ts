import { useState, useEffect, useCallback } from 'react';
import * as onboardingService from '../../services/Recruitment/onboarding';
import { GetOnboardingParams, UpdateOnboardingParams } from '../../services/Recruitment/onboarding';
import { MOCK_DATA } from '../../constants/MockData';

export const useOnboardingList = (params?: GetOnboardingParams) => {
    const [data, setData] = useState<any>({
        code: 200,
        data: {
            hits: MOCK_DATA.onboarding as onboardingService.Onboarding[],
            pagination: {
                totalPages: 1,
                totalRows: MOCK_DATA.onboarding.length
            }
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const paramsString = JSON.stringify(params);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await onboardingService.getOnboardingList(params);
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

export const useOnboarding = (id: string) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const result = await onboardingService.getOnboarding(id);
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

export const useCreateOnboarding = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: onboardingService.CreateOnboardingParams) => {
        setIsLoading(true);
        try {
            const result = await onboardingService.createOnboarding(params);
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

export const useUpdateOnboarding = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: UpdateOnboardingParams) => {
        setIsLoading(true);
        try {
            const result = await onboardingService.updateOnboarding(params);
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

export const useUpdateOnboardingStepStatus = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (stepId: string, status: string) => {
        setIsLoading(true);
        try {
            const result = await onboardingService.updateOnboardingStepStatus(stepId, status);
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
