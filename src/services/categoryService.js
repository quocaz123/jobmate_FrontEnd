import httpClient from "../configurations/httpClient";
import { CATEGORY } from "../configurations/configuration";

export const getAllCategories = async () => {
    return await httpClient.get(CATEGORY.GET_ALL_CATEGORIES);
}