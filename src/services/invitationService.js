import httpClient from "../configurations/httpClient";
import { INVITATION } from "../configurations/configuration";

export const getMyInvitations = async () => {
    return await httpClient.get(INVITATION.GET_MY_INVITATIONS);
};

export const sendInvitation = async (payload) => {
    return await httpClient.post(INVITATION.SEND_INVITATION, payload);
};

export const acceptInvitation = async (invitationId) => {
    return await httpClient.post(INVITATION.ACCEPT_INVITATION(invitationId));
};

export const rejectInvitation = async (invitationId) => {
    return await httpClient.post(INVITATION.REJECT_INVITATION(invitationId));
};

