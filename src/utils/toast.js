import toast from 'react-hot-toast';

/**
 * Hiển thị toast thành công
 * @param {string} message - Nội dung thông báo
 * @param {object} options - Tùy chọn thêm
 */
export const showSuccess = (message, options = {}) => {
    toast.success(message, {
        ...options,
    });
};

/**
 * Hiển thị toast lỗi
 * @param {string} message - Nội dung thông báo lỗi
 * @param {object} options - Tùy chọn thêm
 */
export const showError = (message, options = {}) => {
    toast.error(message, {
        ...options,
    });
};

/**
 * Hiển thị toast thông tin
 * @param {string} message - Nội dung thông báo
 * @param {object} options - Tùy chọn thêm
 */
export const showInfo = (message, options = {}) => {
    toast(message, {
        icon: 'ℹ️',
        ...options,
    });
};

/**
 * Hiển thị toast cảnh báo
 * @param {string} message - Nội dung cảnh báo
 * @param {object} options - Tùy chọn thêm
 */
export const showWarning = (message, options = {}) => {
    toast(message, {
        icon: '⚠️',
        style: {
            background: '#fef3c7',
            color: '#92400e',
        },
        ...options,
    });
};

/**
 * Hiển thị toast loading
 * @param {string} message - Nội dung loading
 * @returns {string} - ID của toast để dismiss sau
 */
export const showLoading = (message = 'Đang xử lý...') => {
    return toast.loading(message);
};

/**
 * Đóng toast loading
 * @param {string} toastId - ID của toast cần đóng
 */
export const dismissLoading = (toastId) => {
    toast.dismiss(toastId);
};

/**
 * Hiển thị toast promise (tự động success/error)
 * @param {Promise} promise - Promise cần theo dõi
 * @param {object} messages - Các message cho loading, success, error
 */
export const showPromise = (promise, messages = {}) => {
    return toast.promise(promise, {
        loading: messages.loading || 'Đang xử lý...',
        success: messages.success || 'Thành công!',
        error: messages.error || 'Có lỗi xảy ra!',
    });
};

// Export default toast để dùng các API khác nếu cần
export default toast;
