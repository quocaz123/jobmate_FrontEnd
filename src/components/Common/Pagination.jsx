import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, onChangePage }) => {
  if (totalPages <= 1) return null;

  const handleClick = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== page) {
      onChangePage(newPage);
    }
  };

  return (
    <div className="flex items-center justify-end p-3 border-t bg-white">
      <button
        onClick={() => handleClick(page - 1)}
        disabled={page === 0}
        className={`p-2 rounded-md border ${
          page === 0
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-100 text-gray-700"
        }`}
      >
        <ChevronLeft size={18} />
      </button>

      <span className="mx-3 text-sm text-gray-700">
        Trang <span className="font-semibold">{page + 1}</span> / {totalPages}
      </span>

      <button
        onClick={() => handleClick(page + 1)}
        disabled={page === totalPages - 1}
        className={`p-2 rounded-md border ${
          page === totalPages - 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-100 text-gray-700"
        }`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
