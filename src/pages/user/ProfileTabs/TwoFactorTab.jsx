import React, { useState } from "react";
import { Loader2, Eye, EyeOff, Lock } from "lucide-react";
import { updatePassword } from "../../../services/userService";
import { showSuccess, showError } from "../../../utils/toast";

const TwoFactorTab = ({ twoFactorEnabled, isUpdating, onToggle }) => {
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (passwordErrors[name]) {
            setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validatePassword = () => {
        const errors = {};

        if (!passwordData.oldPassword) {
            errors.oldPassword = "Vui lòng nhập mật khẩu cũ";
        }

        if (!passwordData.newPassword) {
            errors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (passwordData.newPassword.length < 8) {
            errors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
        }

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitPasswordChange = async (e) => {
        e.preventDefault();

        if (!validatePassword()) {
            return;
        }

        setIsChangingPassword(true);
        try {
            await updatePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword,
            });

            showSuccess("Đổi mật khẩu thành công!");
            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setPasswordErrors({});
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                "Không thể đổi mật khẩu. Vui lòng thử lại.";
            showError(errorMessage);
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* 2FA Section */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                    Xác thực hai yếu tố (2FA)
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-800 mb-1">
                                Bật xác thực hai yếu tố
                            </h4>
                            <p className="text-sm text-gray-500">
                                Tăng cường bảo mật tài khoản bằng cách yêu cầu mã xác thực từ ứng
                                dụng di động
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={twoFactorEnabled}
                                onChange={(e) => onToggle(e.target.checked)}
                                className="sr-only peer"
                                disabled={isUpdating}
                            />
                            <div
                                className={`relative w-11 h-6 rounded-full transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                ${twoFactorEnabled ? "bg-blue-600 after:translate-x-full after:border-white" : "bg-gray-200"}
                ${isUpdating ? "opacity-60 cursor-not-allowed" : "peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"}
              `}
                            ></div>
                        </label>
                    </div>

                    {isUpdating && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang cập nhật trạng thái 2FA...
                        </div>
                    )}

                    {twoFactorEnabled && !isUpdating && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800 mb-2">
                                <strong>Hướng dẫn:</strong>
                            </p>
                            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                                <li>Tải ứng dụng xác thực như Google Authenticator hoặc Authy</li>
                                <li>Quét mã QR được hiển thị</li>
                                <li>Nhập mã xác thực 6 chữ số để hoàn tất</li>
                            </ol>
                        </div>
                    )}
                </div>
            </div>

            {/* Change Password Section */}
            <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                    <Lock className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">Đổi mật khẩu</h3>
                </div>
                <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
                    {/* Old Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu cũ
                        </label>
                        <div className="relative">
                            <input
                                type={showOldPassword ? "text" : "password"}
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    passwordErrors.oldPassword
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                placeholder="Nhập mật khẩu cũ"
                                disabled={isChangingPassword}
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={isChangingPassword}
                            >
                                {showOldPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {passwordErrors.oldPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {passwordErrors.oldPassword}
                            </p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    passwordErrors.newPassword
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                                disabled={isChangingPassword}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={isChangingPassword}
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {passwordErrors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {passwordErrors.newPassword}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Xác nhận mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    passwordErrors.confirmPassword
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                placeholder="Nhập lại mật khẩu mới"
                                disabled={isChangingPassword}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={isChangingPassword}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {passwordErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {passwordErrors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            className={`px-6 py-2 rounded-lg text-white font-medium transition ${
                                isChangingPassword
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {isChangingPassword ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </span>
                            ) : (
                                "Đổi mật khẩu"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TwoFactorTab;
