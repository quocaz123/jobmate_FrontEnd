import React, { useEffect, useState } from "react";
import {
    ArrowRight,
    Award,
    BookOpen,
    Briefcase,
    Calendar,
    CheckCircle,
    DollarSign,
    Eye,
    Lightbulb,
    MessageSquare,
    TrendingUp,
    Zap,
} from "lucide-react";
import { getMyInvitations, acceptInvitation, rejectInvitation } from "../../services/invitationService";
import { getRecommendedJobsByProfile } from "../../services/recommendService";
import { getUserInfo } from "../../services/userService";
import { showError, showSuccess } from "../../utils/toast";
import { SALARY_UNIT_LABELS } from "../../constants/salaryUnits";
import { formatWorkingDaysForDisplay } from "../../utils/scheduleUtils";
import JobListDetail from "./JobListDetail";

const onboardingSteps = [
    {
        id: 1,
        title: "Hoàn thiện hồ sơ",
        description: "Thêm ảnh, kỹ năng, kinh nghiệm",
        icon: Award,
        completed: true,
        link: "/student/profile",
    },
    {
        id: 2,
        title: "Tìm công việc",
        description: "Khám phá hàng trăm cơ hội việc làm",
        icon: Briefcase,
        completed: false,
        link: "/student/jobs",
    },
    {
        id: 3,
        title: "Ứng tuyển",
        description: "Gửi CV và thư xin việc",
        icon: MessageSquare,
        completed: false,
        link: "/student/jobs",
    },
    {
        id: 4,
        title: "Chờ phản hồi",
        description: "Theo dõi trạng thái ứng tuyển",
        icon: TrendingUp,
        completed: false,
        link: "/student/applications",
    },
];


const applications = [
    {
        id: 1,
        company: "Tech Startup ABC",
        position: "Frontend Developer Intern",
        status: "pending",
        appliedDate: "2024-01-15",
        salary: "8-12 triệu/tháng",
    },
    {
        id: 2,
        company: "Marketing Agency XYZ",
        position: "Content Creator",
        status: "interview",
        appliedDate: "2024-01-10",
        salary: "6-8 triệu/tháng",
    },
    {
        id: 3,
        company: "E-commerce Platform",
        position: "Customer Service",
        status: "accepted",
        appliedDate: "2024-01-05",
        salary: "5-7 triệu/tháng",
    },
];

