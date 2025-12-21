import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { getRatings } from "../../../services/ratingService";
import { formatDate, initials } from "../../../utils/candidateUtils";

const ReviewsTab = ({ userId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReviews = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await getRatings(userId);
                // API trả về: response.data.data.data (array reviews)
                const responseData = response?.data?.data || response?.data;
                const reviewsArray = responseData?.data || [];

                // Map data từ API format sang component format
                const mappedReviews = reviewsArray.map((review) => ({
                    reviewerId: review.fromUserId,
                    reviewerName: review.fromUserName,
                    reviewerAvatar: review.fromUserAvatar,
                    jobTitle: review.jobTitle,
                    score: review.score,
                    comment: review.comment,
                    createdAt: review.createdAt
                }));

                setReviews(mappedReviews);
            } catch (error) {
                console.error("Lỗi khi lấy đánh giá:", error);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        loadReviews();
    }, [userId]);

    if (loading) {
        return (
            <div>
                <h3 className="font-semibold text-gray-800 mb-4">Đánh giá</h3>
                <div className="text-center py-12">
                    <div className="text-gray-500">Đang tải đánh giá...</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="font-semibold text-gray-800 mb-4">Đánh giá</h3>
            <div className="space-y-4">
                {reviews && reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <div
                            key={review.reviewerId || index}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar người đánh giá */}
                                {review.reviewerAvatar ? (
                                    <img
                                        src={review.reviewerAvatar}
                                        alt={review.reviewerName}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/150";
                                            e.target.onerror = null;
                                        }}
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold border-2 border-gray-300">
                                        {initials(review.reviewerName)}
                                    </div>
                                )}

                                <div className="flex-1">
                                    {/* Header: Tên người đánh giá và điểm */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-semibold text-gray-800">{review.reviewerName}</h4>
                                            {review.jobTitle && (
                                                <p className="text-sm text-gray-600 mt-1">{review.jobTitle}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star size={18} className="text-yellow-500 fill-yellow-500" />
                                            <span className="font-semibold text-gray-800">{review.score.toFixed(1)}</span>
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                        <p className="text-gray-700 leading-relaxed mb-2">{review.comment}</p>
                                    )}

                                    {/* Ngày đánh giá */}
                                    {review.createdAt && (
                                        <p className="text-xs text-gray-500">
                                            {formatDate(review.createdAt)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Chưa có đánh giá nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsTab;

