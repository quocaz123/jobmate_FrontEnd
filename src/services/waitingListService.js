import httpClient from "../configurations/httpClient";
import { WAITING_LIST } from "../configurations/configuration";

export const createWaitingList = async (data) => {
    return await httpClient.post(WAITING_LIST.CREATE_WAITING_LIST, data);
}

export const getMyWaitingList = async () => {
    return await httpClient.get(WAITING_LIST.GET_MY_WAITING_LIST);
}

export const deleteWaitingList = async (id) => {
    return await httpClient.delete(WAITING_LIST.DELETE_WAITING_LIST(id));
}

export const getAllWaitingLists = async (page, size) => {
    return await httpClient.get(WAITING_LIST.GET_ALL_WAITING_LISTS, { params: { page, size } });
}