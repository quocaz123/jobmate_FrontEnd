
// Validate OAuth configuration
const validateOAuthConfig = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI;

    if (!clientId || clientId.trim() === '') {
        if (import.meta.env.DEV) {
            console.warn('Tạo file .env.local với: VITE_GOOGLE_CLIENT_ID=your-client-id');
        }
    }

    if (!redirectUri || redirectUri.trim() === '') {
        console.warn('VITE_OAUTH_REDIRECT_URI không được set. Sẽ sử dụng fallback.');
    }

    return {
        clientId: clientId || '',
        redirectUri: redirectUri || (typeof window !== 'undefined' ? `${window.location.origin}/authenticate` : 'http://localhost:5173/authenticate'),
    };
};

const oauthConfig = validateOAuthConfig();

export const OAuthConfig = {
    clientId: oauthConfig.clientId,
    redirectUri: oauthConfig.redirectUri,
    authUri: "https://accounts.google.com/o/oauth2/v2/auth",
}


export const CONFIG = {
    API_GATEWAY: import.meta.env.VITE_API_GATEWAY,
};

export const AUTH = {
    LOGIN: "/jobmate/auth/login",
    OAUTH_AUTHENTICATION: "/jobmate/auth/outbound/authentication",
    REFRESH_TOKEN: "/jobmate/auth/refresh",
    LOGOUT: "/jobmate/auth/logout",
    VERIFY_OTP: "/jobmate/auth/verify-otp",
    RESEND_OTP: "/jobmate/auth/resend-otp",
    SET_PASSWORD: "/jobmate/auth/set-password",
    FORGOT_PASSWORD: "/jobmate/auth/forgot-password",
    RESET_PASSWORD: "/jobmate/auth/reset-password",
    REGISTER: "/jobmate/users/registration",
    ENABLE_2FA: "/jobmate/users/two-fa",
};

export const USER = {
    GET_USER_INFO: "/jobmate/users/my-info",
    GET_ALL_USERS: "/jobmate/users",
    UPDATE_USER: "/jobmate/users",
    GET_USER_DETAIL: (userId) => `/jobmate/users/${userId}`,
    GET_USER_TOPRATED: "/jobmate/users/top-rated",
    GET_USER_TOP10: "/jobmate/users/top-10",
    GET_LOCATION: "/jobmate/users/locations",
    AUTO_COMPLETE_LOCATION: "/jobmate/users/location/auto",
    GET_USER_STATS: "/jobmate/users/my-stats",
    SET_PASSWORD: "/jobmate/auth/set-password",
    UPDATE_PASSWORD: "/jobmate/users/password",
    UPGRADE_ROLE: (userId) => `/jobmate/users/${userId}/upgrade-employer`,
    UPDATE_USER_STATUS: (userId) => `/jobmate/admin/verify/${userId}/status`,
};

export const NOTIFICATION = {
    GET_NOTIFICATIONS: "/jobmate/notifications/me",
    MARK_AS_READ: (id) => `/jobmate/notifications/${id}/read`,
    CREATE_NOTIFICATION: "/jobmate/notifications",
    DELETE_ALL: "/jobmate/notifications/me",
};

export const JOB = {
    CREATE_JOB: "/jobmate/jobs",
    UPDATE_JOB: (jobId) => `/jobmate/jobs/${jobId}`,
    VERIFY_JOB: (jobId) => `/jobmate/jobs/${jobId}/verify-job`,
    CLOSE_JOB: (jobId) => `/jobmate/jobs/${jobId}/close`,
    GET_JOBS: "/jobmate/jobs",
    GET_JOB_DETAIL: (jobId) => `/jobmate/jobs/${jobId}`,
    GET_JOB_DETAIL_BY_ID_FOR_USER: (jobId) => `/jobmate/jobs/details/${jobId}`,
    GET_NEARBY_JOBS: "/jobmate/jobs/nearby",
    GET_MY_JOBS: "/jobmate/jobs/my-jobs",
    GET_AVAILABLE_JOBS: "/jobmate/jobs/available",
    GET_ALL_JOB_PEDINGS: "/jobmate/jobs",
    DELETE_JOB: (jobId) => `/jobmate/jobs/${jobId}/delete`,
}

