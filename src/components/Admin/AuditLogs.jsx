import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    History,
    Filter,
    RefreshCcw,
    Search,
    Clock,
    Target,
    UserCircle2,
    ChevronDown,
} from "lucide-react";
import Pagination from "../Common/Pagination";
import { getAuditLogs } from "../../services/auditLogService";
import { getAllUsers } from "../../services/userService";

const ACTION_OPTIONS = [
    { value: "", label: "Tất cả hành động" },
    { value: "AUTH_LOGIN_SUCCESS", label: "Đăng nhập thành công" },
    { value: "USER_UPDATE_PROFILE", label: "Cập nhật hồ sơ" },
    { value: "JOB_CREATE", label: "Tạo công việc" },
    { value: "JOB_STATUS_CHANGE", label: "Đổi trạng thái công việc" },
];

const formatDateTime = (value) => {
    if (!value) return "—";
    try {
        return new Intl.DateTimeFormat("vi-VN", {
            dateStyle: "short",
            timeStyle: "medium",
        }).format(new Date(value));
    } catch {
        return value;
    }
};

const actionBadgeClass = (action) => {
    switch (action) {
        case "AUTH_LOGIN_SUCCESS":
            return "bg-emerald-50 text-emerald-700 border border-emerald-200";
        case "USER_UPDATE_PROFILE":
            return "bg-indigo-50 text-indigo-700 border border-indigo-200";
        case "JOB_CREATE":
            return "bg-sky-50 text-sky-700 border border-sky-200";
        case "JOB_STATUS_CHANGE":
            return "bg-amber-50 text-amber-700 border border-amber-200";
        default:
            return "bg-slate-100 text-slate-700 border border-slate-200";
    }
};

const normalizeLogs = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.content)) return payload.content;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.results)) return payload.results;
    return [];
};

