import React, { useState, useEffect } from 'react';
import Pagination from '../Common/Pagination';
import { Search, User, Mail, Shield, Trash2, Lock, Unlock, Edit } from 'lucide-react';

// Mock data - sẽ thay thế bằng API call thực tế
const generateMockUsers = () => {
    const roles = ['User', 'Employer', 'Admin'];
    const statuses = ['active', 'locked', 'inactive'];
    const users = [];

    for (let i = 1; i <= 150; i++) {
        users.push({
            id: i,
            fullName: `Người dùng ${i}`,
            email: `user${i}@jobmate.com`,
            role: roles[Math.floor(Math.random() * roles.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toLocaleDateString('vi-VN'),
            lastLogin: Math.random() > 0.5 ? new Date(2024, 10, Math.floor(Math.random() * 30)).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'
        });
    }

    return users;
};

const ManagerUser = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Load mock data
    useEffect(() => {
        const mockData = generateMockUsers();
        setUsers(mockData);
        setFilteredUsers(mockData);
    }, []);

    // Filter users
    useEffect(() => {
        let filtered = [...users];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        setFilteredUsers(filtered);
        setCurrentPage(0); // Reset về trang đầu khi filter
    }, [searchTerm, roleFilter, statusFilter, users]);

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    // Handlers
    const handleDelete = (userId) => {
        if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
            setUsers(users.filter(user => user.id !== userId));
            console.log('Xóa user:', userId);
        }
    };

    const handleToggleLock = (userId) => {
        setUsers(users.map(user =>
            user.id === userId
                ? { ...user, status: user.status === 'locked' ? 'active' : 'locked' }
                : user
        ));
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Admin':
                return 'bg-red-100 text-red-700';
            case 'Employer':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'locked':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'Hoạt động';
            case 'locked':
                return 'Đã khóa';
            default:
                return 'Không hoạt động';
        }
    };

    const getRoleText = (role) => {
        switch (role) {
            case 'Admin':
                return 'Quản trị viên';
            case 'Employer':
                return 'Nhà tuyển dụng';
            default:
                return 'Người dùng';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
                        <p className="text-gray-600 mt-1">Tổng cộng: {filteredUsers.length} người dùng</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả vai trò</option>
                        <option value="User">Người dùng</option>
                        <option value="Employer">Nhà tuyển dụng</option>
                        <option value="Admin">Quản trị viên</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Hoạt động</option>
                        <option value="locked">Đã khóa</option>
                        <option value="inactive">Không hoạt động</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Người dùng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Vai trò
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Đăng nhập cuối
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <p className="text-lg">Không tìm thấy người dùng nào</p>
                                        <p className="text-sm mt-2">Thử thay đổi bộ lọc của bạn</p>
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                                    <div className="text-sm text-gray-500">ID: {user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-700">
                                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                {getRoleText(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                                                {getStatusText(user.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {user.createdAt}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {user.lastLogin}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleLock(user.id)}
                                                    className={`p-2 rounded-lg transition-colors ${user.status === 'locked'
                                                        ? 'text-green-600 hover:bg-green-50'
                                                        : 'text-orange-600 hover:bg-orange-50'
                                                        }`}
                                                    title={user.status === 'locked' ? 'Mở khóa' : 'Khóa tài khoản'}
                                                >
                                                    {user.status === 'locked' ? (
                                                        <Unlock className="w-4 h-4" />
                                                    ) : (
                                                        <Lock className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                    <Pagination
                        page={currentPage}
                        totalPages={totalPages}
                        onChangePage={setCurrentPage}
                    />
                )}
            </div>


        </div>
    );
};

export default ManagerUser;
