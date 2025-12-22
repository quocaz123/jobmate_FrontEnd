import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, MapPin, DollarSign, Clock, Calendar, Sparkles, Send, ChevronDown, Eye, X, Star, Zap, List } from "lucide-react";
import { getAllWaitingLists } from "../../services/waitingListService";
import { get_my_Jobs } from "../../services/jobService";
import { getRecommendedUsers } from "../../services/recommendService";
import { sendInvitation } from "../../services/invitationService";
import { getUserDetail } from "../../services/userService";
import { getRatings } from "../../services/ratingService";
import ReviewsModal from "../../components/Employer/ReviewsModal";
import { SALARY_UNIT_LABELS } from "../../constants/salaryUnits";
import { showError, showSuccess } from "../../utils/toast";
import { formatWorkingDaysForDisplay } from "../../utils/scheduleUtils";

const PAGE_SIZE = 6;

const JOB_TYPE_LABELS = {
    FULL_TIME: "Toàn thời gian",
    PART_TIME: "Bán thời gian",
    FREELANCE: "Freelance",
    INTERNSHIP: "Thực tập",
};

const formatSalary = (amount, unit) => {
    if (!amount) return "Thỏa thuận";
    const formatted = Number(amount).toLocaleString("vi-VN");
    const label = unit ? SALARY_UNIT_LABELS[unit] || unit : "VND";
    return `${formatted}đ • ${label}`;
};

const parseSkills = (skills) =>
    skills
        ? skills
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

