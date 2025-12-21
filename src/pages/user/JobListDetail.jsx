import React, { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Clock, DollarSign, Users, Star, Calendar, Building2, Phone, Mail, Globe, MessageCircle } from "lucide-react";
import { getJobDetailByIdForUser } from "../../services/jobService";
import { createConversation } from "../../services/chatService";
import ApplicationModal from "../../components/User/ApplicationModal";
import { formatWorkingDaysForDisplay } from "../../utils/scheduleUtils";

export default function JobListDetail({ id, onBack, onStartChat, variant = "page", reportReason = null }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [participantIds, setParticipantIds] = useState(null);
  const [showModal, setShowModal] = useState(false);



  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getJobDetailByIdForUser(id);
        const j = res?.data?.data || res?.data;
        setJob(j || null);
        setParticipantIds([j?.employer?.id]);
      } catch (e) {
        console.warn("Không tải được chi tiết công việc", e);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const isModal = variant === "modal";

  if (loading) {
    return (
      <div className={isModal ? "p-6 text-center text-gray-500" : "p-6 text-center text-gray-500"}>
        Đang tải chi tiết công việc...
      </div>
    );
  }

  const handleStartChat = async () => {
    const ids = participantIds && participantIds.filter(Boolean);
    if (!ids || ids.length === 0) return;
    try {
      await createConversation({ participantIds: ids });
      if (onStartChat) onStartChat();
    } catch (e) {
      console.warn('Không thể tạo cuộc trò chuyện:', e);
    }
  };

  if (!job) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Không tìm thấy công việc.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            ← Quay lại
          </button>
        )}
      </div>
    );
  }

  const employer = job.employer || {};
  const companyName = employer.fullName || "Nhà tuyển dụng";
  const applicants = job.applicationCount || 0;
  const rating = job.averageRating ?? null;
  const email = employer.email || null;
  const skillsArr = Array.isArray(job.skills)
    ? job.skills
    : (typeof job.skills === 'string' && job.skills.trim().length > 0
      ? job.skills.split(',').map(s => s.trim()).filter(Boolean)
      : []);
  const employerAvatar = employer.avatarUrl || null;
  const employerAddress = employer.address || null;
  const employerBadge = employer.badgeLevel || null;
  const employerReviews = employer.reviewCount ?? null;
  const phone = job.contactPhone || null;

  const toList = (val) => {
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === 'string') {
      const s = val.trim();
      if (!s) return [];
      // tách theo xuống dòng, dấu chấm phẩy, hoặc gạch đầu dòng
      return s
        .split(/\r?\n|;|\u2022|-|•/)
        .map((x) => x.trim())
        .filter(Boolean);
    }
    return [];
  };
  const requirementsArr = toList(job.requirements);
  const benefitsArr = toList(job.benefits);

  return (
    <div className={`${isModal ? "bg-white p-4" : "min-h-screen bg-gray-50 p-6"}`}>
      {/* Header actions */}
      <div className={`${isModal ? "max-w-5xl mx-auto mb-4" : "max-w-5xl mx-auto mb-4"}`}>
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50 flex items-center gap-2">
              <ArrowLeft size={16} /> Quay lại
            </button>
          )}
          <div className="flex-1" />
          <button onClick={handleStartChat} className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50 flex items-center gap-2">
            <MessageCircle size={16} /> Chat với nhà tuyển dụng
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-600">
                {companyName?.charAt(0) || "C"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
                <div className="flex items-center gap-2 mb-3 text-gray-700">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{companyName}</span>
                  {rating ? (
                    <div className="flex items-center gap-1 ml-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{Number(rating).toFixed(1)}</span>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{job.salary ? `${Number(job.salary).toLocaleString('vi-VN')}đ/${job.salaryUnit || 'buổi'}` : 'Thoả thuận'}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{job.jobType || 'PART_TIME'}</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" />{applicants} ứng viên</span>
                  {job.deadline && (
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Hạn: {new Date(job.deadline).toLocaleString('vi-VN')}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-2">
                  {job.workingHours && <span>Giờ làm: {job.workingHours}</span>}
                  {job.workingDays && <span>Ngày làm: {formatWorkingDaysForDisplay(job.workingDays)}</span>}
                  {job.workMode && <span>Hình thức: {job.workMode}</span>}
                  {job.category && <span>Ngành: {job.category}</span>}
                  {typeof job.viewsCount === 'number' && <span>{job.viewsCount} lượt xem</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b px-6 py-4"><h2 className="font-semibold">Mô tả công việc</h2></div>
            <div className="p-6">
              <div className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{job.description}</div>
            </div>
          </div>

          {/* Requirements & Benefits */}
          {(requirementsArr.length > 0 || benefitsArr.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="border-b px-6 py-4"><h2 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" />Yêu cầu</h2></div>
                <div className="p-6">
                  <ul className="space-y-2 text-sm text-gray-700">
                    {requirementsArr.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow">
                <div className="border-b px-6 py-4"><h2 className="font-semibold flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" />Quyền lợi</h2></div>
                <div className="p-6">
                  <ul className="space-y-2 text-sm text-gray-700">
                    {benefitsArr.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Skills */}
          {skillsArr.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="border-b px-6 py-4"><h2 className="font-semibold">Kỹ năng yêu cầu</h2></div>
              <div className="p-6 flex flex-wrap gap-2">
                {skillsArr.map((s, idx) => (
                  <span key={idx} className="px-2 py-1 text-xs rounded-full border bg-gray-50 text-gray-700 border-gray-200">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {!reportReason ? (
            <div className="bg-white rounded-lg shadow p-6">
              <button disabled={applied} onClick={() => setShowModal(true)} className="w-full mb-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                {applied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
              </button>
              <div className="text-center text-sm text-gray-500">
                {job.deadline && (
                  <p>Hạn nộp hồ sơ: <span className="font-medium">{new Date(job.deadline).toLocaleDateString('vi-VN')}</span></p>
                )}
                <p className="mt-1">{applicants} người đã ứng tuyển</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="border-b pb-3 mb-3">
                <h2 className="font-semibold text-lg">Lý do bị báo cáo</h2>
                <p className="text-sm text-gray-500 mt-1">Được cung cấp bởi người dùng</p>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">{reportReason}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            <div className="border-b px-6 py-4"><h2 className="font-semibold">Thông tin nhà tuyển dụng</h2></div>
            <div className="p-6">
              {/* Company Profile */}
              <div className="flex items-start gap-4 mb-6">
                {employerAvatar ? (
                  <img src={employerAvatar} alt="Avatar" className="h-16 w-16 rounded-full object-cover border" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-600">
                    {companyName?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <h3 className="font-semibold text-gray-800">{companyName}</h3>
                  </div>
                  {email && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span>{email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {employerBadge && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        {employerBadge}
                      </span>
                    )}
                    {typeof employerReviews === 'number' && (
                      <span className="text-xs text-gray-500">{employerReviews} đánh giá</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Contact Information */}
              <div className="space-y-3 text-sm text-gray-700">
                {employerAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{employerAddress}</span>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {job && !reportReason && (
        <ApplicationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => setApplied(true)}
          jobTitle={job.title}
          jobId={job.id}
        />
      )}
    </div>
  );
}
