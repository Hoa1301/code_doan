import { http } from '../utils/http';
import { ResponseDetailSuccess } from '../utils/types/ServiceResponse';

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    todayVisits: number;
    openPositions: number;
    totalApplications: number;
    pendingApplications: number;
    upcomingInterviews: number;
    activeInterns: number;
    pendingReviews: number;
    convertedInterns: number;
    conversionRate: number;
}

export const getDashboardStats = async (): Promise<ResponseDetailSuccess<DashboardStats>> => {
    const result = await http.get<ResponseDetailSuccess<DashboardStats>>('/dashboardStats');
    return result;
};
