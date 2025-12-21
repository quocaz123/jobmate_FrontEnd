import React, { useState } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { submitReport } from "../../services/reportService";
import { showWarning } from "../../utils/toast";

const ReportModal = ({ isOpen, onClose, targetType, targetId, targetTitle }) => {
    
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason.trim()) {
            showWarning("Vui lòng nhập lý do báo cáo");
            return;
        }

        try {
            setIsSubmitting(true);
            await submitReport({
                targetType: targetType,
                targetId: targetId,
                reason: reason.trim()
            });

            setIsSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error) {
            showWarning(error?.response?.data?.message || "Không thể gửi báo cáo. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setReason("");
            setIsSuccess(false);
            onClose();
        }
    };

    if (!isOpen) {
        return null;
    }
    const getTargetTypeLabel = () => {
        switch (targetType) {
            case "JOB":
                return "công việc";
            case "USER":
                return "người dùng";
            case "RATING":
                return "đánh giá";
            default:
                return "nội dung";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold">Báo cáo {getTargetTypeLabel()}</h2>
                        {targetTitle && (
                            <p className="text-sm text-gray-500 mt-1">{targetTitle}</p>
                        )}
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
                            <h3 className="text-lg font-semibold mb-2">Báo cáo thành công!</h3>
                            <p className="text-gray-600 mb-6">
                                Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.
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
                            {/* Info Note */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-blue-800">
                                        <strong>Lưu ý:</strong> Báo cáo của bạn sẽ được xem xét bởi đội ngũ quản trị viên. 
                                        Vui lòng cung cấp thông tin chính xác và chi tiết để chúng tôi có thể xử lý tốt nhất.
                                    </p>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="space-y-3">
                                <h4 className="font-medium">Lý do báo cáo *</h4>
                                <textarea
                                    placeholder="Vui lòng mô tả chi tiết lý do bạn báo cáo nội dung này..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full min-h-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    maxLength={1000}
                                />
                                <p className="text-xs text-gray-400">{reason.length}/1000 ký tự</p>
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
                                    disabled={isSubmitting || !reason.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin">⏳</span> Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={16} /> Gửi báo cáo
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportModal;

