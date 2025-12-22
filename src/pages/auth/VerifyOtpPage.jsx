import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, RefreshCcw } from "lucide-react";
import { verify_otp, resend_otp } from "../../services/authService";
import { showSuccess, showError, showLoading, dismissLoading } from "../../utils/toast";
import { handleAuthSuccess } from "../../services/authHandler";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const getUserIdFromLocation = (location) => {
    const stateUserId = location.state?.userId;
    const searchParams = new URLSearchParams(location.search);
    const queryUserId = searchParams.get("userId");
    return stateUserId || queryUserId || "";
};

export default function VerifyOtpPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [userId, setUserId] = useState(() => getUserIdFromLocation(location));
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

    const canResend = useMemo(
        () => Boolean(userId) && cooldown === 0 && !resendLoading,
        [userId, cooldown, resendLoading]
    );

    useEffect(() => {
        setUserId(getUserIdFromLocation(location));
    }, [location]);

    useEffect(() => {
        if (cooldown === 0) {
            return undefined;
        }

        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev === 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    const handleOtpChange = (value) => {
        const numericValue = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
        setOtp(numericValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            showError("Thiếu thông tin userId để xác thực OTP.");
            return;
        }

        if (otp.length !== OTP_LENGTH) {
            showError(`OTP phải gồm đúng ${OTP_LENGTH} chữ số.`);
            return;
        }

        const loadingToast = showLoading("Đang xác thực OTP...");
        setSubmitting(true);

        try {
            const response = await verify_otp({ userId, otp });
            dismissLoading(loadingToast);

            // showSuccess("Đăng nhập thành công!");
            setTimeout(() => {
                handleAuthSuccess(response.data.data.token, navigate);
            }, 1200);

        } catch (error) {
            dismissLoading(loadingToast);
            const errorMessage = error?.response?.data?.message || "Xác thực OTP thất bại. Vui lòng kiểm tra lại.";
            showError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        if (!userId) {
            showError("Thiếu thông tin userId để gửi lại OTP.");
            return;
        }

        if (!canResend) {
            return;
        }

        setResendLoading(true);
        try {
            await resend_otp({ userId });
            showSuccess("OTP mới đã được gửi. Vui lòng kiểm tra email/SMS của bạn.");
            setCooldown(RESEND_COOLDOWN);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || "Gửi lại OTP thất bại. Vui lòng thử lại sau.";
            showError(errorMessage);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center p-6">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-transparent to-purple-50 opacity-80 pointer-events-none" />

                <div className="relative p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Xác thực OTP
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Nhập mã OTP đã được gửi tới email hoặc số điện thoại của bạn để hoàn tất xác thực tài khoản.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!userId && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                                Không tìm thấy thông tin tài khoản. Vui lòng quay lại email hoặc liên hệ hỗ trợ để lấy lại đường dẫn xác thực.
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Mã OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => handleOtpChange(e.target.value)}
                                placeholder={`Nhập ${OTP_LENGTH} chữ số`}
                                className="w-full text-center tracking-widest text-2xl font-semibold py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent shadow-sm transition-all"
                                inputMode="numeric"
                                maxLength={OTP_LENGTH}
                                required
                            />
                            <p className="text-xs text-gray-500 text-center">
                                Mã OTP có hiệu lực trong thời gian ngắn. Vui lòng không chia sẻ mã cho người khác.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !userId}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Đang xác thực..." : "Xác nhận OTP"}
                        </button>
                    </form>

                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Không nhận được mã?{" "}
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={!canResend}
                                className="inline-flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                {resendLoading ? "Đang gửi..." : "Gửi lại OTP"}
                            </button>
                        </p>
                        {cooldown > 0 && (
                            <p className="text-xs text-gray-500">
                                Bạn có thể yêu cầu mã mới sau <span className="font-semibold text-purple-500">{cooldown}s</span>.
                            </p>
                        )}
                    </div>

                    <div className="text-center text-sm text-gray-500">
                        <p>
                            Nếu bạn đã xác thực thành công trước đó, hãy{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                quay lại trang đăng nhập
                            </button>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

