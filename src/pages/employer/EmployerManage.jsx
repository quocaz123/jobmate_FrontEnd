import React, { useEffect, useState, useRef } from 'react'
import { MapPin, DollarSign, Clock, Users, Eye, MoreVertical, Trash2, Edit, Search, Calendar } from 'lucide-react'
import { get_my_Jobs, closeJob as closeJobApi, deleteJob as deleteJobApi } from '../../services/jobService'
import { SALARY_UNIT_LABELS } from '../../constants/salaryUnits'
import Pagination from '../../components/Common/Pagination'
import EmployerCandidates from './EmployerCandidates'

function statusStyle(status) {
  switch (status) {
    case 'PENDING_REVIEW':
      return { label: 'Đang xem xét', badge: 'bg-yellow-50 text-yellow-700', border: 'border-l-4 border-yellow-300' }
    case 'ACTIVE':
    case 'APPROVED':
      return { label: 'Đang hoạt động', badge: 'bg-green-50 text-green-700', border: 'border-l-4 border-green-300' }
    case 'REJECTED':
      return { label: 'Bị từ chối', badge: 'bg-red-50 text-red-700', border: 'border-l-4 border-red-300' }
    case 'CLOSED':
      return { label: 'Hết hạn', badge: 'bg-gray-50 text-gray-700', border: 'border-l-4 border-gray-300' }
    case 'EXPIRED':
      return { label: 'Hết hạn', badge: 'bg-gray-50 text-gray-700', border: 'border-l-4 border-gray-300' }
    default:
      return { label: 'Đang tuyển', badge: 'bg-gray-50 text-gray-700', border: 'border-l-4 border-gray-100' }
  }
}

const formatInstant = (isoUtc) => {
  if (!isoUtc) return ''
  try {
    return new Date(isoUtc).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false,
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return String(isoUtc).replace('T', ' ')
  }
}


