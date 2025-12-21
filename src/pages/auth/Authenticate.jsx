import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { handleAuthSuccess } from "../../services/authHandler";
import { AUTH, CONFIG } from "../../configurations/configuration";

export default function Authenticate() {
  const navigate = useNavigate();
  const hasHandledCodeRef = useRef(false);
  useEffect(() => {
    if (hasHandledCodeRef.current) return;

    console.log(window.location.href);

    const authCodeRegex = /code=([^&]+)/;
    const isMatch = window.location.href.match(authCodeRegex);

    if (isMatch) {
      hasHandledCodeRef.current = true;
      const authCode = isMatch[1];

      const url = `${CONFIG.API_GATEWAY}${AUTH.OAUTH_AUTHENTICATION}?code=${authCode}`;

      fetch(url, {
        method: "POST",
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then(errData => {
              throw new Error(errData?.message || errData?.data?.message || 'Đăng nhập thất bại');
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          const responseData = data?.data;
          const token = responseData?.token;

          // Kiểm tra nếu không có token (tài khoản bị khóa hoặc lỗi khác)
          if (!token) {
            const errorMessage = data?.message || responseData?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            alert(errorMessage);
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
          const errorMessage = error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
          alert(errorMessage);
          navigate('/login');
        });
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