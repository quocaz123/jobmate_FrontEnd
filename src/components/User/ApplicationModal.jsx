import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, FileText, Check, X } from "lucide-react";
import { applyJob } from "../../services/applicationService";
import { showError, showWarning } from "../../utils/toast";

const ApplicationModal = ({ isOpen, onClose, jobTitle, jobId, onSuccess, userInfo }) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [selectedResume, setSelectedResume] = useState(null); // "profile" | "upload" | null
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_BYTES = 20 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/png", "image/jpg", "image/jpeg", "application/pdf"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      showWarning("Chỉ chấp nhận file .png, .jpg, .jpeg hoặc .pdf (tối đa 20MB).");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      showWarning("Kích thước file tối đa 20MB.");
      e.target.value = "";
      return;
    }

    setUploadedFile(file);
    setSelectedResume("upload");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      // Xác định resume file và useProfileResume
      let resumeFileToSend = null;
      let useProfileResume = false;

      if (selectedResume === "upload" && uploadedFile) {
        resumeFileToSend = uploadedFile;
        useProfileResume = false;
      } else if (selectedResume === "profile") {
        if (!hasResume) {
          setIsSubmitting(false);
          showWarning("Vui lòng tải lên CV trong hồ sơ trước khi sử dụng tùy chọn này.");
          return;
        }
        resumeFileToSend = null;
        useProfileResume = true;
      }

      // Gọi API apply job
      const response = await applyJob(
        jobId,
        coverLetter || null,
        resumeFileToSend,
        useProfileResume
      );


      setIsSubmitting(false);
      setIsSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => handleClose(), 2000);
    } catch (error) {
      console.error("Lỗi khi ứng tuyển:", error);
      setIsSubmitting(false);
      showError(error?.response?.data?.message || "Có lỗi xảy ra khi ứng tuyển. Vui lòng thử lại.");
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCoverLetter("");
      setSelectedResume(null);
      setUploadedFile(null);
      setIsSuccess(false);
      onClose();
    }
  };

  // Lấy thông tin resume từ userInfo
  const profileResume = userInfo?.resume || null;
  const hasResume = Boolean(
    profileResume &&
    (profileResume.fileName || profileResume.id)
  );

  useEffect(() => {
    if (isOpen && hasResume) {
      setSelectedResume("profile");
    } else if (isOpen && !hasResume) {
      setSelectedResume(null);
    }
  }, [isOpen, hasResume]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Ứng tuyển vị trí</h2>
            <p className="text-sm text-gray-500 mt-1">{jobTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ứng tuyển thành công!</h3>
              <p className="text-gray-600 mb-6">
                Nhà tuyển dụng sẽ liên hệ với bạn trong thời gian sớm nhất.
              </p>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resume Selection */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CV của bạn
                </h4>

                {/* Use Profile CV */}
                {hasResume ? (
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedResume === "profile"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                      }`}
                    onClick={() => {
                      if (!hasResume) return;
                      setSelectedResume(selectedResume === "profile" ? null : "profile");
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="resume"
                        value="profile"
                        checked={selectedResume === "profile"}
                        onChange={() => {
                          if (!hasResume) return;
                          setSelectedResume(selectedResume === "profile" ? null : "profile");
                        }}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                        disabled={!hasResume}
                      />
                      <div className="flex-1">
                        <p className="font-medium">Sử dụng CV từ hồ sơ</p>
                        <p className="text-sm text-gray-500 truncate">
                          {profileResume?.fileName || "Chưa cập nhật tên tệp"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Cập nhật:{" "}
                          {profileResume?.createdAt
                            ? new Date(profileResume.createdAt).toLocaleDateString("vi-VN")
                            : "Không xác định"}
                        </p>
                      </div>
                      {selectedResume === "profile" && (
                        <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm">
                    Bạn chưa tải lên CV trong hồ sơ. Vui lòng cập nhật CV ở trang Hồ sơ trước
                    khi sử dụng tùy chọn này.
                  </div>
                )}

                {/* Upload CV */}
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedResume === "upload"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                    }`}
                  onClick={(e) => {
                    if (e.target.type === "radio") return;
                    if (selectedResume === "upload") {
                      setSelectedResume(null);
                      setUploadedFile(null);
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="resume"
                      value="upload"
                      checked={selectedResume === "upload"}
                      onChange={() =>
                        setSelectedResume(selectedResume === "upload" ? null : "upload")
                      }
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <p className="font-medium">Tải lên CV mới</p>
                      {uploadedFile ? (
                        <>
                          <p className="text-sm text-gray-500">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-400">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Kéo thả file hoặc bấm để chọn (PDF, DOC, DOCX)
                        </p>
                      )}
                    </div>
                    {selectedResume === "upload" && (
                      <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Cover Letter */}
              <div className="space-y-3">
                <h4 className="font-medium">Thư xin việc (không bắt buộc)</h4>
                <textarea
                  placeholder="Chia sẻ tại sao bạn quan tâm đến vị trí này..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full min-h-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-400">{coverLetter.length}/1000 ký tự</p>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Mẹo:</p>
                  <p className="text-blue-800">
                    Viết thư xin việc cá nhân hoá sẽ tăng khả năng được phỏng vấn. Hãy nêu rõ
                    lý do bạn quan tâm đến công ty và vị trí này.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Đang gửi..." : "Ứng tuyển"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
