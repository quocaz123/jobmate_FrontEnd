import React from "react";
import { MapPin, DollarSign, Plus, X } from "lucide-react";
import { showWarning } from "../../../utils/toast";
import {
  DAY_OPTIONS,
  TIME_PRESETS,
  formatWorkingDays,
  formatWorkingHours,
} from "../../../utils/scheduleUtils";

const JobRequestForm = ({
  show,
  jobType,
  setJobType,
  jobTypeOptions,
  expectedMinSalary,
  setExpectedMinSalary,
  expectedSalaryUnit,
  setExpectedSalaryUnit,
  salaryUnitOptions,
  skills,
  skillInput,
  setSkillInput,
  addSkill,
  removeSkill,
  skillSuggestions = [],
  searchRadius,
  setSearchRadius,
  location,
  selectedDays,
  setSelectedDays,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  isFlexibleHours,
  setIsFlexibleHours,
  note,
  setNote,
  userProfile,
  loading,
  myRequestsLength,
  maxRequests,
  handleCreate,
}) => {
  if (!show) return null;

  return (
    <form
      onSubmit={handleCreate}
      className="lg:col-span-2 bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium text-indigo-700">Tạo yêu cầu tìm việc mới</h2>
        <span className="text-sm text-gray-500">
          {myRequestsLength}/{maxRequests} yêu cầu
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Loại công việc *</label>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full border border-indigo-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300"
            required
          >
            {jobTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Lương tối thiểu (VND) *</label>
          <input
            type="number"
            value={expectedMinSalary}
            onChange={(e) => setExpectedMinSalary(e.target.value)}
            placeholder="15000000"
            min="0"
            className="w-full border border-indigo-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Đơn vị lương mong muốn *</label>
          <select
            value={expectedSalaryUnit}
            onChange={(e) => setExpectedSalaryUnit(e.target.value)}
            className="w-full border border-indigo-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300"
          >
            {salaryUnitOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Kỹ năng *</label>
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Nhập kỹ năng..."
            className="flex-1 border border-indigo-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="button"
            onClick={addSkill}
            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {skills.map((s, i) => (
            <div
              key={`${s}-${i}`}
              className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1 text-xs"
            >
              {s}
              <button
                type="button"
                onClick={() => removeSkill(i)}
                className="text-indigo-500 hover:text-indigo-700"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        {skillSuggestions.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] text-gray-500 mb-2">Gợi ý kỹ năng (bấm để thêm):</p>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto border border-indigo-50 rounded-lg p-2 bg-indigo-50/40">
              {skillSuggestions.map((suggestion) => {
                const isSelected = skills.includes(suggestion);
                return (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addSkill(suggestion)}
                    className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${isSelected
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {suggestion}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Bán kính (km) *</label>
          <input
            type="number"
            value={searchRadius}
            onChange={(e) => setSearchRadius(e.target.value)}
            min="1"
            max="100"
            className="w-full border border-indigo-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Vị trí *</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={location}
              placeholder="Địa chỉ từ hồ sơ..."
              readOnly
              className="flex-1 border border-indigo-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600"
              onClick={() => {
                if (!userProfile?.address) {
                  showWarning("Vui lòng cập nhật vị trí trong hồ sơ trước khi tạo yêu cầu.");
                }
              }}
              required
            />
            <MapPin size={16} className="text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Ngày làm việc</label>
          <div className="border border-indigo-100 rounded-lg p-4 bg-indigo-50/30 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Đang chọn: {formatWorkingDays(selectedDays) || "Chưa chọn"}</span>
              <button
                type="button"
                onClick={() => {
                  const allSelected = DAY_OPTIONS.every((day) => selectedDays.includes(day.value));
                  setSelectedDays(allSelected ? [] : DAY_OPTIONS.map((day) => day.value));
                }}
                className="px-3 py-1 rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
              >
                {DAY_OPTIONS.every((day) => selectedDays.includes(day.value)) ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
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
                        setSelectedDays(next);
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{day.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Thời gian</label>
          <div className="border border-indigo-100 rounded-lg p-4 bg-indigo-50/30 space-y-3">
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
                        setIsFlexibleHours(true);
                        setStartTime("");
                        setEndTime("");
                      } else {
                        setIsFlexibleHours(false);
                        setStartTime(preset.start);
                        setEndTime(preset.end);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${isActive
                      ? "bg-indigo-600 text-white border-indigo-600"
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
                  onChange={(e) => {
                    setIsFlexibleHours(false);
                    setStartTime(e.target.value);
                  }}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="pt-5 text-gray-400">-</div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Đến</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setIsFlexibleHours(false);
                    setEndTime(e.target.value);
                  }}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {isFlexibleHours
                ? "Đang chọn: Linh hoạt"
                : formatWorkingHours(startTime, endTime) || "Chưa chọn"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tìm việc Java developer..."
          rows={2}
          className="w-full border border-indigo-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 resize-none"
        />
      </div>

      {!userProfile?.address && (
        <p className="text-xs text-amber-600">⚠️ Vui lòng cập nhật địa chỉ trong hồ sơ của bạn.</p>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={loading || myRequestsLength >= maxRequests}
          className="px-6 py-2 rounded-full text-white bg-gradient-to-r from-indigo-600 to-blue-500 shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? "Đang tạo..." : "Tạo yêu cầu"}
        </button>
        {myRequestsLength >= maxRequests && (
          <span className="text-xs text-amber-600">Đã đạt giới hạn {maxRequests} yêu cầu</span>
        )}
      </div>
    </form>
  );
};

export default JobRequestForm;