const getStatusStyles = (status) => {
    switch (status) {
        case "pending":
            return "bg-yellow-100 text-yellow-800";
        case "interview":
            return "bg-blue-100 text-blue-800";
        case "accepted":
            return "bg-green-100 text-green-800";
        case "rejected":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

const getStatusText = (status) => {
    switch (status) {
        case "pending":
            return "Đang chờ";
        case "interview":
            return "Phỏng vấn";
        case "accepted":
            return "Được nhận";
        case "rejected":
            return "Từ chối";
        default:
            return status;
    }
};

export default function Dashboard({ onTabChange }) {
    const isNewUser = true; // TODO: cập nhật theo dữ liệu thật

    const [invitations, setInvitations] = useState([]);
    const [loadingInvitations, setLoadingInvitations] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [loadingRecommendedJobs, setLoadingRecommendedJobs] = useState(false);
    const [hasProfileInfo, setHasProfileInfo] = useState(false);
    const [detailJobId, setDetailJobId] = useState(null);
    const [showJobDetail, setShowJobDetail] = useState(false);

    useEffect(() => {
        const fetchInvitations = async () => {
            setLoadingInvitations(true);
            try {
                const response = await getMyInvitations();
                setInvitations(response?.data?.data || []);
            } catch (error) {
                const message = error?.response?.data?.message || "Không thể tải lời mời";
                showError(message);
            } finally {
                setLoadingInvitations(false);
            }
        };

        fetchInvitations();
    }, []);

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const res = await getUserInfo();
                const profile = res?.data?.data || res?.data || {};

                // Kiểm tra xem user đã cập nhật thông tin việc làm chưa
                const hasJobInfo = Boolean(
                    profile.preferredJobType ||
                    profile.availableDays ||
                    profile.availableTime ||
                    profile.preferredMinSalary
                );
                setHasProfileInfo(hasJobInfo);

                // Nếu đã cập nhật, load recommended jobs
                if (hasJobInfo) {
                    await loadRecommendedJobs();
                }
            } catch (err) {
                console.error("Lỗi khi tải thông tin người dùng:", err);
            }
        };

        loadUserProfile();
    }, []);

    const loadRecommendedJobs = async () => {
        setLoadingRecommendedJobs(true);
        try {
            const res = await getRecommendedJobsByProfile();
            const payload = res?.data?.data;
            const nested = payload?.data;

            console.log("Recommended jobs response:", payload);

            // Xử lý dữ liệu nested (mảng các mảng)
            let jobs = [];
            if (Array.isArray(nested)) {
                jobs = nested.flatMap((item) =>
                    Array.isArray(item) ? item.filter(Boolean) : [item]
                );
            }
            setRecommendedJobs(jobs);
        } catch (err) {
            console.error("Lỗi khi tải gợi ý công việc:", err);
            setRecommendedJobs([]);
        } finally {
            setLoadingRecommendedJobs(false);
        }
    };

    const formatDateTime = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
    };

    const getInvitationStatusStyle = (status) => {
        switch (status) {
            case "ACCEPTED":
                return "bg-green-100 text-green-700";
            case "REJECTED":
                return "bg-red-100 text-red-700";
            case "EXPIRED":
                return "bg-gray-100 text-gray-600";
            case "PENDING":
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    const getInvitationStatusText = (status) => {
        switch (status) {
            case "ACCEPTED":
                return "Đã chấp nhận";
            case "REJECTED":
                return "Đã từ chối";
            case "EXPIRED":
                return "Đã hết hạn";
            case "PENDING":
            default:
                return "Chờ phản hồi";
        }
    };

    const formatJobSalary = (salary, unit) => {
        if (!salary) return "Thỏa thuận";
        const formatted = new Intl.NumberFormat("vi-VN").format(salary) + "đ";
        const unitLabel = unit ? (SALARY_UNIT_LABELS[unit] || unit) : "";
        return unitLabel ? `${formatted} · ${unitLabel}` : formatted;
    };


    const handleViewJobDetail = (jobId) => {
        if (!jobId) return;
        setDetailJobId(jobId);
        setShowJobDetail(true);
    };

    const handleInvitationAction = async (invitationId, action) => {
        const actionKey = `${invitationId}-${action}`;
        setActionLoading(actionKey);
        try {
            const apiCall = action === "accept" ? acceptInvitation : rejectInvitation;
            const response = await apiCall(invitationId);
            const updatedInvitation = response?.data?.data;

            setInvitations((prev) =>
                prev.map((inv) =>
                    inv.id === invitationId
                        ? {
                            ...inv,
                            status: updatedInvitation?.status || (action === "accept" ? "ACCEPTED" : "REJECTED"),
                        }
                        : inv
                )
            );

            showSuccess(action === "accept" ? "Đã chấp nhận lời mời" : "Đã từ chối lời mời");
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể xử lý lời mời";
            showError(message);
        } finally {
            setActionLoading(null);
        }
    };

    const renderInvitationsSection = () => {
        const pendingCount = invitations.filter((inv) => inv.status === "PENDING").length;

        return (
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">Lời mời làm việc</h3>
                        <p className="text-sm text-gray-500">Theo dõi lời mời từ nhà tuyển dụng và phản hồi nhanh chóng</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-700">
                        {pendingCount} lời mời đang chờ
                    </span>
                </div>

                {loadingInvitations ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : invitations.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p className="font-semibold">Bạn chưa có lời mời nào</p>
                        <p className="text-sm mt-1">Tiếp tục cập nhật hồ sơ và ứng tuyển để thu hút nhà tuyển dụng</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {invitations.map((invitation) => {
                            const isPending = invitation.status === "PENDING";
                            const isExpired = invitation.status === "EXPIRED";
                            const acceptKey = `${invitation.id}-accept`;
                            const rejectKey = `${invitation.id}-reject`;

                            return (
                                <div
                                    key={invitation.id}
                                    className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 transition hover:border-indigo-200 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                            <Briefcase className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{invitation.message}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Công việc: <span className="font-medium text-gray-700">{invitation.title}</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDateTime(invitation.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getInvitationStatusStyle(invitation.status)}`}>
                                            {getInvitationStatusText(invitation.status)}
                                        </span>
                                        {isPending ? (
                                            <div className="flex gap-2">
                                                <button
                                                    className="px-4 py-2 rounded-full border text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                                    onClick={() => handleInvitationAction(invitation.id, "reject")}
                                                    disabled={actionLoading === rejectKey}
                                                >
                                                    {actionLoading === rejectKey ? "Đang xử lý..." : "Từ chối"}
                                                </button>
                                                <button
                                                    className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-medium hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50"
                                                    onClick={() => handleInvitationAction(invitation.id, "accept")}
                                                    disabled={actionLoading === acceptKey}
                                                >
                                                    {actionLoading === acceptKey ? "Đang xử lý..." : "Chấp nhận"}
                                                </button>
                                            </div>
                                        ) : isExpired ? (
                                            <span className="text-xs text-gray-500">Lời mời đã hết hạn</span>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    if (isNewUser) {
        return (
            <>
                <div className="p-6 space-y-8">
                    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-8 text-white">
                        <div className="max-w-2xl space-y-6">
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-indigo-100">Xin chào</p>
                                <h1 className="text-4xl font-bold mb-2">Chào mừng bạn!</h1>
                                <p className="text-indigo-100 text-lg">Bắt đầu hành trình tìm việc part-time của bạn trong 4 bước đơn giản</p>
                            </div>
                            <button
                                onClick={() => onTabChange && onTabChange('profile')}
                                className="bg-white text-indigo-600 px-6 py-3 rounded-full flex items-center gap-2 font-medium hover:bg-indigo-50 transition"
                            >
                                Bắt đầu ngay <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">Lộ trình của bạn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {onboardingSteps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.id} className="space-y-3">
                                        <div
                                            className={`bg-white rounded-xl border p-5 transition hover:shadow-lg cursor-pointer ${step.completed ? "bg-green-50 border-green-200" : ""
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={`p-3 rounded-lg ${step.completed ? "bg-green-100" : "bg-indigo-100"}`}>
                                                    <Icon className={`${step.completed ? "text-green-600" : "text-indigo-600"} h-6 w-6`} />
                                                </div>
                                                {step.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                                            </div>
                                            <h3 className="font-semibold text-sm">{step.title}</h3>
                                            <p className="text-xs text-gray-500 mb-4">{step.description}</p>
                                            <button
                                                onClick={() => {
                                                    if (step.id === 1 && onTabChange) onTabChange('profile');
                                                    else if (step.id === 2 && onTabChange) onTabChange('find-jobs');
                                                    else if (step.id === 3 && onTabChange) onTabChange('find-jobs');
                                                    else if (step.id === 4 && onTabChange) onTabChange('applications');
                                                }}
                                                className="w-full border rounded-full py-2 text-xs font-medium hover:bg-gray-50"
                                            >
                                                {step.completed ? "Xong" : "Bắt đầu"}
                                            </button>
                                        </div>
                                        {index < onboardingSteps.length - 1 && (
                                            <div className="hidden md:flex justify-center">
                                                <ArrowRight className="h-4 w-4 text-gray-300 rotate-90" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {renderInvitationsSection()}

                    <div>
                        <h2 className="text-2xl font-bold mb-4">Công việc gợi ý cho bạn</h2>
                        {!hasProfileInfo ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                                <Lightbulb className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Cập nhật thông tin việc làm để nhận gợi ý phù hợp</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Hãy cập nhật loại công việc mong muốn, ngày làm việc, thời gian và mức lương trong hồ sơ của bạn để chúng tôi có thể gợi ý những công việc phù hợp nhất.
                                </p>
                                <button
                                    onClick={() => onTabChange && onTabChange('profile')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 text-sm font-medium"
                                >
                                    Cập nhật hồ sơ ngay
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        ) : loadingRecommendedJobs ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="bg-white rounded-xl p-5 shadow-sm h-64 animate-pulse" />
                                ))}
                            </div>
                        ) : recommendedJobs.length === 0 ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">Chưa có công việc gợi ý phù hợp. Hãy thử cập nhật thêm thông tin trong hồ sơ.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {recommendedJobs.slice(0, 6).map((job) => (
                                    <div key={job.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <Briefcase className="h-6 w-6 text-indigo-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">{job.companyName || "—"}</p>
                                                {job.score && (
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="h-3 w-3 text-yellow-500" />
                                                        <span className="text-xs font-semibold text-yellow-600">{Math.round(job.score)}% phù hợp</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
                                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                <span>{formatJobSalary(job.salary, job.salaryUnit)}</span>
                                            </div>
                                            {job.distance && (
                                                <div className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    <span>Cách {job.distance.toFixed(1)} km</span>
                                                </div>
                                            )}
                                            {job.scheduleDays && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatWorkingDaysForDisplay(job.scheduleDays)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleViewJobDetail(job.id)}
                                            className="w-full py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 text-sm font-medium"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">Mẹo để thành công</h3>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                                Hoàn thiện hồ sơ tăng 80% cơ hội được nhận
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                                Ứng tuyển sớm trong ngày để tăng cơ hội phỏng vấn
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                                Chuẩn bị kỹ trước mỗi cuộc phỏng vấn
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Modal chi tiết công việc */}
                {showJobDetail && detailJobId && (
                    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => {
                        setShowJobDetail(false);
                        setDetailJobId(null);
                    }}>
                        <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <JobListDetail
                                id={detailJobId}
                                variant="modal"
                                onBack={() => {
                                    setShowJobDetail(false);
                                    setDetailJobId(null);
                                }}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <div className="p-6 space-y-8">
                {renderInvitationsSection()}

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Ứng tuyển gần đây</h3>
                            <p className="text-sm text-gray-500">Theo dõi trạng thái các đơn ứng tuyển của bạn</p>
                        </div>
                        <button
                            onClick={() => onTabChange && onTabChange('applications')}
                            className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                        >
                            Xem tất cả
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-600">
                                        {app.company.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{app.position}</h4>
                                        <p className="text-sm text-gray-500">{app.company}</p>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                {app.salary}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {app.appliedDate}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(app.status)}`}>
                                        {getStatusText(app.status)}
                                    </span>
                                    <button
                                        onClick={() => onTabChange && onTabChange('applications')}
                                        className="h-9 w-9 rounded-full border flex items-center justify-center text-gray-500 hover:text-indigo-600"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Hoàn thiện hồ sơ</h3>
                        <p className="text-sm text-gray-500 mb-4">Hồ sơ hoàn thiện giúp bạn có cơ hội được tuyển dụng cao hơn</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Tiến độ hoàn thiện</span>
                                <span className="text-sm font-medium">85%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-600" style={{ width: "85%" }} />
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-green-600">
                                    <Award className="h-4 w-4" />
                                    <span>Thông tin cá nhân đã hoàn thiện</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-600">
                                    <Award className="h-4 w-4" />
                                    <span>Kỹ năng đã cập nhật</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Cần thêm chứng chỉ và dự án</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Công việc gợi ý</h3>
                        {!hasProfileInfo ? (
                            <div className="text-center py-6">
                                <p className="text-sm text-gray-500 mb-3">Cập nhật thông tin việc làm để nhận gợi ý</p>
                                <button
                                    onClick={() => onTabChange && onTabChange('profile')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                                >
                                    Cập nhật hồ sơ
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        ) : loadingRecommendedJobs ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
                                ))}
                            </div>
                        ) : recommendedJobs.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                <p className="text-sm">Chưa có công việc gợi ý phù hợp</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recommendedJobs.slice(0, 5).map((job) => (
                                    <div key={job.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <Briefcase className="h-6 w-6 text-indigo-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{job.title}</h4>
                                                <p className="text-sm text-gray-500">{job.companyName || "—"}</p>
                                                <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    {formatJobSalary(job.salary, job.salaryUnit)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleViewJobDetail(job.id)}
                                            className="text-sm text-indigo-600 hover:underline"
                                        >
                                            Xem
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal chi tiết công việc */}
                {showJobDetail && detailJobId && (
                    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => {
                        setShowJobDetail(false);
                        setDetailJobId(null);
                    }}>
                        <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <JobListDetail
                                id={detailJobId}
                                variant="modal"
                                onBack={() => {
                                    setShowJobDetail(false);
                                    setDetailJobId(null);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

