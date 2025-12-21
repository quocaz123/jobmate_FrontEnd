import React from 'react'
import { X, Star } from 'lucide-react'
import { formatDate, initials } from '../../utils/candidateUtils'

export default function ReviewsModal({
  isOpen,
  onClose,
  reviews,
  applicantName
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Đánh giá về ứng viên</h2>
            {applicantName && (
              <p className="text-sm text-gray-500 mt-1">{applicantName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!reviews || reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Chưa có đánh giá nào.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={review.reviewerId || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    {/* Avatar người đánh giá */}
                    {review.reviewerAvatar ? (
                      <img
                        src={review.reviewerAvatar}
                        alt={review.reviewerName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150"
                          e.target.onerror = null
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold border-2 border-gray-300">
                        {initials(review.reviewerName)}
                      </div>
                    )}

                    <div className="flex-1">
                      {/* Header: Tên người đánh giá và điểm */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">{review.reviewerName}</h4>
                          {review.jobTitle && (
                            <p className="text-sm text-gray-600 mt-1">{review.jobTitle}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={18} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-gray-800">{review.score.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Comment */}
                      {review.comment && (
                        <p className="text-gray-700 leading-relaxed mb-2">{review.comment}</p>
                      )}

                      {/* Ngày đánh giá */}
                      {review.createdAt && (
                        <p className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