const JobSelect = ({ jobs, value, onChange, placeholder = "Chọn tin tuyển dụng", disabled = false }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    useEffect(() => {
        if (disabled && open) setOpen(false);
    }, [disabled, open]);

    const selectedJob = jobs.find((job) => job.id === value);
    const label = selectedJob
        ? `${selectedJob.title || "Tin tuyển dụng"} • ${selectedJob.location || "Không rõ"}`
        : placeholder;

    return (
        <div ref={ref} className={`relative ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
            <button
                type="button"
                onClick={() => !disabled && setOpen((prev) => !prev)}
                className="w-full border rounded-xl px-3 py-2 text-sm bg-white flex items-center justify-between gap-2"
            >
                <span className="truncate text-left">{label}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && !disabled && (
                <div className="absolute z-40 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-auto">
                    {jobs.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Không có tin tuyển dụng.</div>
                    ) : (
                        jobs.map((job) => (
                            <button
                                type="button"
                                key={job.id}
                                onClick={() => {
                                    onChange(job.id);
                                    setOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm ${job.id === value ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"
                                    }`}
                            >
                                <div className="font-medium">{job.title || "Tin tuyển dụng"}</div>
                                <div className="text-xs text-gray-500">{job.location || "Không rõ"}</div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const WaitingListCard = ({ data, onInvite, onViewDetail }) => {
    const skills = parseSkills(data.skills);
    const score = data.score || data.matchScore || null;
    // Ưu tiên fullName từ nhiều nguồn: data.fullName, user.fullName, userInfo.fullName, v.v.
    const fullName = data.fullName

        || `Ứng viên #${(data.userId || "").slice(0, 8)}`;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex flex-wrap justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-800">{fullName}</p>
                        {score !== null && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
                                <Zap size={12} className="text-yellow-600" />
                                <span className="text-xs font-semibold">{Math.round(score)}% phù hợp</span>
                            </div>
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {JOB_TYPE_LABELS[data.jobType] || data.jobType || "Không rõ"} · {formatSalary(data.expectedMinSalary, data.expectedSalaryUnit)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{data.note || "Ứng viên chưa để lại ghi chú."}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-center">
                        {data.status === "PENDING" ? "Đang chờ việc" : data.status}
                    </span>
                    <button
                        onClick={() => onViewDetail && onViewDetail(data.userId)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 transition"
                    >
                        <Eye size={14} /> Xem chi tiết
                    </button>
                    <button
                        onClick={() => onInvite(data)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs hover:bg-indigo-700 transition"
                    >
                        <Send size={14} /> Gửi lời mời
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span>Bán kính tìm việc: {data.searchRadius || 0} km</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span>Thời gian: {data.availableTime || "Linh hoạt"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Ngày làm: {data.availableDays ? formatWorkingDaysForDisplay(data.availableDays) : "Linh hoạt"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Tạo lúc: {new Date(data.createdAt).toLocaleString("vi-VN")}</span>
                </div>
            </div>

            <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Kỹ năng</h4>
                {skills.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa cập nhật kỹ năng.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <span key={skill} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const RecommendationCard = ({ data, onInvite, onViewDetail }) => {
    const skills = parseSkills(data.skills);
    const score = data.score || data.matchScore || null;
    // Ưu tiên fullName từ nhiều nguồn: data.fullName, user.fullName, userInfo.fullName, v.v.
    const fullName = data.fullName
        || data.user?.fullName
        || data.userInfo?.fullName
        || data.userName
        || data.name
        || data.user?.name
        || data.userInfo?.name
        || `#${(data.userId || "").slice(0, 6)}`;

    return (
        <div className="border rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-gray-800">{fullName}</p>
                        {score !== null && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
                                <Zap size={10} className="text-yellow-600" />
                                <span className="text-xs font-semibold">{Math.round(score)}%</span>
                            </div>
                        )}
                    </div>
                    <h4 className="font-semibold text-sm text-gray-800">{JOB_TYPE_LABELS[data.jobType] || data.jobType}</h4>
                    <p className="text-xs text-gray-500 mt-1">{formatSalary(data.expectedMinSalary, data.expectedSalaryUnit)}</p>
                </div>
                <div className="flex flex-col gap-1">
                    <button
                        onClick={() => onViewDetail && onViewDetail(data.userId)}
                        className="px-2 py-1 text-xs rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                    >
                        <Eye size={12} /> Xem
                    </button>
                    <button
                        onClick={() => onInvite(data)}
                        className="px-2 py-1 text-xs rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                        Mời
                    </button>
                </div>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center gap-1">
                    <Clock size={12} /> {data.availableTime || "Linh hoạt"}
                </div>
                <div className="flex items-center gap-1">
                    <Calendar size={12} /> {data.availableDays ? formatWorkingDaysForDisplay(data.availableDays) : "Không rõ"}
                </div>
            </div>
            <div className="flex flex-wrap gap-1">
                {skills.length === 0 ? (
                    <span className="text-xs text-gray-400">Chưa có kỹ năng</span>
                ) : (
                    skills.map((skill) => (
                        <span key={skill} className="text-2xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                            {skill}
                        </span>
                    ))
                )}
            </div>
        </div>
    );
};

const Pagination = ({ page, totalPages, onChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <button
                onClick={() => onChange(Math.max(0, page - 1))}
                className="px-3 py-1 rounded-lg border bg-white text-sm disabled:opacity-50"
                disabled={page === 0}
            >
                Trước
            </button>
            <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => onChange(idx)}
                        className={`w-8 h-8 rounded-lg text-sm ${idx === page ? "bg-indigo-600 text-white" : "bg-white border text-gray-600"
                            }`}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>
            <button
                onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
                className="px-3 py-1 rounded-lg border bg-white text-sm disabled:opacity-50"
                disabled={page >= totalPages - 1}
            >
                Sau
            </button>
        </div>
    );
};

const FindCandidates = () => {
    const [waitingLists, setWaitingLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [jobTypeFilter, setJobTypeFilter] = useState("ALL");

    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState("");
    const [recommended, setRecommended] = useState([]);
    const [loadingRecommended, setLoadingRecommended] = useState(false);

    const [inviteModal, setInviteModal] = useState({ open: false, waitingList: null });
    const [selectedInviteJob, setSelectedInviteJob] = useState("");
    const [inviteMessage, setInviteMessage] = useState("");
    const [sendingInvite, setSendingInvite] = useState(false);

    const [detailModal, setDetailModal] = useState({ open: false, userId: null });
    const [userDetail, setUserDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [reviewsModal, setReviewsModal] = useState({ open: false, reviews: [], applicantName: "" });
    const [loadingReviews, setLoadingReviews] = useState(false);

    const loadWaitingLists = useCallback(async (targetPage = 0) => {
        setLoading(true);
        try {
            const res = await getAllWaitingLists(targetPage, PAGE_SIZE);
            const payload = res?.data?.data || res?.data;
            setWaitingLists(payload?.data || []);
            setPage(payload?.currentPage ?? targetPage);
            setTotalPages(payload?.totalPages ?? 1);
        } catch (err) {
            showError(err?.response?.data?.message || "Không tải được danh sách ứng viên.");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadJobs = useCallback(async () => {
        try {
            const res = await get_my_Jobs(0, 50, "APPROVED");
            const payload = res?.data?.data;
            const data = payload?.data || payload || [];
            setJobs(data);
            if (!selectedJob && data.length > 0) {
                setSelectedJob(data[0].id);
            }
        } catch (err) {
            showError(err?.response?.data?.message || "Không tải được danh sách tin tuyển dụng.");
        }
    }, [selectedJob]);

    const loadRecommended = async (jobId) => {
        if (!jobId) {
            setRecommended([]);
            return;
        }
        setLoadingRecommended(true);
        try {
            const res = await getRecommendedUsers(jobId);
            const payload = res?.data?.data || res?.data;
            const list = payload?.data || payload || [];
            setRecommended(list);
        } catch (err) {
            showError(err?.response?.data?.message || "Không tải được gợi ý ứng viên.");
            setRecommended([]);
        } finally {
            setLoadingRecommended(false);
        }
    };

    useEffect(() => {
        loadWaitingLists(0);
        loadJobs();
    }, [loadJobs, loadWaitingLists]);

    useEffect(() => {
        if (selectedJob) {
            loadRecommended(selectedJob);
        } else {
            setRecommended([]);
        }
    }, [selectedJob]);

    const filteredLists = useMemo(() => {
        const q = search.trim().toLowerCase();
        return waitingLists.filter((item) => {
            if (jobTypeFilter !== "ALL" && item.jobType !== jobTypeFilter) return false;
            if (!q) return true;
            const haystack = `${item.note || ""} ${item.skills || ""} ${JOB_TYPE_LABELS[item.jobType] || ""}`.toLowerCase();
            return haystack.includes(q);
        });
    }, [waitingLists, search, jobTypeFilter]);

    const handleOpenInvite = (waitingList, jobPref) => {
        setInviteModal({ open: true, waitingList });
        const defaultJob = jobPref || selectedJob || jobs[0]?.id || "";
        setSelectedInviteJob(defaultJob);
        setInviteMessage("Chúng tôi muốn mời bạn ứng tuyển cho công việc phù hợp này!");
    };

    const handleSendInvite = async () => {
        if (!inviteModal.waitingList) return;
        if (!selectedInviteJob) {
            showError("Vui lòng chọn tin tuyển dụng để gửi lời mời.");
            return;
        }

        // Hậu đài đôi khi trả dữ liệu khác nhau giữa danh sách chờ và gợi ý,
        // nên lấy candidateId/waitingListId theo nhiều trường, rỗng thì chặn lại.
        const candidateId =
            inviteModal.waitingList.userId ||
            inviteModal.waitingList.candidateId ||
            inviteModal.waitingList.id ||
            inviteModal.waitingList.user?.id;
        const waitingListId =
            inviteModal.waitingList.waitingListId ||
            inviteModal.waitingList.id ||
            inviteModal.waitingList.candidateWaitingListId;

        if (!candidateId) {
            showError("Thiếu mã ứng viên, vui lòng thử lại hoặc tải lại trang.");
            return;
        }

        setSendingInvite(true);
        try {
            await sendInvitation({
                candidateId,
                // Một số nguồn (gợi ý) không có waitingListId, backend cần thì gửi, không thì bỏ qua.
                ...(waitingListId ? { waitingListId } : {}),
                jobId: selectedInviteJob,
                message: inviteMessage || "Chúng tôi muốn mời bạn ứng tuyển job này!",
            });
            showSuccess("Đã gửi lời mời tới ứng viên.");
            setInviteModal({ open: false, waitingList: null });
        } catch (err) {
            showError(err?.response?.data?.message || "Gửi lời mời thất bại.");
        } finally {
            setSendingInvite(false);
        }
    };

    const handleViewDetail = async (userId) => {
        if (!userId) return;
        setDetailModal({ open: true, userId });
        setLoadingDetail(true);
        setUserDetail(null);
        try {
            const res = await getUserDetail(userId);
            const data = res?.data?.data || res?.data;
            setUserDetail(data);
        } catch (err) {
            showError(err?.response?.data?.message || "Không thể tải thông tin ứng viên.");
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleCloseDetail = () => {
        setDetailModal({ open: false, userId: null });
        setUserDetail(null);
    };

    const handleViewReviews = async (userId) => {
        if (!userId) return;
        setLoadingReviews(true);
        try {
            const response = await getRatings(userId);
            const responseData = response?.data?.data || response?.data;
            const reviewsArray = responseData?.data || [];

            // Map data từ API format sang component format
            const mappedReviews = reviewsArray.map((review) => ({
                reviewerId: review.reviewerId || review.employerId || review.userId,
                reviewerName: review.reviewerName || review.employerName || review.reviewer?.fullName || "Người đánh giá",
                reviewerAvatar: review.reviewerAvatar || review.reviewer?.avatarUrl || null,
                jobTitle: review.jobTitle || review.job?.title || null,
                score: review.score || review.rating || 0,
                comment: review.comment || review.content || "",
                createdAt: review.createdAt || review.createdDate || null,
            }));

            setReviewsModal({
                open: true,
                reviews: mappedReviews,
                applicantName: userDetail?.fullName || userDetail?.name || "Ứng viên"
            });
        } catch (error) {
            console.error("Lỗi khi tải đánh giá:", error);
            showError(error?.response?.data?.message || "Không thể tải đánh giá. Vui lòng thử lại.");
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleCloseReviews = () => {
        setReviewsModal({ open: false, reviews: [], applicantName: "" });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl border px-4 py-2">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm theo kỹ năng, ghi chú, loại công việc..."
                                className="bg-transparent w-full outline-none text-sm text-gray-700"
                            />
                        </div>
                    </div>
                    <select
                        value={jobTypeFilter}
                        onChange={(e) => setJobTypeFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border text-sm bg-white"
                    >
                        <option value="ALL">Tất cả loại công việc</option>
                        {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-4">
                    {loading ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
                            Đang tải danh sách ứng viên...
                        </div>
                    ) : filteredLists.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
                            Không tìm thấy ứng viên phù hợp.
                        </div>
                    ) : (
                        filteredLists.map((item) => (
                            <WaitingListCard key={item.id} data={item} onInvite={handleOpenInvite} onViewDetail={handleViewDetail} />
                        ))
                    )}
                    <Pagination page={page} totalPages={totalPages} onChange={(nextPage) => loadWaitingLists(nextPage)} />
                </div>

                <aside className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Sparkles size={18} className="text-amber-500" /> Gợi ý ứng viên
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Chọn một tin tuyển dụng để xem ứng viên phù hợp.</p>
                            </div>
                        </div>
                        <JobSelect jobs={jobs} value={selectedJob} onChange={setSelectedJob} placeholder="Chọn tin tuyển dụng" />

                        {loadingRecommended ? (
                            <div className="text-sm text-gray-500 py-6 text-center">Đang tải gợi ý...</div>
                        ) : recommended.length === 0 ? (
                            <div className="text-sm text-gray-500 py-6 text-center">
                                {selectedJob ? "Chưa có dữ liệu gợi ý." : "Hãy chọn một tin tuyển dụng."}
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                {recommended.map((candidate, idx) => (
                                    <RecommendationCard
                                        key={`${candidate.userId || candidate.id || "cand"}-${idx}`}
                                        data={candidate}
                                        onInvite={(data) => handleOpenInvite(data, selectedJob)}
                                        onViewDetail={handleViewDetail}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {inviteModal.open && inviteModal.waitingList && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Gửi lời mời ứng tuyển</h3>
                        <div className="space-y-2 text-sm">
                            <label className="text-gray-600 font-medium">Chọn tin tuyển dụng</label>
                            <JobSelect
                                jobs={jobs}
                                value={selectedInviteJob}
                                onChange={setSelectedInviteJob}
                                placeholder="Chọn tin tuyển dụng"
                            />
                        </div>

                        <div className="space-y-2 text-sm">
                            <label className="text-gray-600 font-medium">Lời nhắn</label>
                            <textarea
                                value={inviteMessage}
                                onChange={(e) => setInviteMessage(e.target.value)}
                                rows={3}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setInviteModal({ open: false, waitingList: null })}
                                className="px-4 py-2 rounded-lg border text-sm text-gray-600"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSendInvite}
                                disabled={sendingInvite}
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {sendingInvite ? "Đang gửi..." : "Gửi lời mời"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            {detailModal.open && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">Chi tiết ứng viên</h2>
                            <button
                                onClick={handleCloseDetail}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            {loadingDetail ? (
                                <div className="text-center py-12 text-gray-500">Đang tải thông tin...</div>
                            ) : userDetail ? (
                                <div className="space-y-6">
                                    {/* Thông tin cơ bản */}
                                    <div className="flex items-start gap-4 pb-6 border-b">
                                        {userDetail.avatarUrl ? (
                                            <img
                                                src={userDetail.avatarUrl}
                                                alt={userDetail.fullName}
                                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/150";
                                                    e.target.onerror = null;
                                                }}
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-2xl border-2 border-gray-300">
                                                {(userDetail.fullName || userDetail.email || "U").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                                {userDetail.fullName || userDetail.name || "Chưa cập nhật"}
                                            </h3>
                                            {userDetail.email && (
                                                <p className="text-sm text-gray-600 mb-1">{userDetail.email}</p>
                                            )}
                                            {userDetail.contactPhone && (
                                                <p className="text-sm text-gray-600 mb-1">{userDetail.contactPhone}</p>
                                            )}
                                            {userDetail.address && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                                    <MapPin size={16} />
                                                    <span>{userDetail.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Thông tin việc làm */}
                                    {(userDetail.preferredJobType || userDetail.availableDays || userDetail.availableTime) && (
                                        <div className="pb-6 border-b">
                                            <h4 className="font-semibold text-gray-800 mb-3">Thông tin việc làm</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                                {userDetail.preferredJobType && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-gray-400" />
                                                        <span>Loại công việc: {JOB_TYPE_LABELS[userDetail.preferredJobType] || userDetail.preferredJobType}</span>
                                                    </div>
                                                )}
                                                {userDetail.availableDays && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={16} className="text-gray-400" />
                                                        <span>Ngày làm: {formatWorkingDaysForDisplay(userDetail.availableDays)}</span>
                                                    </div>
                                                )}
                                                {userDetail.availableTime && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-gray-400" />
                                                        <span>Thời gian: {userDetail.availableTime}</span>
                                                    </div>
                                                )}
                                                {userDetail.preferredMinSalary && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign size={16} className="text-gray-400" />
                                                        <span>Mức lương mong muốn: {formatSalary(userDetail.preferredMinSalary, userDetail.preferredSalaryUnit)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Kỹ năng */}
                                    {userDetail.skills && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">Kỹ năng</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {parseSkills(userDetail.skills).map((skill, idx) => (
                                                    <span key={idx} className="text-sm px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Đánh giá */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {userDetail.trustScore ? (
                                                    <>
                                                        <Star size={20} className="text-yellow-500 fill-yellow-500" />
                                                        <span className="text-lg font-semibold text-gray-800">
                                                            {userDetail.trustScore.toFixed(1)}/5.0
                                                        </span>
                                                        {userDetail.reviewCount && (
                                                            <span className="text-sm text-gray-500">
                                                                ({userDetail.reviewCount} đánh giá)
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Chưa có đánh giá</span>
                                                )}
                                            </div>
                                            {userDetail.id && (
                                                <button
                                                    onClick={() => handleViewReviews(userDetail.id)}
                                                    disabled={loadingReviews}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                                                >
                                                    <List size={16} />
                                                    {loadingReviews ? "Đang tải..." : "Xem đánh giá"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">Không tìm thấy thông tin ứng viên.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Modal */}
            <ReviewsModal
                isOpen={reviewsModal.open}
                onClose={handleCloseReviews}
                reviews={reviewsModal.reviews}
                applicantName={reviewsModal.applicantName}
            />
        </div>
    );
};

export default FindCandidates;

