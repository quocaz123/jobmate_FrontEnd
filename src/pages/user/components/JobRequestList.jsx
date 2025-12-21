import React from "react";
import { Activity, Calendar, Clock, DollarSign, MapPin, X } from "lucide-react";
import { formatWorkingDaysForDisplay } from "../../../utils/scheduleUtils";

const STATUS_STYLES = {
  PENDING: {
    className: "bg-amber-100 text-amber-700",
    label: "Đang chờ",
  },
  MATCHED: {
    className: "bg-emerald-100 text-emerald-700",
    label: "Đã kết nối",
  },
  CLOSED: {
    className: "bg-gray-100 text-gray-600",
    label: "Đã đóng",
  },
};

const JobRequestList = ({
  requests,
  loading,
  maxRequests,
  selectedWaitingListId,
  onSelect,
  onClose,
  formatSalary,
  formatDate,
  getJobTypeLabel,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 text-center text-gray-500">
        Đang tải...
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 text-center text-gray-500">
        <Activity size={32} className="mx-auto mb-2 text-indigo-400" />
        <p>Bạn chưa có yêu cầu tìm việc nào.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
      <h2 className="text-lg font-medium text-indigo-700 mb-4">
        Danh sách yêu cầu đã tạo ({requests.length}/{maxRequests})
      </h2>
      <div className="space-y-4">
        {requests.map((request, index) => (
          <div
            key={request.id || index}
            className={`border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${selectedWaitingListId === request.id ? "border-indigo-400 shadow-md bg-indigo-50/30" : "border-gray-200"
              }`}
            onClick={() => onSelect(request.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                    {getJobTypeLabel(request.jobType)}
                  </span>
                  {request.status && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[request.status]?.className || "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {STATUS_STYLES[request.status]?.label || request.status}
                    </span>
                  )}
                  {request.createdAt && (
                    <span className="text-xs text-gray-500">{formatDate(request.createdAt)}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="text-gray-600">Lương tối thiểu:</span>
                    <span className="font-medium">
                      {formatSalary(request.expectedMinSalary, request.expectedSalaryUnit || request.salaryUnit)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-600">Bán kính:</span>
                    <span className="font-medium">{request.searchRadius || "—"} km</span>
                  </div>
                  {request.availableDays && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-600">Ngày làm việc:</span>
                      <span className="font-medium">{formatWorkingDaysForDisplay(request.availableDays)}</span>
                    </div>
                  )}
                  {request.availableTime && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="font-medium">{request.availableTime}</span>
                    </div>
                  )}
                </div>

                {request.skills && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-600">Kỹ năng: </span>
                    <div className="inline-flex flex-wrap gap-1 mt-1">
                      {request.skills.split(";").map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {request.note && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                    <span className="font-medium">Ghi chú: </span>
                    {request.note}
                  </div>
                )}
              </div>
              <div className="ml-4">
                {request.status !== "CLOSED" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose(request.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Đóng yêu cầu"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(request.id);
                  }}
                  className="mt-2 px-3 py-1 rounded-full text-xs border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  Xem gợi ý
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobRequestList;

