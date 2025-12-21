import httpClient from "../configurations/httpClient";
import { ADMIN_DASHBOARD } from "../configurations/configuration";

const sanitizeLimit = (limit, fallback = 5) => {
    const value = Number(limit);
    if (Number.isNaN(value)) return fallback;
    return Math.min(Math.max(value, 1), 100);
};

export const getAdminDashboardSummary = async () => {
    return await httpClient.get(ADMIN_DASHBOARD.SUMMARY);
};

export const getAdminSystemHealth = async () => {
    return await httpClient.get(ADMIN_DASHBOARD.SYSTEM_HEALTH);
};

export const getAdminTopViolationUsers = async (limit = 5) => {
    const params = { limit: sanitizeLimit(limit, 5) };
    return await httpClient.get(ADMIN_DASHBOARD.TOP_VIOLATIONS, { params });
};

