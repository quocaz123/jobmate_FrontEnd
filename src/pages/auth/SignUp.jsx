import React, { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react"
import { Link } from "react-router-dom"
import { OAuthConfig } from "../../configurations/configuration"
import { register } from "../../services/authService"
import { showSuccess, showError } from "../../utils/toast"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(phoneNumber)) {
      showError("Số điện thoại phải gồm đúng 10 chữ số.")
      return
    }
    const payload = {
      email,
      password,
      fullName,
      phoneNumber,
    }
    register(payload)
      .then(response => {
        showSuccess("Đăng ký thành công!");
        // Chuyển hướng đến trang đăng nhập sau 1.5 giây
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      })
      .catch(error => {
        showError("Đăng ký thất bại. Vui lòng thử lại.");
      });
  }

  const handleGoogleSignup = () => {
    const callbackUrl = OAuthConfig.redirectUri?.trim()
    const authUrl = OAuthConfig.authUri
    const googleClientId = OAuthConfig.clientId?.trim()

    // Validate Google Client ID
    if (!googleClientId || googleClientId === '') {
      showError('Google OAuth chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
      console.error('VITE_GOOGLE_CLIENT_ID không được set!');
      return;
    }

    // Validate redirect URI
    if (!callbackUrl || callbackUrl === '') {
      showError('Redirect URI chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
      console.error('VITE_OAUTH_REDIRECT_URI không được set!');
      return;
    }

    const params = new URLSearchParams({
      redirect_uri: callbackUrl,
      response_type: "code",
      client_id: googleClientId,
      scope: "openid email profile",
      prompt: "consent",
      access_type: "offline",
    })

    window.location.href = `${authUrl}?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center p-6">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-transparent to-purple-50 opacity-80 pointer-events-none" />

        <div className="relative text-center p-8 pb-4">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Tạo tài khoản mới 🌟
          </h1>
          <p className="text-gray-500 mt-2">Tham gia ngay để không bỏ lỡ cơ hội</p>
        </div>

        <div className="relative px-8 pb-8 pt-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-all"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
                <input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0123456789"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent shadow-sm transition-all"
                  value={phoneNumber}
                  inputMode="numeric"
                  maxLength={10}
                  pattern="\d{10}"
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10)
                    setPhoneNumber(onlyDigits)
                  }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
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
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-transform"
            >
              Đăng ký
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <span className="relative bg-white px-3 text-sm text-gray-500">Hoặc tiếp tục với</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center border border-gray-300 bg-white py-3 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="font-medium text-gray-700">Đăng ký với Google</span>
          </button>

          <div className="text-center mt-6 text-gray-600">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-purple-600 hover:underline font-medium hover:text-purple-700">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
