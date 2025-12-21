import { jwtDecode } from 'jwt-decode';
import { getToken } from '../services/localStorageService';

// Hàm lấy thông tin user từ token
export const getUserInfo = () => {
    try {
        const token = getToken();
        if (!token) return null;
        const decoded = jwtDecode(token);
        const userRoles = decoded.scope?.split(" ") || [];
        const isAdmin = userRoles.includes("ROLE_ADMIN");
        const isEmployer = userRoles.includes("ROLE_EMPLOYER") || userRoles.some(r => r.includes("EMPLOYER"));

        return {
            fullName: decoded.sub || decoded.name || decoded.username || 'Người dùng',
            role: isAdmin ? 'Admin' : isEmployer ? 'Employer' : 'User',
            email: decoded.sub || decoded.email || '',
            roles: userRoles
        };
    } catch (error) {
        console.error('Lỗi khi decode token:', error);
        return null;
    }
};
