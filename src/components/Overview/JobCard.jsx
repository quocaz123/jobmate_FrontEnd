import React from "react";
import { MapPin, Clock, Star, Users } from "lucide-react";

export default function JobCard({ job }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-700 font-bold">
            {job.logoText}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {job.title}
            </h3>
            <p className="text-gray-500 text-sm">{job.company}</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1 text-sm text-gray-600 mb-3">
        <p className="flex items-center gap-2">
          <MapPin size={16} /> {job.location} • Cách {job.distance}km
        </p>
        <p className="flex items-center gap-2">
          <Clock size={16} /> {job.time}
        </p>
        <p className="flex items-center gap-2">
          <Star size={16} className="text-yellow-500" />
          {job.rating} ({job.reviews} đánh giá)
        </p>
        <p className="flex items-center gap-2">
          <Users size={16} /> {job.applicants} người ứng tuyển
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.tags.map((tag, i) => (
          <span
            key={i}
            className={`px-3 py-1 rounded-md text-xs border ${tag === "Đã xác minh"
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <p className="text-lg font-bold text-gray-900">{job.salary}</p>
        <div className="flex gap-2">
          <button className="border text-gray-500 border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition">
            Chi tiết
          </button>
          <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition">
            Ứng tuyển
          </button>
        </div>
      </div>
    </div>
  );
}