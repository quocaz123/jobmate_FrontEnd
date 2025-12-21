import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, X } from 'lucide-react';


const PasswordSetupModal = ({ isOpen, onClose, userEmail, userName, userId }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSetupPassword = () => {
        if (!userId) {
            console.error('PasswordSetupModal: Missing userId when navigating to set password');
            return;
        }

        navigate('/set-password', {
            state: { userEmail, userName, userId }
        });
        onClose();
    };

    const handleSkip = () => {
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={handleSkip}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
                    {/* Close Button */}
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Icon */}
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>

                    {/* Content */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Tạo Mật Khẩu?
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Bạn đã đăng nhập thành công qua Google!
                        </p>
                        <p className="text-sm text-gray-500">
                            Tạo mật khẩu để có thể đăng nhập bằng email <span className="font-semibold">{userEmail}</span> trong tương lai.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <p className="text-sm font-medium text-blue-900 mb-2">Lợi ích khi tạo mật khẩu:</p>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>✓ Đăng nhập bằng email & mật khẩu</li>
                            <li>✓ Không phụ thuộc vào Google</li>
                            <li>✓ Bảo mật tài khoản tốt hơn</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleSetupPassword}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Tạo Mật Khẩu Ngay
                        </button>
                        <button
                            onClick={handleSkip}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Để Sau
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-4">
                        Bạn có thể tạo mật khẩu bất cứ lúc nào trong phần Cài đặt
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </>
    );
};

export default PasswordSetupModal;
