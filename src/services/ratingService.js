import httpClient from "../configurations/httpClient";
import { RATING } from "../configurations/configuration";

export const createRating = async (data) => {
    return await httpClient.post(RATING.CREATE_RATING, {
        toUserId: data.toUserId,
        jobId: data.jobId,
        score: data.score,
        comment: data.comment || null
    });
}

export const getRatings = async (userId) => {
    return await httpClient.get(`${RATING.GET_RATINGS}/${userId}`);
}

