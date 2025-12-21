import React, { useState } from "react";
import { Star, X, Check } from "lucide-react";
import { createRating } from "../../services/ratingService";
import { showSuccess, showWarning } from "../../utils/toast";

const RatingModal = ({ isOpen, onClose, jobTitle, jobId, employerId, employerName, onSuccess, isEmployerRating = false }) => {
    const [score, setScore] = useState(0);
    const [hoveredScore, setHoveredScore] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (score < 1 || score > 5) {
            showWarning("Vui lòng chọn điểm đánh giá từ 1 đến 5 sao");
            return;
        }

        if (!employerId) {
            showWarning(isEmployerRating ? "Không tìm thấy thông tin ứng viên" : "Không tìm thấy thông tin nhà tuyển dụng");
            return;
        }

        try {
            setIsSubmitting(true);
            await createRating({
                toUserId: employerId,
                jobId: jobId,
                score: score,
                comment: comment.trim() || null
            });

            setIsSuccess(true);
            if (onSuccess) onSuccess();

            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error) {
            showWarning(error?.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setScore(0);
            setHoveredScore(0);
            setComment("");
            setIsSuccess(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold">{isEmployerRating ? "Đánh giá ứng viên" : "Đánh giá công việc"}</h2>
                        <p className="text-sm text-gray-500 mt-1">{jobTitle}</p>
                        {employerName && (
                            <p className="text-xs text-gray-400 mt-1">
                                {isEmployerRating ? `Ứng viên: ${employerName}` : `Nhà tuyển dụng: ${employerName}`}
                            </p>
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
                            <h3 className="text-lg font-semibold mb-2">Đánh giá thành công!</h3>
                            <p className="text-gray-600 mb-6">
                                {isEmployerRating ? "Cảm ơn bạn đã đánh giá ứng viên này." : "Cảm ơn bạn đã đánh giá công việc này."}
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
                            {/* Rating Stars */}
                            <div className="space-y-3">
                                <h4 className="font-medium">Đánh giá của bạn *</h4>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setScore(star)}
                                            onMouseEnter={() => setHoveredScore(star)}
                                            onMouseLeave={() => setHoveredScore(0)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={40}
                                                className={`${star <= (hoveredScore || score)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                                    } transition-colors`}
                                            />
                                        </button>
                                    ))}
                                    {score > 0 && (
                                        <span className="ml-2 text-sm text-gray-600">
                                            {score} / 5 sao
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400">
                                    Nhấp vào số sao để đánh giá (1 sao = Rất không hài lòng, 5 sao = Rất hài lòng)
                                </p>
                            </div>

                            {/* Comment */}
                            <div className="space-y-3">
                                <h4 className="font-medium">Nhận xét (không bắt buộc)</h4>
                                <textarea
                                    placeholder={isEmployerRating ? "Chia sẻ đánh giá của bạn về ứng viên này..." : "Chia sẻ trải nghiệm của bạn về công việc này..."}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full min-h-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    maxLength={1000}
                                />
                                <p className="text-xs text-gray-400">{comment.length}/1000 ký tự</p>
                            </div>

                            {/* Info Note */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Lưu ý:</strong> {isEmployerRating
                                        ? "Đánh giá của bạn sẽ giúp cộng đồng có thêm thông tin về ứng viên này."
                                        : "Đánh giá của bạn sẽ giúp cộng đồng có thêm thông tin về công việc và nhà tuyển dụng này."}
                                </p>
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
                                    disabled={isSubmitting || score < 1}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin">⏳</span> Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Star size={16} className="fill-white" /> Gửi đánh giá
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

export default RatingModal;

