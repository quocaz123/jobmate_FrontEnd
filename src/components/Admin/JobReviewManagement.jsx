import React, { useEffect, useMemo, useState } from 'react';
import { Search, Eye, Check, X, MapPin, DollarSign, Briefcase, Calendar, Building2, Phone, Clock, Users } from 'lucide-react';
import { getAllJobPeding, approveJob, rejectJob, getJobDetail } from '../../services/jobService';
import { showSuccess, showError, showWarning } from '../../utils/toast';
import { formatWorkingDaysForDisplay } from '../../utils/scheduleUtils';
import { SALARY_UNIT_LABELS } from '../../constants/salaryUnits';

const DEFAULT_PAGE_SIZE = 10;

const extractPageData = (response) => {
    const payload = response?.data ?? response ?? {};
    const pageData = payload?.data ?? payload ?? {};

    const list =
        Array.isArray(pageData?.data) ? pageData.data :
            Array.isArray(pageData?.content) ? pageData.content :
                Array.isArray(pageData?.items) ? pageData.items :
                    Array.isArray(pageData?.results) ? pageData.results :
                        Array.isArray(pageData) ? pageData : [];

    return {
        items: list,
        meta: pageData,
    };
};

const formatSalary = (salary, unit) => {
    if (unit === 'NEGOTIABLE') return 'Thỏa thuận';
    if (!salary) return '—';
    const formatted = new Intl.NumberFormat('vi-VN').format(salary);
    const unitLabel = SALARY_UNIT_LABELS[unit] || unit || 'VND';
    return `${formatted} ${unitLabel}`;
};

const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('vi-VN');
};

