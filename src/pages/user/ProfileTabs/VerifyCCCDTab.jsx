import React from "react";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import VerifyCCCD from "../VerifyCCCD";

const STATUS_COPY = {
    PENDING: {
        title: "Yêu cầu đang được xử lý",
        description:
            "Hồ sơ CCCD của bạn đã được gửi và đang chờ kiểm duyệt. Chúng tôi sẽ thông báo qua email khi hoàn tất.",
        icon: Clock,
        className: "bg-indigo-50 border-indigo-200 text-indigo-700",
    },
    VERIFIED: {
        title: "CCCD đã được xác minh",
        description:
            "Thông tin CCCD của bạn đã được phê duyệt. Bạn không cần thực hiện thêm thao tác nào.",
        icon: CheckCircle,
        className: "bg-green-50 border-green-200 text-green-700",
    },
    REJECTED: {
        title: "Yêu cầu bị từ chối",
        description:
            "Rất tiếc, hồ sơ CCCD của bạn bị từ chối. Vui lòng xem lý do bên dưới và gửi lại.",
        icon: XCircle,
        className: "bg-red-50 border-red-200 text-red-700",
    },
    UNVERIFIED: {
        title: "Chưa xác minh CCCD",
        description:
            "Để tăng độ tin cậy của hồ sơ, vui lòng tải ảnh mặt trước và mặt sau CCCD để yêu cầu xác minh.",
        icon: AlertCircle,
        className: "bg-yellow-50 border-yellow-200 text-yellow-700",
    },
};

const VerifyCCCDTab = ({
    verificationStatus = "UNVERIFIED",
    rejectionReason,
    onVerifySuccess,
    hasAvatar = false,
}) => {
    const normalizedStatus = verificationStatus?.toUpperCase() || "UNVERIFIED";
    const statusCopy = STATUS_COPY[normalizedStatus] || STATUS_COPY.UNVERIFIED;
    const mustUploadAvatar = (normalizedStatus === "UNVERIFIED" || normalizedStatus === "REJECTED") && !hasAvatar;

    return (
        <div className="space-y-6">
            <div className={`p-4 border rounded-lg flex items-start gap-3 ${statusCopy.className}`}>
                <statusCopy.icon className="w-5 h-5 mt-0.5" />
                <div>
                    <h3 className="font-semibold">{statusCopy.title}</h3>
                    <p className="text-sm mt-1">{statusCopy.description}</p>
                    {normalizedStatus === "REJECTED" && rejectionReason && (
                        <div className="mt-3 rounded-md bg-white/60 border border-red-200 px-3 py-2 text-sm text-red-700">
                            <span className="font-medium">Lý do:</span> {rejectionReason}
                        </div>
                    )}
                </div>
            </div>

            {mustUploadAvatar && (
                <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 text-sm text-yellow-800">
                    Vui lòng tải ảnh đại diện trước khi thực hiện xác minh CCCD.
                </div>
            )}

            {normalizedStatus === "UNVERIFIED" && !mustUploadAvatar && (
                <VerifyCCCD onSubmit={() => onVerifySuccess && onVerifySuccess("PENDING")} />
            )}

            {normalizedStatus === "REJECTED" && !mustUploadAvatar && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Bạn có thể chỉnh sửa và gửi lại hồ sơ CCCD ngay bên dưới. Hãy đảm bảo hình ảnh rõ nét và thông tin
                        trung thực.
                    </p>
                    <VerifyCCCD onSubmit={() => onVerifySuccess && onVerifySuccess("PENDING")} />
                </div>
            )}

            {normalizedStatus === "PENDING" && (
                <p className="text-sm text-gray-500">
                    Nếu bạn cần chỉnh sửa thông tin, vui lòng chờ kết quả xác minh hiện tại trước khi gửi lại hồ sơ mới.
                </p>
            )}
        </div>
    );
};

export default VerifyCCCDTab;
