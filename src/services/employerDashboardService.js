import httpClient from "../configurations/httpClient";
import { EMPLOYER_DASHBOARD } from "../configurations/configuration";

const sanitizeLimit = (limit, fallback) => {
    const value = Number(limit);
    if (Number.isNaN(value)) return fallback;
    return Math.min(Math.max(value, 1), 100);
};

export const getEmployerDashboardSummary = async () => {
    return await httpClient.get(EMPLOYER_DASHBOARD.SUMMARY);
};

export const getEmployerTopJobs = async (limit = 5) => {
    const params = { limit: sanitizeLimit(limit, 5) };
    return await httpClient.get(EMPLOYER_DASHBOARD.TOP_JOBS, { params });
};

export const getEmployerRecentCandidates = async (limit = 6) => {
    const params = { limit: sanitizeLimit(limit, 6) };
    return await httpClient.get(EMPLOYER_DASHBOARD.RECENT_CANDIDATES, { params });
};

