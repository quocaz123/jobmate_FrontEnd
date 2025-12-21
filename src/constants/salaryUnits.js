export const SALARY_UNIT_OPTIONS = [
    { value: 'VND_PER_HOUR', label: 'VND / giờ' },
    { value: 'VND_PER_SHIFT', label: 'VND / ca (4-6h)' },
    { value: 'VND_PER_DAY', label: 'VND / ngày' },
    { value: 'VND_PER_WEEK', label: 'VND / tuần' },
    { value: 'VND_PER_MONTH', label: 'VND / tháng' },
    { value: 'VND_PER_PROJECT', label: 'VND / dự án' },
    { value: 'VND_PER_PRODUCT', label: 'VND / sản phẩm' },
    { value: 'VND_PER_TASK', label: 'VND / nhiệm vụ' },
    { value: 'VND_PER_ORDER', label: 'VND / đơn hàng' },
    { value: 'VND_PER_KM', label: 'VND / km' },
    { value: 'VND_PER_SESSION', label: 'VND / buổi đào tạo' },
    { value: 'VND_PER_STUDENT', label: 'VND / học viên' },
    { value: 'COMMISSION', label: 'Hoa hồng %' },
    { value: 'BONUS', label: 'Thưởng cố định' },
    { value: 'NEGOTIABLE', label: 'Thỏa thuận' },
];

export const SALARY_UNIT_LABELS = SALARY_UNIT_OPTIONS.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
}, {});

