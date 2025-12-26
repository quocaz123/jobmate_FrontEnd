import React, { useEffect, useState, useCallback } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { createWaitingList, getMyWaitingList, deleteWaitingList } from "../../services/waitingListService";
import { getUserInfo } from "../../services/userService";
import { getRecommendedJobs } from "../../services/recommendService";
import { SALARY_UNIT_OPTIONS, SALARY_UNIT_LABELS } from "../../constants/salaryUnits";
import { SKILL_SUGGESTIONS } from "../../constants/skillSuggestions";
import {
  formatWorkingDaysForAPI,
  formatWorkingHours,
  parseWorkingDays,
  parseWorkingHours,
  isFlexibleLabel,
} from "../../utils/scheduleUtils";
import JobListDetail from "./JobListDetail";
import JobRequestForm from "./components/JobRequestForm";
import JobRecommendations from "./components/JobRecommendations";
import JobRequestList from "./components/JobRequestList";

const MAX_REQUESTS = 5;

const jobTypeOptions = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Thực tập" },
];

const DEFAULT_SALARY_UNIT = "VND_PER_HOUR";

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('vi-VN');
}

function formatSalary(salary, unit) {
  if (!salary) return '—';
  const amount = new Intl.NumberFormat('vi-VN').format(salary) + 'đ';
  const unitLabel = unit ? (SALARY_UNIT_LABELS[unit] || unit) : 'VND';
  return `${amount} · ${unitLabel}`;
}

function formatJobSalary(salary, unit) {
  if (!salary) return unit ? (SALARY_UNIT_LABELS[unit] || unit) : '—';
  const formatted = new Intl.NumberFormat('vi-VN').format(salary) + 'đ';
  const label = unit ? (SALARY_UNIT_LABELS[unit] || unit) : '';
  return label ? `${formatted} · ${label}` : formatted;
}

