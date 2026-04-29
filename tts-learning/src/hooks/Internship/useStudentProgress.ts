import { useState, useEffect, useCallback } from 'react';
import * as studentProgressService from '../../services/Internship/studentProgress';
import { StudentProgress } from '../../services/Internship/studentProgress';
import { ResponseDetailSuccess } from '../../utils/types/ServiceResponse';

export const useStudentProgress = (internId: string) => {
    const [data, setData] = useState<ResponseDetailSuccess<StudentProgress> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const fetchData = useCallback(async () => {
        if (!internId) return;
        setIsLoading(true);
        try {
            const result = await studentProgressService.getInternProgress(internId);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [internId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
};

export const useMyProgress = () => {
    const [data, setData] = useState<ResponseDetailSuccess<StudentProgress> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await studentProgressService.getMyProgress();
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
