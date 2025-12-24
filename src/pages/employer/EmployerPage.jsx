import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
// import { getUserInfo } from '../../utils/userUtils';
import { employerMenuItems } from '../../utils/menuConfig';
import { EmployerDashboard } from './EmployerDashboard';
import EmployerPost from './EmployerPost';
import EmployerManage from './EmployerManage';
import FindCandidates from './FindCandidates';
import MessagesPage from '../Common/MessagePage';
import Profile from '../user/Profile';
import { getUserInfo } from '../../services/userService';
import PasswordSetupModal from '../../components/Common/PasswordSetupModal';
import { MessageNotificationProvider } from '../../contexts/MessageNotificationContext.jsx';
import logoImg from '../../assets/logo.jpg';

const EmployerPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [editor, setEditor] = useState({ mode: 'create', jobId: null, jobStatus: null });
    const [userInfo, setUserInfo] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordSetupData, setPasswordSetupData] = useState(null);

    // Kiểm tra xem có cần hiển thị modal setup password không
    useEffect(() => {
        const showSetup = localStorage.getItem('showPasswordSetup');
        const authResponseStr = localStorage.getItem('authResponse');

        if (showSetup === 'true' && authResponseStr) {
            try {
                const authResponse = JSON.parse(authResponseStr);
                if (authResponse?.requiresPasswordSetup) {
                    setPasswordSetupData({
                        userEmail: authResponse.userEmail,
                        userName: authResponse.userName || authResponse.userEmail,
                        userId: authResponse.userId
                    });
                    setShowPasswordModal(true);
                }
            } catch (error) {
                console.error('Error parsing authResponse:', error);
            } finally {
                localStorage.removeItem('showPasswordSetup');
                localStorage.removeItem('authResponse');
            }
        }
    }, []);

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const res = await getUserInfo();
                if (res?.data?.data) {
                    const userData = res.data.data;
                    setAvatarUrl(userData.avatarUrl || userData.avatar || null);
                    // Lưu thông tin user
                    setUserInfo({
                        fullName: userData.fullName || userData.name || 'Người dùng',
                        email: userData.email || '',
                        role: userData.role || 'User',
                        roles: userData.roles || [],
                    });
                }
            } catch (error) {
                console.error('Lỗi khi lấy thông tin user:', error);
            }
        };
        loadUserInfo();
    }, []);


    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <EmployerDashboard onTabChange={setActiveTab} />;
            case 'post-job':
                return <EmployerPost mode={editor.mode} jobId={editor.jobId} jobStatus={editor.jobStatus} onDone={() => { setEditor({ mode: 'create', jobId: null, jobStatus: null }); setActiveTab('manage-jobs'); }} />;
            case 'manage-jobs':
                return (
                    <EmployerManage
                        onView={(jobId) => { setEditor({ mode: 'view', jobId, jobStatus: null }); setActiveTab('post-job'); }}
                        onEdit={(jobId) => { setEditor({ mode: 'edit', jobId, jobStatus: null }); setActiveTab('post-job'); }}
                        onEditWithStatus={(jobId, jobStatus) => { setEditor({ mode: 'edit', jobId, jobStatus }); setActiveTab('post-job'); }}
                        onStartChat={() => setActiveTab('messages')}
                    />
                );
            case 'search-candidates':
                return <FindCandidates />;
            // case 'search-candidates':
            //     return (
            //         <div className="bg-white rounded-lg shadow p-6">
            //             <h2 className="text-2xl font-bold mb-4">Tìm ứng viên</h2>
            //             <p className="text-gray-600">Tìm kiếm và lọc ứng viên...</p>
            //         </div>
            //     );
            case 'messages':
                return <MessagesPage />;
            case 'profile':
                return <Profile userInfo={userInfo} />;

            default:
                return (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold mb-4">{activeTab}</h2>
                        <p className="text-gray-600">Nội dung đang được phát triển...</p>
                    </div>
                );
        }
    };

    const handleTabChange = (tabId) => {
        if (tabId === 'post-job') {
            setEditor({ mode: 'create', jobId: null, jobStatus: null })
        }
        setActiveTab(tabId)
    }

    return (
        <MessageNotificationProvider>
            <DashboardLayout
                activeTab={activeTab}
                onTabChange={handleTabChange}
                menuItems={employerMenuItems}
                logo={logoImg}
                logoText="JobMate Employer"
                avatarUrl={avatarUrl}
            >
                {renderContent()}
            </DashboardLayout>

            {/* Modal setup password cho Google OAuth users */}
            {showPasswordModal && passwordSetupData && (
                <PasswordSetupModal
                    isOpen={showPasswordModal}
                    onClose={() => setShowPasswordModal(false)}
                    userEmail={passwordSetupData.userEmail}
                    userName={passwordSetupData.userName}
                    userId={passwordSetupData.userId}
                />
            )}
        </MessageNotificationProvider>
    );
};

export default EmployerPage;

