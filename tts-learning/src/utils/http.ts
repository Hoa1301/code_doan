import { message } from 'antd';
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const DEFAULT_API_BASE_URL = '/api/';
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/?$/, '/');
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT || 10000);

class Http {
    instance: AxiosInstance;
    private instancePublic: AxiosInstance;

    private normalizeSuccessResponse(res: { errorCode?: number; traceId?: string; data?: unknown }) {
        const payload = res?.data;

        if (Array.isArray(payload)) {
            return {
                errorCode: res?.errorCode,
                traceId: res?.traceId,
                data: payload,
                hits: payload
            };
        }

        if (payload && typeof payload === 'object') {
            const payloadRecord = payload as Record<string, unknown>;
            const hits = payloadRecord.hits;

            if (Array.isArray(hits)) {
                return {
                    ...payloadRecord,
                    errorCode: res?.errorCode,
                    traceId: res?.traceId,
                    data: hits,
                    hits,
                    pagination: payloadRecord.pagination
                };
            }

            return {
                ...payloadRecord,
                errorCode: res?.errorCode,
                traceId: res?.traceId,
                data: payloadRecord
            };
        }

        return {
            errorCode: res?.errorCode,
            traceId: res?.traceId,
            data: payload,
            value: payload
        };
    }

    constructor() {
        // Instance cho các API cần authentication
        this.instance = axios.create({
            baseURL: API_BASE_URL,
            timeout: API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true // Cho phép gửi cookie trong request
        });

        // Instance cho các API public không cần authentication
        this.instancePublic = axios.create({
            baseURL: API_BASE_URL,
            timeout: API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: false // Không gửi cookie trong request
        });

        this.instancePublic.interceptors.response.use(
            (response) => {
                const res = response.data;
                if (res.errorCode !== 0) {
                    message.error(res.message || 'Có lỗi xảy ra');
                    return Promise.reject(res);
                }
                return this.normalizeSuccessResponse(res);
            },
            (error) => {
                if (error.response) {
                    message.error(error.response.data?.message || 'Có lỗi xảy ra');
                }
                return Promise.reject(error);
            }
        );

        // Thêm interceptor để xử lý request cho instance có authentication
        this.instance.interceptors.request.use(
            (config) => {
                const token = Cookies.get('accessToken');
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Thêm interceptor để xử lý response cho instance có authentication
        this.instance.interceptors.response.use(
            (response) => {

                if (response.config.responseType === 'blob') {
                    return response;
                }
                const res = response.data;
                if (res.errorCode !== 0) {
                    if (res.errorCode === 1003) {
                        message.error(res.message || 'Phiên đăng nhập đã hết hạn');
                        Cookies.remove('accessToken');
                        // window.location.href = '/login';
                    } else {
                        message.error(res.message || 'Có lỗi xảy ra');
                    }
                    return Promise.reject(res);
                }
                return this.normalizeSuccessResponse(res);
            },
            (error) => {
                // Xử lý các lỗi HTTP status codes (nếu có)
                if (error.response) {
                    const { status, data } = error.response;
                    switch (status) {
                        case 401:
                            message.error(data?.message || 'Phiên đăng nhập đã hết hạn');
                            break;
                        case 403:
                            message.error('Bạn không có quyền truy cập');
                            break;
                        default:
                            message.error(data?.message || 'Có lỗi xảy ra');
                            break;
                    }
                } else {
                    message.error('Không thể kết nối đến server');
                }
                return Promise.reject(error);
            }
        );
    }

    // Getter cho instance public
    get public() {
        return this.instancePublic;
    }
}

export interface HttpClient {
    get<T = unknown>(url: string, config?: unknown): Promise<T>;
    post<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>;
    patch<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>;
    put<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>;
    delete<T = unknown>(url: string, config?: unknown): Promise<T>;
    interceptors: unknown;
}

// Xử lý type cast cho axios instance để khớp với interceptor return value
export const http = new Http().instance as unknown as HttpClient;
export const httpPublic = new Http().public as unknown as HttpClient;
