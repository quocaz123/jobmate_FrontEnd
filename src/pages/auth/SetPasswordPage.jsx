import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { setPassword } from '../../services/authService';
import { showSuccess, showError, showLoading, dismissLoading } from '../../utils/toast';


const SetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userEmail, userName, userId } = location.state || {};

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const validatePassword = () => {
        if (formData.password.length < 8) {
            showError('Mật khẩu phải có ít nhất 8 ký tự');
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return false;
        }
        if (formData.password.length > 50) {
            showError('Mật khẩu không được vượt quá 50 ký tự');
            setError('Mật khẩu không được vượt quá 50 ký tự');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            showError('Mật khẩu xác nhận không khớp');
            setError('Mật khẩu xác nhận không khớp');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword()) {
            return;
        }

        const loadingToast = showLoading('Đang tạo mật khẩu...');
        setLoading(true);
        setError('');

        try {
            if (!userId) {
                throw new Error('Không tìm thấy userId để tạo mật khẩu');
            }

            const response = await setPassword({
                userId: userId,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });

            console.log('Set password response:', response);

            if (response.data?.code === 1000) {
                dismissLoading(loadingToast);
                showSuccess('Tạo mật khẩu thành công! Đang chuyển hướng...');

                const redirectUrl = response.data?.data?.redirectUrl || '/home';
                setTimeout(() => navigate(redirectUrl), 1000);
            }
        } catch (err) {
            dismissLoading(loadingToast);
            const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi tạo mật khẩu';
            showError(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        // User chooses to skip password setup
        navigate('/user');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Tạo Mật Khẩu</h1>
                    <p className="text-gray-600">
                        Xin chào <span className="font-semibold">{userName || userEmail}</span>!
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Tạo mật khẩu để có thể đăng nhập bằng email trong tương lai
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                                placeholder="Nhập mật khẩu (8-50 ký tự)"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                                placeholder="Nhập lại mật khẩu"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Password Requirements */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800 font-medium mb-2">Yêu cầu mật khẩu:</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li className="flex items-center gap-2">
                                <CheckCircle className={`w-3 h-3 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`} />
                                Tối thiểu 8 ký tự
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className={`w-3 h-3 ${formData.password === formData.confirmPassword && formData.password ? 'text-green-600' : 'text-gray-400'}`} />
                                Mật khẩu xác nhận khớp
                            </li>
                        </ul>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang xử lý...' : 'Tạo Mật Khẩu'}
                        </button>

                        <button
                            type="button"
                            onClick={handleSkip}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Bỏ qua (Tạo sau)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SetPasswordPage;
