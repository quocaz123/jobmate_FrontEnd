import React, { useEffect, useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { getApplicationsByJob, getApplicationDetail, updateApplicationStatus } from '../../services/applicationService'
import { createConversation } from '../../services/chatService'
import { getFileUrl } from '../../services/uploadFileService'
import { getJobDetail } from '../../services/jobService'
import RatingModal from '../../components/User/RatingModal'
import { getRatings } from '../../services/ratingService'
import CandidateCard from '../../components/Employer/CandidateCard'
import ApplicationDetailModal from '../../components/Employer/ApplicationDetailModal'
import ReviewsModal from '../../components/Employer/ReviewsModal'
import RejectModal from '../../components/Employer/RejectModal'
import { showSuccess, showError, showWarning } from '../../utils/toast'

export default function EmployerCandidates({ jobId, onStartChat }) {
  const [candidates, setCandidates] = useState([])
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [applicationDetail, setApplicationDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false)
  const [reviews, setReviews] = useState([])
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [selectedApplicationForReject, setSelectedApplicationForReject] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [jobStatus, setJobStatus] = useState(null)
  const [jobTitle, setJobTitle] = useState(null)
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    jobId: null,
    jobTitle: null,
    applicantId: null,
    applicantName: null
  })

  const loadCandidates = useCallback(async (statusFilter = null) => {
    if (!jobId) {
      setCandidates([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      // Map filter từ client sang status API
      let statusParam = null
      if (statusFilter === 'pending') {
        statusParam = 'PENDING'
      } else if (statusFilter === 'accepted') {
        statusParam = 'ACCEPTED'
      } else if (statusFilter === 'rejected') {
        statusParam = 'REJECTED'
      } else if (statusFilter === 'cancelled') {
        statusParam = 'CANCELLED'
      }

      const response = await getApplicationsByJob(jobId, statusParam)
      const data = response?.data?.data

      if (data) {
        const mapped = (data.data || []).map((app) => ({
          id: app.applicationId,
          applicationId: app.applicationId,
          applicantId: app.applicantId,
          name: app.fullName,
          avatarUrl: app.avatarUrl,
          address: app.address,
          skills: app.skills,
          preferredJobType: app.preferredJobType,
          status: app.status,
          matchScore: app.matchScore || 0,
          trustScore: app.trustScore || 0,
          appliedAt: app.appliedAt
        }))
        setCandidates(mapped)
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách ứng viên:", error)
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    loadCandidates(filter === 'all' ? null : filter)
  }, [loadCandidates, filter])

  // Load job status và title khi có jobId
  useEffect(() => {
    const loadJobInfo = async () => {
      if (!jobId) {
        setJobStatus(null)
        setJobTitle(null)
        return
      }
      try {
        const response = await getJobDetail(jobId)
        const jobData = response?.data?.data || response?.data
        if (jobData?.status) {
          setJobStatus(jobData.status)
        }
        if (jobData?.title) {
          setJobTitle(jobData.title)
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin job:", error)
      }
    }
    loadJobInfo()
  }, [jobId])

  // Filter theo search query (API đã filter theo status rồi)
  const filtered = candidates.filter(c => {
    if (!q) return true
    const s = q.toLowerCase()
    return String(c.name || '').toLowerCase().includes(s) || String(c.skills || '').toLowerCase().includes(s)
  })

  const handleChat = async (applicantId) => {
    if (!applicantId) {
      console.warn("Không có applicantId để tạo conversation")
      return
    }
    try {
      await createConversation({ participantIds: [applicantId] })
      if (onStartChat) {
        onStartChat()
      } else {
        // Fallback: navigate to messages tab if callback not provided
        window.dispatchEvent(new CustomEvent('navigate-to-messages'))
      }
    } catch (error) {
      console.error("Lỗi khi tạo conversation:", error)
      showError(error?.response?.data?.message || "Không thể tạo cuộc trò chuyện. Vui lòng thử lại.")
    }
  }

  const handleViewProfile = async (applicationId) => {
    if (!applicationId) return
    setIsModalOpen(true)
    setLoadingDetail(true)
    try {
      const response = await getApplicationDetail(applicationId)
      const data = response?.data?.data
      setApplicationDetail(data || null)
    } catch (error) {
      console.error("Lỗi khi tải chi tiết ứng tuyển:", error)
      setApplicationDetail(null)
      showError(error?.response?.data?.message || "Không thể tải chi tiết hồ sơ. Vui lòng thử lại.")
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setApplicationDetail(null)
  }

  const handleViewResume = async () => {
    if (!applicationDetail?.applicantId || !applicationDetail?.hasResume) {
      showWarning("Không có CV để xem.")
      return
    }

    try {
      const response = await getFileUrl("RESUME", applicationDetail.applicantId)
      const cvUrl = response?.data?.data?.url || response?.data?.data?.fileUrl || response?.data?.data

      if (cvUrl) {
        // Mở CV trong tab mới
        window.open(cvUrl, '_blank')
      } else {
        showError("Không thể lấy link CV. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error("Lỗi khi lấy link CV:", error)
      showError(error?.response?.data?.message || "Không thể lấy link CV. Vui lòng thử lại.")
    }
  }

  const handleViewReviews = async () => {
    if (!applicationDetail?.applicantId) return

    try {
      const response = await getRatings(applicationDetail.applicantId)
      // API trả về: response.data.data.data (array reviews)
      const responseData = response?.data?.data || response?.data
      const reviewsArray = responseData?.data || []

      // Map data từ API format sang component format
      const mappedReviews = reviewsArray.map((review) => ({
        reviewerId: review.fromUserId,
        reviewerName: review.fromUserName,
        reviewerAvatar: review.fromUserAvatar,
        jobTitle: review.jobTitle,
        score: review.score,
        comment: review.comment,
        createdAt: review.createdAt
      }))

      setReviews(mappedReviews)
      setIsReviewsModalOpen(true)
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error)
      showError(error?.response?.data?.message || "Không thể tải đánh giá. Vui lòng thử lại.")
      setReviews([])
    }
  }

  const handleCloseReviewsModal = () => {
    setIsReviewsModalOpen(false)
    setReviews([])
  }

  const handleAccept = async (applicationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn chấp nhận ứng viên này không?")) {
      return
    }

    try {
      setIsUpdating(true)
      await updateApplicationStatus(applicationId, 'ACCEPTED')
      showSuccess("Đã chấp nhận ứng viên thành công!")
      // Reload danh sách ứng viên
      await loadCandidates(filter === 'all' ? null : filter)
    } catch (error) {
      console.error("Lỗi khi chấp nhận ứng viên:", error)
      showError(error?.response?.data?.message || "Không thể chấp nhận ứng viên. Vui lòng thử lại.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReject = (applicationId) => {
    setSelectedApplicationForReject(applicationId)
    setRejectionReason('')
    setIsRejectModalOpen(true)
  }

  const handleConfirmReject = async () => {
    if (!selectedApplicationForReject) return

    try {
      setIsUpdating(true)
      await updateApplicationStatus(selectedApplicationForReject, 'REJECTED', rejectionReason || null)
      showSuccess("Đã từ chối ứng viên thành công!")
      setIsRejectModalOpen(false)
      setSelectedApplicationForReject(null)
      setRejectionReason('')
      // Reload danh sách ứng viên
      await loadCandidates(filter === 'all' ? null : filter)
    } catch (error) {
      console.error("Lỗi khi từ chối ứng viên:", error)
      showError(error?.response?.data?.message || "Không thể từ chối ứng viên. Vui lòng thử lại.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false)
    setSelectedApplicationForReject(null)
    setRejectionReason('')
  }

  const handleOpenRating = (candidate) => {
    setRatingModal({
      isOpen: true,
      jobId: jobId,
      jobTitle: jobTitle || 'Công việc',
      applicantId: candidate.applicantId,
      applicantName: candidate.name
    })
  }

  const handleRatingSuccess = () => {
    // Reload danh sách sau khi đánh giá thành công
    loadCandidates(filter === 'all' ? null : filter)
  }

  // Kiểm tra xem có thể đánh giá không
  const canRate = (candidate) => {
    return (
      jobStatus === "CLOSED" &&
      (candidate.status === "ACCEPTED" || candidate.status === "REJECTED") &&
      candidate.applicantId &&
      jobId
    )
  }

  return (
    <div className="space-y-6">
      {/* Main content: list card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Danh sách ứng viên</h2>
            <p className="text-sm text-gray-500">Danh sách và quản lý các ứng viên đã ứng tuyển</p>
          </div>

          <div className="w-80">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={16} /></span>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm kiếm ứng viên..." className="w-full border border-gray-100 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-100 bg-gray-50" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setFilter('all')} className={`px-3 py-2 rounded-full text-sm ${filter === 'all' ? 'bg-white border' : 'bg-gray-50'}`}>Tất cả</button>
            <button onClick={() => setFilter('pending')} className={`px-3 py-2 rounded-full text-sm ${filter === 'pending' ? 'bg-white border' : 'bg-gray-50'}`}>Chờ duyệt</button>
            <button onClick={() => setFilter('accepted')} className={`px-3 py-2 rounded-full text-sm ${filter === 'accepted' ? 'bg-white border' : 'bg-gray-50'}`}>Đã chấp nhận</button>
            <button onClick={() => setFilter('rejected')} className={`px-3 py-2 rounded-full text-sm ${filter === 'rejected' ? 'bg-white border' : 'bg-gray-50'}`}>Đã từ chối</button>
            <button onClick={() => setFilter('cancelled')} className={`px-3 py-2 rounded-full text-sm ${filter === 'cancelled' ? 'bg-white border' : 'bg-gray-50'}`}>Đã hủy</button>
          </div>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="text-sm text-gray-500 py-8 text-center">Đang tải dữ liệu...</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-sm text-gray-500 py-8 text-center">Không có ứng viên.</div>
          )}

          {!loading && filtered.map(c => (
            <CandidateCard
              key={c.id}
              candidate={c}
              onViewProfile={handleViewProfile}
              onChat={handleChat}
              onAccept={handleAccept}
              onReject={handleReject}
              onRate={handleOpenRating}
              canRate={canRate(c)}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      </div>

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        applicationDetail={applicationDetail}
        loadingDetail={loadingDetail}
        onViewResume={handleViewResume}
        onViewReviews={handleViewReviews}
      />

      {/* Reviews Modal */}
      <ReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={handleCloseReviewsModal}
        reviews={reviews}
        applicantName={applicationDetail?.applicantName}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={handleCloseRejectModal}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        onConfirm={handleConfirmReject}
        isUpdating={isUpdating}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, jobId: null, jobTitle: null, applicantId: null, applicantName: null })}
        jobTitle={ratingModal.jobTitle}
        jobId={ratingModal.jobId}
        employerId={ratingModal.applicantId}
        employerName={ratingModal.applicantName}
        onSuccess={handleRatingSuccess}
        isEmployerRating={true}
      />
    </div>
  )
}
