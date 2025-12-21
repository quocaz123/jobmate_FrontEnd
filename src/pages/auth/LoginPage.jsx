import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Mail, Lock, X, Loader2 } from "lucide-react";
import { OAuthConfig } from "../../configurations/configuration";
import { login, forgotPassword, resetPassword } from "../../services/authService";
import { handleAuthSuccess } from "../../services/authHandler";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../../utils/toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Forgot password state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: OTP + new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpExpiryTime, setOtpExpiryTime] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const countdownIntervalRef = useRef(null);

  // Countdown timer cho OTP
  useEffect(() => {
    if (forgotPasswordStep === 2 && otpExpiryTime && otpExpiryTime > 0) {
      setCountdown(otpExpiryTime);

      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            // Hết thời gian, quay về bước 1
            clearInterval(countdownIntervalRef.current);
            setForgotPasswordStep(1);
            setOtp("");
            setOtpExpiryTime(null);
            setCountdown(null);
            showError("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      setCountdown(null);
    }
  }, [forgotPasswordStep, otpExpiryTime]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await login(email, password);
    const data = res.data.data;

    // Nếu tài khoản bị cấm / khoá
    if (data.status === "BANNED" || data.banned === true) {
      showError("Tài khoản của bạn đã bị khóa do vi phạm quy định.");
      return;
    }

    // Nếu bật xác thực 2FA (OTP)
    if (data.twoFaEnabled) {
      showSuccess("Vui lòng nhập mã OTP để tiếp tục");
      navigate("/verify-otp", {
        state: {
          userId: data.userId,
          otpExpiryTime: data.otpExpiryTime
        }
      });
      return;
    }

    // Đăng nhập bình thường
    setTimeout(() => {
      handleAuthSuccess(data.token, navigate);
    }, 1200);

  } catch (error) {
    const msg = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
    showError(msg);
  }
};

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
    const callbackUrl = OAuthConfig.redirectUri;
    const authUrl = OAuthConfig.authUri;
    const googleClientId = OAuthConfig.clientId;

    const params = new URLSearchParams({
      redirect_uri: callbackUrl,
      response_type: "code",
      client_id: googleClientId,
      scope: "openid email profile",
      prompt: "consent",
      access_type: "offline",
    });

    const targetUrl = `${authUrl}?${params.toString()}`;
    window.location.href = targetUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Hiệu ứng nền */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-transparent to-purple-50 opacity-80 pointer-events-none" />

        {/* Logo + Tiêu đề */}
        <div className="relative text-center p-8">
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            JobMate
          </div>
          <p className="text-gray-500 text-sm">
            Nền tảng giúp sinh viên kết nối cơ hội việc làm tốt nhất.
          </p>
        </div>

        {/* Form */}
        <div className="relative px-8 pb-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent shadow-sm transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Quên mật khẩu */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-sm text-blue-600 hover:underline hover:text-blue-700 transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-transform"
            >
              Đăng nhập
            </button>
          </form>

          {/* Hoặc tiếp tục với */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <span className="relative bg-white px-3 text-sm text-gray-500">
              Hoặc tiếp tục với
            </span>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center border border-gray-300 bg-white py-3 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-gray-700">
              Đăng nhập với Google
            </span>
          </button>

          {/* Đăng ký */}
          <div className="text-center mt-6">
            <span className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <a
                href="http://localhost:5173/signup"
                className="text-purple-600 font-medium hover:underline hover:text-purple-700"
              >
                Đăng ký ngay
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              onClick={() => {
                if (countdownIntervalRef.current) {
                  clearInterval(countdownIntervalRef.current);
                }
                setShowForgotPasswordModal(false);
                setForgotPasswordStep(1);
                setForgotEmail("");
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setOtpExpiryTime(null);
                setCountdown(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Quên mật khẩu
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {forgotPasswordStep === 1
                ? "Nhập email của bạn để nhận mã OTP"
                : "Nhập mã OTP và mật khẩu mới"}
            </p>

            {forgotPasswordStep === 1 ? (
              // Step 1: Enter email
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!forgotEmail) {
                    showError("Vui lòng nhập email");
                    return;
                  }

                  setIsLoading(true);
                  try {
                    const res = await forgotPassword(forgotEmail);
                    const data = res?.data?.data || res?.data;
                    showSuccess(
                      data?.message || "OTP đã được gửi đến email của bạn"
                    );
                    setOtpExpiryTime(data?.otpExpiryTime || 180);
                    setForgotPasswordStep(2);
                  } catch (error) {
                    const errorMessage =
                      error?.response?.data?.message ||
                      "Không thể gửi OTP. Vui lòng thử lại.";
                    showError(errorMessage);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 rounded-lg font-semibold transition ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang gửi...
                    </span>
                  ) : (
                    "Gửi mã OTP"
                  )}
                </button>
              </form>
            ) : (
              // Step 2: Enter OTP and new password
              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (!otp) {
                    showError("Vui lòng nhập mã OTP");
                    return;
                  }

                  if (!newPassword) {
                    showError("Vui lòng nhập mật khẩu mới");
                    return;
                  }

                  if (newPassword.length < 8) {
                    showError("Mật khẩu phải có ít nhất 8 ký tự");
                    return;
                  }

                  if (newPassword !== confirmPassword) {
                    showError("Mật khẩu xác nhận không khớp");
                    return;
                  }

                  setIsLoading(true);
                  try {
                    const res = await resetPassword({
                      email: forgotEmail,
                      otp: otp,
                      newPassword: newPassword,
                      confirmPassword: confirmPassword,
                    });

                    const data = res?.data?.data || res?.data;
                    showSuccess(
                      data?.message || "Đặt lại mật khẩu thành công!"
                    );

                    // Close modal and reset
                    if (countdownIntervalRef.current) {
                      clearInterval(countdownIntervalRef.current);
                    }
                    setTimeout(() => {
                      setShowForgotPasswordModal(false);
                      setForgotPasswordStep(1);
                      setForgotEmail("");
                      setOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setOtpExpiryTime(null);
                      setCountdown(null);
                    }, 1500);
                  } catch (error) {
                    const errorMessage =
                      error?.response?.data?.message ||
                      "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
                    showError(errorMessage);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Nhập mã OTP 6 số"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                    disabled={isLoading}
                  />
                  {countdown !== null && countdown > 0 ? (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <p className={`text-sm font-medium ${
                        countdown <= 30 ? "text-red-600" : "text-gray-600"
                      }`}>
                        Mã OTP có hiệu lực trong: <span className="font-bold">{formatCountdown(countdown)}</span>
                      </p>
                    </div>
                  ) : countdown === 0 ? (
                    <p className="text-xs text-red-600 mt-1 text-center">
                      Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 8 ký tự"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      disabled={isLoading}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (countdownIntervalRef.current) {
                        clearInterval(countdownIntervalRef.current);
                      }
                      setForgotPasswordStep(1);
                      setOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setCountdown(null);
                      setOtpExpiryTime(null);
                    }}
                    disabled={isLoading}
                    className="flex-1 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 py-2.5 rounded-lg font-semibold transition ${
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </span>
                    ) : (
                      "Đặt lại mật khẩu"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
