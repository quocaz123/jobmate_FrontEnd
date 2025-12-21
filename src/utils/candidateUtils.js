// Helper functions cho candidate components

export function statusBadge(status) {
    if (!status) return 'bg-gray-50 text-gray-700'
    const s = String(status).toLowerCase()
    if (s.includes('chờ') || s.includes('pending')) return 'bg-yellow-50 text-yellow-700'
    if (s.includes('chấp') || s.includes('accepted')) return 'bg-green-50 text-green-700'
    if (s.includes('từ') || s.includes('rejected')) return 'bg-red-50 text-red-700'
    return 'bg-gray-50 text-gray-700'
}

export function statusColor(status) {
    const s = String(status || '').toLowerCase()
    if (s.includes('chờ') || s.includes('pending')) return 'border-l-4 border-blue-300'
    if (s.includes('chấp') || s.includes('accepted')) return 'border-l-4 border-green-300'
    if (s.includes('từ') || s.includes('rejected')) return 'border-l-4 border-red-300'
    return 'border-l-4 border-gray-300'
}

export function initials(name) {
    if (!name) return ''
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

export function getStatusLabel(status) {
    const statusMap = {
        PENDING: "Chờ duyệt",
        ACCEPTED: "Đã chấp nhận",
        REJECTED: "Đã từ chối",
        INTERVIEW: "Phỏng vấn",
        CANCELLED: "Đã hủy"
    }
    return statusMap[status] || status
}

export function getJobTypeLabel(jobType) {
    const typeMap = {
        FULL_TIME: "Toàn thời gian",
        PART_TIME: "Bán thời gian",
        FREELANCE: "Freelance",
        INTERNSHIP: "Thực tập"
    }
    return typeMap[jobType] || jobType
}

export function formatDateFull(dateString) {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    })
}

export function formatDate(dateString) {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    })
}

