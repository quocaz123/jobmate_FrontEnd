import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Common/SideBar';
import TopBar from '../components/Common/TopBar';
import { getUserInfo } from '../utils/userUtils';
import { getMenuItemsByRole } from '../utils/menuConfig';
import { initUserLocation } from '../services/locationService';

const DashboardLayout = ({
    children,
    activeTab = 'overview',
    onTabChange,
    menuItems, // Menu items được truyền từ page
    logo = "/vite.svg",
    logoText = "JobMate",
    avatarUrl = null // Avatar URL từ props
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [internalMenuItems, setInternalMenuItems] = useState([]);

    useEffect(() => {
        const userInfo = getUserInfo();
        if (userInfo) {
            setUserInfo(userInfo);
        }
    }, []);

    // Khởi tạo vị trí người dùng khi vào dashboard (chỉ chạy 1 lần)
    useEffect(() => {
        const initLocation = async () => {
            try {
                await initUserLocation();
            } catch (err) {
                console.warn('Không thể khởi tạo vị trí:', err);
            }
        };
        initLocation();
    }, []);

    // Nếu menuItems được truyền từ props thì dùng, nếu không thì tự động lấy theo role (backward compatibility)
    useEffect(() => {
        if (menuItems && menuItems.length > 0) {
            setInternalMenuItems(menuItems);
        } else {
            // Fallback: tự động lấy menu theo role nếu không truyền menuItems
            const userInfo = getUserInfo();
            const role = userInfo?.role || 'Student';
            const items = getMenuItemsByRole(role);
            setInternalMenuItems(items);
        }
    }, [menuItems]);

    // Nếu chưa load menuItems, hiển thị loading
    if (internalMenuItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    const handleTabChange = (tabId) => {
        if (onTabChange) {
            onTabChange(tabId);
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            <Sidebar
                sidebarItems={internalMenuItems}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                logo={logo}
                logoText={logoText}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar
                    inFor={userInfo?.fullName || ''}
                    role={userInfo?.role || 'Student'}
                    avatar={avatarUrl}
                    onTabChange={handleTabChange}
                />
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
