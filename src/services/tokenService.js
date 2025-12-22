import { jwtDecode } from "jwt-decode";
import { getToken, setToken, removeToken } from "./localStorageService";
import httpClient from "../configurations/httpClient";
import { CONFIG, AUTH } from "../configurations/configuration";

let refreshTimer = null;


export const getTokenExpiry = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return null;
    return decoded.exp * 1000; 
  } catch (e) {
    console.error("Lỗi khi decode JWT:", e);
    return null;
  }
};


export const scheduleTokenRefresh = () => {
  const token = getToken();
  if (!token) return;

  const expiry = getTokenExpiry(token);
  if (!expiry) return;

  const now = Date.now();
  const timeLeft = expiry - now;


  const refreshTime = Math.max(timeLeft - 60 * 1000, 5000);

  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(async () => {
    try {
      const res = await httpClient.post(`${CONFIG.API_GATEWAY}${AUTH.REFRESH_TOKEN}`, { token });
      const newToken = res.data.token;

      if (newToken) {
        setToken(newToken);
        scheduleTokenRefresh(); 
      } else {
        throw new Error("Không nhận được token mới từ server");
      }
    } catch (err) {
      console.error("Refresh token thất bại, chuyển hướng login", err);
      removeToken();
      window.location.href = "/login";
    }
  }, refreshTime);
};


export const clearTokenRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};
