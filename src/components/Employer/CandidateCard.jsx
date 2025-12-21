import React from 'react'
import { MapPin, Clock, Star, MessageCircle, Eye, CheckCircle, XCircle } from 'lucide-react'
import { statusBadge, statusColor, initials, getStatusLabel, getJobTypeLabel, formatDateFull } from '../../utils/candidateUtils'

export default function CandidateCard({ 
  candidate, 
  onViewProfile, 
  onChat, 
  onAccept, 
  onReject, 
  onRate,
  canRate,
  isUpdating 
}) {
  const skillsList = candidate.skills ? candidate.skills.split(',').map(s => s.trim()).filter(Boolean) : []
  const matchPercentage = candidate.matchScore || 0

  return (
    <div className={`${statusColor(candidate.status)} rounded-lg border border-gray-100 bg-white p-5 hover:shadow-lg transition`}>
      <div className="flex items-start gap-4">
        {/* Left: Avatar and Info */}
        <div className="flex items-start gap-4 flex-1">
          {candidate.avatarUrl ? (
            <img
              src={candidate.avatarUrl}
              alt={candidate.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150"
                e.target.onerror = null
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xl border-2 border-gray-300">
              {initials(candidate.name)}
            </div>
          )}

          <div className="flex-1">
            {/* Name and Status */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{candidate.name}</h3>
                {candidate.appliedAt && (
                  <p className="text-sm text-gray-600">Ngày nộp: {formatDateFull(candidate.appliedAt)}</p>
                )}
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge(candidate.status)}`}>
                {getStatusLabel(candidate.status)}
              </div>
            </div>

            {/* Rating, Location, Job Type */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{candidate.trustScore ? candidate.trustScore.toFixed(1) : '0.0'}</span>
              </div>
              {candidate.address && (
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{candidate.address}</span>
                </div>
              )}
              {candidate.preferredJobType && (
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{getJobTypeLabel(candidate.preferredJobType)}</span>
                </div>
              )}
            </div>

            {/* Skills Tags */}
            {skillsList.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {skillsList.map((skill, i) => (
                  <span key={i} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Progress Bars */}
            {matchPercentage > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    style={{ width: `${matchPercentage}%` }}
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 min-w-[80px] text-right">
                  {matchPercentage.toFixed(0)}% phù hợp
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Buttons (Vertical) */}
        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={() => onViewProfile(candidate.applicationId)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm hover:bg-gray-50 whitespace-nowrap"
          >
            <Eye size={16} /> Xem hồ sơ
          </button>
          <button
            onClick={() => onChat(candidate.applicantId)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm hover:bg-gray-50 whitespace-nowrap"
          >
            <MessageCircle size={16} /> Nhắn tin
          </button>
          {candidate.status === 'PENDING' && (
            <>
              <button
                onClick={() => onAccept(candidate.applicationId)}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={16} /> Chấp nhận
              </button>
              <button
                onClick={() => onReject(candidate.applicationId)}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle size={16} /> Từ chối
              </button>
            </>
          )}
          {canRate && (
            <button
              onClick={() => onRate(candidate)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 shadow-sm whitespace-nowrap font-medium"
              title="Đánh giá ứng viên"
            >
              <Star size={16} className="fill-white text-white" /> Đánh giá
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

