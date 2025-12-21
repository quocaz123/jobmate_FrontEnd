import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { handleAuthSuccess } from "../../services/authHandler";
import { oauth2_login } from "../../services/authService";
import { OAuthConfig } from "../../configurations/configuration";
import { showError } from "../../utils/toast";

export default function Authenticate() {
  const navigate = useNavigate();
  const hasHandledCodeRef = useRef(false);

  useEffect(() => {
    if (hasHandledCodeRef.current) return;

    console.log('OAuth callback URL:', window.location.href);

    // Lấy code từ URL
    const authCodeRegex = /code=([^&]+)/;
    const isMatch = window.location.href.match(authCodeRegex);

    if (isMatch) {
      hasHandledCodeRef.current = true;
      const authCode = decodeURIComponent(isMatch[1]);

      console.log('OAuth code received:', authCode ? '✅' : '❌');

      // Gọi API xác thực OAuth với redirect_uri từ config
      // redirect_uri phải khớp với URI đã đăng ký trong Google Console
      oauth2_login(authCode)
        .then((response) => {
          console.log('OAuth authentication response:', response);
          const responseData = response?.data?.data || response?.data;
          const token = responseData?.token;

          // Kiểm tra nếu không có token (tài khoản bị khóa hoặc lỗi khác)
          if (!token) {
            const errorMessage = response?.data?.message || responseData?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            showError(errorMessage);
            navigate('/login');
            return;
          }

          // Nếu requiresPasswordSetup = true, lưu thông tin để UserPage/EmployerPage hiển thị modal
          if (responseData?.requiresPasswordSetup) {
            localStorage.setItem('authResponse', JSON.stringify(responseData));
            localStorage.setItem('showPasswordSetup', 'true');
          }

          handleAuthSuccess(token, navigate);
        })
        .catch((error) => {
          console.error('Lỗi khi xác thực OAuth:', error);

          // Lấy thông báo lỗi chi tiết từ response
          const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.data?.message ||
            error?.message ||
            'Đăng nhập thất bại. Vui lòng thử lại.';

          console.error('Error details:', {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            message: errorMessage
          });

          showError(errorMessage);
          navigate('/login');
        });
    } else {
      // Không tìm thấy code trong URL
      console.error('Không tìm thấy OAuth code trong URL');
      showError('Lỗi xác thực: Không nhận được mã từ Google.');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col gap-8 justify-center items-center h-screen bg-gradient-to-br from-blue-500/5 via-gray-50 to-purple-500/5">
      {/* Loading Spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>

      {/* Loading Text */}
      <p className="text-lg text-gray-700 font-medium">Authenticating...</p>
    </div>
  )
}