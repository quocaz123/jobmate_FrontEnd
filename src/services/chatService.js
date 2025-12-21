import httpClient from "../configurations/httpClient";
import { CHAT } from "../configurations/configuration";

export  const getMyConversations = async () => {
    return await httpClient.get(CHAT.GET_MY_CONVERSATIONS);
}

export const createConversation = async (data) => {
    return await httpClient.post(CHAT.CREATE_VERSATION, {
        type: "DIRECT",
        participantIds: data.participantIds
    });
}

export const getMessagesOfConversation = async (conversationId) => {
    return await httpClient.get(`${CHAT.GET_MESSAGES_OF_CONVERSATION}?conversationId=${conversationId}`);
}

export const createMessage = async (data) => {
    return await httpClient.post(CHAT.CREATE_MESSAGE, {
        conversationId: data.conversationId,
        message: data.message
    });
}

export const searchConversations = async (keyword) => {
  return await httpClient.get(`${CHAT.SEARCH_CONVERSATIONS}?keyword=${encodeURIComponent(keyword)}`);
};

