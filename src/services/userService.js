import httpClient from "../configurations/httpClient";
import { USER, AUTH, VERIFY } from "../configurations/configuration";

export const getUserInfo = async () => {
    return await httpClient.get(USER.GET_USER_INFO);
}

export const getUserStats = async () => {
    return await httpClient.get(USER.GET_USER_STATS);
}

export const updateUserInfo = async (request) => {
    return await httpClient.put(USER.UPDATE_USER, request);
}

export const updateTwoFactorStatus = async (enabled) => {
    return await httpClient.put(AUTH.ENABLE_2FA, { enabled });
}

export const submitCCCDVerification = async () => {
    return await httpClient.post(VERIFY.VERIFY_CCCD);
}

export const getAllUsers = async (page, size, status, role) => {
    return await httpClient.get(USER.GET_ALL_USERS, {
        params: {
            page: page,
            size: size,
            status: status,
            role: role
        }
    });
}

export const upgradeRole = async (userId) => {
    return await httpClient.patch(USER.UPGRADE_ROLE(userId));
}

export const updatePassword = async (request) => {
    return await httpClient.put(USER.UPDATE_PASSWORD, request);
}

export const getUserDetail = async (userId) => {
    return await httpClient.get(USER.GET_USER_DETAIL(userId));
}

export const updateUserStatus = async (userId, status, reason = '') => {
    return await httpClient.put(USER.UPDATE_USER_STATUS(userId), {
        status,
        reason
    });
}