export default function EmployerManage({ onView, onEdit, onStartChat, onEditWithStatus }) {
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showCandidates, setShowCandidates] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [selectedJobTitle, setSelectedJobTitle] = useState(null)
  const menuRefs = useRef({})

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      try {
        const statusParam = filter === 'active' ? 'APPROVED' : filter === 'pending' ? 'PENDING_REVIEW' : filter === 'expired' ? 'CLOSED' : undefined
        const res = await get_my_Jobs(page, pageSize, statusParam)
        const payload = res?.data?.data
        const list = payload?.data || []
        const mapped = list.map((j) => ({
          id: j.id,
          title: j.title,
          location: j.location,
          salary: j.salary,
          type: j.jobType,
          status: j.status,
          startAt: j.startAt,
          createdAt: j.createdAt,
          applicants: new Array(j.applicationCount || 0).fill({}),
          views: j.viewsCount || 0,
          salaryUnit: j.salaryUnit,
        }))
        setJobs(mapped)
        if (typeof payload?.totalPages === 'number') setTotalPages(payload.totalPages)
      } catch {
        setMessage({ type: 'error', text: 'Không tải được danh sách tin tuyển dụng.' })
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [page, filter])

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 2500)
      return () => clearTimeout(t)
    }
  }, [message])

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId].contains(event.target)) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openMenuId])

  async function handleDelete(id) {
    const ok = window.confirm('Bạn có chắc muốn xóa tin tuyển dụng này?')
    if (!ok) return
    try {
      await deleteJobApi(id)
      const next = jobs.filter(j => j.id !== id)
      setJobs(next)
      setMessage({ type: 'success', text: 'Đã xóa tin tuyển dụng.' })
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Không thể xóa tin tuyển dụng. Vui lòng thử lại.'
      setMessage({ type: 'error', text: errorMessage })
    }
  }

  function handleEdit(id) {
    const job = jobs.find(j => j.id === id)
    if (!job) return

    // Cho phép edit nếu status là PENDING_REVIEW, CLOSED, hoặc REJECTED
    const editableStatuses = ['PENDING_REVIEW', 'CLOSED', 'REJECTED']
    if (!editableStatuses.includes(job.status)) {
      setMessage({ type: 'error', text: 'Chỉ có thể chỉnh sửa tin đang chờ duyệt, đã đóng hoặc bị từ chối.' })
      return
    }

    // Nếu có onEditWithStatus, truyền cả status
    if (onEditWithStatus) {
      onEditWithStatus(id, job.status)
    } else if (onEdit) {
      onEdit(id)
    }
  }

  async function handleCloseJob(id) {
    const job = jobs.find(j => j.id === id)
    if (!job) return
    const ok = window.confirm('Đóng tin tuyển dụng này? Ứng viên sẽ không thể ứng tuyển.')
    if (!ok) return

    try {
      await closeJobApi(id)
      const next = jobs.map(j => j.id === id ? { ...j, status: 'CLOSED' } : j)
      setJobs(next)
      setMessage({ type: 'success', text: 'Đã đóng tin tuyển dụng.' })
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Không thể đóng tin tuyển dụng. Vui lòng thử lại.'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setOpenMenuId(null)
    }
  }

  function handleViewCandidates(jobId, jobTitle) {
    setSelectedJobId(jobId)
    setSelectedJobTitle(jobTitle)
    setShowCandidates(true)
    setOpenMenuId(null)
  }

  function filtered() {
    const q = query.trim().toLowerCase()
    return jobs.filter(job => {
      if (!q) return true
      return (job.title || '').toLowerCase().includes(q) || (job.location || '').toLowerCase().includes(q)
    })
  }

  // Nếu đang xem danh sách ứng viên, render EmployerCandidates
  if (showCandidates) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => {
                setShowCandidates(false)
                setSelectedJobId(null)
                setSelectedJobTitle(null)
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Danh sách ứng viên</h1>
              <p className="text-gray-500 mt-2">{selectedJobTitle}</p>
            </div>
          </div>
        </div>
        <EmployerCandidates jobId={selectedJobId} onStartChat={onStartChat} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header card (no stats, no post button) */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Tin tuyển dụng</h1>
        <p className="text-gray-500 mt-2">Quản lý và theo dõi các tin tuyển dụng của bạn</p>
      </div>

      {/* Main content: list card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Danh sách tin đăng</h2>
            <p className="text-sm text-gray-500">Quản lý các tin bạn đã đăng </p>
          </div>

          <div className="w-80">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={16} /></span>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm tin đăng..." className="w-full border border-gray-100 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-100 bg-gray-50" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => { setFilter('all'); setPage(0) }} className={`px-3 py-2 rounded-full text-sm ${filter === 'all' ? 'bg-white border' : 'bg-gray-50'}`}>Tất cả</button>
            <button onClick={() => { setFilter('active'); setPage(0) }} className={`px-3 py-2 rounded-full text-sm ${filter === 'active' ? 'bg-white border' : 'bg-gray-50'}`}>Đang hoạt động</button>
            <button onClick={() => { setFilter('pending'); setPage(0) }} className={`px-3 py-2 rounded-full text-sm ${filter === 'pending' ? 'bg-white border' : 'bg-gray-50'}`}>Chờ duyệt</button>
            <button onClick={() => { setFilter('expired'); setPage(0) }} className={`px-3 py-2 rounded-full text-sm ${filter === 'expired' ? 'bg-white border' : 'bg-gray-50'}`}>Hết hạn</button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 px-4 py-2 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          {loading && (
            <div className="text-sm text-gray-500 py-8 text-center">Đang tải dữ liệu...</div>
          )}
          {!loading && filtered().length === 0 && (
            <div className="text-sm text-gray-500 py-8 text-center">Không có tin nào khớp.</div>
          )}

          {filtered().map(job => {
            const style = statusStyle(job.status)
            return (
              <div key={job.id || job._id || job.title} className={`${style.border} rounded-lg border border-gray-100 p-5 flex items-center justify-between hover:shadow-lg transform hover:-translate-y-0.5 transition`}>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-medium text-gray-800">{job.title || 'Tiêu đề công việc'}</h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style.badge}`}>{style.label}</div>
                  </div>

                  <div className="mt-3 text-sm text-gray-500 flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-2"><MapPin size={14} /> <span>{job.location || 'Địa điểm'}</span></div>
                    <div className="flex items-center gap-2"><DollarSign size={14} /> <span>{
                      typeof job.salary === 'number'
                        ? (() => {
                          const unitLabel = SALARY_UNIT_LABELS[job.salaryUnit] || job.salaryUnit || 'VND';
                          return `${job.salary.toLocaleString('vi-VN')}đ/${unitLabel}`;
                        })()
                        : (job.salary || (SALARY_UNIT_LABELS[job.salaryUnit] || 'Mức lương'))
                    }</span></div>
                    <div className="flex items-center gap-2"><Clock size={14} /> <span>{job.type || 'Part-time'}</span></div>
                    {job.startAt && (
                      <div className="flex items-center gap-2"><Calendar size={14} /> <span>{formatInstant(job.startAt)}</span></div>
                    )}
                    {job.createdAt && (
                      <div className="flex items-center gap-2"><Calendar size={14} /> <span>Tạo: {formatInstant(job.createdAt)}</span></div>
                    )}
                  </div>

                  <div className="mt-3 text-sm text-gray-500 flex items-center gap-6">
                    <div className="flex items-center gap-2"><Users size={14} /> <span>{(job.applicants && job.applicants.length) || 0} ứng viên</span></div>
                    <div className="flex items-center gap-2"><Eye size={14} /> <span>{job.views || 0} lượt xem</span></div>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-3 relative">
                  <button onClick={() => (onView ? onView(job.id) : alert('Xem chi tiết'))} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded bg-white text-sm"><Eye size={16} /> Xem</button>
                  <button onClick={() => handleViewCandidates(job.id, job.title)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded bg-white text-sm"><Users size={16} /> Xem danh sách ứng viên</button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(job.id)}
                      disabled={!['PENDING_REVIEW', 'CLOSED', 'REJECTED'].includes(job.status)}
                      className={`p-2 rounded ${!['PENDING_REVIEW', 'CLOSED', 'REJECTED'].includes(job.status) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-50 text-blue-600'}`}
                      title={
                        !['PENDING_REVIEW', 'CLOSED', 'REJECTED'].includes(job.status)
                          ? 'Chỉ có thể sửa tin đang chờ duyệt, đã đóng hoặc bị từ chối'
                          : job.status === 'CLOSED' || job.status === 'REJECTED'
                            ? 'Chỉnh sửa và đăng lại'
                            : 'Sửa'
                      }
                    >
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(job.id)} className="p-2 rounded hover:bg-gray-50 text-red-600" title="Xóa"><Trash2 size={16} /></button>
                    <div className="relative" ref={(el) => (menuRefs.current[job.id] = el)}>
                      <button onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)} className="p-2 rounded hover:bg-gray-50 text-gray-400" title="Thêm"><MoreVertical size={16} /></button>
                      {openMenuId === job.id && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded shadow-md z-10">
                          {(() => {
                            const closableStatuses = ['APPROVED', 'PENDING_REVIEW', 'REJECTED']
                            const canClose = closableStatuses.includes(job.status)
                            return (
                              <button
                                disabled={!canClose}
                                onClick={() => canClose && handleCloseJob(job.id)}
                                className={`w-full text-left px-3 py-2 text-sm ${!canClose ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                              >
                                Đóng tin
                              </button>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <Pagination page={page} totalPages={totalPages} onChangePage={setPage} />
      </div>
    </div>
  )
}
