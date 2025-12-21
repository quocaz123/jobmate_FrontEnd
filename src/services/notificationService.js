import httpClient from "../configurations/httpClient";
import { NOTIFICATION } from "../configurations/configuration";

const notificationService = {
    getNotifications: async () => {
        const response = await httpClient.get(NOTIFICATION.GET_NOTIFICATIONS);
        return response.data;
    },
    markAsRead: async (id) => {
        const response = await httpClient.post(NOTIFICATION.MARK_AS_READ(id));
        return response.data;
    },
    createNotification: async (data) => {
        const response = await httpClient.post(NOTIFICATION.CREATE_NOTIFICATION, data);
        return response.data;
    },
    deleteAll: async () => {
        const response = await httpClient.delete(NOTIFICATION.DELETE_ALL);
        return response.data;
    },
};

export default notificationService;
