import React from "react";
import { SKILL_SUGGESTIONS } from "../../../constants/skillSuggestions";

const InfoTab = ({ profile, isEditing, handleChange, onAddressPickerOpen }) => {
    const skillList = profile.skills
        ? profile.skills
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [];

    const handleAddSuggestedSkill = (skill) => {
        if (!isEditing) return;
        const alreadyHas = skillList.includes(skill);
        if (alreadyHas) return;
        const updatedSkills = [...skillList, skill].join(', ');
        handleChange?.({
            target: {
                name: "skills",
                value: updatedSkills,
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Thông tin cá nhân */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                    Thông tin cá nhân
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {[
                        { label: "Họ và tên", name: "fullName" },
                        { label: "Email", name: "email", readOnlyAlways: true },
                        { label: "Địa chỉ", name: "address" },
                        { label: "Số điện thoại", name: "contactPhone" },
                    ].map((f) => {
                        const isAlwaysReadOnly = Boolean(f.readOnlyAlways);
                        const inputReadOnly = !isEditing || isAlwaysReadOnly;
                        if (f.name === "address") {
                            return (
                                <div key={f.name}>
                                    <label className="text-gray-500 flex items-center justify-between">
                                        <span>{f.label}</span>
                                        {isEditing && (
                                            <span className="text-xs text-gray-400">Chọn từ bản đồ</span>
                                        )}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isEditing) return;
                                            onAddressPickerOpen?.();
                                        }}
                                        className={`w-full mt-1 border rounded-lg p-2 text-left text-gray-700 transition ${isEditing
                                            ? "bg-white hover:border-cyan-400"
                                            : "bg-gray-50 cursor-not-allowed opacity-75"
                                            }`}
                                        disabled={!isEditing}
                                    >
                                        {profile.address || "Chưa cập nhật"}
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div key={f.name}>
                                <label className="text-gray-500 flex items-center justify-between">
                                    <span>{f.label}</span>
                                    {isAlwaysReadOnly && (
                                        <span className="text-xs text-gray-400 italic">Liên hệ hỗ trợ để thay đổi</span>
                                    )}
                                </label>
                                <input
                                    name={f.name}
                                    className={`w-full mt-1 border rounded-lg p-2 text-gray-700 bg-gray-50 ${inputReadOnly ? "cursor-not-allowed opacity-75" : ""}`}
                                    value={profile[f.name] || ""}
                                    onChange={(e) => {
                                        if (f.name === "contactPhone") {
                                            const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                                            handleChange?.({
                                                target: {
                                                    name: "contactPhone",
                                                    value: digits,
                                                },
                                            });
                                            return;
                                        }
                                        handleChange?.(e);
                                    }}
                                    inputMode={f.name === "contactPhone" ? "numeric" : undefined}
                                    maxLength={f.name === "contactPhone" ? 10 : undefined}
                                    readOnly={inputReadOnly}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Kỹ năng */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-4">Kỹ năng</h3>
                <textarea
                    name="skills"
                    className="w-full border rounded-lg p-3 text-gray-700 bg-gray-50 resize-none"
                    rows="3"
                    value={profile.skills || ""}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder="Nhập các kỹ năng của bạn, cách nhau bởi dấu phẩy..."
                />
                {isEditing && (
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Gợi ý kỹ năng (bấm để thêm):</p>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-cyan-50 rounded-lg p-2 bg-cyan-50/50">
                            {SKILL_SUGGESTIONS.map((skill) => {
                                const isSelected = skillList.includes(skill);
                                return (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => handleAddSuggestedSkill(skill)}
                                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${isSelected
                                            ? "bg-cyan-600 text-white border-cyan-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                            }`}
                                    >
                                        {skill}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                {skillList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {skillList.map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Giới thiệu bản thân */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                    Giới thiệu bản thân
                </h3>
                <textarea
                    name="bio"
                    className="w-full border rounded-lg p-3 text-gray-700 bg-gray-50 resize-none"
                    rows="3"
                    value={profile.bio || ""}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
            </div>
        </div>
    );
};

export default InfoTab;

