import httpClient from "../configurations/httpClient";
import { JOB } from "../configurations/configuration";

export const get_my_Jobs = async (page = 0, size = 10, status) => {
    const params = { page, size };
    if (status) params.status = status;
    return await httpClient.get(JOB.GET_MY_JOBS, { params });
};

export const createJob = async (data) => {
    return await httpClient.post(JOB.CREATE_JOB, data);
};

export const updateJob = async (jobId, data) => {
    return await httpClient.put(JOB.UPDATE_JOB(jobId), data);
};

export const getJobDetail = async (jobId) => {
    return await httpClient.get(JOB.GET_JOB_DETAIL(jobId));
};

export const getJobDetailByIdForUser = async (jobId) => {
    return await httpClient.get(JOB.GET_JOB_DETAIL_BY_ID_FOR_USER(jobId));
};

export const getNearbyJobs = async (params = {}) => {
    const {
        latitude = null,
        longitude = null,
        radius = 10,
        page = 0,
        size = 10,
    } = params;

    const queryParams = { page, size };

    // Chỉ thêm latitude, longitude, radius nếu được cung cấp
    if (latitude !== null && longitude !== null) {
        queryParams.latitude = latitude;
        queryParams.longitude = longitude;
        queryParams.radius = radius;
    }

    return await httpClient.get(JOB.GET_NEARBY_JOBS, { params: queryParams });
};

export const getAvailableJobs = async () => {
    return await httpClient.get(JOB.GET_AVAILABLE_JOBS);
};

export const searchAvailableJobs = async (params = {}) => {
    const {
        page = 0,
        size = 10,
        keyword = null,
        location = null,
        jobType = null,
        workMode = null,
        categoryId = null,
        salaryMin = null,
        salaryMax = null,
    } = params;

    const queryParams = { page, size };
    if (keyword) queryParams.keyword = keyword;
    if (location) queryParams.location = location;
    if (jobType) queryParams.jobType = jobType;
    if (workMode) queryParams.workMode = workMode;
    if (categoryId) queryParams.categoryId = categoryId;
    if (salaryMin !== null && salaryMin !== undefined) queryParams.salaryMin = salaryMin;
    if (salaryMax !== null && salaryMax !== undefined) queryParams.salaryMax = salaryMax;

    return await httpClient.get(JOB.GET_AVAILABLE_JOBS, { params: queryParams });
};

export const getAllJobPeding = async (page, size) => {
    return await httpClient.get(JOB.GET_ALL_JOB_PEDINGS, { params: { page, size } });
}

export const approveJob = async (jobId) => {
    return await httpClient.put(JOB.VERIFY_JOB(jobId), null, { params: { status: 'APPROVED' } });
}

export const rejectJob = async (jobId, rejectionReason) => {
    const params = { status: 'REJECTED' };
    if (rejectionReason) {
        params.reason = rejectionReason;
    }
    return await httpClient.put(JOB.VERIFY_JOB(jobId), null, { params });
}

export const closeJob = async (jobId) => {
    return await httpClient.put(JOB.CLOSE_JOB(jobId));
}

export const deleteJob = async (jobId) => {
    return await httpClient.put(JOB.DELETE_JOB(jobId));
}


