import httpClient from "../configurations/httpClient";
import { AUDIT_LOG } from "../configurations/configuration";

export const getAuditLogs = async ({
    page = 0,
    size = 20,
    userId,
    action,
    targetId,
    startDate,
    endDate,
} = {}) => {
    const params = {
        page: Math.max(page, 0),
        size: Math.min(Math.max(size, 1), 100),
    };

    if (userId) params.userId = userId;
    if (action) params.action = action;
    if (targetId) params.targetId = targetId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return await httpClient.get(AUDIT_LOG.GET_AUDIT_LOGS, { params });
};


