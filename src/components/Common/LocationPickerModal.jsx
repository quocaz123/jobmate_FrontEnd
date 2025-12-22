import React, { useEffect, useState } from "react";

const DEFAULT_HERE_KEY =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_HERE_API_KEY) || "";

const LocationPickerModal = ({
    open,
    onClose,
    onSelect,
    defaultQuery = "",
    title = "Chọn địa điểm",
    description = "Tìm kiếm hoặc sử dụng vị trí hiện tại của bạn.",
    enableCurrentLocation = true,
}) => {
    const [query, setQuery] = useState(defaultQuery);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const resolvedApiKey = ( DEFAULT_HERE_KEY || "").trim();

    useEffect(() => {
        if (open) {
            setQuery(defaultQuery || "");
            setResults([]);
            setError("");
        }
    }, [open, defaultQuery]);

    const closeModal = () => {
        setResults([]);
        setError("");
        onClose?.();
    };

    const handleSelect = (item) => {
        const label = item?.address?.label || item?.title || item?.label || query;
        const lat = item?.position?.lat ?? item?.lat ?? item?.latitude ?? null;
        const lon = item?.position?.lng ?? item?.lon ?? item?.longitude ?? null;
        onSelect?.(label, lat, lon, item);
        closeModal();
    };

    const ensureApiKey = () => {
        if (!resolvedApiKey) {
            setError("Chưa cấu hình HERE API key.");
            setLoading(false);
            return false;
        }
        return true;
    };

    const searchLocationService = async () => {
        if (!query.trim()) {
            setError("Vui lòng nhập từ khóa để tìm địa chỉ.");
            setResults([]);
            return;
        }
        if (!ensureApiKey()) return;

        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${encodeURIComponent(
                    query
                )}&lang=vi-VN&limit=6&apiKey=${resolvedApiKey}`
            );
            if (!res.ok) throw new Error("Không thể tìm vị trí, thử lại sau.");
            const data = await res.json();
            setResults(Array.isArray(data?.items) ? data.items : []);
        } catch (err) {
            setError(err.message || "Không thể tìm vị trí.");
        } finally {
            setLoading(false);
        }
    };

    const handleUseCurrentLocation = async () => {
        if (!enableCurrentLocation) return;
        if (typeof navigator === "undefined" || !navigator?.geolocation) {
            setError("Trình duyệt không hỗ trợ xác định vị trí.");
            return;
        }
        if (!ensureApiKey()) return;

        setLoading(true);
        setError("");
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&lang=vi-VN&apiKey=${resolvedApiKey}`
                    );
                    if (!res.ok) {
                        throw new Error("Không thể lấy địa chỉ từ vị trí hiện tại.");
                    }
                    const data = await res.json();
                    const item = data?.items?.[0];
                    if (item) {
                        handleSelect(item);
                    } else {
                        throw new Error("Không tìm thấy địa chỉ phù hợp.");
                    }
                } catch (err) {
                    setError(err.message || "Không thể xác định địa chỉ.");
                    setLoading(false);
                }
            },
            (err) => {
                setLoading(false);
                setError(err?.message || "Không thể truy cập vị trí của bạn.");
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
            <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                    <button
                        type="button"
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
                    <div className="flex gap-2">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                            placeholder="Nhập tên đường, phường, tỉnh..."
                        />
                        <button
                            type="button"
                            onClick={searchLocationService}
                            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                        >
                            Tìm
                        </button>
                    </div>
                    {enableCurrentLocation && (
                        <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            className="text-sm text-cyan-700 hover:underline self-start"
                            disabled={loading}
                        >
                            Dùng vị trí hiện tại
                        </button>
                    )}
                </div>

                {error && <div className="text-sm text-red-600">{error}</div>}

                <div className="max-h-60 overflow-y-auto border border-gray-100 rounded">
                    {loading && (
                        <div className="p-4 text-sm text-gray-500">Đang tìm vị trí...</div>
                    )}
                    {!loading && results.length === 0 && !error && (
                        <div className="p-4 text-sm text-gray-500">Chưa có kết quả. Hãy nhập từ khóa để tìm.</div>
                    )}
                    {results.map((item, index) => (
                        <button
                            key={item.id || index}
                            type="button"
                            onClick={() => handleSelect(item)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 border-gray-100"
                        >
                            <p className="text-sm font-medium text-gray-800">
                                {item.address?.label || item.title || "Địa điểm"}
                            </p>
                            {item.position && (
                                <p className="text-xs text-gray-500">
                                    Lat: {Number(item.position.lat).toFixed(4)} - Lon: {Number(item.position.lng).toFixed(4)}
                                </p>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-200 rounded text-gray-600 hover:bg-gray-50"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPickerModal;

