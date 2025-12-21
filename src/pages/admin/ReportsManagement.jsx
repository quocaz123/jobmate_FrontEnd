import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Filter, RefreshCw, ShieldCheck, User, X } from "lucide-react";
import { getAllReports, reviewReport } from "../../services/reportService";
import { showError, showSuccess } from "../../utils/toast";
import JobListDetail from "../user/JobListDetail";

const PAGE_SIZE = 10;

const statusStyles = {
    PENDING: {
        text: "Chưa duyệt",
        className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
        icon: Clock,
    },
    REJECTED: {
        text: "Đã từ chối",
        className: "bg-red-50 text-red-700 border border-red-200",
        icon: AlertCircle,
    },
    REVIEWED: {
        text: "Đã duyệt",
        className: "bg-green-50 text-green-700 border border-green-200",
        icon: CheckCircle2,
    },
};

const ReportsManagement = () => {
    const [reports, setReports] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [showJobDetail, setShowJobDetail] = useState(false);
    const [detailJobId, setDetailJobId] = useState(null);
    const [detailReportReason, setDetailReportReason] = useState(null);
    const [rejectModal, setRejectModal] = useState({
        open: false,
        report: null,
        note: "",
    });

    const handleCloseDetail = () => {
        setShowJobDetail(false);
        setDetailJobId(null);
        setDetailReportReason(null);
    };

    const filteredReports = useMemo(() => {
        if (filterStatus === "ALL") return reports;
        return reports.filter((report) => report.status === filterStatus);
    }, [reports, filterStatus]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await getAllReports(page, PAGE_SIZE);
            const payload = response?.data?.data ?? response?.data ?? {};
            setReports(payload.data || []);
            setTotalPages(payload.totalPages || 0);
            setTotalElements(payload.totalElements || 0);
        } catch (error) {
            console.error("Failed to fetch reports", error);
            showError("Không thể tải danh sách báo cáo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const openRejectModal = (report) => {
        setRejectModal({
            open: true,
            report,
            note: "",
        });
    };

    const closeRejectModal = () => {
        setRejectModal({
            open: false,
            report: null,
            note: "",
        });
    };

    const handleReview = async (report, accept, noteOverride = "") => {
        const actionLabel = accept ? "chấp nhận" : "từ chối";
        const targetLabel = accept
            ? report.jobTitle || `${report.targetType}`
            : `${report.targetType} (${report.targetId})`;
        const confirmMessage = `Bạn có chắc muốn ${actionLabel} báo cáo này?\n- Lý do: ${report.reason}\n- Đối tượng: ${targetLabel}`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        const note = noteOverride ?? "";
        if (!accept && !note.trim()) {
            showError("Vui lòng nhập lý do từ chối");
            return;
        }

        try {
            setLoading(true);
            await reviewReport(report.id, accept, note);
            showSuccess(`Đã ${actionLabel} báo cáo`);
            if (!accept) {
                closeRejectModal();
            }
            fetchReports();
        } catch (error) {
            console.error("Failed to review report", error);
            showError("Không thể cập nhật trạng thái báo cáo");
        } finally {
            setLoading(false);
        }
    };

    const renderReviewedInfo = (report) => {
        if (report.status !== "REVIEWED") {
            return <span className="text-gray-500 text-sm">Chờ xử lý</span>;
        }

        if (!report.reviewedBy) {
            return (
                <div className="text-sm text-blue-600 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Đã duyệt bởi hệ thống
                </div>
            );
        }

        return (
            <div className="text-sm text-emerald-600 space-y-1">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {report.reviewedBy} {report.reviewedByEmail && `(${report.reviewedByEmail})`}
                </div>
                {report.reviewedAt && (
                    <p className="text-xs text-gray-500">
                        {new Date(report.reviewedAt).toLocaleString("vi-VN")}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">Quản lý báo cáo</h2>
                    <p className="text-gray-500 text-sm">
                        Tổng cộng {totalElements} báo cáo cần theo dõi và phê duyệt
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setFilterStatus("ALL")}
                        className={`px-4 py-2 rounded-full text-sm border ${filterStatus === "ALL"
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-200"
                            }`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => setFilterStatus("PENDING")}
                        className={`px-4 py-2 rounded-full text-sm border flex items-center gap-2 ${filterStatus === "PENDING"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-white text-gray-600 border-gray-200"
                            }`}
                    >
                        <Clock className="h-4 w-4" />
                        Chưa duyệt
                    </button>
                    <button
                        onClick={() => setFilterStatus("REJECTED")}
                        className={`px-4 py-2 rounded-full text-sm border flex items-center gap-2 ${filterStatus === "REJECTED"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-white text-gray-600 border-gray-200"
                            }`}
                    >
                        <AlertCircle className="h-4 w-4" />
                        Đã từ chối
                    </button>
                    <button
                        onClick={() => setFilterStatus("REVIEWED")}
                        className={`px-4 py-2 rounded-full text-sm border flex items-center gap-2 ${filterStatus === "REVIEWED"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-white text-gray-600 border-gray-200"
                            }`}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Đã duyệt
                    </button>
                    <button
                        onClick={fetchReports}
                        className="px-4 py-2 rounded-full text-sm border border-gray-200 bg-white text-gray-700 flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Filter className="h-4 w-4" />
                        Hiển thị {filteredReports.length} báo cáo trang hiện tại
                    </div>
                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-indigo-600">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Đang tải dữ liệu...
                        </div>
                    )}
                </div>

                <div className="divide-y divide-gray-100">
                    {filteredReports.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                            Không tìm thấy báo cáo phù hợp
                        </div>
                    )}

                    {filteredReports.map((report) => {
                        const fallbackKeyParts = [
                            report.targetType ?? "UNKNOWN",
                            report.targetId ?? "NA",
                            report.createdAt ?? "NO_TIME",
                        ];
                        const reportKey = report?.id ?? fallbackKeyParts.join("-");
                        const canOverride = report.status === "PENDING" || (report.status === "REVIEWED" && !report.reviewedBy);
                        const statusMeta = statusStyles[report.status] || statusStyles.PENDING;
                        const StatusIcon = statusMeta.icon;

                        return (
                            <div key={reportKey} className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${statusMeta.className}`}>
                                            <StatusIcon className="h-4 w-4" />
                                            {statusMeta.text}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Gửi lúc {new Date(report.createdAt).toLocaleString("vi-VN")}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Người báo cáo</p>
                                        <p className="font-semibold">
                                            {report.reporterFullName} &middot; {report.reporterEmail}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-500">Đối tượng</p>
                                            <p className="font-medium">
                                                {report.targetType} &middot;{" "}
                                                <span className="text-gray-500 font-normal">{report.targetId}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Lý do</p>
                                            <p className="font-medium text-gray-900">{report.reason}</p>
                                        </div>
                                    </div>

                                    {(report.jobTitle || report.jobOwnerFullName) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            {report.jobTitle && (
                                                <div>
                                                    <p className="text-gray-500">Tên công việc</p>
                                                    <p className="font-semibold text-gray-900">{report.jobTitle}</p>
                                                </div>
                                            )}
                                            {report.jobOwnerFullName && (
                                                <div>
                                                    <p className="text-gray-500">Nhà tuyển dụng</p>
                                                    <p className="font-medium text-gray-900">
                                                        {report.jobOwnerFullName} &middot;{" "}
                                                        <span className="text-gray-500 font-normal">{report.jobOwnerEmail}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">Thông tin duyệt</p>
                                        {renderReviewedInfo(report)}
                                        {report.adminNote && (
                                            <p className="text-xs text-gray-500 mt-2">Ghi chú: {report.adminNote}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 w-full md:w-60">
                                    <button
                                        onClick={() => {
                                            setDetailJobId(report.targetId);
                                            setDetailReportReason(report.reason);
                                            setShowJobDetail(true);
                                        }}
                                        className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        Xem chi tiết công việc
                                    </button>

                                    {canOverride && (
                                        <>
                                            <button
                                                onClick={() => handleReview(report, true)}
                                                className="px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition"
                                            >
                                                Chấp nhận báo cáo
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(report)}
                                                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
                                            >
                                                Từ chối báo cáo
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-sm text-gray-500">
                        <span>
                            Trang {page + 1} / {totalPages}
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <button
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showJobDetail && detailJobId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
                        <button
                            onClick={handleCloseDetail}
                            className="absolute top-4 right-4 h-9 w-9 rounded-full border flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <JobListDetail
                            id={detailJobId}
                            variant="modal"
                            onBack={handleCloseDetail}
                            reportReason={detailReportReason}
                        />
                    </div>
                </div>
            )}

            {rejectModal.open && rejectModal.report && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
                        <button
                            onClick={closeRejectModal}
                            className="absolute top-4 right-4 h-9 w-9 rounded-full border flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <h3 className="text-xl font-semibold mb-4">Lý do từ chối báo cáo</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Vui lòng ghi rõ lý do từ chối báo cáo <span className="font-medium">{rejectModal.report.reason}</span>
                        </p>
                        <textarea
                            value={rejectModal.note}
                            onChange={(e) => setRejectModal((prev) => ({ ...prev, note: e.target.value }))}
                            rows={5}
                            className="w-full border rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-200"
                            placeholder="Nhập lý do..."
                        />
                        <div className="flex items-center justify-end gap-3 mt-4">
                            <button
                                onClick={closeRejectModal}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleReview(rejectModal.report, false, rejectModal.note)}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                            >
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsManagement;

