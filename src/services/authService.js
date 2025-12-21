import httpClient from "../configurations/httpClient";
import { getToken } from "./localStorageService";
import { jwtDecode } from "jwt-decode";
import { AUTH } from "../configurations/configuration";

const getUserIdFromToken = () => {
    const token = getToken();
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.userId;
}

export const login = async (email, password) => {
    return await httpClient.post(AUTH.LOGIN, {
        email: email,
        password: password
    });
};

export const oauth2_login = async (code) => {
    return await httpClient.post(AUTH.OAUTH_AUTHENTICATION, null, {
        params: { code },
    });
};

export const isAuthenticated = () => {
    return getToken();
};

export const logout = async () => {
    const token = getToken();
    return await httpClient.post(AUTH.LOGOUT, {
        token: token
    });
};

export const verify_otp = async ({ userId, otp }) => {
    const resolvedUserId = userId ?? getUserIdFromToken();

    if (!resolvedUserId) {
        throw new Error("Thiếu userId khi xác thực OTP");
    }

    return await httpClient.post(AUTH.VERIFY_OTP, {
        userId: resolvedUserId,
        otp: otp
    });
};

export const resend_otp = async ({ userId }) => {
    const resolvedUserId = userId ?? getUserIdFromToken();

    if (!resolvedUserId) {
        throw new Error("Thiếu userId khi yêu cầu gửi lại OTP");
    }

    return await httpClient.post(AUTH.RESEND_OTP, {
        userId: resolvedUserId
    });
}

export const setPassword = async ({ userId, password, confirmPassword }) => {
    if (!userId) {
        throw new Error("Thiếu userId khi gọi setPassword");
    }

    return await httpClient.post(`${AUTH.SET_PASSWORD}?userId=${userId}`, {
        password: password,
        confirmPassword: confirmPassword
    });
}

export const register = async (data) => {
    return await httpClient.post(AUTH.REGISTER, data);
}

export const forgotPassword = async (email) => {
    return await httpClient.post(AUTH.FORGOT_PASSWORD, { email });
}

export const resetPassword = async (request) => {
    return await httpClient.post(AUTH.RESET_PASSWORD, request);
}