import httpClient from "../configurations/httpClient";
import { VERIFICATION_ADMIN } from "../configurations/configuration";

export const getPendingVerifications = async (page = 0, size = 10, status = 'PENDING') => {
    return await httpClient.get(VERIFICATION_ADMIN.GET_PENDING, {
        params: { page, size, status }
    });
}

export const getVerificationDetail = async (userId) => {
    return await httpClient.get(VERIFICATION_ADMIN.GET_DETAIL(userId));
}

export const approveVerification = async (userId) => {
    return await httpClient.post(VERIFICATION_ADMIN.APPROVE(userId));
}

export const rejectVerification = async (userId, reason) => {
    return await httpClient.post(VERIFICATION_ADMIN.REJECT(userId), null, {
        params: { reason }
    });
}


