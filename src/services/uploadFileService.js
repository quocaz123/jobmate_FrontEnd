import httpClient from "../configurations/httpClient";
import { UPLOAD } from "../configurations/configuration";

export const uploadFile = async (file, type) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        const response = await httpClient.post(UPLOAD.UPLOAD_FILE, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response?.data?.data?.url || response?.data?.data?.fileUrl || response?.data?.data;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};


export const getFileUrl = async (type, userId) => {
    return await httpClient.get(UPLOAD.GET_FILE, {
        params: {
            type: type,
            userId: userId
        }
    });
};
