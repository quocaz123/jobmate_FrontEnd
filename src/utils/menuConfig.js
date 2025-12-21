import { LayoutDashboard, Briefcase, ClipboardList, MessageSquare, Building2, UserCheck, Search, Settings, Users, BarChart3, Shield, Send, Calendar, FileText, Sparkles, User, AlertTriangle, History } from 'lucide-react';

// Menu items cho User (Ứng viên)
export const userMenuItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'find-jobs', label: 'Tìm việc làm', icon: Briefcase },
    { id: 'job-requests', label: 'Yêu cầu tìm việc', icon: Sparkles },
    { id: 'applications', label: 'Ứng tuyển của tôi', icon: Send },
    { id: 'messages', label: 'Tin nhắn', icon: MessageSquare },
    { id: 'profile', label: 'Hồ sơ', icon: User },
];

// Menu items cho Employer
export const employerMenuItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'post-job', label: 'Đăng tin tuyển dụng', icon: Briefcase },
    { id: 'manage-jobs', label: 'Quản lý tin tuyển dụng', icon: ClipboardList },
    // { id: 'candidates', label: 'Ứng viên', icon: UserCheck },
    { id: 'search-candidates', label: 'Tìm ứng viên', icon: Search },
    { id: 'messages', label: 'Tin nhắn', icon: MessageSquare },
    { id: 'profile', label: 'Hồ sơ', icon: User },
    // { id: 'settings', label: 'Cài đặt', icon: Settings },
];

// Menu items cho Admin
export const adminMenuItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'users', label: 'Quản lý người dùng', icon: Users },
    // { id: 'employers', label: 'Quản lý nhà tuyển dụng', icon: Building2 },
    { id: 'job-review', label: 'Duyệt công việc', icon: ClipboardList },
    { id: 'reports', label: 'Báo cáo vi phạm', icon: AlertTriangle },
    { id: 'verifications', label: 'Xác minh CCCD', icon: Shield },
    { id: 'audit-logs', label: 'Nhật ký hệ thống', icon: History },
    // { id: 'statistics', label: 'Thống kê', icon: BarChart3 },
    // { id: 'applicants', label: 'Quản lý ứng viên', icon: FileText },
    // { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
    // { id: 'security', label: 'Bảo mật', icon: Shield },
];

// Lấy menu items dựa trên role
export const getMenuItemsByRole = (role) => {
    if (role === 'Admin') {
        return adminMenuItems;
    }
    if (role === 'Employer') {
        return employerMenuItems;
    }
    // Mặc định là User
    return userMenuItems;
};
