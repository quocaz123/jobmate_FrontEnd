import React from "react";
import { ChevronLeft, LogOut } from 'lucide-react';
import { logout } from '../../services/authService';
import { removeToken } from '../../services/localStorageService';

const Sidebar = ({ sidebarItems, activeTab, setActiveTab, sidebarOpen, setSidebarOpen, logo, logoText }) => {
    return (
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-sm border-r border-gray-200 transition-all duration-300 flex flex-col h-full`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                        {logo ? (
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <img
                                    src={logo}
                                    alt="Logo"
                                    className={`${sidebarOpen ? 'h-10 w-auto max-w-[120px]' : 'h-10 w-10'} object-contain flex-shrink-0`}
                                />
                                {sidebarOpen && logoText && (
                                    <span className="text-sm font-bold text-gray-900 truncate">{logoText}</span>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-2 rounded-lg flex-shrink-0">
                                    <div className="h-5 w-5 bg-white rounded"></div>
                                </div>
                                {sidebarOpen && logoText && (
                                    <span className="text-sm font-bold text-gray-900">{logoText}</span>
                                )}
                            </div>
                        )}
                    </div>
                    {sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center hover:from-indigo-600 hover:to-blue-700 transition-all"
                        >
                            <ChevronLeft className="h-4 w-4 text-white" />
                        </button>
                    )}
                    {!sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center hover:from-indigo-600 hover:to-blue-700 transition-all"
                        >
                            <ChevronLeft className="h-4 w-4 text-white rotate-180" />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Navigation */}
<nav className="flex-1 px-3 py-4 overflow-y-auto">
                <ul className="space-y-1">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all ${isActive
                                        ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-blue-50'
                                        }`}
                                >
                                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                                    {sidebarOpen && (
                                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                                            {item.label}
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Navigation */}
            <div className="border-t border-gray-200 px-3 py-4 space-y-1">
                <button
                    onClick={() => {
                        logout();
                        removeToken();
                        window.location.href = '/login';
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="h-5 w-5 text-red-600" />
                    {sidebarOpen && <span className="text-sm font-medium">Đăng xuất</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar; 