export default function JobRequest({ onStartChat }) {
  const [jobType, setJobType] = useState("FULL_TIME");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [expectedMinSalary, setExpectedMinSalary] = useState("");
  const [expectedSalaryUnit, setExpectedSalaryUnit] = useState(DEFAULT_SALARY_UNIT);
  const [searchRadius, setSearchRadius] = useState(10);
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isFlexibleHours, setIsFlexibleHours] = useState(false);
  const [note, setNote] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [myRequests, setMyRequests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [selectedWaitingListId, setSelectedWaitingListId] = useState(null);
  const [recommendError, setRecommendError] = useState("");
  const [detailJobId, setDetailJobId] = useState(null);
  const [showJobDetail, setShowJobDetail] = useState(false);

  const loadMyRequests = async () => {
    setLoadingList(true);
    try {
      const res = await getMyWaitingList();
      const data = res?.data?.data || res?.data || [];
      setMyRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách yêu cầu:", err);
      setMyRequests([]);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchRecommendedJobs = useCallback(async (waitingListId) => {
    if (!waitingListId) return;
    setLoadingRecommendations(true);
    setRecommendError("");
    try {
      const res = await getRecommendedJobs(waitingListId);
      const payload = res?.data?.data;
      const nested = payload?.data;
      let jobs = [];
      if (Array.isArray(nested)) {
        jobs = nested.flatMap((item) =>
          Array.isArray(item) ? item.filter(Boolean) : [item]
        );
      }
      setRecommendedJobs(jobs);
    } catch (err) {
      console.error("Lỗi khi tải gợi ý công việc:", err);
      setRecommendError(err?.response?.data?.message || "Không thể tải gợi ý công việc.");
      setRecommendedJobs([]);
    } finally {
      setLoadingRecommendations(false);
    }
  }, []);

  // Load user profile để lấy địa chỉ
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const res = await getUserInfo();
        const profile = res?.data?.data || res?.data || {};
        setUserProfile(profile);
        if (profile.address) {
          setLocation(profile.address);
        }
        if (profile.availableDays) {
          setSelectedDays(parseWorkingDays(profile.availableDays));
        }
        if (isFlexibleLabel(profile.availableTime)) {
          setIsFlexibleHours(true);
          setStartTime("");
          setEndTime("");
        } else {
          const parsed = parseWorkingHours(profile.availableTime);
          setIsFlexibleHours(false);
          setStartTime(parsed.start);
          setEndTime(parsed.end);
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin người dùng:", err);
      }
    };
    loadUserProfile();
  }, []);

  // Load danh sách yêu cầu đã tạo
  useEffect(() => {
    loadMyRequests();
  }, []);

  const handleViewJobDetail = (jobId) => {
    if (!jobId) return;
    setDetailJobId(jobId);
    setShowJobDetail(true);
  };

  const handleSelectWaitingList = (requestId) => {
    if (!requestId) return;
    setSelectedWaitingListId(requestId);
    fetchRecommendedJobs(requestId);
  };

  const handleCloseRequest = async (requestId) => {
    if (!window.confirm("Bạn có chắc chắn muốn đóng yêu cầu tìm việc này không?")) {
      return;
    }

    try {
      await deleteWaitingList(requestId);
      setSuccess("Đã đóng yêu cầu tìm việc thành công!");
      await loadMyRequests();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể đóng yêu cầu. Vui lòng thử lại.");
    }
  };

  const addSkill = (skillName) => {
    const rawValue = typeof skillName === "string" ? skillName : skillInput;
    const normalized = rawValue.trim();
    if (!normalized) {
      if (typeof skillName !== "string") setSkillInput("");
      return;
    }
    if (!skills.includes(normalized)) {
      setSkills((prev) => [...prev, normalized]);
    }
    if (typeof skillName !== "string") {
      setSkillInput("");
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, idx) => idx !== index));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Kiểm tra giới hạn 5 yêu cầu
    if (myRequests.length >= MAX_REQUESTS) {
      setError(`Bạn chỉ được tạo tối đa ${MAX_REQUESTS} yêu cầu tìm việc. Vui lòng xóa một yêu cầu cũ trước khi tạo mới.`);
      return;
    }

    // Validation
    if (!location) {
      setError("Vui lòng cập nhật địa chỉ trong hồ sơ của bạn.");
      return;
    }

    if (skills.length === 0) {
      setError("Vui lòng thêm ít nhất một kỹ năng.");
      return;
    }

    if (!expectedMinSalary || parseFloat(expectedMinSalary) <= 0) {
      setError("Vui lòng nhập mức lương mong muốn hợp lệ.");
      return;
    }

    // Kiểm tra tọa độ địa lý
    const latitude = userProfile?.latitude ?? userProfile?.lat ?? null;
    const longitude = userProfile?.longitude ?? userProfile?.lon ?? userProfile?.lng ?? null;

    if (!latitude || !longitude) {
      setError("Vui lòng cập nhật địa chỉ có tọa độ địa lý trong hồ sơ để hệ thống có thể tìm việc phù hợp theo khoảng cách.");
      return;
    }

    setLoading(true);
    try {
      const formattedDays = formatWorkingDaysForAPI(selectedDays);
      const formattedTime = isFlexibleHours ? "Linh hoạt" : formatWorkingHours(startTime, endTime);

      const data = {
        jobType,
        skills: skills.join(";"),
        expectedMinSalary: parseFloat(expectedMinSalary),
        expectedSalaryUnit,
        searchRadius: parseFloat(searchRadius),
        availableDays: formattedDays || undefined,
        availableTime: formattedTime || undefined,
        note: note || undefined,
        latitude: latitude,
        longitude: longitude,
      };

      await createWaitingList(data);
      setSuccess("Tạo yêu cầu tìm việc thành công!");

      // Reset form
      setJobType("FULL_TIME");
      setSkills([]);
      setSkillInput("");
      setExpectedMinSalary("");
      setExpectedSalaryUnit(DEFAULT_SALARY_UNIT);
      setSearchRadius(10);
      setSelectedDays([]);
      setStartTime("");
      setEndTime("");
      setIsFlexibleHours(false);
      setNote("");

      // Reload danh sách
      await loadMyRequests();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tạo yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const getJobTypeLabel = (type) => {
    const option = jobTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Yêu cầu tìm việc</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          {showCreateForm ? "Ẩn form tạo" : "Tạo yêu cầu mới"}
        </button>
      </div>

      {/* Thông báo */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="space-y-6 lg:col-span-2">
          <JobRequestList
            requests={myRequests}
            loading={loadingList}
            maxRequests={MAX_REQUESTS}
            selectedWaitingListId={selectedWaitingListId}
            onSelect={handleSelectWaitingList}
            onClose={handleCloseRequest}
            formatSalary={formatSalary}
            formatDate={formatDate}
            getJobTypeLabel={getJobTypeLabel}
          />
        </div>

        <JobRecommendations
          loading={loadingRecommendations}
          error={recommendError}
          selectedWaitingListId={selectedWaitingListId}
          recommendedJobs={recommendedJobs}
          formatJobSalary={formatJobSalary}
          onViewDetail={handleViewJobDetail}
        />
      </div>

      {/* Modal chi tiết công việc */}
      {showJobDetail && detailJobId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <JobListDetail
              id={detailJobId}
              variant="modal"
              onBack={() => {
                setShowJobDetail(false);
                setDetailJobId(null);
              }}
              onStartChat={() => {
                setShowJobDetail(false);
                setDetailJobId(null);
                if (onStartChat) onStartChat();
              }}
            />
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowCreateForm(false)}
              className="absolute top-4 right-4 px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Đóng
            </button>
            <div className="p-6">
              <JobRequestForm
                show={true}
                jobType={jobType}
                setJobType={setJobType}
                jobTypeOptions={jobTypeOptions}
                expectedMinSalary={expectedMinSalary}
                setExpectedMinSalary={setExpectedMinSalary}
                expectedSalaryUnit={expectedSalaryUnit}
                setExpectedSalaryUnit={setExpectedSalaryUnit}
                salaryUnitOptions={SALARY_UNIT_OPTIONS}
                skills={skills}
                skillInput={skillInput}
                setSkillInput={setSkillInput}
                addSkill={addSkill}
                removeSkill={removeSkill}
                skillSuggestions={SKILL_SUGGESTIONS}
                searchRadius={searchRadius}
                setSearchRadius={setSearchRadius}
                location={location}
                selectedDays={selectedDays}
                setSelectedDays={setSelectedDays}
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
                isFlexibleHours={isFlexibleHours}
                setIsFlexibleHours={setIsFlexibleHours}
                note={note}
                setNote={setNote}
                userProfile={userProfile}
                loading={loading}
                myRequestsLength={myRequests.length}
                maxRequests={MAX_REQUESTS}
                handleCreate={handleCreate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
