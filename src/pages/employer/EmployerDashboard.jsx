import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Mail,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  getEmployerDashboardSummary,
  getEmployerRecentCandidates,
  getEmployerTopJobs,
} from '../../services/employerDashboardService';
import { getApplicationDetail } from '../../services/applicationService';
import { showWarning, showError } from '../../utils/toast';
import ApplicationDetailModal from '../../components/Employer/ApplicationDetailModal';
import ReviewsModal from '../../components/Employer/ReviewsModal';
import { getRatings } from '../../services/ratingService';
import { getFileUrl } from '../../services/uploadFileService';

const LIMIT_TOP_JOBS = 5;
const LIMIT_RECENT_CANDIDATES = 6;

const formatNumber = (value) => {
  if (value == null) return '0';
  try {
    return new Intl.NumberFormat('vi-VN').format(value);
  } catch {
    return String(value);
  }
};

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const extractData = (response) => response?.data?.data ?? response?.data ?? response ?? null;

const JobStatusBadge = ({ status }) => {
  const variants = {
    APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
    REJECTED: 'bg-red-50 text-red-600 border border-red-200',
    CLOSED: 'bg-slate-100 text-slate-600 border border-slate-200',
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${variants[status] || 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {status || 'UNKNOWN'}
    </span>
  );
};

const CandidateStatusBadge = ({ status }) => {
  const variants = {
    PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
    REVIEWING: 'bg-sky-50 text-sky-700 border border-sky-200',
    INTERVIEW: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    REJECTED: 'bg-rose-50 text-rose-600 border border-rose-200',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${variants[status] || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};

const SummaryCard = ({ icon, label, value, subText, accent }) => {
  const IconComp = icon;
  return (
    <div className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{formatNumber(value)}</p>
        {subText && <p className="mt-1 text-xs text-slate-400">{subText}</p>}
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
        <IconComp className="h-5 w-5 text-indigo-600" />
      </div>
    </div>
  );
};

const TopJobCard = ({ job }) => {
  const progress = job?.targetApplicants
    ? Math.min(Math.round((job.totalApplications / job.targetApplicants) * 100), 150)
    : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-900">{job.title}</p>
          <p className="text-sm text-slate-500">
            {formatNumber(job.totalApplications)} ứng viên · mục tiêu {formatNumber(job.targetApplicants)}
          </p>
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1 text-slate-500">
          <Users className="h-4 w-4 text-indigo-500" />
          {formatNumber(job.viewsCount)} lượt xem
        </span>
        <span className="inline-flex items-center gap-1 text-slate-500">
          <Eye className="h-4 w-4 text-slate-400" />
          {job.lastApplicationAt ? `Ứng viên cuối: ${formatDateTime(job.lastApplicationAt)}` : 'Chưa có ứng viên'}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Mức độ hoàn thành mục tiêu</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${job.targetReached ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="inline-flex items-center gap-2 text-slate-500">
          <Target className="h-4 w-4 text-slate-400" />
          {job.targetReached ? 'Đã đạt mục tiêu tuyển' : 'Đang tuyển thêm'}
        </div>
        {job.targetReached ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Hoàn thành
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
            <AlertCircle className="h-4 w-4" />
            Chưa đạt
          </span>
        )}
      </div>
    </div>
  );
};

const CandidateCard = ({ candidate, onViewDetail }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-base font-semibold text-slate-900">{candidate.candidateName}</p>
        <p className="inline-flex items-center gap-1 text-sm text-slate-500">
          <Mail className="h-4 w-4 text-slate-400" />
          {candidate.candidateEmail}
        </p>
      </div>
      <CandidateStatusBadge status={candidate.status} />
    </div>

    <div className="mt-4 space-y-2 text-sm text-slate-600">
      <div className="flex items-center gap-2 text-slate-500">
        <Briefcase className="h-4 w-4 text-indigo-500" />
        {candidate.jobTitle} ({candidate.jobStatus})
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <TrendingUp className="h-4 w-4 text-emerald-500" />
        Điểm phù hợp {candidate.matchScore != null ? `${candidate.matchScore}%` : '—'}
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <Calendar className="h-4 w-4 text-slate-400" />
        Nộp lúc {formatDateTime(candidate.appliedAt)}
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <FileText className={`h-4 w-4 ${candidate.resumeAvailable ? 'text-indigo-500' : 'text-slate-300'}`} />
        {candidate.resumeAvailable ? 'Đã đính kèm CV' : 'Chưa có CV'}
      </div>
    </div>

    {onViewDetail && candidate.applicationId && (
      <div className="mt-4 pt-4 border-t border-slate-200">
        <button
          onClick={() => onViewDetail(candidate.applicationId)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition text-sm font-medium"
        >
          <Eye className="h-4 w-4" />
          Xem chi tiết
        </button>
      </div>
    )}
  </div>
);

const EmptyState = ({ title, description }) => (
  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
    <p className="text-base font-semibold text-slate-700">{title}</p>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
  </div>
);

const SectionHeader = ({ title, description, onRefresh, loading }) => (
  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
    <div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-slate-500">{description}</p>}
    </div>
    {onRefresh && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRefresh(e);
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
        Làm mới
      </button>
    )}
  </div>
);

export const EmployerDashboard = ({ onTabChange }) => {
  const [summary, setSummary] = useState(null);
  const [topJobs, setTopJobs] = useState([]);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [loading, setLoading] = useState({
    summary: true,
    jobs: true,
    candidates: true,
  });
  const [error, setError] = useState({
    summary: '',
    jobs: '',
    candidates: '',
  });

  // State cho modal chi tiết ứng viên
  const [detailModal, setDetailModal] = useState({ open: false, applicationId: null });
  const [applicationDetail, setApplicationDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);

  const fetchSummary = useCallback(async () => {
    setLoading((prev) => ({ ...prev, summary: true }));
    setError((prev) => ({ ...prev, summary: '' }));
    try {
      const response = await getEmployerDashboardSummary();
      setSummary(extractData(response));
    } catch (err) {
      console.error('Lỗi tải thống kê employer:', err);
      setSummary(null);
      setError((prev) => ({
        ...prev,
        summary: err?.response?.data?.message || 'Không thể tải thống kê tổng quan.',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, summary: false }));
    }
  }, []);

  const fetchTopJobs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, jobs: true }));
    setError((prev) => ({ ...prev, jobs: '' }));
    try {
      const response = await getEmployerTopJobs(LIMIT_TOP_JOBS);
      const data = extractData(response);
      setTopJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải top jobs:', err);
      setTopJobs([]);
      setError((prev) => ({
        ...prev,
        jobs: err?.response?.data?.message || 'Không thể tải danh sách công việc.',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, jobs: false }));
    }
  }, []);

  const fetchRecentCandidates = useCallback(async () => {
    setLoading((prev) => ({ ...prev, candidates: true }));
    setError((prev) => ({ ...prev, candidates: '' }));
    try {
      const response = await getEmployerRecentCandidates(LIMIT_RECENT_CANDIDATES);
      const data = extractData(response);
      setRecentCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải ứng viên mới:', err);
      setRecentCandidates([]);
      setError((prev) => ({
        ...prev,
        candidates: err?.response?.data?.message || 'Không thể tải danh sách ứng viên.',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, candidates: false }));
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchTopJobs();
    fetchRecentCandidates();
  }, [fetchSummary, fetchTopJobs, fetchRecentCandidates]);

  const summaryCards = useMemo(
    () => [
      {
        key: 'totalJobs',
        label: 'Tổng số tin đăng',
        value: summary?.totalJobs,
        subText: 'Tất cả trạng thái',
        icon: Briefcase,
        accent: 'bg-indigo-50 text-indigo-600',
      },
      {
        key: 'activeJobs',
        label: 'Tin đang hoạt động',
        value: summary?.activeJobs,
        subText: 'Đang hiển thị cho ứng viên',
        icon: Activity,
        accent: 'bg-emerald-50 text-emerald-600',
      },
      {
        key: 'pendingReviewJobs',
        label: 'Tin chờ duyệt',
        value: summary?.pendingReviewJobs,
        subText: 'Đang chờ quản trị viên',
        icon: Calendar,
        accent: 'bg-amber-50 text-amber-600',
      },
      {
        key: 'closedJobs',
        label: 'Tin đã đóng',
        value: summary?.closedJobs,
        subText: 'Ngừng nhận ứng tuyển',
        icon: Target,
        accent: 'bg-slate-100 text-slate-600',
      },
      {
        key: 'totalApplications',
        label: 'Tổng lượt ứng tuyển',
        value: summary?.totalApplications,
        subText: 'Tất cả chiến dịch',
        icon: Users,
        accent: 'bg-sky-50 text-sky-600',
      },
      {
        key: 'pendingApplications',
        label: 'Ứng tuyển chờ xử lý',
        value: summary?.pendingApplications,
        subText: 'Cần phản hồi',
        icon: AlertCircle,
        accent: 'bg-rose-50 text-rose-600',
      },
      {
        key: 'applicationsToday',
        label: 'Ứng tuyển hôm nay',
        value: summary?.applicationsToday,
        subText: 'Trong 24h gần nhất',
        icon: TrendingUp,
        accent: 'bg-violet-50 text-violet-600',
      },
    ],
    [summary]
  );

  const handleRefreshAll = () => {
    fetchSummary();
    fetchTopJobs();
    fetchRecentCandidates();
  };

  const handleViewDetail = async (applicationId) => {
    if (!applicationId) return;
    setDetailModal({ open: true, applicationId });
    setLoadingDetail(true);
    setApplicationDetail(null);
    try {
      const response = await getApplicationDetail(applicationId);
      const data = response?.data?.data || response?.data;
      const normalized = {
        ...data,
        resumeUrl: data?.resumeUrl || data?.resume,
        // Kiểm tra hasResume từ API hoặc từ resumeUrl/resume
        hasResume: data?.hasResume !== undefined 
          ? Boolean(data.hasResume) 
          : Boolean(data?.resumeUrl || data?.resume),
      };
      setApplicationDetail(normalized);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết ứng viên:', error);
      setApplicationDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailModal({ open: false, applicationId: null });
    setApplicationDetail(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển nhà tuyển dụng</h1>
          <p className="text-sm text-slate-500">Theo dõi hiệu quả tuyển dụng và phản hồi ứng viên theo thời gian thực.</p>
        </div>
        <button
          type="button"
          onClick={handleRefreshAll}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <Activity className="h-4 w-4" />
          Làm mới dữ liệu
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading.summary && (
          <div className="col-span-full flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải thống kê...
          </div>
        )}
        {!loading.summary &&
          summaryCards.map((card) => (
            <SummaryCard key={card.key} icon={card.icon} label={card.label} value={card.value} subText={card.subText} accent={card.accent} />
          ))}
        {!loading.summary && error.summary && (
          <div className="col-span-full rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">
            {error.summary}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div
          className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2 cursor-pointer transition hover:border-indigo-300 hover:shadow-md"
          onClick={() => onTabChange && onTabChange('manage-jobs')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTabChange && onTabChange('manage-jobs');
            }
          }}
        >
          <SectionHeader
            title="Top công việc hiệu quả"
            description="Những tin tuyển dụng thu hút nhiều ứng viên và lượt xem nhất."
            onRefresh={(e) => {
              e.stopPropagation();
              fetchTopJobs();
            }}
            loading={loading.jobs}
          />
          <div className="space-y-4 px-6 py-6">
            {loading.jobs ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang tải danh sách công việc...
              </div>
            ) : error.jobs ? (
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">{error.jobs}</div>
            ) : topJobs.length === 0 ? (
              <EmptyState title="Chưa có dữ liệu" description="Bạn chưa có tin tuyển dụng nào hoặc chưa có ứng viên." />
            ) : (
              topJobs.map((job) => <TopJobCard key={job.jobId} job={job} />)
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            title="Ứng viên mới"
            description="Danh sách ứng viên ứng tuyển gần nhất."
            onRefresh={fetchRecentCandidates}
            loading={loading.candidates}
          />
          <div className="space-y-4 px-6 py-6">
            {loading.candidates ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang tải danh sách ứng viên...
              </div>
            ) : error.candidates ? (
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">{error.candidates}</div>
            ) : recentCandidates.length === 0 ? (
              <EmptyState title="Chưa có ứng viên mới" description="Hãy theo dõi lại khi có ứng viên ứng tuyển." />
            ) : (
              recentCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.applicationId}
                  candidate={candidate}
                  onViewDetail={handleViewDetail}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        isOpen={detailModal.open}
        onClose={handleCloseDetail}
        applicationDetail={applicationDetail}
        loadingDetail={loadingDetail}
        onViewResume={async () => {
          if (!applicationDetail?.applicantId || !applicationDetail?.hasResume) {
            showWarning('Không có CV để xem.');
            return;
          }

          try {
            const response = await getFileUrl('RESUME', applicationDetail.applicantId);
            const cvUrl = response?.data?.data?.url || response?.data?.data?.fileUrl || response?.data?.data;

            if (cvUrl) {
              window.open(cvUrl, '_blank');
            } else {
              showError('Không thể lấy link CV. Vui lòng thử lại.');
            }
          } catch (error) {
            console.error('Lỗi khi lấy link CV:', error);
            showError(error?.response?.data?.message || 'Không thể lấy link CV. Vui lòng thử lại.');
          }
        }}
        onViewReviews={async () => {
          if (!applicationDetail?.applicantId) {
            showWarning('Không tìm thấy thông tin ứng viên để xem đánh giá.');
            return;
          }
          try {
            const res = await getRatings(applicationDetail.applicantId);
            const list = res?.data?.data || res?.data || [];
            setReviews(Array.isArray(list) ? list : []);
            setReviewsModalOpen(true);
          } catch {
            showWarning('Không tải được đánh giá của ứng viên.');
          }
        }}
      />
      <ReviewsModal
        isOpen={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        reviews={reviews}
        applicantName={applicationDetail?.applicantName}
      />
    </div>
  );
};

export default EmployerDashboard;
