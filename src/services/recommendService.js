import httpClient from "../configurations/httpClient";
import { RECOMMENDATION } from "../configurations/configuration";

export const getRecommendedJobs = async (waitingListId) => {
    return await httpClient.get(RECOMMENDATION.GET_RECOMMENDATION_JOBS, {
        params: {
            waitingListId: waitingListId
        }
    });
}

export const getRecommendedJobsByProfile = async () => {
    return await httpClient.get(RECOMMENDATION.GET_RECOMMENDATION_JOBS);
}

export const getRecommendedUsers = async (jobId) => {
    return await httpClient.get(RECOMMENDATION.GET_RECOMMENDATION_USERS, {
        params: {
            jobId: jobId
        }
    });
}