import httpClient from "../configurations/httpClient";
import { REPORT } from "../configurations/configuration";

export const submitReport = async (data) => {
    return await httpClient.post(REPORT.CREATE_REPORT, {
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reason
    });
}

export const getAllReports = async (page, size) => {
    return await httpClient.get(REPORT.GET_ALL_REPORTS, { params: { page, size } });
   
}

export const reviewReport = async (reportId, accept, note) => {
    return await httpClient.put(
        REPORT.REVIEW_REPORT(reportId),
        null,
        {
            params: {
                accept: accept,
                note: note,
            }
        }
    );
};

