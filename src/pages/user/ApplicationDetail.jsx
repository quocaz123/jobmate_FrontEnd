import React, { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Star,
  Mail,
  Phone,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { getApplicationDetail } from "../../services/applicationService";
import { getJobDetailByIdForUser } from "../../services/jobService";
import RatingModal from "../../components/User/RatingModal";
import { formatWorkingDaysForDisplay } from "../../utils/scheduleUtils";

export default function ApplicationDetail({ id, onBack }) {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    jobId: null,
    jobTitle: null,
    employerId: null,
    employerName: null
  });

  const loadApplicationDetail = useCallback(async () => {
    if (!id) {
      setApp(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await getApplicationDetail(id);
      const data = response?.data?.data;
      if (data) {
        setApp(data);
      } else {
        console.warn("API không trả về dữ liệu cho application:", id);
        setApp(null);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết ứng tuyển:", error);
      setApp(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplicationDetail();
  }, [loadApplicationDetail]);

  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: { label: "Đang xem xét", color: "bg-yellow-100 text-yellow-600" },
      ACCEPTED: { label: "Chấp nhận", color: "bg-green-100 text-green-600" },
      REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-600" },
      INTERVIEW: { label: "Phỏng vấn", color: "bg-blue-100 text-blue-600" },
      CANCELLED: { label: "Đã hủy", color: "bg-gray-100 text-gray-600" }
    };
    return statusMap[status] || { label: status, color: "bg-gray-100 text-gray-600" };
  };

  const getJobTypeLabel = (jobType) => {
    const typeMap = {
      FULL_TIME: "Toàn thời gian",
      PART_TIME: "Bán thời gian",
      FREELANCE: "Freelance",
      INTERNSHIP: "Thực tập"
    };
    return typeMap[jobType] || jobType;
  };

  const formatSalary = (salary, salaryUnit) => {
    if (!salary) return "Thỏa thuận";
    const formattedSalary = parseFloat(salary).toLocaleString("vi-VN");
    return `${formattedSalary}đ/${salaryUnit || "tháng"}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleOpenRating = async () => {
    if (!app) return;

    let employerId = app.employerId;
    let employerName = app.companyName || app.employerName;

    // Nếu chưa có employerId, lấy từ job detail
    if (!employerId && app.jobId) {
      try {
        const jobResponse = await getJobDetailByIdForUser(app.jobId);
        const jobData = jobResponse?.data?.data || jobResponse?.data;
        if (jobData?.employer?.id) {
          employerId = jobData.employer.id;
        }
        if (!employerName && jobData?.employer?.fullName) {
          employerName = jobData.employer.fullName;
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin job:", error);
      }
    }

    setRatingModal({
      isOpen: true,
      jobId: app.jobId,
      jobTitle: app.jobTitle,
      employerId: employerId,
      employerName: employerName
    });
  };

  const handleRatingSuccess = () => {
    // Reload chi tiết sau khi đánh giá thành công
    loadApplicationDetail();
  };

  // Kiểm tra xem có thể đánh giá không
  const canRate = () => {
    if (!app) return false;
    return (
      app.statusJob === "CLOSED" &&
      (app.status === "ACCEPTED" || app.status === "REJECTED") &&
      app.jobId
    );
  };

  // Map jobStatus từ backend sang tiếng Việt
  const getJobStatusLabel = (statusJob) => {
    const statusMap = {
      PENDING: { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-600" },
      APPROVED: { label: "Đã duyệt", color: "bg-green-100 text-green-600" },
      REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-600" },
      CLOSED: { label: "Đã đóng", color: "bg-gray-100 text-gray-600" },
      OPEN: { label: "Đang mở", color: "bg-blue-100 text-blue-600" }
    };
    return statusMap[statusJob] || { label: statusJob || "N/A", color: "bg-gray-100 text-gray-600" };
  };


  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Đang tải chi tiết ứng tuyển...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy đơn ứng tuyển</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(app.status);
  const schedule = `${app.workingDays ? formatWorkingDaysForDisplay(app.workingDays) : ""}${app.workingHours ? ` • ${app.workingHours}` : ""}`;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Nút quay lại */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-black"
      >
        <ArrowLeft size={18} />
        <span>Quay lại danh sách</span>
      </button>

      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        {/* Header công việc */}
        <div className="flex gap-5 mb-6 items-center">
          {/* Avatar chữ cái đầu */}
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-2xl shadow-sm border">
            {app.jobTitle?.charAt(0).toUpperCase() || "J"}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-800">{app.jobTitle || "Công việc"}</h1>
            <p className="text-gray-500">{app.companyName || ""}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-2">
              {app.location && (
                <>
                  <MapPin size={14} /> {app.location}
                </>
              )}
              {app.salary && (
                <>
                  {" • "}
                  <DollarSign size={14} /> {formatSalary(app.salary, app.salaryUnit)}
                </>
              )}
              {schedule && (
                <>
                  {" • "}
                  <Clock size={14} /> {schedule}
                </>
              )}
              {app.jobType && (
                <>
                  {" • "}
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {getJobTypeLabel(app.jobType)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Trạng thái */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
          {app.statusJob && (() => {
            const jobStatusInfo = getJobStatusLabel(app.statusJob);
            return (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${jobStatusInfo.color}`}
                title="Trạng thái công việc"
              >
                {jobStatusInfo.label}
              </span>
            );
          })()}
          {app.appliedAt && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              Đã nộp: {formatDate(app.appliedAt)}
            </span>
          )}
          {app.hasResume && (
            <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full flex items-center gap-1">
              <FileText size={14} /> CV: {app.resumeFileName}
            </span>
          )}
        </div>

        {/* Thông tin công việc */}
        <div className="border-t pt-4 space-y-6">
          {app.description && (
            <div>
              <div className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                <FileText size={18} /> <span>Mô tả công việc</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{app.description}</p>
            </div>
          )}

          {app.requirements && (
            <div>
              <div className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                <AlertCircle size={18} /> <span>Yêu cầu</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{app.requirements}</p>
            </div>
          )}

          {app.benefits && (
            <div>
              <div className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                <Star size={18} /> <span>Quyền lợi</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{app.benefits}</p>
            </div>
          )}

          {app.coverLetter && (
            <div>
              <div className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                <FileText size={18} /> <span>Thư xin việc của bạn</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{app.coverLetter}</p>
              </div>
            </div>
          )}

          {app.status === "REJECTED" && (
            <div>
              <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                <XCircle size={18} /> <span>Lý do từ chối</span>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-700 leading-relaxed">
                  {app.rejectionReason || "Nhà tuyển dụng chưa cung cấp lý do cụ thể."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Thông tin nhà tuyển dụng */}
        {app.employerName && (
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center gap-2 text-gray-800 font-semibold mb-4">
              <User size={18} /> <span>Thông tin nhà tuyển dụng</span>
            </div>
            <div className="flex gap-4 items-center">
              {app.employerAvatar && (
                <img
                  src={app.employerAvatar}
                  alt={app.employerName}
                  className="w-16 h-16 rounded-full object-cover border"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-800">{app.employerName}</p>
                {app.employerEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Mail size={14} /> {app.employerEmail}
                  </div>
                )}
                {app.employerPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Phone size={14} /> {app.employerPhone}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Nút hành động */}
        <div className="mt-6 flex justify-between items-center border-t pt-6">
          <button
            onClick={onBack}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
          >
            Quay lại danh sách
          </button>

          <div className="flex gap-3">
            {canRate() && (
              <button
                onClick={handleOpenRating}
                className="px-4 py-2 rounded-lg text-white text-sm bg-gradient-to-r from-pink-500 to-cyan-500 hover:opacity-95 flex items-center gap-1"
              >
                <Star size={16} className="fill-white" /> Đánh giá công việc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, jobId: null, jobTitle: null, employerId: null, employerName: null })}
        jobTitle={ratingModal.jobTitle}
        jobId={ratingModal.jobId}
        employerId={ratingModal.employerId}
        employerName={ratingModal.employerName}
        onSuccess={handleRatingSuccess}
      />
    </div>
  );
}
