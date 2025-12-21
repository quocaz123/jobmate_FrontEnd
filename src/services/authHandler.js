import { setToken } from "./localStorageService";
import { scheduleTokenRefresh } from "./tokenService";
import { jwtDecode } from "jwt-decode";
import { showSuccess } from "../utils/toast";

export const handleAuthSuccess = (token, navigate, shouldNavigate = true) => {
    if (!token || typeof token !== 'string') {
        console.error("Không nhận được token hợp lệ!");
        if (shouldNavigate) {
            navigate("/login");
        }
        return;
    }

    try {
        setToken(token);
        scheduleTokenRefresh();

        if (!shouldNavigate) {
            return;
        }

        const decoded = jwtDecode(token);
        const roles = decoded.scope?.split(" ") || [];

        showSuccess("Đăng nhập thành công!");
        setTimeout(() => {
            if (roles.includes("ROLE_ADMIN")) navigate("/admin");
            else if (roles.includes("ROLE_EMPLOYER")) navigate("/employer");
            else navigate("/home");
        }, 2000);
    } catch (error) {
        console.error("Lỗi khi xử lý đăng nhập:", error);
        if (shouldNavigate) {
            navigate("/login");
        }
    }
};