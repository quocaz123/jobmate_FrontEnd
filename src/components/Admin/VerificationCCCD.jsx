import React, { useEffect, useMemo, useState } from 'react';
import { Search, Eye, Calendar, Check, X } from 'lucide-react';
import { getPendingVerifications, getVerificationDetail, approveVerification, rejectVerification } from '../../services/verificationService';
import { showError, showSuccess, showWarning } from '../../utils/toast';
const PAGE_SIZE = 10;

export default function VerificationCCCD() {
    const [tab, setTab] = useState('PENDING'); // PENDING | VERIFIED | REJECTED
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [detail, setDetail] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [actionType, setActionType] = useState(null); // 'approve' | 'reject' | null
    const [rejectReason, setRejectReason] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getPendingVerifications(Math.max(page - 1, 0), PAGE_SIZE, tab);
                const payload = res?.data?.data || {};
                const list = Array.isArray(payload?.data) ? payload.data : [];
                const mapped = list.map((u) => ({
                    userId: u.userId,
                    avatarUrl: u.avatarUrl,
                    fullName: u.fullName || 'Chưa cập nhật',
                    email: u.email || '',
                    requestedAt: u.requestedAt || null,
                    verificationStatus: u.verificationStatus || 'PENDING',
                }));
                setRows(mapped);
                setTotalPages(payload.totalPages || 1);
                setTotalElements(payload.totalElements || mapped.length);
            } catch (err) {
                setError(err?.response?.data?.message || 'Không tải được danh sách chờ duyệt');
                setRows([]);
            } finally {
                setLoading(false);
            }
        };
        fetchList();
    }, [tab, page, refreshKey]);

    useEffect(() => {
        setPage(1);
    }, [tab]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
    }, [rows, search]);

    const start = totalElements === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const end = totalElements === 0 ? 0 : Math.min(page * PAGE_SIZE, totalElements);

    const openDetail = async (userId) => {
        try {
            const res = await getVerificationDetail(userId);
            setDetail(res?.data?.data || res?.data);
            setShowDetail(true);
            setActionType(null);
            setRejectReason('');
        } catch (err) {
            showError(err?.response?.data?.message || 'Không tải được chi tiết xác minh');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8">
                <h1 className="text-4xl font-extrabold tracking-tight">Danh sách xác minh</h1>
                <p className="text-gray-500 mt-2">Kiểm duyệt CCCD với hỗ trợ</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setTab('PENDING')}
                        className={`px-4 py-2 rounded-full ${tab === 'PENDING' ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Chờ duyệt
                    </button>
                    <button
                        onClick={() => setTab('VERIFIED')}
                        className={`px-4 py-2 rounded-full ${tab === 'VERIFIED' ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Đã duyệt
                    </button>
                    <button
                        onClick={() => setTab('REJECTED')}
                        className={`px-4 py-2 rounded-full ${tab === 'REJECTED' ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Từ chối
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {tab === 'PENDING' ? 'Danh sách chờ duyệt' : tab === 'VERIFIED' ? 'Danh sách đã duyệt' : 'Danh sách bị từ chối'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Hiển thị {start}-{end} trên {totalElements}
                        </p>
                    </div>
                    <div className="w-80">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={16} /></span>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm kiếm theo tên, email..."
                                className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                <div className="divide-y">
                    {loading && <div className="px-6 py-10 text-center text-gray-500">Đang tải...</div>}
                    {error && !loading && <div className="px-6 py-10 text-center text-red-500">{error}</div>}
                    {!loading && !error && filtered.length === 0 && (
                        <div className="px-6 py-10 text-center text-gray-500">Không có yêu cầu chờ duyệt</div>
                    )}
                    {!loading && !error && filtered.map((r) => (
                        <div key={r.userId} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                {r.avatarUrl ? (
                                    <img src={r.avatarUrl} alt={r.fullName} className="h-12 w-12 rounded-full object-cover border" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-100 border flex items-center justify-center text-gray-600 font-semibold">
                                        {(r.fullName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">{r.fullName}</p>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Chờ duyệt</span>
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center gap-3">
                                        <span>{r.email}</span>
                                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar size={12} /> {r.requestedAt ? new Date(r.requestedAt).toLocaleDateString('vi-VN') : '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openDetail(r.userId)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-gray-700 text-xs hover:bg-gray-50"
                                >
                                    <Eye size={14} /> Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t">
                    <p className="text-sm text-gray-500">Hiển thị {start}-{end} trên {totalElements}</p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className={`h-9 w-9 rounded border ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>‹</button>
                        <span className="text-sm text-gray-600">Trang {page} / {Math.max(1, totalPages)}</span>
                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className={`h-9 w-9 rounded border ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>›</button>
                    </div>
                </div>
            </div>

            {showDetail && detail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold">Chi tiết xác minh danh tính</h3>
                                <p className="text-xs text-gray-500">Kiểm tra thông tin và hình ảnh CCCD</p>
                            </div>
                            <button onClick={() => setShowDetail(false)} className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50">Đóng</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-4">
                                {detail.avatarUrl ? (
                                    <img src={detail.avatarUrl} alt={detail.fullName} className="h-16 w-16 rounded-full object-cover border" />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-gray-100 border flex items-center justify-center text-gray-600 font-semibold">
                                        {(detail.fullName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xl font-semibold">{detail.fullName || '—'}</p>
                                        {detail.verificationStatus && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${detail.verificationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {detail.verificationStatus === 'PENDING' ? 'Chờ duyệt' : detail.verificationStatus}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{detail.email || '—'}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="rounded-lg border p-4">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase">Thông tin</h4>
                                    <div className="mt-2 text-sm text-gray-700 space-y-1">
                                        <p><span className="text-gray-500">Địa chỉ:</span> {detail.address || '—'}</p>
                                        <p><span className="text-gray-500">SĐT:</span> {detail.contactPhone || '—'}</p>
                                        <p><span className="text-gray-500">Yêu cầu lúc:</span> {detail.requestedAt ? new Date(detail.requestedAt).toLocaleString('vi-VN') : '—'}</p>
                                        {detail.rejectionReason && (
                                            <p className="text-red-600">
                                                <span className="text-gray-500">Lý do từ chối:</span> {detail.rejectionReason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase">Ảnh CCCD</h4>
                                    <div className="mt-2 grid grid-cols-2 gap-3">
                                        {detail.cccdFrontUrl ? (
                                            <img
                                                src={detail.cccdFrontUrl}
                                                alt="CCCD mặt trước"
                                                className="rounded border cursor-zoom-in"
                                                onClick={() => setPreviewUrl(detail.cccdFrontUrl)}
                                            />
                                        ) : (
                                            <div className="text-xs text-gray-500">Không có ảnh mặt trước</div>
                                        )}
                                        {detail.cccdBackUrl ? (
                                            <img
                                                src={detail.cccdBackUrl}
                                                alt="CCCD mặt sau"
                                                className="rounded border cursor-zoom-in"
                                                onClick={() => setPreviewUrl(detail.cccdBackUrl)}
                                            />
                                        ) : (
                                            <div className="text-xs text-gray-500">Không có ảnh mặt sau</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Ghi chú và hành động */}
                            <div className="rounded-lg border p-4">
                                <h4 className="text-sm font-semibold text-gray-600 uppercase">Ghi chú của admin</h4>
                                {actionType === 'reject' ? (
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Nhập lý do từ chối..."
                                        className="mt-3 w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
                                        rows={4}
                                    />
                                ) : (
                                    <p className="mt-3 text-sm text-gray-500">Ghi chú chỉ yêu cầu khi bạn Từ chối.</p>
                                )}

                                {/* Chỉ hiển thị hành động khi trạng thái còn PENDING hoặc đang ở tab PENDING */}
                                {(detail.verificationStatus === 'PENDING' || tab === 'PENDING') && (
                                    <div className="mt-4 flex items-center gap-2">
                                        <button
                                            onClick={async () => {
                                                if (actionType !== 'reject') {
                                                    setActionType('reject');
                                                    return;
                                                }
                                                if (!detail?.userId) return;
                                                if (!rejectReason.trim()) {
                                                    showWarning('Vui lòng nhập lý do từ chối.');
                                                    return;
                                                }
                                                try {
                                                    setSubmitting(true);
                                                    await rejectVerification(detail.userId, rejectReason.trim());
                                                    showSuccess('Đã từ chối xác minh thành công');
                                                    setShowDetail(false);
                                                    setRefreshKey((k) => k + 1);
                                                } catch (err) {
                                                    showError(err?.response?.data?.message || 'Từ chối thất bại');
                                                } finally {
                                                    setSubmitting(false);
                                                }
                                            }}
                                            disabled={submitting}
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white bg-red-600 text-sm hover:bg-red-700 ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            <X size={14} /> {actionType === 'reject' ? 'Xác nhận từ chối' : 'Từ chối'}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!detail?.userId) return;
                                                try {
                                                    setSubmitting(true);
                                                    await approveVerification(detail.userId);
                                                    showSuccess('Đã xác minh thành công');
                                                    setShowDetail(false);
                                                    setRefreshKey((k) => k + 1);
                                                } catch (err) {
                                                    showError(err?.response?.data?.message || 'Xác minh thất bại');
                                                } finally {
                                                    setSubmitting(false);
                                                }
                                            }}
                                            disabled={submitting}
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-blue-600 text-sm hover:opacity-90 ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            <Check size={14} /> Xác minh
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox preview */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setPreviewUrl(null)}
                >
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-[95vh] max-w-[95vw] rounded-lg shadow-2xl object-contain cursor-zoom-out"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setPreviewUrl(null)}
                        className="absolute top-4 right-4 rounded-full bg-white/90 text-gray-800 px-3 py-1 text-sm shadow hover:bg-white"
                    >
                        Đóng
                    </button>
                </div>
            )}
        </div>
    );
}


