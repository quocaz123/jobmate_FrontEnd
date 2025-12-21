import React from 'react'
import { X, MapPin, Mail, Phone, Download, List } from 'lucide-react'
import { statusBadge, getStatusLabel, getJobTypeLabel, formatDate, initials } from '../../utils/candidateUtils'
import { formatWorkingDaysForDisplay } from '../../utils/scheduleUtils'

export default function ApplicationDetailModal({
    isOpen,
    onClose,
    applicationDetail,
    loadingDetail,
    onViewResume,
    onViewReviews
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-800">Chi tiết hồ sơ ứng viên</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loadingDetail ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500">Đang tải dữ liệu...</div>
                        </div>
                    ) : applicationDetail ? (
                        <div className="space-y-6">
                            {/* Thông tin ứng viên */}
                            <div className="flex items-start gap-4 pb-6 border-b">
                                {applicationDetail.avatarUrl ? (
                                    <img
                                        src={applicationDetail.avatarUrl}
                                        alt={applicationDetail.applicantName}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/150"
                                            e.target.onerror = null
                                        }}
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-2xl border-2 border-gray-300">
                                        {initials(applicationDetail.applicantName)}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{applicationDetail.applicantName}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        {applicationDetail.email && (
                                            <div className="flex items-center gap-1">
                                                <Mail size={16} />
                                                <span>{applicationDetail.email}</span>
                                            </div>
                                        )}
                                        {applicationDetail.contactPhone && (
                                            <div className="flex items-center gap-1">
                                                <Phone size={16} />
                                                <span>{applicationDetail.contactPhone}</span>
                                            </div>
                                        )}
                                        {applicationDetail.address && (
                                            <div className="flex items-center gap-1">
                                                <MapPin size={16} />
                                                <span>{applicationDetail.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge(applicationDetail.status)}`}>
                                    {getStatusLabel(applicationDetail.status)}
                                </div>
                            </div>

                            {/* Thông tin công việc */}
                            <div className="pb-6 border-b">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Thông tin công việc</h4>
                                <div className="space-y-2 text-sm">
                                    <div><span className="font-medium">Vị trí:</span> {applicationDetail.jobTitle}</div>
                                    <div><span className="font-medium">Công ty:</span> {applicationDetail.companyName}</div>
                                    {applicationDetail.salary && (
                                        <div>
                                            <span className="font-medium">Lương:</span> {applicationDetail.salary.toLocaleString('vi-VN')}đ/{applicationDetail.salaryUnit}
                                        </div>
                                    )}
                                    {applicationDetail.workingDays && (
                                        <div><span className="font-medium">Ngày làm việc:</span> {formatWorkingDaysForDisplay(applicationDetail.workingDays)}</div>
                                    )}
                                    {applicationDetail.workingHours && (
                                        <div><span className="font-medium">Giờ làm việc:</span> {applicationDetail.workingHours}</div>
                                    )}
                                    {applicationDetail.appliedAt && (
                                        <div><span className="font-medium">Ngày nộp:</span> {formatDate(applicationDetail.appliedAt)}</div>
                                    )}
                                </div>
                            </div>

                            {/* Thông tin cá nhân */}
                            <div className="pb-6 border-b">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Thông tin cá nhân</h4>
                                <div className="space-y-2 text-sm">
                                    {applicationDetail.bio && (
                                        <div>
                                            <span className="font-medium">Giới thiệu:</span>
                                            <p className="text-gray-700 mt-1">{applicationDetail.bio}</p>
                                        </div>
                                    )}
                                    {applicationDetail.skills && (
                                        <div>
                                            <span className="font-medium">Kỹ năng:</span>
                                            <p className="text-gray-700 mt-1">{applicationDetail.skills}</p>
                                        </div>
                                    )}
                                    {applicationDetail.preferredJobType && (
                                        <div>
                                            <span className="font-medium">Loại công việc mong muốn:</span> {getJobTypeLabel(applicationDetail.preferredJobType)}
                                        </div>
                                    )}
                                    {applicationDetail.matchScore && (
                                        <div>
                                            <span className="font-medium">Điểm phù hợp:</span> {applicationDetail.matchScore.toFixed(1)}/100
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Thư xin việc */}
                            {applicationDetail.coverLetter && (
                                <div className="pb-6 border-b">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Thư xin việc</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{applicationDetail.coverLetter}</p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-4">
                                {applicationDetail.hasResume && (
                                    <button
                                        onClick={onViewResume}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <Download size={18} /> Xem CV
                                    </button>
                                )}
                                <button
                                    onClick={onViewReviews}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    <List size={18} /> Xem đánh giá
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-500">Không tìm thấy thông tin hồ sơ.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

