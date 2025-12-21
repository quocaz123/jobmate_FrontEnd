import React, { useState, useEffect } from "react";
import { Briefcase, CalendarDays, Clock, DollarSign } from "lucide-react";
import {
    DAY_OPTIONS,
    TIME_PRESETS,
    parseWorkingDays,
    formatWorkingDays,
    formatWorkingDaysForAPI,
    parseWorkingHours,
    formatWorkingHours,
    isFlexibleLabel,
} from "../../../utils/scheduleUtils";
import { SALARY_UNIT_OPTIONS, SALARY_UNIT_LABELS } from "../../../constants/salaryUnits";

const ALL_DAY_VALUES = DAY_OPTIONS.map((day) => day.value);

const CareerInfoTab = ({ profile, isEditing, handleChange }) => {
    const [salaryInput, setSalaryInput] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isFlexibleHours, setIsFlexibleHours] = useState(false);

    useEffect(() => {
        if (profile.preferredMinSalary !== null && profile.preferredMinSalary !== undefined) {
            setSalaryInput(String(profile.preferredMinSalary));
        } else {
            setSalaryInput("");
        }
    }, [profile.preferredMinSalary]);

    useEffect(() => {
        setSelectedDays(parseWorkingDays(profile.availableDays));
    }, [profile.availableDays]);

    useEffect(() => {
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
    }, [profile.availableTime]);

    const updateAvailableDays = (days) => {
        setSelectedDays(days);
        if (isEditing) {
            handleChange({
                target: {
                    name: "availableDays",
                    value: formatWorkingDaysForAPI(days),
                },
            });
        }
    };

    const updateAvailableTime = (nextStart, nextEnd, flexible) => {
        setIsFlexibleHours(flexible);
        setStartTime(nextStart);
        setEndTime(nextEnd);
        if (isEditing) {
            handleChange({
                target: {
                    name: "availableTime",
                    value: flexible ? "Linh hoạt" : formatWorkingHours(nextStart, nextEnd),
                },
            });
        }
    };

    const dayLabelMap = DAY_OPTIONS.reduce((acc, day) => {
        acc[day.value] = day.label;
        return acc;
    }, {});

    const displayDays = selectedDays.length > 0 ? formatWorkingDays(selectedDays) : "";
    const displayTime = isFlexibleHours ? "Linh hoạt" : formatWorkingHours(startTime, endTime);

    return (
        <div>
            <h3 className="font-semibold text-gray-800 mb-4">Thông tin việc làm mong muốn</h3>

            <div className="space-y-4">
                {/* Loại công việc mong muốn */}
                <div>
                    <label className="text-sm text-gray-500 mb-2 block flex items-center gap-2">
                        <Briefcase className="text-blue-500 h-4 w-4" />
                        Loại công việc mong muốn
                    </label>
                    {isEditing ? (
                        <select
                            name="preferredJobType"
                            value={profile.preferredJobType || ""}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 text-gray-700 bg-gray-50"
                        >
                            <option value="">Chọn loại công việc</option>
                            <option value="FULL_TIME">Toàn thời gian</option>
                            <option value="PART_TIME">Bán thời gian</option>
                            <option value="FREELANCE">Freelance</option>
                        </select>
                    ) : (
                        <p className="font-medium text-gray-800">
                            {profile.preferredJobType === "FULL_TIME" ? "Toàn thời gian" :
                                profile.preferredJobType === "PART_TIME" ? "Bán thời gian" :
                                    profile.preferredJobType === "FREELANCE" ? "Freelance" :
                                        "Chưa cập nhật"}
                        </p>
                    )}
                </div>

                {/* Ngày có thể làm việc */}
                <div>
                    <label className="text-sm text-gray-500 mb-2 block flex items-center gap-2">
                        <CalendarDays className="text-green-500 h-4 w-4" />
                        Ngày có thể làm việc
                    </label>
                    {isEditing ? (
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Đang chọn: {formatWorkingDays(selectedDays) || "Chưa chọn"}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const allSelected = ALL_DAY_VALUES.every((v) =>
                                            selectedDays.includes(v)
                                        );
                                        updateAvailableDays(allSelected ? [] : ALL_DAY_VALUES);
                                    }}
                                    className="px-3 py-1 rounded-full border border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                                >
                                    {ALL_DAY_VALUES.every((v) => selectedDays.includes(v)) ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                                </button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {DAY_OPTIONS.map((day) => {
                                    const checked = selectedDays.includes(day.value);
                                    return (
                                        <label key={day.value} className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    const next = e.target.checked
                                                        ? [...selectedDays, day.value].sort((a, b) => a - b)
                                                        : selectedDays.filter((d) => d !== day.value);
                                                    updateAvailableDays(next);
                                                }}
                                                className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                            />
                                            <span>{day.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        displayDays ? (
                            <div className="flex flex-wrap gap-2">
                                {selectedDays.map((value) => (
                                    <span
                                        key={value}
                                        className="px-3 py-1 rounded-full border border-cyan-200 text-sm text-cyan-700 bg-cyan-50"
                                    >
                                        {dayLabelMap[value] || `Thứ ${value}`}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="font-medium text-gray-800">Chưa cập nhật</p>
                        )
                    )}
                </div>

                {/* Khung giờ làm việc */}
                <div>
                    <label className="text-sm text-gray-500 mb-2 block flex items-center gap-2">
                        <Clock className="text-orange-500 h-4 w-4" />
                        Khung giờ làm việc
                    </label>
                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {TIME_PRESETS.map((preset) => {
                                    const isActive = preset.label === "Linh hoạt"
                                        ? isFlexibleHours
                                        : (!isFlexibleHours &&
                                            preset.start &&
                                            preset.end &&
                                            startTime === preset.start &&
                                            endTime === preset.end);
                                    return (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => {
                                                if (preset.label === "Linh hoạt") {
                                                    updateAvailableTime("", "", true);
                                                } else {
                                                    updateAvailableTime(preset.start, preset.end, false);
                                                }
                                            }}
                                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${isActive
                                                ? "bg-cyan-600 text-white border-cyan-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            {preset.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Từ</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => updateAvailableTime(e.target.value, endTime, false)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-200"
                                    />
                                </div>
                                <div className="pt-5 text-gray-400">-</div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Đến</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => updateAvailableTime(startTime, e.target.value, false)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-200"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                {isFlexibleHours
                                    ? "Đang chọn: Linh hoạt"
                                    : formatWorkingHours(startTime, endTime) || "Chưa chọn"}
                            </p>
                        </div>
                    ) : (
                        displayTime ? (
                            <div className="text-sm font-medium text-gray-800">
                                {displayTime}
                            </div>
                        ) : (
                            <p className="font-medium text-gray-800">Chưa cập nhật</p>
                        )
                    )}
                </div>

                {/* Mức lương tối thiểu mong muốn */}
                <div>
                    <label className="text-sm text-gray-500 mb-2 block flex items-center gap-2">
                        <DollarSign className="text-purple-500 h-4 w-4" />
                        Mức lương tối thiểu mong muốn
                    </label>
                    {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <input
                                    type="text"
                                    name="preferredMinSalary"
                                    value={salaryInput}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        // Cho phép nhập số hoặc rỗng
                                        if (inputValue === "" || /^\d+$/.test(inputValue)) {
                                            setSalaryInput(inputValue); // Update local state immediately
                                            const numValue = inputValue === "" ? null : Number(inputValue);
                                            handleChange({
                                                target: {
                                                    name: "preferredMinSalary",
                                                    value: numValue
                                                }
                                            });
                                        }
                                    }}
                                    placeholder="VD: 50000"
                                    className="w-full border rounded-lg p-2 text-gray-700 bg-gray-50"
                                />
                            </div>
                            <div>
                                <select
                                    name="preferredSalaryUnit"
                                    value={profile.preferredSalaryUnit || "VND_PER_HOUR"}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 text-gray-700 bg-gray-50"
                                >
                                    {SALARY_UNIT_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <p className="font-medium text-gray-800">
                            {profile.preferredMinSalary
                                ? `${new Intl.NumberFormat("vi-VN").format(profile.preferredMinSalary)}đ · ${SALARY_UNIT_LABELS[profile.preferredSalaryUnit] || profile.preferredSalaryUnit || "VND"}`
                                : "Chưa cập nhật"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CareerInfoTab;
