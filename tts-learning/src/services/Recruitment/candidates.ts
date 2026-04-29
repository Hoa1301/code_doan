import { http } from '../../utils/http';
import {
    ResponseListSuccess,
    ResponseDetailSuccess,
    SearchParams,
    PaginateParams
} from '../../utils/types/ServiceResponse';

export interface Candidate {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    location: string;
    avatarUrl: string;
    education: string;
    experience: string;
    skills: string[];
    resumeUrl: string;
    appliedDate: string;
    job?: {
        id: string;
        title: string;
        department: string;
    };
    status:
        | 'pending_review'
        | 'cv_screened'
        | 'shortlisted'
        | 'interview_scheduled'
        | 'passed_interview'
        | 'offer'
        | 'rejected'
        | 'rejected_cv'
        | 'rejected_interview'
        | 'converted_to_intern';
    matchScore: number;
    coverLetter: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetCandidatesParams {
    pagination?: PaginateParams;
    searcher?: SearchParams;
    status?: string;
}

export const getCandidates = async (params?: GetCandidatesParams): Promise<ResponseListSuccess<Candidate>> => {
    const queryParams: any = {};
    if (params?.searcher?.keyword) queryParams.q = params.searcher.keyword;
    if (params?.status && params.status !== 'all') queryParams.status = params.status;
    if (params?.pagination?.page) queryParams.page = params.pagination.page;
    if (params?.pagination?.pageSize) queryParams.pageSize = params.pagination.pageSize;

    const result = await http.get<ResponseListSuccess<Candidate>>('/candidates', { params: queryParams });

    return {
        errorCode: result.errorCode,
        data: result.data || []
    };
};

export const getCandidate = async (id: string): Promise<ResponseDetailSuccess<Candidate>> => {
    const result = await http.get<ResponseDetailSuccess<Candidate>>(`/candidates/${id}`);
    return result;
};

export interface UpdateCandidateParams {
    id: string;
    status?: string;
    matchScore?: number;
    notes?: string;
}

export const updateCandidate = async (params: UpdateCandidateParams): Promise<ResponseDetailSuccess<Candidate>> => {
    const { id, ...data } = params;
    const updateResult = await http.patch<ResponseDetailSuccess<Candidate>>(`/candidates/${id}`, data);
    return updateResult;
};

export interface ShortlistCandidateParams {
    id: string;
}

export const shortlistCandidate = async (
    params: ShortlistCandidateParams
): Promise<ResponseDetailSuccess<Candidate>> => {
    return updateCandidate({
        id: params.id,
        status: 'shortlisted'
    });
};

export interface RejectCandidateParams {
    id: string;
    reason?: string;
}

export const rejectCandidate = async (params: RejectCandidateParams): Promise<ResponseDetailSuccess<Candidate>> => {
    return updateCandidate({
        id: params.id,
        status: 'rejected'
    });
};

export interface PassInterviewCandidateParams {
    id: string;
}

export const passInterviewCandidate = async (
    params: PassInterviewCandidateParams
): Promise<ResponseDetailSuccess<Candidate>> => {
    return updateCandidate({
        id: params.id,
        status: 'passed_interview'
    });
};

export interface CreateCandidateParams {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    jobId: string;
    education?: string;
    experience?: string;
    coverLetter?: string;
    skills?: string[];
    resumeUrl?: string;
}

export const createCandidate = async (params: CreateCandidateParams): Promise<ResponseDetailSuccess<Candidate>> => {
    const result = await http.post<ResponseDetailSuccess<Candidate>>('/candidates', params);
    return result;
};

export interface CreateCandidateWithCvParams {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    jobId: string;
    education?: string;
    experience?: string;
    coverLetter?: string;
    cv?: File;
}

export interface CandidateCvUploadResult {
    fileName: string;
    fileUrl: string;
    mimeType: string;
    size: number;
}

export const createCandidateWithCv = async (
    params: CreateCandidateWithCvParams
): Promise<ResponseDetailSuccess<Candidate>> => {
    if (!params.cv) {
        return createCandidate({
            fullName: params.fullName,
            email: params.email,
            phone: params.phone,
            location: params.location,
            jobId: params.jobId,
            education: params.education,
            experience: params.experience,
            coverLetter: params.coverLetter
        });
    }

    const formData = new FormData();
    formData.append('fullName', params.fullName);
    formData.append('email', params.email);
    formData.append('jobId', params.jobId);
    if (params.phone) formData.append('phone', params.phone);
    if (params.location) formData.append('location', params.location);
    if (params.education) formData.append('education', params.education);
    if (params.experience) formData.append('experience', params.experience);
    formData.append('coverLetter', params.coverLetter || '');
    formData.append('cv', params.cv);

    const result = await http.post<ResponseDetailSuccess<Candidate>>('/candidates/apply-with-cv', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return result;
};

export const uploadCandidateCv = async (cv: File): Promise<ResponseDetailSuccess<CandidateCvUploadResult>> => {
    const formData = new FormData();
    formData.append('cv', cv);

    const result = await http.post<ResponseDetailSuccess<CandidateCvUploadResult>>('/candidates/upload-cv', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return result;
};

export interface UpdateCandidateCvParams {
    id: string;
    cv: File;
}

export const updateCandidateCv = async (params: UpdateCandidateCvParams): Promise<ResponseDetailSuccess<Candidate>> => {
    const formData = new FormData();
    formData.append('cv', params.cv);

    const result = await http.patch<ResponseDetailSuccess<Candidate>>(`/candidates/${params.id}/cv`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return result;
};

export interface DeleteCandidateParams {
    id: string;
}

export const deleteCandidate = async (params: DeleteCandidateParams): Promise<ResponseDetailSuccess<null>> => {
    const result = await http.delete<ResponseDetailSuccess<null>>(`/candidates/${params.id}`);
    return result;
};

export const convertCandidateToIntern = async (id: string, mentorId: string): Promise<ResponseDetailSuccess<any>> => {
    const result = await http.post<ResponseDetailSuccess<any>>(`/candidates/${id}/convert-to-intern`, {
        mentorId
    });
    return result;
};