const AuditLogs = () => {
    const [filters, setFilters] = useState({
        userId: "",
        action: "",
        targetId: "",
        startDate: "",
        endDate: "",
    });
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState({
        totalPages: 1,
        totalElements: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    // State cho danh sách users
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const userDropdownRef = React.useRef(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getAuditLogs({
                page,
                size,
                userId: filters.userId || undefined,
                targetId: filters.targetId || undefined,
                action: filters.action || undefined,
                startDate: filters.startDate ? new Date(filters.startDate).toISOString() : undefined,
                endDate: filters.endDate ? new Date(filters.endDate).toISOString() : undefined,
            });

            const payload = response?.data ?? response;
            const data = payload?.data ?? {};
            const entries = normalizeLogs(data);
            setLogs(entries);
            setMeta({
                totalPages: data?.totalPages ?? 1,
                totalElements: data?.totalElements ?? entries.length,
            });
            if (typeof data?.currentPage === "number") {
                setPage(data.currentPage);
            }
        } catch (err) {
            console.error("Lỗi khi tải audit log:", err);
            setLogs([]);
            setMeta({ totalPages: 1, totalElements: 0 });
            setError(err?.response?.data?.message || "Không thể tải audit log. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [filters, page, size]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Load danh sách users
    useEffect(() => {
        const loadUsers = async () => {
            setLoadingUsers(true);
            try {
                const response = await getAllUsers(0, 1000); // Lấy tối đa 1000 users
                const payload = response?.data?.data || response?.data;
                const usersList = payload?.data || payload || [];
                setUsers(usersList);
            } catch (err) {
                console.error("Lỗi khi tải danh sách users:", err);
                setUsers([]);
            } finally {
                setLoadingUsers(false);
            }
        };
        loadUsers();
    }, []);

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredLogs = useMemo(() => {
        if (!searchText.trim()) return logs;
        const keyword = searchText.trim().toLowerCase();
        return logs.filter((log) => {
            const line =
                `${log?.userEmail || ""} ${log?.userFullName || ""} ${log?.description || ""}`.toLowerCase();
            return line.includes(keyword);
        });
    }, [logs, searchText]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
        setPage(0);
    };

    const handleResetFilters = () => {
        setFilters({
            userId: "",
            action: "",
            targetId: "",
            startDate: "",
            endDate: "",
        });
        setSearchText("");
        setPage(0);
        setSize(20);
    };

    const handleRefresh = () => {
        fetchLogs();
    };

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const handleChangeSize = (event) => {
        const newSize = Number(event.target.value) || 20;
        setSize(newSize);
        setPage(0);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3 text-slate-900">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                <History className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold">Nhật ký hoạt động hệ thống</h1>
                                <p className="text-sm text-slate-500">Theo dõi mọi thao tác nhạy cảm của quản trị viên và người dùng.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Làm mới
                        </button>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Đặt lại
                        </button>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">Người dùng</label>
                            <div className="mt-1 relative" ref={userDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="w-full flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left focus-within:border-indigo-500 hover:bg-slate-100 transition"
                                >
                                    <UserCircle2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span className="flex-1 text-sm text-slate-700 truncate">
                                        {filters.userId 
                                            ? (users.find(u => (u.id || u.userId) === filters.userId)?.fullName || users.find(u => (u.id || u.userId) === filters.userId)?.email || filters.userId)
                                            : "Chọn người dùng..."}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {userDropdownOpen && (
                                    <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {loadingUsers ? (
                                            <div className="px-4 py-8 text-center text-sm text-slate-500">Đang tải...</div>
                                        ) : users.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-sm text-slate-500">Không có người dùng</div>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleFilterChange("userId", "");
                                                        setUserDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700"
                                                >
                                                    Tất cả người dùng
                                                </button>
                                                {users.map((user) => {
                                                    const userId = user.id || user.userId;
                                                    const userName = user.fullName || user.name || user.email || "Người dùng";
                                                    const userEmail = user.email || "";
                                                    const isSelected = filters.userId === userId;
                                                    return (
                                                        <button
                                                            key={userId}
                                                            type="button"
                                                            onClick={() => {
                                                                handleFilterChange("userId", userId);
                                                                setUserDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition ${
                                                                isSelected ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700'
                                                            }`}
                                                        >
                                                            <div className="font-medium">{userName}</div>
                                                            {userEmail && (
                                                                <div className="text-xs text-slate-500">{userEmail}</div>
                                                            )}
                                                            <div className="text-xs text-slate-400 mt-0.5">{userId}</div>
                                                        </button>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">Mục tiêu (UUID)</label>
                            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-500">
                                <Target className="h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={filters.targetId}
                                    onChange={(event) => handleFilterChange("targetId", event.target.value)}
                                    placeholder="vd: d79baba1-..."
                                    className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">Hành động</label>
                            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-500">
                                <Filter className="h-4 w-4 text-slate-400" />
                                <select
                                    value={filters.action}
                                    onChange={(event) => handleFilterChange("action", event.target.value)}
                                    className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                                >
                                    {ACTION_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">Tìm nhanh</label>
                            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-500">
                                <Search className="h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchText}
                                    onChange={(event) => setSearchText(event.target.value)}
                                    placeholder="Email, mô tả..."
                                    className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">Từ ngày</label>
                            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-500">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <input
                                    type="datetime-local"
                                    value={filters.startDate}
                                    onChange={(event) => handleFilterChange("startDate", event.target.value)}
                                    className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">Đến ngày</label>
                            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-500">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <input
                                    type="datetime-local"
                                    value={filters.endDate}
                                    onChange={(event) => handleFilterChange("endDate", event.target.value)}
                                    className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">Số bản ghi / trang</label>
                            <select
                                value={size}
                                onChange={handleChangeSize}
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none"
                            >
                                {[10, 20, 50, 100].map((option) => (
                                    <option key={option} value={option}>
                                        {option} bản ghi
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Kết quả truy vết</h2>
                        <p className="text-sm text-slate-500">
                            Hiển thị {filteredLogs.length} / {meta.totalElements} bản ghi. Trang {page + 1} /{" "}
                            {Math.max(meta.totalPages, 1)}.
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold">Người dùng</th>
                                <th className="px-6 py-3 text-left font-semibold">Hành động</th>
                                <th className="px-6 py-3 text-left font-semibold">Mục tiêu</th>
                                <th className="px-6 py-3 text-left font-semibold">Mô tả</th>
                                <th className="px-6 py-3 text-left font-semibold">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                                        Không có bản ghi phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-900">
                                                {log.userFullName || log.userEmail || "Người dùng hệ thống"}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {log.userEmail || log.userId || "—"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${actionBadgeClass(
                                                    log.action
                                                )}`}
                                            >
                                                <History className="h-3 w-3" />
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-900 font-medium">
                                                {log.targetId || "—"}
                                            </p>
                                            <p className="text-xs text-slate-500">ID thao tác</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-700">{log.description}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {formatDateTime(log.createdAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} totalPages={Math.max(meta.totalPages, 1)} onChangePage={handleChangePage} />
            </div>
        </div>
    );
};

export default AuditLogs;

