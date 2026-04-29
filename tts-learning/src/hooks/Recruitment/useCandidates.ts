import { useState, useEffect, useCallback } from 'react';
import * as candidatesService from '../../services/Recruitment/candidates';
import {
    GetCandidatesParams,
    CreateCandidateParams,
    CreateCandidateWithCvParams,
    UpdateCandidateParams,
    ShortlistCandidateParams,
    RejectCandidateParams
} from '../../services/Recruitment/candidates';

export const useCandidates = (params?: GetCandidatesParams) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const paramsString = JSON.stringify(params);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await candidatesService.getCandidates(params);
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

export const useCandidate = (id: string) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const result = await candidatesService.getCandidate(id);
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

export const useCreateCandidate = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: CreateCandidateParams) => {
        setIsLoading(true);
        try {
            const result = await candidatesService.createCandidate(params);
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

export const useCreateCandidateWithCv = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: CreateCandidateWithCvParams) => {
        setIsLoading(true);
        try {
            const result = await candidatesService.createCandidateWithCv(params);
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

export const useUploadCandidateCv = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const mutate = async (file: File) => {
        setIsLoading(true);
        try {
            const result = await candidatesService.uploadCandidateCv(file);
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

export const useUpdateCandidate = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: UpdateCandidateParams) => {
        setIsLoading(true);
        try {
            const result = await candidatesService.updateCandidate(params);
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

export const useUpdateCandidateCv = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const mutate = async (params: candidatesService.UpdateCandidateCvParams) => {
        setIsLoading(true);
        try {
            const result = await candidatesService.updateCandidateCv(params);
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

export const useShortlistCandidate = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: ShortlistCandidateParams) => {
        setIsLoading(true);
        try {
            const result = await candidatesService.shortlistCandidate(params);
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

export const useRejectCandidate = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: RejectCandidateParams) => {
        setIsLoading(true);
        try {
            const result = await candidatesService.rejectCandidate(params);
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

export const usePassInterviewCandidate = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (params: candidatesService.PassInterviewCandidateParams) => {
        setIsLoading(true);
        try {
            const result = await candidatesService.passInterviewCandidate(params);
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

export const useDeleteCandidate = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (id: string) => {
        setIsLoading(true);
        try {
            const result = await candidatesService.deleteCandidate({ id });
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

export const useConvertCandidateToIntern = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const mutate = async (id: string, mentorId: string) => {
        setIsLoading(true);
        try {
            const result = await candidatesService.convertCandidateToIntern(id, mentorId);
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
