import axios from "axios";
import { CONFIG, AUTH } from "./configuration";
import { getToken, setToken, removeToken } from "../services/localStorageService";

const httpClient = axios.create({
    baseURL: CONFIG.API_GATEWAY,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

httpClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        config.headers = config.headers || {};
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
};

httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Chỉ xử lý 401 Unauthorized
        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        // Nếu đã retry rồi mà vẫn 401, không retry nữa
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        // Nếu đang refresh token, đăng ký callback để chờ token mới
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((token) => {
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers["Authorization"] = `Bearer ${token}`;
                    httpClient(originalRequest)
                        .then(resolve)
                        .catch(reject);
                });
            });
        }

        // Bắt đầu refresh token
        isRefreshing = true;

        try {
            const oldToken = getToken();
            if (!oldToken) {
                throw new Error("No token available");
            }

            // Gọi API refresh token
            const res = await axios.post(`${CONFIG.API_GATEWAY}${AUTH.REFRESH_TOKEN}`, {
                token: oldToken,
            });

            const newToken = res.data?.data?.token || res.data?.token;

            if (!newToken) {
                throw new Error("No new token returned from refresh API");
            }

            setToken(newToken);
            onRefreshed(newToken);
            isRefreshing = false;

            // Cập nhật header và retry request gốc
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

            const retryResponse = await httpClient(originalRequest);
            return retryResponse;

        } catch (err) {
            // CHỈ redirect đến login khi refresh token API thất bại
            // KHÔNG redirect nếu chỉ là lỗi retry request
            isRefreshing = false;
            refreshSubscribers = [];

            // Kiểm tra xem lỗi có phải từ refresh token API không
            const isRefreshTokenAPIError =
                err.config?.url?.includes(AUTH.REFRESH_TOKEN) || // Lỗi từ refresh API
                err.message?.includes("No token") || // Không có token
                err.message?.includes("No new token") || // Không nhận được token mới
                (err.response?.status === 401 && err.config?.url?.includes(AUTH.REFRESH_TOKEN)); // 401 từ refresh API

            // Chỉ redirect khi refresh token API thất bại
            if (isRefreshTokenAPIError) {
                removeToken();
                try {
                    window.location.href = "/login";
                } catch (e) {
                    console.error("Error redirecting to login:", e);
                }
            } else {
                // Lỗi từ retry request, không redirect, chỉ log
                console.warn("Retry request sau refresh token thất bại, nhưng không redirect:", err.message);
            }

            return Promise.reject(err);
        }
    }
);

export default httpClient;