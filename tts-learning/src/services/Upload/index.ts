import { http } from "../../utils/http";

export const uploadSingle = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await http.post('/upload/single', formData);
    return response.data;
};