import httpClient from "../configurations/httpClient";
import { APPLICATION } from "../configurations/configuration";

export const application_job = async (jobId) => {
    return await httpClient.post(APPLICATION.APPLICATION_JOB, {
        jobId: jobId
    });
}

export const applyJob = async (jobId, coverLetter, resumeFile, useProfileResume = false) => {
    const formData = new FormData();
    formData.append("jobId", jobId);

    if (coverLetter) {
        formData.append("coverLetter", coverLetter);
    }

    if (resumeFile) {
        formData.append("resumeFile", resumeFile);
    }

    formData.append("useProfileResume", useProfileResume.toString());

    return await httpClient.post(APPLICATION.APPLY_JOB, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
}

export const getMyApplications = async (page = 0, size = 10) => {
    return await httpClient.get(APPLICATION.GET_MY_APPLICATIONS, {
        params: {
            page,
            size
        }
    });
}

export const getApplicationDetail = async (applicationId) => {
    return await httpClient.get(APPLICATION.GET_APPLICATION_DETAIL(applicationId));
}

export const cancelApplication = async (applicationId) => {
    return await httpClient.put(APPLICATION.CANCEL_APPLICATION(applicationId));
}

export const getApplicationsByJob = async (jobId, status) => {
    return await httpClient.get(APPLICATION.GET_APPLICATIONS_BY_JOB(jobId), {
        params: {
            status
        }
    });
}

export const updateApplicationStatus = async (applicationId, status, rejectionReason = null) => {
    const params = { status };
    if (rejectionReason) {
        params.rejectionReason = rejectionReason;
    }
    return await httpClient.put(APPLICATION.UPDATE_APPLICATION_STATUS(applicationId), null, {
        params
    });
}