import React, { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AnalyticsHeader from './components/analytics/AnalyticsHeader';
import OverviewStats from './components/analytics/OverviewStats';
import AnalyticsTabs from './components/analytics/AnalyticsTabs';

const AdminAnalyticsPage = () => {
  const [activeMenu, setActiveMenu] = useState('stats'); // Set active menu to stats

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      {/* Main Content (with offset for sidebar) */}
      <div className="ml-64 w-[calc(100%-16rem)]">
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex justify-end items-center mb-4">
            <span className="text-gray-700 font-medium">Xin chào, Admin</span>
          </div>

          {/* Analytics Header */}
          <AnalyticsHeader />

          {/* Overview Stats */}
          <OverviewStats />

          {/* Analytics Tabs */}
          <AnalyticsTabs />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
