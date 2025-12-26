import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Clock,
  Star,
  User,
  Search,
  Filter,
  MoreVertical,
  List as ListIcon,
  X,
  ChevronDown,
} from "lucide-react";
import { searchAvailableJobs } from "../../services/jobService";
import { getAllCategories } from "../../services/categoryService";
import ApplicationModal from "../../components/User/ApplicationModal";
import ReportModal from "../../components/User/ReportModal";
import { SALARY_UNIT_LABELS } from "../../constants/salaryUnits";
import {
  VIETNAM_CITIES,
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
} from "../../constants/jobFilters";
import { formatWorkingDaysForDisplay } from "../../utils/scheduleUtils";

function companyInitials(name) {
  if (!name) return "CC";
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const COLORS = [
  "bg-gradient-to-br from-blue-50 to-indigo-100",
  "bg-gradient-to-br from-indigo-50 to-blue-100",
  "bg-gradient-to-br from-purple-50 to-blue-100",
  "bg-gradient-to-br from-green-50 to-green-100",
  "bg-gradient-to-br from-blue-50 to-purple-100",
];
function pickColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i);
  return COLORS[Math.abs(h) % COLORS.length];
}

function tagClass(tag) {
  const t = tag.toLowerCase();
  if (t.includes("gấp")) return "bg-red-100 text-red-600 border-red-200";
  if (t.includes("đã xác minh")) return "bg-green-100 text-green-600 border-green-200";
  if (t.includes("freelance")) return "bg-purple-100 text-purple-600 border-purple-200";
  if (t.includes("part")) return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default function JobList({ onViewDetail, userInfo }) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categorySelectRef = useRef(null);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const locationSelectRef = useRef(null);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(12);

  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const dropdownRefs = useRef({});
  const lastRefreshRef = useRef(Date.now());
  const refreshIntervalRef = useRef(null);
  const previousJobsRef = useRef(null); // Lưu dữ liệu jobs trước đó để so sánh

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await getAllCategories();
        const list = res?.data?.data || res?.data || [];
        setCategories(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách lĩnh vực:", err);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Hàm so sánh jobs để kiểm tra có thay đổi không
  const hasJobsChanged = (oldJobs, newJobs) => {
    if (!oldJobs || !newJobs) return true;
    if (oldJobs.length !== newJobs.length) return true;

    // Tạo map từ oldJobs với key là ID
    const oldJobsMap = new Map();
    oldJobs.forEach(job => {
      const id = job.id || job.job_id || job.jobId;
      if (id) {
        oldJobsMap.set(String(id), {
          id: String(id),
          status: job.status,
          applicationCount: job.applicationCount || 0,
        });
      }
    });

    // Tạo set các ID từ newJobs
    const newJobsIds = new Set();

    for (const newJob of newJobs) {
      const id = String(newJob.id || newJob.job_id || newJob.jobId);
      if (!id) continue;

      newJobsIds.add(id);

      const oldJob = oldJobsMap.get(id);
      if (!oldJob) {
        // Có job mới
        return true;
      }

      // Kiểm tra các thay đổi quan trọng
      const newStatus = newJob.status;
      const newAppCount = newJob.applicationCount || 0;

      if (oldJob.status !== newStatus) return true;
      if (oldJob.applicationCount !== newAppCount) return true;
    }

    // Kiểm tra xem có job nào bị xóa không (có trong old nhưng không có trong new)
    if (oldJobsMap.size !== newJobsIds.size) return true;

    for (const oldJobId of oldJobsMap.keys()) {
      if (!newJobsIds.has(oldJobId)) {
        return true; // Có job bị xóa/đóng
      }
    }

    return false; // Không có thay đổi
  };

  // Load jobs with filters
  const loadJobs = useCallback(async (currentPage = 0, forceUpdate = false, silent = false) => {
    // Chỉ hiển thị loading nếu không phải silent mode (polling)
    if (!silent) {
      setLoading(true);
    }

    try {
      const params = {
        page: currentPage,
        size: pageSize,
        keyword: keyword.trim() || null,
        location: location.trim() || null,
        jobType: jobType || null,
        workMode: workMode || null,
        categoryId: categoryId || null,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
      };

      const res = await searchAvailableJobs(params);
      const pageData = res?.data?.data || res?.data || {};
      const list = pageData?.data || [];

      // Chỉ update state nếu có thay đổi thực sự hoặc force update
      const hasChanged = forceUpdate || hasJobsChanged(previousJobsRef.current, list);

      if (hasChanged) {
        // Có thay đổi - update state
        if (silent) {
          // Silent mode: chỉ log để debug
          console.log('[JobList] Có thay đổi dữ liệu (silent mode)');
        }
        setJobs(list);
        setTotalPages(pageData?.totalPages || 0);
        setTotalElements(pageData?.totalElements || 0);
        setPage(currentPage);
        // Lưu deep copy để tránh reference issue khi so sánh lần sau
        previousJobsRef.current = JSON.parse(JSON.stringify(list));
      } else {
        // Không có thay đổi - KHÔNG update bất kỳ state nào để tránh re-render
        if (silent) {
          console.log('[JobList] Không có thay đổi, bỏ qua update (silent mode)');
        }
        // Chỉ cập nhật ref với dữ liệu mới (deep copy) để so sánh lần sau
        // Lưu ý: việc này không gây re-render vì ref không trigger re-render
        previousJobsRef.current = JSON.parse(JSON.stringify(list));
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách công việc:", err);
      if (!silent) {
        setJobs([]);
        setTotalPages(0);
        setTotalElements(0);
        previousJobsRef.current = null;
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [keyword, location, jobType, workMode, categoryId, salaryMin, salaryMax, pageSize]);

  // Initial load
  useEffect(() => {
    loadJobs(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh với Visibility API + Polling
  useEffect(() => {
    const POLLING_INTERVAL = 30000; // 30 giây
    const MIN_REFRESH_INTERVAL = 5000; // Tối thiểu 5 giây giữa các lần refresh

    // Hàm refresh jobs (chỉ khi tab visible và không đang loading)
    const refreshJobs = () => {
      // Chỉ refresh nếu tab đang visible
      if (document.visibilityState !== 'visible') {
        return;
      }

      // Tránh refresh quá thường xuyên
      const now = Date.now();
      if (now - lastRefreshRef.current < MIN_REFRESH_INTERVAL) {
        return;
      }

      // Tránh refresh khi đang loading
      if (loading) {
        return;
      }

      // Refresh với page và filters hiện tại (silent mode để không hiển thị loading)
      loadJobs(page, false, true); // silent = true để không làm UI nhảy
      lastRefreshRef.current = now;
    };

    // Xử lý khi tab visibility thay đổi
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Khi quay lại tab, refresh ngay nếu đã qua một khoảng thời gian
        const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
        if (timeSinceLastRefresh >= POLLING_INTERVAL) {
          refreshJobs();
        }
      }
    };

    // Setup polling interval
    refreshIntervalRef.current = setInterval(() => {
      refreshJobs();
    }, POLLING_INTERVAL);

    // Lắng nghe visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [page, loading, loadJobs]);

  // Search handler
  const handleSearch = () => {
    // Reset timer để tránh polling refresh ngay sau khi user search
    lastRefreshRef.current = Date.now();
    previousJobsRef.current = null; // Reset để force update khi search
    loadJobs(0, true); // Force update khi user thao tác
  };

  // Filter change handler
  const handleFilterChange = () => {
    // Reset timer để tránh polling refresh ngay sau khi user thay đổi filter
    lastRefreshRef.current = Date.now();
    previousJobsRef.current = null; // Reset để force update khi filter
    loadJobs(0, true); // Force update khi user thao tác
  };

  // Reset filters
  const handleResetFilters = () => {
    setKeyword("");
    setLocation("");
    setJobType("");
    setWorkMode("");
    setCategoryId("");
    setSalaryMin("");
    setSalaryMax("");
    // Reset timer để tránh polling refresh ngay sau khi reset
    lastRefreshRef.current = Date.now();
    previousJobsRef.current = null; // Reset để force update khi reset
    setTimeout(() => loadJobs(0, true), 100); // Force update khi user thao tác
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    if (openDropdownId === null) return;

    const handleClickOutside = (event) => {
      if (showReportModal) return;
      const ref = dropdownRefs.current[openDropdownId];
      if (ref) {
        const isClickInside = ref.contains(event.target);
        if (!isClickInside) {
          setOpenDropdownId(null);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openDropdownId, showReportModal]);

  // Đóng category dropdown khi click bên ngoài
  useEffect(() => {
    const handler = (event) => {
      if (
        categorySelectRef.current &&
        !categorySelectRef.current.contains(event.target)
      ) {
        setCategoryDropdownOpen(false);
      }

      if (
        locationSelectRef.current &&
        !locationSelectRef.current.contains(event.target)
      ) {
        setLocationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggleDropdown(jobId) {
    setOpenDropdownId(openDropdownId === jobId ? null : jobId);
  }

  function handleReport(job) {
    const jobId = job.id || job.job_id || job.jobId;
    setOpenDropdownId(null);
    const reportData = {
      targetType: "JOB",
      targetId: jobId,
      targetTitle: job.title,
    };
    setReportTarget(reportData);
    setShowReportModal(true);
  }

  function handleApply(job) {
    setSelectedJob(job);
    setShowModal(true);
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-semibold text-gray-800">
            Tìm việc làm
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Khám phá hàng trăm công việc phù hợp với bạn
          </p>
        </div>

        {/* Search bar */}
        <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 mb-6 border">
          <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg flex-1">
            <Search className="text-gray-400" size={18} />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Tìm kiếm theo tên công việc, công ty..."
              className="w-full outline-none text-sm text-gray-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg border transition ${showFilters
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "hover:bg-gray-100"
                }`}
            >
              <Filter size={18} />
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Bộ lọc</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Đặt lại
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm
                </label>
                <div
                  ref={locationSelectRef}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setLocationDropdownOpen((prev) => !prev)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setLocationDropdownOpen((prev) => !prev);
                      }
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white flex items-center justify-between gap-3 text-sm"
                  >
                    <span
                      className={`truncate ${location ? "text-gray-800" : "text-gray-500"
                        }`}
                    >
                      {location || "Tất cả"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${locationDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  {locationDropdownOpen && (
                    <div className="absolute left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto origin-top">
                      {VIETNAM_CITIES.map((city) => {
                        const isSelected = city.value === location;
                        return (
                          <button
                            key={city.value}
                            type="button"
                            onClick={() => {
                              setLocation(city.value);
                              setLocationDropdownOpen(false);
                              handleFilterChange();
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${isSelected
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-700"
                              }`}
                          >
                            {city.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại công việc
                </label>
                <select
                  value={jobType}
                  onChange={(e) => {
                    setJobType(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {JOB_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình thức làm việc
                </label>
                <select
                  value={workMode}
                  onChange={(e) => {
                    setWorkMode(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {WORK_MODE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lĩnh vực
                </label>
                <div
                  ref={categorySelectRef}
                  className={`relative ${categoriesLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  <button
                    type="button"
                    disabled={categoriesLoading}
                    onClick={() => {
                      if (categoriesLoading) return;
                      setCategoryDropdownOpen((prev) => !prev);
                    }}
                    onKeyDown={(e) => {
                      if (categoriesLoading) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setCategoryDropdownOpen((prev) => !prev);
                      }
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white flex items-center justify-between gap-3 text-sm disabled:bg-gray-50"
                  >
                    <span className={`truncate ${categoryId ? "text-gray-800" : "text-gray-500"}`}>
                      {categoryId
                        ? categories.find((c) => c.id === categoryId)?.name || "Chọn lĩnh vực"
                        : categoriesLoading
                          ? "Đang tải..."
                          : "Tất cả"}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {categoryDropdownOpen && (
                    <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto origin-top">
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryId("");
                          setCategoryDropdownOpen(false);
                          handleFilterChange();
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${!categoryId ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"
                          }`}
                      >
                        Tất cả
                      </button>
                      {categories.map((cat) => {
                        const isSelected = cat.id === categoryId;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => {
                              setCategoryId(cat.id);
                              setCategoryDropdownOpen(false);
                              handleFilterChange();
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${isSelected
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-700"
                              }`}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Salary Min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lương tối thiểu (VND)
                </label>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="VD: 5000000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Salary Max */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lương tối đa (VND)
                </label>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="VD: 20000000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
              >
                Đặt lại
              </button>
              <button
                onClick={() => {
                  handleFilterChange();
                  setShowFilters(false);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
              >
                Áp dụng
              </button>
            </div>
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            Tìm thấy <span className="font-semibold">{totalElements}</span> công việc
          </div>
        )}

        {/* Job list */}
        {loading && (
          <div className="text-center py-8 text-gray-500">
            Đang tải danh sách công việc...
          </div>
        )}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobs.map((job) => {
                const jobId = job.id || job.job_id || job.jobId;
                const companyName = job.companyName || job.company || "Công ty";
                const initials = companyInitials(companyName);
                const pastel = pickColor(companyName);
                const salaryUnitLabel = job.salaryUnit
                  ? SALARY_UNIT_LABELS[job.salaryUnit] || job.salaryUnit
                  : null;
                const salaryDisplay = (() => {
                  if (typeof job.salary === "number") {
                    const amount = `${job.salary.toLocaleString("vi-VN")}đ`;
                    return salaryUnitLabel ? `${amount} · ${salaryUnitLabel}` : amount;
                  }
                  if (job.salary) return job.salary;
                  if (salaryUnitLabel && !job.salary) return salaryUnitLabel;
                  return "Thỏa thuận";
                })();

                return (
                  <div
                    key={jobId}
                    className="bg-white p-5 rounded-2xl shadow-sm border relative hover:-translate-y-1 hover:shadow-lg transition"
                  >
                    <div
                      className="absolute right-4 top-4"
                      ref={(el) => (dropdownRefs.current[jobId] = el)}
                    >
                      <button
                        onClick={() => toggleDropdown(jobId)}
                        className="p-2 rounded-md hover:bg-gray-100 transition"
                      >
                        <MoreVertical size={18} className="text-gray-400" />
                      </button>
                      {openDropdownId === jobId && (
                        <div
                          className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleReport(job);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-lg"
                          >
                            Báo cáo
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-semibold ${pastel}`}
                      >
                        {initials}
                      </div>
                      <div className="flex-1">
                        <h3
                          className="text-lg font-semibold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis"
                          title={job.title}
                        >
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {job.companyName || job.company}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span>
                          {job.location || job.address}
                          {typeof job.distance === "number" && job.distance >= 0 && (
                            <span className="ml-2 text-xs text-gray-500">
                              · {job.distance.toFixed(1)} km
                            </span>
                          )}
                          {typeof job.distanceKm === "number" && job.distanceKm >= 0 && typeof job.distance !== "number" && (
                            <span className="ml-2 text-xs text-gray-500">
                              · {job.distanceKm.toFixed(1)} km
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span>
                          {job.workingHours || "Linh hoạt"} • {job.workingDays ? formatWorkingDaysForDisplay(job.workingDays) : "Linh hoạt"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Star
                          size={16}
                          className={
                            job.averageRating && job.averageRating > 0
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-400"
                          }
                        />
                        <span>
                          {job.averageRating && job.averageRating > 0
                            ? `${job.averageRating.toFixed(1)} (${job.ratingCount || 0} đánh giá)`
                            : `Chưa có đánh giá (${job.ratingCount || 0} đánh giá)`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500">
                        <User size={16} className="text-gray-400" />
                        <span>{job.applicationCount || 0} người ứng tuyển</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.tags && Array.isArray(job.tags) && job.tags.length > 0 ? (
                        job.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-1 rounded-full border ${tagClass(t)}`}
                          >
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full border bg-gray-100 text-gray-700 border-gray-200">
                          {job.jobType || "Part-time"}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="text-lg font-semibold text-pink-600">
                        {salaryDisplay}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onViewDetail(jobId)}
                          className="px-4 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleApply(job)}
                          className="px-4 py-2 rounded-lg text-white text-sm bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition-all"
                        >
                          Ứng tuyển
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {jobs.length === 0 && (
                <div className="col-span-full bg-white p-8 rounded-xl border text-center text-gray-500">
                  Không có công việc phù hợp.
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    lastRefreshRef.current = Date.now();
                    previousJobsRef.current = null; // Reset để force update khi chuyển trang
                    loadJobs(page - 1, true);
                  }}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Trước
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (page < 3) {
                      pageNum = i;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          lastRefreshRef.current = Date.now();
                          previousJobsRef.current = null; // Reset để force update khi chuyển trang
                          loadJobs(pageNum, true);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm ${page === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    lastRefreshRef.current = Date.now();
                    previousJobsRef.current = null; // Reset để force update khi chuyển trang
                    loadJobs(page + 1, true);
                  }}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <ApplicationModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedJob(null);
          }}
          jobTitle={selectedJob.title}
          userInfo={userInfo}
          jobId={selectedJob.id || selectedJob.job_id || selectedJob.jobId}
        />
      )}

      {/* Report Modal */}
      {(() => {
        const modalIsOpen = showReportModal && reportTarget !== null;

        return (
          <ReportModal
            isOpen={modalIsOpen}
            onClose={() => {
              setShowReportModal(false);
              setReportTarget(null);
            }}
            targetType={reportTarget?.targetType}
            targetId={reportTarget?.targetId}
            targetTitle={reportTarget?.targetTitle}
          />
        );
      })()}
    </div>
  );
}
