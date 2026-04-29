import { useState, useEffect, useCallback, useMemo } from 'react';
import * as approvalsService from '../../services/Recruitment/approvals';
import { Approval, GetApprovalsParams, UpdateApprovalParams } from '../../services/Recruitment/approvals';
import { ResponseListSuccess, ResponseDetailSuccess } from '../../utils/types/ServiceResponse';

export const useApprovals = (params?: GetApprovalsParams) => {
    const [data, setData] = useState<ResponseListSuccess<Approval> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const paramsString = JSON.stringify(params);
    const stableParams = useMemo<GetApprovalsParams | undefined>(() => {
        if (!paramsString) return undefined;
        return JSON.parse(paramsString) as GetApprovalsParams;
    }, [paramsString]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await approvalsService.getApprovals(stableParams);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [stableParams]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
};

export const useApproval = (id: string) => {
    const [data, setData] = useState<ResponseDetailSuccess<Approval> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const result = await approvalsService.getApproval(id);
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

export const useUpdateApproval = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const mutate = async (params: UpdateApprovalParams) => {
        setIsLoading(true);
        try {
            const result = await approvalsService.updateApproval(params);
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
