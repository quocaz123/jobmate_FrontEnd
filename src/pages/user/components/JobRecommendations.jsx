import React from "react";
import { Activity, MapPin, DollarSign, Clock, Zap } from "lucide-react";
import { formatWorkingDaysForDisplay } from "../../../utils/scheduleUtils";

const JobRecommendations = ({
  loading,
  error,
  selectedWaitingListId,
  recommendedJobs,
  formatJobSalary,
  onViewDetail,
}) => {

  const renderBody = () => {
    if (loading) {
      return <div className="text-center py-4 text-gray-500 text-sm">Đang tải...</div>;
    }

    if (error) {
      return <div className="text-center py-4 text-red-500 text-sm">{error}</div>;
    }

    if (selectedWaitingListId === null) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          <Activity size={24} className="mx-auto mb-2 text-indigo-400" />
          Chọn một yêu cầu tìm việc để xem gợi ý
        </div>
      );
    }

    if (!recommendedJobs.length) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          <Activity size={24} className="mx-auto mb-2 text-indigo-400" />
          Chưa có gợi ý phù hợp
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {recommendedJobs.map((job) => (
          <div key={job.id} className="p-3 border border-indigo-50 rounded-lg hover:shadow transition bg-white">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-800 mb-1">{job.title}</h4>
                <p className="text-xs text-gray-500 mb-2">{job.companyName || job.company || "—"}</p>
              </div>
              {job.score && (
                <div className="flex items-center gap-1 ml-2">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs font-semibold text-yellow-600">{Math.round(job.score)}%</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {job.location || (job.scheduleDays ? formatWorkingDaysForDisplay(job.scheduleDays) : "—")}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign size={12} />
                {formatJobSalary(job.salary, job.salaryUnit)}
              </span>
              {job.distance !== undefined && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {job.distance?.toFixed ? `${job.distance.toFixed(2)} km` : `${job.distance} km`}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {job.scheduleTime || job.description?.slice(0, 40) || ""}
              </span>
              <button
                onClick={() => onViewDetail(job.id)}
                className="px-2 py-1 rounded-md bg-indigo-600 text-white text-xs hover:bg-indigo-700"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <aside className="lg:col-span-1 sticky top-6 space-y-4" style={{ alignSelf: "flex-start" }}>
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4">
        <h3 className="text-sm font-medium text-indigo-700 mb-3">Gợi ý công việc</h3>
        {renderBody()}
      </div>
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 text-center text-xs text-gray-500">
        <Activity size={16} className="mx-auto mb-1 text-indigo-400" />
        Gợi ý dựa trên kỹ năng và loại công việc bạn chọn.
      </div>
    </aside>
  );
};

export default JobRecommendations;

