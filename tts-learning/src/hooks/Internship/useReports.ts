import { useState, useEffect, useCallback } from 'react';
import * as reportsService from '../../services/Internship/reports';
import { GetReportsParams, CreateReportParams, UpdateReportParams } from '../../services/Internship/reports';

export const useReports = (params?: GetReportsParams) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const paramsString = JSON.stringify(params);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await reportsService.getReports(params);
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

export const useReport = (id: string) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const result = await reportsService.getReport(id);
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

export const useCreateReport = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: CreateReportParams) => {
        setIsLoading(true);
        try {
            const result = await reportsService.createReport(params);
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

export const useUpdateReport = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: UpdateReportParams) => {
        setIsLoading(true);
        try {
            const result = await reportsService.updateReport(params);
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

export const useDeleteReport = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (id: string) => {
        setIsLoading(true);
        try {
            const result = await reportsService.deleteReport(id);
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
