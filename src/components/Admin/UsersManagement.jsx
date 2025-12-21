import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Download,
  Users,
  Building2,
  GraduationCap,
  Mail,
  Phone,
  Eye,
  Lock,
  Unlock,
  Star,
  BadgeCheck,
  MapPin as MapPinIcon,
  X,
  Loader2,
} from 'lucide-react';
import { getAllUsers, updateUserStatus } from '../../services/userService';
import { showSuccess, showError } from '../../utils/toast';

const ROLE_TABS = [
  { key: 'USER', label: 'Sinh viên', icon: Users, description: 'Quản lý tài khoản sinh viên' },
  {
    key: 'EMPLOYER',
    label: 'Nhà tuyển dụng',
    icon: Building2,
    description: 'Quản lý tài khoản nhà tuyển dụng',
  },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'BANNED', label: 'Đã khóa' },
  { value: 'PENDING', label: 'Chờ xác minh' },
];

const PAGE_SIZE = 10;

const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
};

const toUpper = (value, fallback = '') => {
  if (!value && value !== 0) return fallback;
  try {
    return String(value).toUpperCase();
  } catch {
    return fallback;
  }
};

const normalizeUser = (user = {}, fallbackRole) => {
  const fullName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.name ||
    user.username ||
    'Chưa cập nhật';

  // Ưu tiên trường theo schema mới bạn cung cấp
  const roleFromArray =
    Array.isArray(user.roles) && user.roles.length > 0
      ? user.roles[0]?.name
      : undefined;

  const status = toUpper(user.status || user.accountStatus || user.state || '', 'UNKNOWN');

  return {
    id: user.id ?? user.userId ?? user.accountId ?? user._id ?? `temp-${Math.random()}`,
    fullName,
    email: user.email || '',
    phone: user.contactPhone || user.phone || user.phoneNumber || '',
    university:
      user.university ||
      user.school ||
      user.education?.university ||
      user.education?.school ||
      '',

    // Dùng trustScore làm "đánh giá", reviewCount là số lượt
    rating: user.trustScore ?? user.rating ?? user.averageRating ?? 0,
    ratingCount: user.reviewCount ?? user.ratingCount ?? user.totalReviews ?? 0,
    role: roleFromArray || user.roleName || user.role || fallbackRole || '',
    status,
    avatarUrl: user.avatarUrl || user.avatar || user.profilePicture || '',
    address: user.address || '',
    createdAt: user.createdAt || user.createdDate || user.created_time || null,
    lastLogin: user.lastLogin || user.lastLoginAt || null,
    jobCount: user.totalJobs ?? user.jobsCount ?? null,
    // Một số trường bổ sung từ schema
    verificationStatus: user.verificationStatus ?? null,
    badgeLevel: user.badgeLevel ?? null,
    violationCount: user.violationCount ?? 0,
    twoFaEnabled: user.twoFaEnabled ?? false,
    raw: user,
  };
};

const statusBadgeClass = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-100 text-emerald-700';
    case 'BANNED':
      return 'bg-red-100 text-red-700';
    case 'PENDING':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const badgeLabel = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'Hoạt động';
    case 'BANNED':
      return 'Đã khóa';
    case 'PENDING':
      return 'Chờ xác minh';
    default:
      return status || 'Không rõ';
  }
};

