import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminMenuItems } from '../../utils/menuConfig';
import AdminDashboard from '../../components/Admin/AdminDashboard';
import UsersManagement from '../../components/Admin/UsersManagement';
import ReportsManagement from './ReportsManagement';
import VerificationCCCD from '../../components/Admin/VerificationCCCD';
import JobReviewManagement from '../../components/Admin/JobReviewManagement';
import AuditLogs from '../../components/Admin/AuditLogs';
import { MessageNotificationProvider } from '../../contexts/MessageNotificationContext.jsx';
import logoImg from '../../assets/logo.jpg';

// Component cho Overview
const AdminOverview = () => {
    return <AdminDashboard />;
};

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <AdminOverview />;
            case 'users':
                return <UsersManagement />;
            case 'job-review':
                return <JobReviewManagement />;
            case 'verifications':
                return <VerificationCCCD />;
            case 'audit-logs':
                return <AuditLogs />;
      case 'reports':
          return <ReportsManagement />;
            default:
                return (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold mb-4">{activeTab}</h2>
                        <p className="text-gray-600">Nội dung đang được phát triển...</p>
                    </div>
                );
        }
    };

    return (
        <MessageNotificationProvider>
            <DashboardLayout
                activeTab={activeTab}
                onTabChange={setActiveTab}
                menuItems={adminMenuItems}
                logo={logoImg}
                logoText="JobMate Admin"
            >
                {renderContent()}
            </DashboardLayout>
        </MessageNotificationProvider>
    );
};

export default AdminPage;