const badgeByStatus = (status) => {
    switch (status) {
        case 'PENDING_REVIEW':
            return 'bg-yellow-100 text-yellow-700';
        case 'APPROVED':
            return 'bg-green-100 text-green-700';
        case 'REJECTED':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const statusLabel = (status) => {
    switch (status) {
        case 'PENDING_REVIEW':
            return 'Chờ duyệt';
        case 'APPROVED':
            return 'Đã duyệt';
        case 'REJECTED':
            return 'Đã từ chối';
        default:
            return status;
    }
};

const jobTypeLabel = (type) => {
    switch (type) {
        case 'FULL_TIME':
            return 'Toàn thời gian';
        case 'PART_TIME':
            return 'Bán thời gian';
        case 'CONTRACT':
            return 'Hợp đồng';
        default:
            return type;
    }
};

const workModeLabel = (mode) => {
    switch (mode) {
        case 'ONSITE':
            return 'Tại văn phòng';
        case 'REMOTE':
            return 'Làm việc từ xa';
        case 'HYBRID':
            return 'Linh hoạt';
        default:
            return mode;
    }
};

export default function JobReviewManagement() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rows, setRows] = useState([]);
    const [serverPage, setServerPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const [detail, setDetail] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [actionType, setActionType] = useState(null); // 'approve' | 'reject' | null
    const [rejectReason, setRejectReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getAllJobPeding(Math.max(page - 1, 0), pageSize);
                const { items, meta: serverMeta } = extractPageData(res);

                const serverPageSize = serverMeta.pageSize || serverMeta.size || DEFAULT_PAGE_SIZE;
                const serverTotalPages = serverMeta.totalPages || serverMeta.totalPage || serverMeta.pages || 1;
                const serverTotalElements = serverMeta.totalElements || serverMeta.totalItems || serverMeta.total || items.length;
                let currentPageFromServer = 1;
                if (typeof serverMeta.currentPage === 'number') {
                    currentPageFromServer = serverMeta.currentPage;
                } else if (typeof serverMeta.page === 'number') {
                    currentPageFromServer = serverMeta.page + 1;
                } else if (typeof serverMeta.number === 'number') {
                    currentPageFromServer = serverMeta.number + 1;
                }

                const syncedPage = currentPageFromServer || page;
                setServerPage(syncedPage);
                if (syncedPage !== page) {
                    setPage(syncedPage);
                }
                setTotalPages(serverTotalPages || 1);
                setTotalElements(serverTotalElements);
                setPageSize(serverPageSize);
                setRows(items);
            } catch (err) {
                setError(err?.response?.data?.message || 'Không tải được danh sách công việc chờ duyệt');
                setRows([]);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [page, refreshKey, pageSize]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (r) =>
                (r.title || '').toLowerCase().includes(q) ||
                (r.companyName || '').toLowerCase().includes(q) ||
                (r.createdByName || '').toLowerCase().includes(q) ||
                (r.location || '').toLowerCase().includes(q)
        );
    }, [rows, search]);

    const start = totalElements === 0 ? 0 : (serverPage - 1) * pageSize + 1;
    const end = totalElements === 0 ? 0 : Math.min(serverPage * pageSize, totalElements);

    const openDetail = async (jobId) => {
        try {
            const res = await getJobDetail(jobId);
            setDetail(res?.data?.data || res?.data);
            setShowDetail(true);
            setActionType(null);
            setRejectReason('');
        } catch (err) {
            showError(err?.response?.data?.message || 'Không tải được chi tiết công việc');
        }
    };

    const handleApprove = async () => {
        if (!detail?.id) return;
        try {
            setSubmitting(true);
            await approveJob(detail.id);
            showSuccess('Đã duyệt công việc thành công!');
            setShowDetail(false);
            setRefreshKey((k) => k + 1);
        } catch (err) {
            showError(err?.response?.data?.message || 'Duyệt công việc thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!detail?.id) return;
        if (actionType !== 'reject') {
            setActionType('reject');
            return;
        }
        if (!rejectReason.trim()) {
            showWarning('Vui lòng nhập lý do từ chối.');
            return;
        }
        try {
            setSubmitting(true);
            await rejectJob(detail.id, rejectReason.trim());
            showSuccess('Đã từ chối công việc thành công!');
            setShowDetail(false);
            setRefreshKey((k) => k + 1);
        } catch (err) {
            showError(err?.response?.data?.message || 'Từ chối công việc thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8">
                <h1 className="text-4xl font-extrabold tracking-tight">Duyệt công việc</h1>
                <p className="text-gray-500 mt-2">Kiểm duyệt và phê duyệt các tin tuyển dụng</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold">Danh sách công việc chờ duyệt</h2>
                        <p className="text-sm text-gray-500">
                            Hiển thị {start}-{end} trên {totalElements}
                        </p>
                    </div>
                    <div className="w-80">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                <Search size={16} />
                            </span>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm kiếm theo tiêu đề, công ty..."
                                className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                <div className="divide-y">
                    {loading && <div className="px-6 py-10 text-center text-gray-500">Đang tải...</div>}
                    {error && !loading && <div className="px-6 py-10 text-center text-red-500">{error}</div>}
                    {!loading && !error && filtered.length === 0 && (
                        <div className="px-6 py-10 text-center text-gray-500">Không có công việc chờ duyệt</div>
                    )}
                    {!loading && !error && filtered.map((job) => (
                        <div key={job.id} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeByStatus(job.status)}`}>
                                            {statusLabel(job.status)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={16} className="text-gray-400" />
                                            <span>{job.companyName || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={16} className="text-gray-400" />
                                            <span>{jobTypeLabel(job.jobType)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span className="truncate">{job.location || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            <span>{formatSalary(job.salary, job.salaryUnit)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Users size={14} />
                                            <span>Người tạo: {job.createdByName || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>Ngày tạo: {formatDate(job.createdAt)}</span>
                                        </div>
                                        {job.deadline && (
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                <span>Hạn nộp: {formatDate(job.deadline)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => openDetail(job.id)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-gray-700 text-xs hover:bg-gray-50"
                                    >
                                        <Eye size={14} /> Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t">
                    <p className="text-sm text-gray-500">Hiển thị {start}-{end} trên {totalElements}</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, serverPage - 1, p - 1))}
                            disabled={serverPage <= 1}
                            className={`h-9 w-9 rounded border ${serverPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                            ‹
                        </button>
                        <span className="text-sm text-gray-600">
                            Trang {serverPage} / {Math.max(1, totalPages)}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, serverPage + 1, p + 1))}
                            disabled={serverPage >= totalPages}
                            className={`h-9 w-9 rounded border ${serverPage >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>

            {showDetail && detail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold">Chi tiết công việc</h3>
                                <p className="text-xs text-gray-500">Xem và duyệt tin tuyển dụng</p>
                            </div>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-gray-900">{detail.title}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeByStatus(detail.status)}`}>
                                        {statusLabel(detail.status)}
                                    </span>
                                </div>
                                <p className="text-gray-600">{detail.companyName || '—'}</p>
                            </div>

                            {/* Thông tin cơ bản */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="rounded-lg border p-4">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Thông tin cơ bản</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={16} className="text-gray-400" />
                                            <span className="text-gray-500">Loại công việc:</span>
                                            <span className="font-medium">{jobTypeLabel(detail.jobType)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            <span className="text-gray-500">Lương:</span>
                                            <span className="font-medium">{formatSalary(detail.salary, detail.salaryUnit)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span className="text-gray-500">Địa điểm:</span>
                                            <span className="font-medium">{detail.location || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-gray-400" />
                                            <span className="text-gray-500">Chế độ:</span>
                                            <span className="font-medium">{workModeLabel(detail.workMode)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span className="text-gray-500">Hạn nộp:</span>
                                            <span className="font-medium">{formatDate(detail.deadline)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Thông tin liên hệ</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-gray-400" />
                                            <span className="text-gray-500">Người tạo:</span>
                                            <span className="font-medium">{detail.createdByName || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-gray-400" />
                                            <span className="text-gray-500">SĐT:</span>
                                            <span className="font-medium">{detail.contactPhone || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span className="text-gray-500">Ngày tạo:</span>
                                            <span className="font-medium">{formatDate(detail.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={16} className="text-gray-400" />
                                            <span className="text-gray-500">Danh mục:</span>
                                            <span className="font-medium">{detail.categoryName || '—'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mô tả và yêu cầu */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="rounded-lg border p-4">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Mô tả công việc</h4>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.description || '—'}</p>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Yêu cầu</h4>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.requirements || '—'}</p>
                                </div>
                            </div>

                            {/* Quyền lợi và kỹ năng */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="rounded-lg border p-4">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Quyền lợi</h4>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.benefits || '—'}</p>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Kỹ năng</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {detail.skills ? detail.skills.split(';').map((skill, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                {skill.trim()}
                                            </span>
                                        )) : '—'}
                                    </div>
                                </div>
                            </div>

                            {/* Thời gian làm việc */}
                            {(detail.workingHours || detail.workingDays) && (
                                <div className="rounded-lg border p-4">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Thời gian làm việc</h4>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        {detail.workingHours && (
                                            <div>
                                                <span className="text-gray-500">Giờ làm việc:</span>
                                                <span className="font-medium ml-2">{detail.workingHours}</span>
                                            </div>
                                        )}
                                        {detail.workingDays && (
                                            <div>
                                                <span className="text-gray-500">Ngày làm việc:</span>
                                                <span className="font-medium ml-2">{formatWorkingDaysForDisplay(detail.workingDays)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Lý do từ chối nếu có */}
                            {detail.rejectionReason && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                    <h4 className="text-sm font-semibold text-red-600 uppercase mb-2">Lý do từ chối</h4>
                                    <p className="text-sm text-red-700">{detail.rejectionReason}</p>
                                </div>
                            )}

                            {/* Hành động duyệt/từ chối */}
                            {detail.status === 'PENDING_REVIEW' && (
                                <div className="rounded-lg border p-4">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Thao tác duyệt</h4>
                                    {actionType === 'reject' ? (
                                        <div className="space-y-3">
                                            <textarea
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                placeholder="Nhập lý do từ chối..."
                                                className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
                                                rows={4}
                                            />
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleReject}
                                                    disabled={submitting}
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-red-600 text-sm hover:bg-red-700 ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                >
                                                    <X size={14} /> Xác nhận từ chối
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setActionType(null);
                                                        setRejectReason('');
                                                    }}
                                                    className="px-4 py-2 rounded-lg border text-gray-700 text-sm hover:bg-gray-50"
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleApprove}
                                                disabled={submitting}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-blue-600 text-sm hover:opacity-90 ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            >
                                                <Check size={14} /> Duyệt công việc
                                            </button>
                                            <button
                                                onClick={() => setActionType('reject')}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-red-600 text-sm hover:bg-red-700"
                                            >
                                                <X size={14} /> Từ chối
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

