export const DAY_OPTIONS = [
    { value: 2, label: "Thứ 2" },
    { value: 3, label: "Thứ 3" },
    { value: 4, label: "Thứ 4" },
    { value: 5, label: "Thứ 5" },
    { value: 6, label: "Thứ 6" },
    { value: 7, label: "Thứ 7" },
    { value: 8, label: "Chủ Nhật" },
];

export const TIME_PRESETS = [
    { label: "Sáng", start: "08:00", end: "12:00" },
    { label: "Chiều", start: "13:00", end: "17:00" },
    { label: "Tối", start: "18:00", end: "22:00" },
    { label: "Cả ngày", start: "08:00", end: "17:00" },
    { label: "Linh hoạt", start: "", end: "" },
];

const DAY_VALUE_MAP = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
};

export const parseWorkingDays = (daysString) => {
    if (!daysString || !daysString.trim()) return [];

    // Map từ viết tắt tiếng Anh sang số
    const dayAbbrToValue = {
        "MON": 2,
        "TUE": 3,
        "WED": 4,
        "THU": 5,
        "FRI": 6,
        "SAT": 7,
        "SUN": 8,
    };

    // Thử parse từ định dạng tiếng Anh (MON, TUE, WED...)
    const upperString = daysString.toUpperCase();
    const abbrMatches = upperString.match(/\b(MON|TUE|WED|THU|FRI|SAT|SUN)\b/g);
    if (abbrMatches && abbrMatches.length > 0) {
        const days = abbrMatches
            .map((abbr) => dayAbbrToValue[abbr])
            .filter((num) => typeof num === "number");
        return [...new Set(days)].sort((a, b) => a - b);
    }

    // Fallback: parse từ số (2, 3, 4...)
    const matches = daysString.match(/\d+/g);
    if (!matches) return [];
    const days = matches
        .map((m) => DAY_VALUE_MAP[m])
        .filter((num) => typeof num === "number");
    return [...new Set(days)].sort((a, b) => a - b);
};

export const formatWorkingDays = (daysArray) => {
    if (!Array.isArray(daysArray) || daysArray.length === 0) return "";
    const dayLabelMap = DAY_OPTIONS.reduce((acc, day) => {
        acc[day.value] = day.label;
        return acc;
    }, {});
    return daysArray
        .sort((a, b) => a - b)
        .map((day) => dayLabelMap[day] || `Thứ ${day}`)
        .join(", ");
};

// Format ngày làm việc sang tiếng Anh viết tắt (MON, TUE, WED...) để gửi lên API
export const formatWorkingDaysForAPI = (daysArray) => {
    if (!Array.isArray(daysArray) || daysArray.length === 0) return "";
    const dayAbbrMap = {
        2: "MON",
        3: "TUE",
        4: "WED",
        5: "THU",
        6: "FRI",
        7: "SAT",
        8: "SUN",
    };
    return daysArray
        .sort((a, b) => a - b)
        .map((day) => dayAbbrMap[day] || "")
        .filter(Boolean)
        .join(", ");
};

// Format ngày làm việc từ string (có thể là tiếng Anh hoặc số) sang tiếng Việt để hiển thị
export const formatWorkingDaysForDisplay = (daysString) => {
    if (!daysString || !daysString.trim()) return "";
    // Nếu là "ALL" thì trả về "Tất cả các ngày"
    const upperString = daysString.toUpperCase().trim();
    if (upperString === "ALL") {
        return "Tất cả các ngày";
    }
    // Parse từ tiếng Anh (MON, TUE, WED...) hoặc số (2, 3, 4...) sang mảng số
    const daysArray = parseWorkingDays(daysString);
    // Format sang tiếng Việt
    return formatWorkingDays(daysArray);
};

export const parseWorkingHours = (hoursString) => {
    if (!hoursString || !hoursString.trim()) return { start: "", end: "" };
    const match = hoursString.match(
        /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/
    );
    if (match) {
        return {
            start: `${match[1].padStart(2, "0")}:${match[2]}`,
            end: `${match[3].padStart(2, "0")}:${match[4]}`,
        };
    }
    return { start: "", end: "" };
};

export const formatWorkingHours = (start, end) => {
    if (!start || !end) return "";
    return `${start}-${end}`;
};

export const isFlexibleLabel = (value) =>
    typeof value === "string" && value.trim().toLowerCase() === "linh hoạt";