const roleBadgeClass = (role) => {
  switch (role) {
    case 'USER':
      return 'bg-blue-100 text-blue-700';
    case 'EMPLOYER':
      return 'bg-purple-100 text-purple-700';
    case 'ADMIN':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('vi-VN');
  } catch {
    return value;
  }
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const UsersManagement = () => {
  const [activeRole, setActiveRole] = useState(ROLE_TABS[0].key);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [serverTotalElements, setServerTotalElements] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, user: null, action: null });
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const apiStatus = statusFilter === 'all' ? undefined : statusFilter;
        const pageIndex = Math.max(0, (currentPage || 1) - 1);
        const response = await getAllUsers(pageIndex, PAGE_SIZE, apiStatus, activeRole);
        const payload = response?.data ?? response;
        const pageData = payload?.data ?? {};
        const entries = toArray(pageData?.data ?? pageData);
        const normalized = entries.map((item) => normalizeUser(item, activeRole));
        setUsers(normalized);
        setServerTotalPages(pageData?.totalPages ?? 1);
        setServerTotalElements(pageData?.totalElements ?? normalized.length);
      } catch (error) {
        console.error('Lỗi khi tải danh sách người dùng:', error);
        setUsers([]);
        setErrorMessage(
          error?.response?.data?.message ||
          'Không thể tải danh sách người dùng. Vui lòng thử lại sau.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [activeRole, statusFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, activeRole]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      // Safety check
      if (!user) return false;

      const matchKeyword =
        !keyword ||
        (user.fullName || '').toLowerCase().includes(keyword) ||
        (user.email || '').toLowerCase().includes(keyword) ||
        (user.phone || '').toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === 'all' ||
        user.status === statusFilter ||
        badgeLabel(user.status).toLowerCase().includes(keyword);

      return matchKeyword && matchStatus;
    });
  }, [users, search, statusFilter]);

  const totalItems = serverTotalElements;
  const totalPages = Math.max(1, serverTotalPages || 1);
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE;
  const endIndex = totalItems === 0 ? 0 : Math.min(safePage * PAGE_SIZE, totalItems);
  const pageUsers = filteredUsers; // đã là dữ liệu 1 trang từ server

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCloseDetail = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleOpenStatusModal = (user, action) => {
    setStatusModal({ open: true, user, action });
    setReason('');
  };

  const handleCloseStatusModal = () => {
    setStatusModal({ open: false, user: null, action: null });
    setReason('');
  };

  const handleUpdateStatus = async () => {
    if (!statusModal.user || !statusModal.action) return;

    const { user, action } = statusModal;
    const newStatus = action === 'unlock' ? 'ACTIVE' : 'BANNED';
    
    // Nếu đang khóa và chưa có lý do, yêu cầu nhập lý do
    if (action === 'lock' && !reason.trim()) {
      showError('Vui lòng nhập lý do khóa tài khoản.');
      return;
    }

    setUpdatingStatus(user.id);
    try {
      await updateUserStatus(user.id, newStatus, reason.trim());
      showSuccess(
        action === 'unlock' 
          ? `Đã mở khóa tài khoản ${user.fullName}` 
          : `Đã khóa tài khoản ${user.fullName}`
      );
      
      // Refresh danh sách users
      const apiStatus = statusFilter === 'all' ? undefined : statusFilter;
      const pageIndex = Math.max(0, (currentPage || 1) - 1);
      const response = await getAllUsers(pageIndex, PAGE_SIZE, apiStatus, activeRole);
      const payload = response?.data ?? response;
      const pageData = payload?.data ?? {};
      const entries = toArray(pageData?.data ?? pageData);
      const normalized = entries.map((item) => normalizeUser(item, activeRole));
      setUsers(normalized);
      
      handleCloseStatusModal();
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      showError(error?.response?.data?.message || 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 pt-6">
          <h1 className="text-2xl font-semibold text-slate-900">Quản lý người dùng</h1>
          <p className="text-sm text-slate-500 mt-2">
            Theo dõi trạng thái tài khoản và thông tin liên hệ của sinh viên và nhà tuyển dụng.
          </p>
        </div>

        <div className="px-6 pt-4">
          <div className="flex flex-wrap gap-2 border-b border-slate-200">
            {ROLE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.key === activeRole;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveRole(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${isActive
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          <div>
            <p className="text-sm text-slate-500">
              {ROLE_TABS.find((tab) => tab.key === activeRole)?.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-9 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 md:w-44"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>


          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Danh sách {activeRole === 'USER' ? 'sinh viên' : 'nhà tuyển dụng'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Hiển thị {totalItems === 0 ? 0 : startIndex + 1} - {endIndex} trong tổng số{' '}
              {totalItems} bản ghi.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wide">
                  {activeRole === 'USER' ? 'Sinh viên' : 'Nhà tuyển dụng'}
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wide">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wide">
                  Địa chỉ
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wide">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wide">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right font-semibold text-slate-600 uppercase tracking-wide">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-red-500">
                    {errorMessage}
                  </td>
                </tr>
              ) : pageUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    Không có bản ghi nào phù hợp.
                  </td>
                </tr>
              ) : (
                pageUsers.filter(user => user != null).map((user, index) => (
                  <tr key={`user-${user.id}-${index}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                            {getInitials(user.fullName)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{user.fullName}</p>
                          <p className="text-xs text-slate-500">Mã: {user.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1 text-slate-600">
                        {user.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            {user.email}
                          </p>
                        )}
                        {user.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1 text-slate-600">
                        <p className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-slate-400" />
                          {user.address || 'Chưa cập nhật'}
                        </p>
                        {user.badgeLevel && user.badgeLevel !== 'None' && (
                          <p className="text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <BadgeCheck className="h-3 w-3" />
                              {user.badgeLevel}
                            </span>
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-200" />
                        <span className="font-medium">
                          {user.rating != null ? user.rating.toFixed(1) : '0.0'}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({user.ratingCount ?? 0} lượt)
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                            user.status
                          )}`}
                        >
                          <BadgeCheck className="h-3 w-3" />
                          {badgeLabel(user.status)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${roleBadgeClass(
                            user.role
                          )}`}
                        >
                          {user.role === 'USER' ? 'Sinh viên' : user.role === 'EMPLOYER' ? 'Nhà tuyển dụng' : user.role}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(user)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                          Xem
                        </button>
                        {user.status === 'BANNED' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(user, 'unlock')}
                            disabled={updatingStatus === user.id}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            {updatingStatus === user.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Đang xử lý...</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="h-4 w-4" />
                                <span>Mở</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(user, 'lock')}
                            disabled={updatingStatus === user.id}
                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                          >
                            {updatingStatus === user.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Đang xử lý...</span>
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4" />
                                <span>Khóa</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Hiển thị {totalItems === 0 ? 0 : startIndex + 1} - {endIndex} trên tổng số{' '}
            {totalItems}{' '}
            {activeRole === 'USER' ? 'sinh viên' : 'nhà tuyển dụng'}.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
              className={`h-9 w-9 rounded-lg border border-slate-200 text-slate-600 transition ${safePage === 1
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              ‹
            </button>
            <span className="text-sm text-slate-600">
              Trang {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
              className={`h-9 w-9 rounded-lg border border-slate-200 text-slate-600 transition ${safePage === totalPages
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Thông tin người dùng</h3>
                <p className="text-sm text-slate-500">
                  Chi tiết tài khoản và lịch sử hoạt động gần nhất.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {selectedUser.avatarUrl ? (
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.fullName}
                    className="h-20 w-20 rounded-full border border-slate-200 object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xl font-semibold text-slate-600">
                    {getInitials(selectedUser.fullName)}
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <h4 className="text-xl font-semibold text-slate-900">{selectedUser.fullName}</h4>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                        selectedUser.status
                      )}`}
                    >
                      <BadgeCheck className="h-3 w-3" />
                      {badgeLabel(selectedUser.status)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${roleBadgeClass(
                        selectedUser.role
                      )}`}
                    >
                      {selectedUser.role === 'USER'
                        ? 'Sinh viên'
                        : selectedUser.role === 'EMPLOYER'
                          ? 'Nhà tuyển dụng'
                          : selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h5 className="text-sm font-semibold uppercase text-slate-500 tracking-wide">
                    Liên hệ
                  </h5>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {selectedUser.email || 'Chưa cập nhật'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {selectedUser.phone || 'Chưa cập nhật'}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-slate-400" />
                      {selectedUser.address || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h5 className="text-sm font-semibold uppercase text-slate-500 tracking-wide">
                    Tài khoản
                  </h5>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-medium text-slate-700">Ngày tạo:</span>{' '}
                      {formatDate(selectedUser.createdAt)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">Đăng nhập gần nhất:</span>{' '}
                      {formatDate(selectedUser.lastLogin)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">2FA:</span>{' '}
                      <span className={selectedUser.twoFaEnabled ? 'text-green-600' : 'text-slate-400'}>
                        {selectedUser.twoFaEnabled ? 'Đã bật' : 'Chưa bật'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h5 className="text-sm font-semibold uppercase text-slate-500 tracking-wide">
                  Thống kê hoạt động
                </h5>
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Điểm tin cậy</p>
                    <p className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-400 fill-amber-200" />
                      {selectedUser.rating != null ? selectedUser.rating.toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Số đánh giá</p>
                    <p className="text-xl font-semibold text-slate-900">
                      {selectedUser.ratingCount ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Cấp huy hiệu</p>
                    <p className="text-lg font-semibold text-amber-600">
                      {selectedUser.badgeLevel || 'None'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Vi phạm</p>
                    <p className="text-xl font-semibold text-red-600">
                      {selectedUser.violationCount ?? 0}
                    </p>
                  </div>
                  {selectedUser.verificationStatus && (
                    <div className="col-span-2">
                      <p className="text-slate-500">Trạng thái xác minh</p>
                      <p className="mt-1">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${selectedUser.verificationStatus === 'VERIFIED'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : selectedUser.verificationStatus === 'PENDING'
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                          }`}>
                          <BadgeCheck className="h-3 w-3" />
                          {selectedUser.verificationStatus === 'VERIFIED' ? 'Đã xác minh'
                            : selectedUser.verificationStatus === 'PENDING' ? 'Chờ xác minh'
                              : selectedUser.verificationStatus}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal.open && statusModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" onClick={handleCloseStatusModal}>
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {statusModal.action === 'lock' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {statusModal.user.fullName} ({statusModal.user.email})
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseStatusModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {statusModal.action === 'lock' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lý do khóa tài khoản <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="Nhập lý do khóa tài khoản..."
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              )}

              {statusModal.action === 'unlock' && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-700">
                    Bạn có chắc muốn mở khóa tài khoản này? Người dùng sẽ có thể đăng nhập và sử dụng hệ thống bình thường.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseStatusModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus === statusModal.user.id || (statusModal.action === 'lock' && !reason.trim())}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                    statusModal.action === 'lock'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {updatingStatus === statusModal.user.id ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </span>
                  ) : (
                    statusModal.action === 'lock' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
