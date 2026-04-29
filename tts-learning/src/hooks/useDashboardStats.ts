import { useState, useEffect, useCallback } from 'react';
import * as dashboardService from '../services/dashboard';
import { MOCK_DATA } from '../constants/MockData';

export const useDashboardStats = () => {
    const [data, setData] = useState<any>({
        code: 200,
        data: MOCK_DATA.dashboardStats
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await dashboardService.getDashboardStats();
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
