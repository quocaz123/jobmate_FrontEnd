import React, { useEffect, useRef, useState } from 'react';
import { createJob, getJobDetail, updateJob } from '../../services/jobService';
import { SALARY_UNIT_OPTIONS } from '../../constants/salaryUnits';
import LocationPickerModal from '../../components/common/LocationPickerModal';
import { getAllCategories } from '../../services/categoryService';
import {
    DAY_OPTIONS,
    TIME_PRESETS,
    parseWorkingDays,
    formatWorkingDaysForAPI,
    parseWorkingHours,
    formatWorkingHours,
    isFlexibleLabel,
} from '../../utils/scheduleUtils';
import { SKILL_SUGGESTIONS } from '../../constants/skillSuggestions';

const HERE_API_KEY = (typeof import.meta !== "undefined" && import.meta.env?.VITE_HERE_API_KEY) || "";

const EmployerPost = ({ mode = 'create', jobId = null, jobStatus = null, onDone }) => {
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);

    const normalizeCoord = (value) => {
        if (value === undefined || value === null || value === '') return null;
        const num = Number(value);
        return Number.isNaN(num) ? null : num;
    };
    const [salary, setSalary] = useState('');
    const [description, setDescription] = useState('');
    const [skills, setSkills] = useState('');
    const [requirements, setRequirements] = useState('');
    const [benefits, setBenefits] = useState('');
    const [jobType, setJobType] = useState('PART_TIME');
    const [deadline, setDeadline] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [salaryUnit, setSalaryUnit] = useState('VND_PER_HOUR');
    const [startTime, setStartTime] = useState(''); // Format: HH:mm
    const [endTime, setEndTime] = useState(''); // Format: HH:mm
    const [selectedDays, setSelectedDays] = useState([]); // Mảng các ngày đã chọn: [2, 3, 4, 5, 6, 7, 8]
    const [isFlexibleHours, setIsFlexibleHours] = useState(false);
    const [workMode, setWorkMode] = useState('ONSITE');
    const [maxApplicants, setMaxApplicants] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoriesError, setCategoriesError] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [salaryUnitOpen, setSalaryUnitOpen] = useState(false);
    const salaryUnitSelectRef = useRef(null);
    const categorySelectRef = useRef(null);
    const PHONE_MAX_LEN = 11;
    const PHONE_MIN_LEN = 10; // Chuẩn VN hiện tại đa số là 10 số
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(!(mode === 'edit' && jobId));
    const [success, setSuccess] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

    const toLocalInput = (isoString) => {
        if (!isoString) return '';
        try {
            const d = new Date(isoString);
            const tzOffsetMin = d.getTimezoneOffset();
            const local = new Date(d.getTime() - tzOffsetMin * 60000);
            return local.toISOString().slice(0, 16);
        } catch {
            return String(isoString).slice(0, 16);
        }
    };

    // Hàm thêm kỹ năng vào input
    const addSkill = (skill) => {
        if (mode === 'view' || (mode === 'edit' && !loaded)) return;
        const currentSkills = skills.trim();
        const skillList = currentSkills ? currentSkills.split(',').map(s => s.trim()) : [];

        // Kiểm tra xem kỹ năng đã có chưa
        if (!skillList.includes(skill)) {
            const newSkills = [...skillList, skill].join(', ');
            setSkills(newSkills);
        }
    };

    const reset = () => {
        setTitle('');
        setLocation('');
        setLatitude(null);
        setLongitude(null);
        setSalary('');
        setDescription('');
        setSkills('');
        setRequirements('');
        setBenefits('');
        setJobType('PART_TIME');
        setDeadline('');
        setCompanyName('');
        setSalaryUnit('VND_PER_HOUR');
        setStartTime('');
        setEndTime('');
        setSelectedDays([]);
        setIsFlexibleHours(false);
        setWorkMode('ONSITE');
        setCategoryId('');
        setCategoryName('');
        setMaxApplicants('');
        setContactPhone('');
        setSalaryUnitOpen(false);
        setCategoryDropdownOpen(false);
    };


    useEffect(() => {
        const loadCategories = async () => {
            setCategoriesLoading(true);
            setCategoriesError('');
            try {
                const res = await getAllCategories();
                const list = res?.data?.data || res?.data || [];
                if (Array.isArray(list)) {
                    setCategories(list);
                    if (!list.length) {
                        setCategoriesError('Không có dữ liệu lĩnh vực.');
                    }
                } else {
                    setCategories([]);
                    setCategoriesError('Không thể tải danh sách lĩnh vực. Vui lòng thử lại.');
                }
            } catch (err) {
                console.error('Không thể tải danh sách lĩnh vực:', err);
                setCategories([]);
                setCategoriesError('Không thể tải danh sách lĩnh vực. Vui lòng thử lại.');
            } finally {
                setCategoriesLoading(false);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        if (categoryId && !categoryName && categories.length > 0) {
            const found = categories.find((cat) => cat.id === categoryId);
            if (found) {
                setCategoryName(found.name);
            }
        }
    }, [categories, categoryId, categoryName]);

    useEffect(() => {
        const load = async () => {
            if (!jobId) return;
            try {
                const res = await getJobDetail(jobId);
                const j = res?.data?.data || res?.data;
                if (!j) return;
                setTitle(j.title || '');
                setLocation(j.location || '');
                setLatitude(normalizeCoord(j.latitude ?? j.lat));
                setLongitude(normalizeCoord(j.longitude ?? j.lon ?? j.lng));
                setSalary(j.salary ?? '');
                setDescription(j.description || '');
                setSkills(j.skills || '');
                setRequirements(j.requirements || '');
                setBenefits(j.benefits || '');
                setJobType(j.jobType || 'PART_TIME');
                setDeadline(toLocalInput(j.deadline));
                setCompanyName(j.companyName || '');
                setSalaryUnit(j.salaryUnit || 'VND_PER_HOUR');
                const hoursStr = j.workingHours || '';
                if (isFlexibleLabel(hoursStr)) {
                    setIsFlexibleHours(true);
                    setStartTime('');
                    setEndTime('');
                } else {
                    const parsedHours = parseWorkingHours(hoursStr);
                    setStartTime(parsedHours.start);
                    setEndTime(parsedHours.end);
                    setIsFlexibleHours(false);
                }
                const daysStr = j.workingDays || '';
                setSelectedDays(parseWorkingDays(daysStr));
                setWorkMode(j.workMode || 'ONSITE');
                setCategoryId(j.categoryId || '');
                setCategoryName(j.categoryName || j.category || '');
                setMaxApplicants(
                    j.maxApplicants ??
                    j.applicantQuota ??
                    j.capacity ??
                    ''
                );
                setContactPhone(j.contactPhone || '');
            } catch (err) {
                console.warn('Failed to load job details:', err);
            }
            finally {
                setLoaded(true);
            }
        }
        load()
    }, [jobId])

    useEffect(() => {
        const handler = (event) => {
            if (salaryUnitSelectRef.current && !salaryUnitSelectRef.current.contains(event.target)) {
                setSalaryUnitOpen(false);
            }
            if (categorySelectRef.current && !categorySelectRef.current.contains(event.target)) {
                setCategoryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (mode === 'view' || (mode === 'edit' && !loaded)) {
            setSalaryUnitOpen(false);
        }
    }, [mode, loaded]);
    const salaryUnitDisabled = mode === 'view' || (mode === 'edit' && !loaded);
    const salaryUnitLabel = SALARY_UNIT_OPTIONS.find(opt => opt.value === salaryUnit)?.label || 'Chọn đơn vị';
    const categoryDisabled = mode === 'view' || (mode === 'edit' && !loaded) || categoriesLoading;
    const categoryLabel = categoryName
        ? categoryName
        : (categoriesLoading ? 'Đang tải...' : 'Chọn lĩnh vực');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === 'edit' && !loaded) {
            setSuccess({ type: 'error', message: 'Đang tải dữ liệu công việc, vui lòng đợi...' });
            return;
        }
        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Tiêu đề là bắt buộc.';
        if (!location.trim()) newErrors.location = 'Địa điểm là bắt buộc.';
        if (!salary.toString().trim()) newErrors.salary = 'Mức lương là bắt buộc.';
        if (maxApplicants) {
            const quota = Number(maxApplicants);
            if (Number.isNaN(quota) || quota <= 0) {
                newErrors.maxApplicants = 'Số lượng ứng tuyển phải lớn hơn 0.';
            }
        }
        if (!companyName.trim()) newErrors.companyName = 'Tên công ty/tổ chức là bắt buộc.';
        if (!contactPhone.trim()) newErrors.contactPhone = 'Số điện thoại là bắt buộc.';
        const phoneDigits = contactPhone.replace(/\D/g, '');
        if (phoneDigits.length < PHONE_MIN_LEN || phoneDigits.length > PHONE_MAX_LEN) {
            newErrors.contactPhone = `Số điện thoại phải từ ${PHONE_MIN_LEN}-${PHONE_MAX_LEN} số.`;
        }
        if (!deadline.trim()) newErrors.deadline = 'Hạn nhận hồ sơ là bắt buộc.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setSuccess({ type: 'error', message: 'Vui lòng điền các trường bắt buộc.' });
            return;
        }

        const normalizedLatitude = normalizeCoord(latitude);
        const normalizedLongitude = normalizeCoord(longitude);

        const payload = {
            title: title.trim(),
            description: description.trim(),
            requirements: requirements.trim(),
            benefits: benefits.trim(),
            location: location.trim(),
            latitude: normalizedLatitude,
            longitude: normalizedLongitude,
            salary: Number(salary),
            jobType,
            deadline: new Date(deadline).toISOString(),
            skills: skills.trim(),
            companyName: companyName.trim(),
            salaryUnit,
            workingHours: isFlexibleHours ? 'Linh hoạt' : formatWorkingHours(startTime, endTime),
            workingDays: formatWorkingDaysForAPI(selectedDays),
            workMode,
            categoryId: categoryId || null,
            maxApplicants: maxApplicants ? Number(maxApplicants) : null,
            contactPhone: contactPhone.replace(/\D/g, '').slice(0, PHONE_MAX_LEN),
        };

        setSaving(true);
        try {
            // Nếu job đã CLOSED hoặc REJECTED, tạo job mới thay vì update
            const shouldCreateNew = mode === 'edit' && jobId && (jobStatus === 'CLOSED' || jobStatus === 'REJECTED');
            const res = (mode === 'edit' && jobId && !shouldCreateNew) ? await updateJob(jobId, payload) : await createJob(payload);
            const ok = res?.data?.code === 1000 || res?.status === 200 || res?.status === 201;

            if (ok) {
                const message = shouldCreateNew
                    ? 'Đã đăng lại tin tuyển dụng thành công.'
                    : (mode === 'edit' ? 'Đã cập nhật tin.' : 'Đã đăng tin thành công.');
                setSuccess({ type: 'success', message });
                reset();
                setErrors({});
                if (onDone) onDone();
            } else {
                setSuccess({ type: 'error', message: res?.data?.message || 'Tạo tin thất bại.' });
            }
        } catch (err) {
            setSuccess({ type: 'error', message: err?.response?.data?.message || 'Có lỗi khi gọi API.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page header card */}
            <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight">
                            {mode === 'edit'
                                ? (jobStatus === 'CLOSED' || jobStatus === 'REJECTED'
                                    ? 'Chỉnh sửa và đăng lại tin tuyển dụng'
                                    : 'Cập nhật tin tuyển dụng')
                                : mode === 'view'
                                    ? 'Chi tiết tin tuyển dụng'
                                    : 'Đăng tin tuyển dụng'}
                        </h1>
                        <p className="text-gray-500 mt-2">
                            {mode === 'edit' && (jobStatus === 'CLOSED' || jobStatus === 'REJECTED')
                                ? 'Tin này sẽ được đăng lại như một tin mới sau khi chỉnh sửa.'
                                : mode === 'view'
                                    ? 'Xem chi tiết thông tin tin tuyển dụng'
                                    : 'Điền thông tin chính xác giúp ứng viên dễ dàng tìm thấy và ứng tuyển.'}
                        </p>
                    </div>
                    <span className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-sm font-medium border border-indigo-100">
                        {mode === 'view' ? 'Chế độ xem' : mode === 'edit' ? 'Chế độ chỉnh sửa' : 'Chế độ tạo mới'}
                    </span>
                </div>
            </div>

            {/* Main content card */}
            <div className="bg-white rounded-lg shadow p-6">
                {success && (
                    <div className={`mb-6 px-4 py-2.5 rounded-lg border ${success.type === 'success'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        {success.message}
                    </div>
                )}

                {mode === 'edit' && !loaded && (
                    <div className="mb-4 text-sm text-gray-500">Đang tải dữ liệu công việc...</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề <span className="text-red-500">*</span></label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                disabled={mode === 'view' || (mode === 'edit' && !loaded)}
                                className={`block w-full border rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.title ? 'border-red-300' : 'border-gray-200'}`}
                                placeholder="VD: Frontend Developer"
                            />
                            {errors.title && <div className="text-xs text-red-600 mt-1">{errors.title}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm <span className="text-red-500">*</span></label>
                            <button
                                type="button"
                                onClick={() => {
                                    if (mode === 'view' || (mode === 'edit' && !loaded)) return;
                                    setIsLocationModalOpen(true);
                                }}
                                disabled={mode === 'view' || (mode === 'edit' && !loaded)}
                                className={`block w-full border rounded-lg px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.location ? 'border-red-300' : 'border-gray-200'
                                    } ${mode === 'view' || (mode === 'edit' && !loaded)
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : location
                                            ? 'bg-white text-gray-700 hover:border-indigo-300 cursor-pointer'
                                            : 'bg-white text-gray-500 hover:border-indigo-300 cursor-pointer'
                                    }`}
                            >
                                {location || 'Chọn địa điểm...'}
                            </button>
                            {errors.location && <div className="text-xs text-red-600 mt-1">{errors.location}</div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mức lương (VND) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                min="0"
                                value={salary}
                                onChange={e => setSalary(e.target.value)}
                                disabled={mode === 'view' || (mode === 'edit' && !loaded)}
                                className={`block w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.salary ? 'border-red-300' : 'border-gray-200'}`}
                                placeholder="VD: 250000"
                            />
                            {errors.salary && <div className="text-xs text-red-600 mt-1">{errors.salary}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Đơn vị lương</label>
                            <div
                                ref={salaryUnitSelectRef}
                                className={`relative ${salaryUnitDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!salaryUnitDisabled) setSalaryUnitOpen(prev => !prev);
                                    }}
                                    onKeyDown={e => {
                                        if (!salaryUnitDisabled && (e.key === 'Enter' || e.key === ' ')) {
                                            e.preventDefault();
                                            setSalaryUnitOpen(prev => !prev);
                                        }
                                    }}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white flex items-center justify-between gap-3"
                                    disabled={salaryUnitDisabled}
                                    aria-haspopup="listbox"
                                    aria-expanded={salaryUnitOpen}
                                >
                                    <span className="truncate">{salaryUnitLabel}</span>
                                    <svg
                                        className={`w-4 h-4 text-gray-500 transition-transform ${salaryUnitOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {salaryUnitOpen && (
                                    <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {SALARY_UNIT_OPTIONS.map(option => {
                                            const active = option.value === salaryUnit;
                                            return (
                                                <button
                                                    type="button"
                                                    key={option.value}
                                                    onClick={() => {
                                                        setSalaryUnit(option.value);
                                                        setSalaryUnitOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${active ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}`}
                                                >
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hình thức</label>
                            <select value={jobType} onChange={e => setJobType(e.target.value)} disabled={mode === 'view' || (mode === 'edit' && !loaded)} className="block w-full border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
                                <option value="PART_TIME">Bán thời gian</option>
                                <option value="FULL_TIME">Toàn thời gian</option>
                                <option value="FREELANCE">Freelance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng ứng viên</label>
                            <input
                                type="number"
                                min="1"
                                value={maxApplicants}
                                onChange={(e) => setMaxApplicants(e.target.value)}
                                disabled={mode === 'view' || (mode === 'edit' && !loaded)}
                                className={`block w-full border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.maxApplicants ? 'border-red-300' : ''}`}
                                placeholder="VD: 5"
                            />
                            {errors.maxApplicants && <div className="text-xs text-red-600 mt-1">{errors.maxApplicants}</div>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hạn nhận hồ sơ <span className="text-red-500">*</span></label>
                        <input
                            type="datetime-local"
                            value={deadline}
                            onChange={e => setDeadline(e.target.value)}
                            disabled={mode === 'view' || (mode === 'edit' && !loaded)}
                            className={`block w-full border rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.deadline ? 'border-red-300' : 'border-gray-200'}`}
                        />
                        {errors.deadline && <div className="text-xs text-red-600 mt-1">{errors.deadline}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả công việc <span className="text-gray-400 text-xs">(mô tả ngắn)</span></label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={mode === 'view' || (mode === 'edit' && !loaded)} rows={6} maxLength={1200} className="block w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Mô tả ngắn về công việc, nhiệm vụ..." />
                        <div className="text-xs text-gray-400 text-right mt-1">{description.length}/1200 ký tự</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Yêu cầu</label>
                            <textarea
                                value={requirements}
                                onChange={e => setRequirements(e.target.value)}
                                disabled={mode === 'view' || (mode === 'edit' && !loaded)}
                                rows={5}
                                className="block w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                placeholder="Ví dụ: Nắm vững React, có thể làm 20h/tuần..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quyền lợi</label>
                            <textarea
                                value={benefits}
                                onChange={e => setBenefits(e.target.value)}
                                disabled={mode === 'view' || (mode === 'edit' && !loaded)}
                                rows={5}
                                className="block w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                placeholder="Ví dụ: Lương thưởng, mentor, thời gian linh hoạt..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kỹ năng (phân tách bởi dấu phẩy)</label>
                            <input
                                value={skills}
                                onChange={e => setSkills(e.target.value)}
                                disabled={mode === 'view' || (mode === 'edit' && !loaded)}
                                className="mt-1 block w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                placeholder="Tiếng Anh, Giao tiếp"
                            />

                            {/* Gợi ý kỹ năng */}
                            {mode !== 'view' && (
                                <div className="mt-3">
                                    <p className="text-xs text-gray-500 mb-2">Gợi ý kỹ năng (click để thêm):</p>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-100 rounded-lg bg-gray-50">
                                        {SKILL_SUGGESTIONS.map((skill, index) => {
                                            const currentSkills = skills.trim();
                                            const skillList = currentSkills ? currentSkills.split(',').map(s => s.trim()) : [];
                                            const isSelected = skillList.includes(skill);

                                            return (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => addSkill(skill)}
                                                    disabled={mode === 'edit' && !loaded}
                                                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${isSelected
                                                        ? 'bg-cyan-600 text-white border-cyan-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                        } ${mode === 'edit' && !loaded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    {skill}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Công ty/Tổ chức <span className="text-red-500">*</span></label>
                            <input value={companyName} onChange={e => setCompanyName(e.target.value)} disabled={mode === 'view' || (mode === 'edit' && !loaded)} className={`mt-1 block w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.companyName ? 'border-red-300' : ''}`} placeholder="Tên công ty" />
                            {errors.companyName && <div className="text-xs text-red-600 mt-1">{errors.companyName}</div>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lịch làm việc</label>
                            <p className="text-xs text-gray-500 mb-3">Chọn các ngày bạn có thể làm việc</p>
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-end mb-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (mode === 'view' || (mode === 'edit' && !loaded)) return;
                                            const allValues = [2, 3, 4, 5, 6, 7, 8];
                                            const allSelected = allValues.every(v => selectedDays.includes(v));
                                            setSelectedDays(allSelected ? [] : allValues);
                                        }}
                                        className="text-xs px-3 py-1 rounded-full border border-cyan-200 text-cyan-700 hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={mode === 'view' || (mode === 'edit' && !loaded)}
                                    >
                                        {([2, 3, 4, 5, 6, 7, 8].every(v => selectedDays.includes(v)) ? 'Bỏ chọn tất cả' : 'Chọn tất cả')}
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {DAY_OPTIONS.map((day) => {
                                        const isChecked = selectedDays.includes(day.value);
                                        const isDisabled = mode === 'view' || (mode === 'edit' && !loaded);
                                        return (
                                            <label
                                                key={day.value}
                                                className={`flex items-center gap-2 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        if (isDisabled) return;
                                                        if (e.target.checked) {
                                                            setSelectedDays([...selectedDays, day.value].sort((a, b) => a - b));
                                                        } else {
                                                            setSelectedDays(selectedDays.filter(d => d !== day.value));
                                                        }
                                                    }}
                                                    disabled={isDisabled}
                                                    className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-700">{day.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Giờ làm việc</label>

                                {/* Preset buttons */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {TIME_PRESETS.map((preset) => {
                                        const isDisabled = mode === 'view' || (mode === 'edit' && !loaded);
                                        const isActive = preset.label === 'Linh hoạt'
                                            ? isFlexibleHours
                                            : (!isFlexibleHours && preset.start && preset.end && startTime === preset.start && endTime === preset.end);
                                        return (
                                            <button
                                                key={preset.label}
                                                type="button"
                                                onClick={() => {
                                                    if (isDisabled) return;
                                                    if (preset.label === 'Linh hoạt') {
                                                        setIsFlexibleHours(true);
                                                        setStartTime('');
                                                        setEndTime('');
                                                    } else {
                                                        setIsFlexibleHours(false);
                                                        setStartTime(preset.start);
                                                        setEndTime(preset.end);
                                                    }
                                                }}
                                                disabled={isDisabled}
                                                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${isActive
                                                    ? 'bg-cyan-600 text-white border-cyan-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                {preset.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Time pickers */}
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">Từ</label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => {
                                                if (mode === 'view' || (mode === 'edit' && !loaded)) return;
                                                setIsFlexibleHours(false);
                                                setStartTime(e.target.value);
                                            }}
                                            disabled={mode === 'view' || (mode === 'edit' && !loaded)}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        />
                                    </div>
                                    <div className="pt-5 text-gray-400">-</div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">Đến</label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => {
                                                if (mode === 'view' || (mode === 'edit' && !loaded)) return;
                                                setIsFlexibleHours(false);
                                                setEndTime(e.target.value);
                                            }}
                                            disabled={mode === 'view' || (mode === 'edit' && !loaded)}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hình thức làm</label>
                                <select value={workMode} onChange={e => setWorkMode(e.target.value)} disabled={mode === 'view' || (mode === 'edit' && !loaded)} className="block w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                                    <option value="ONSITE">Làm tại chỗ</option>
                                    <option value="REMOTE">Từ xa</option>
                                    <option value="HYBRID">Kết hợp</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Lĩnh vực</label>
                            <div
                                ref={categorySelectRef}
                                className={`mt-2 relative ${categoryDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <button
                                    type="button"
                                    disabled={categoryDisabled}
                                    onClick={() => {
                                        if (categoryDisabled) return;
                                        setCategoryDropdownOpen(prev => !prev);
                                    }}
                                    onKeyDown={(e) => {
                                        if (categoryDisabled) return;
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setCategoryDropdownOpen(prev => !prev);
                                        }
                                    }}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white flex items-center justify-between gap-3"
                                >
                                    <span className={`truncate ${categoryName ? 'text-gray-800' : 'text-gray-500'}`}>
                                        {categoryLabel}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 text-gray-500 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {categoryDropdownOpen && (
                                    <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto origin-top">
                                        {categoriesLoading ? (
                                            <div className="px-4 py-2 text-sm text-gray-500">Đang tải...</div>
                                        ) : categories.length > 0 ? (
                                            categories.map((cat) => {
                                                const isSelected = cat.id === categoryId;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={cat.id || cat.name}
                                                        onClick={() => {
                                                            setCategoryId(cat.id);
                                                            setCategoryName(cat.name);
                                                            setCategoryDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${isSelected ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}`}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="px-4 py-2 text-sm text-gray-500">Không có lĩnh vực phù hợp.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {categoriesError && (
                                <div className="text-xs text-red-600 mt-1">{categoriesError}</div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={PHONE_MAX_LEN}
                                value={contactPhone}
                                onChange={e => {
                                    const digits = e.target.value.replace(/\D/g, '').slice(0, PHONE_MAX_LEN);
                                    setContactPhone(digits);
                                }}
                                disabled={mode === 'view' || (mode === 'edit' && !loaded)}
                                className={`block w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${errors.contactPhone ? 'border-red-300' : ''}`}
                                placeholder="0123456789"
                            />
                            {errors.contactPhone && <div className="text-xs text-red-600 mt-1">{errors.contactPhone}</div>}
                        </div>
                    </div>

                    {mode !== 'view' ? (
                        <div className="flex flex-wrap items-center gap-3">
                            <button type="submit" disabled={saving || (mode === 'edit' && !loaded)} className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg hover:from-indigo-600 hover:to-blue-700 disabled:opacity-60 shadow-lg">
                                {saving
                                    ? 'Đang lưu...'
                                    : (mode === 'edit'
                                        ? (loaded
                                            ? (jobStatus === 'CLOSED' || jobStatus === 'REJECTED' ? 'Đăng lại tin' : 'Cập nhật tin')
                                            : 'Đang tải...')
                                        : 'Đăng tin')}
                            </button>
                            <button type="button" onClick={reset} className="inline-flex items-center px-5 py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50">Làm lại</button>
                            {mode === 'edit' && (
                                <button type="button" onClick={() => onDone && onDone()} className="inline-flex items-center px-5 py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50">Quay lại</button>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => onDone && onDone()} className="inline-flex items-center px-5 py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50">Quay lại</button>
                        </div>
                    )}
                </form>

                <div className="mt-6 pt-6 text-sm text-gray-500 border-t border-gray-100">
                    Tin đăng sau khi tạo sẽ xuất hiện trong mục <span className="font-medium text-gray-700">Quản lý tin tuyển dụng</span>. Bạn có thể chỉnh sửa hoặc theo dõi trạng thái duyệt tại đó.
                </div>
            </div>

            <LocationPickerModal
                open={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                defaultQuery={location}
                onSelect={(address, lat, lon) => {
                    setLocation(address || '');
                    setLatitude(normalizeCoord(lat));
                    setLongitude(normalizeCoord(lon));
                    setIsLocationModalOpen(false);
                }}
                hereApiKey={HERE_API_KEY}
            />
        </div>
    );
};

export default EmployerPost;