export const APPLICATION = {
    APPLY_JOB: "/jobmate/applications/apply",
    GET_MY_APPLICATIONS: "/jobmate/applications/my-applications",
    GET_APPLICATION_DETAIL: (applicationId) => `/jobmate/applications/${applicationId}`,
    GET_JOB_OF_APPLICATION: (jobId) => `/jobmate/applications/job/${jobId}`,
    CANCEL_APPLICATION: (applicationId) => `/jobmate/applications/${applicationId}/cancel`,
    GET_APPLICATIONS_BY_JOB: (jobId) => `/jobmate/applications/job/${jobId}`,
    UPDATE_APPLICATION_STATUS: (applicationId) => `/jobmate/applications/${applicationId}/status`,
}

export const VERIFY = {
    VERIFY_CCCD: "/jobmate/users/verify/request"
}

export const UPLOAD = {
    UPLOAD_FILE: "/jobmate/files/upload",
    GET_FILE: "/jobmate/files/private-url",
}

export const ADMIN = {
    REJECT_CCCD: (userId) => `/jobmate/admin/verify/${userId}/reject`,
    APPROVE_CCCD: (userId) => `/jobmate/admin/verify/${userId}/approve`,
    GET_ALL_VERIFY_REQUESTS: "/jobmate/admin/verify/pedding",
    GET_VERIFY_DETAIL: (userId) => `/jobmate/admin/verify/pedding/${userId}/detail`,
}

export const VERIFICATION_ADMIN = {
    // Admin - xác minh CCCD
    GET_PENDING: "/jobmate/admin/verify/pending",
    GET_DETAIL: (userId) => `/jobmate/admin/verify/pending/${userId}/detail`,
    APPROVE: (userId) => `/jobmate/admin/verify/${userId}/approve`,
    REJECT: (userId) => `/jobmate/admin/verify/${userId}/reject`,
}

export const AUDIT_LOG = {
    GET_AUDIT_LOGS: "/jobmate/admin/audit-logs",
    GET_STATS: "/jobmate/admin/audit-logs/stats",
}

export const ADMIN_DASHBOARD = {
    SUMMARY: "/jobmate/admin/dashboard/summary",
    SYSTEM_HEALTH: "/jobmate/admin/dashboard/system-health",
    TOP_VIOLATIONS: "/jobmate/admin/dashboard/users/violations",
}

export const EMPLOYER_DASHBOARD = {
    SUMMARY: "/jobmate/employer/dashboard/summary",
    TOP_JOBS: "/jobmate/employer/dashboard/jobs/top",
    RECENT_CANDIDATES: "/jobmate/employer/dashboard/candidates/recent",
}

export const CHAT = {
    GET_MY_CONVERSATIONS: "/chat/conversations/my-conversations",
    GET_MESSAGES_OF_CONVERSATION: "/chat/messages",
    CREATE_MESSAGE: "/chat/messages/create",
    CREATE_VERSATION: "/chat/conversations/create",
    SEARCH_CONVERSATIONS: "/chat/conversations/search",
}

export const RATING = {
    CREATE_RATING: "/jobmate/ratings",
    GET_RATINGS: "/jobmate/ratings/user",
}

export const REPORT = {
    CREATE_REPORT: "/jobmate/reports",
    GET_ALL_REPORTS: "/jobmate/reports",
    REVIEW_REPORT: (reportId) => `/jobmate/reports/${reportId}/review`,
}

export const WAITING_LIST = {
    CREATE_WAITING_LIST: "/jobmate/waiting-list",
    GET_MY_WAITING_LIST: "/jobmate/waiting-list/my-waiting",
    DELETE_WAITING_LIST: (id) => `/jobmate/waiting-list/${id}`,
    GET_ALL_WAITING_LISTS: "/jobmate/waiting-list/candidates",
}

export const RECOMMENDATION = {
    GET_RECOMMENDATION_JOBS: "/jobmate/recommend/jobs",
    GET_RECOMMENDATION_USERS: "/jobmate/recommend/users",
}

export const INVITATION = {
    SEND_INVITATION: "/jobmate/invitations",
    GET_MY_INVITATIONS: "/jobmate/invitations/received",
    ACCEPT_INVITATION: (id) => `/jobmate/invitations/${id}/accept`,
    REJECT_INVITATION: (id) => `/jobmate/invitations/${id}/reject`,
}

export const CATEGORY = {
    GET_ALL_CATEGORIES: "/jobmate/categories",
}