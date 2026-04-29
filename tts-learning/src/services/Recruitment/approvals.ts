import { http } from '../../utils/http';
import {
    ResponseListSuccess,
    ResponseDetailSuccess,
    SearchParams,
    PaginateParams
} from '../../utils/types/ServiceResponse';

export type ApprovalType = 'Conversion' | 'Recruitment';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Adjusting';

export interface ApprovalPositionDetail {
    title: string;
    count: number;
    requirements?: string;
    level?: string;
}

export interface ApprovalDirectorActionHistoryItem {
    action: ApprovalStatus;
    note?: string;
    actedAt: string;
    approverId?: string;
    previousStatus?: ApprovalStatus;
}

export interface ApprovalDetails {
    positions?: ApprovalPositionDetail[];
    totalPositions?: number;
    expectedStart?: string;
    justification?: string;
    directorActionHistory?: ApprovalDirectorActionHistoryItem[];
    [key: string]: unknown;
}

export interface Approval {
    id: string;
    type: ApprovalType;
    name: string;
    title: string;
    currentRole?: string;
    proposedRole?: string;
    mentor?: string;
    score?: number;
    salary?: number;
    budget?: number;
    department?: string;
    entityId?: string;
    hr?: string;
    priority?: 'High' | 'Normal' | 'Low';
    status: ApprovalStatus;
    createdAt: string;
    updatedAt: string;
    notes?: string;
    details?: ApprovalDetails | null;
    planStatus?: string;
}

export interface GetApprovalsParams {
    pagination?: PaginateParams;
    searcher?: SearchParams;
    type?: ApprovalType | 'all';
    status?: ApprovalStatus;
}

export const getApprovals = async (params?: GetApprovalsParams): Promise<ResponseListSuccess<Approval>> => {
    const queryParams: Record<string, string | number> = {};

    if (params?.searcher?.keyword) queryParams.q = params.searcher.keyword;
    if (params?.pagination?.page) queryParams.page = params.pagination.page;
    if (params?.pagination?.pageSize) queryParams.limit = params.pagination.pageSize;
    if (params?.status) queryParams.status = params.status;
    if (params?.type) queryParams.type = params.type;

    const result = await http.get<ResponseListSuccess<Approval>>('/approvals', { params: queryParams });
    return result;
};

export const getApproval = async (id: string): Promise<ResponseDetailSuccess<Approval>> => {
    const result = await http.get<ResponseDetailSuccess<Approval>>(`/approvals/${id}`);
    return result;
};

export interface UpdateApprovalParams {
    id: string;
    status: ApprovalStatus;
    notes?: string;
}

export const updateApproval = async (params: UpdateApprovalParams): Promise<ResponseDetailSuccess<Approval>> => {
    const { id, status, notes } = params;
    const trimmedNotes = typeof notes === 'string' ? notes.trim() : undefined;
    const payload: { status: ApprovalStatus; notes?: string; note?: string } = { status };

    if (trimmedNotes) {
        payload.notes = trimmedNotes;
        payload.note = trimmedNotes;
    }

    const result = await http.patch<ResponseDetailSuccess<Approval>>(`/approvals/${id}`, payload);
    return result;
};
