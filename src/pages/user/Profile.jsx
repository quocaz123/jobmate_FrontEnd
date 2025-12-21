import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Star,
  ClipboardList,
  Percent,
  Camera,
  Clock,
  AlertCircle,
} from "lucide-react";
import InfoTab from "./ProfileTabs/InfoTab";
import TwoFactorTab from "./ProfileTabs/TwoFactorTab";
import VerifyCCCDTab from "./ProfileTabs/VerifyCCCDTab";
import ReviewsTab from "./ProfileTabs/ReviewsTab";
import CareerInfoTab from "./ProfileTabs/CareerInfoTab";
import LocationPickerModal from "../../components/Common/LocationPickerModal";
import { uploadFile } from "../../services/uploadFileService";
import { getUserInfo, getUserStats, updateUserInfo, updateTwoFactorStatus, upgradeRole } from "../../services/userService";
import { logout } from "../../services/authService";
import { removeToken } from "../../services/localStorageService";
import { showSuccess, showError } from "../../utils/toast";
import { formatWorkingDaysForDisplay } from "../../utils/scheduleUtils";

const HERE_API_KEY = (typeof import.meta !== "undefined" && import.meta.env?.VITE_HERE_API_KEY) || "";

// Dữ liệu mẫu (thay bằng API sau)
const MOCK_USER = {
  averageRating: 4.9,
  ratingCount: 12,
  cccdVerified: true,
};

const extractAvatarUrl = (data = {}) =>
  data.avatarUrl ||
  data.avatar ||
  data.profilePicture ||
  data.photoUrl ||
  data.photoURL ||
  null;

const normalizeCoord = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const getTrustBadge = (score) => {
  const value = Number(score ?? 0);
  if (!Number.isFinite(value) || value <= 0) {
    return {
      label: "Chưa xếp hạng",
      className: "bg-gray-100 text-gray-600 border border-gray-200",
    };
  }
  if (value >= 4.5) {
    return {
      label: "Hạng Gold",
      className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    };
  }
  if (value >= 3.5) {
    return {
      label: "Hạng Silver",
      className: "bg-slate-100 text-slate-700 border border-slate-200",
    };
  }
  if (value >= 2.5) {
    return {
      label: "Hạng Bronze",
      className: "bg-amber-100 text-amber-700 border border-amber-200",
    };
  }
  return {
    label: "Chưa xếp hạng",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  };
};

const Profile = ({ onAvatarChange, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // "info", "2fa", "verify", "reviews"
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUpgradeSubmitting, setIsUpgradeSubmitting] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [userStatsLoading, setUserStatsLoading] = useState(false);

  const avatarChangeRef = useRef(onAvatarChange);
  const profileUpdateRef = useRef(onProfileUpdate);

  useEffect(() => {
    avatarChangeRef.current = onAvatarChange;
  }, [onAvatarChange]);

  useEffect(() => {
    profileUpdateRef.current = onProfileUpdate;
  }, [onProfileUpdate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserInfo();
        const data = res?.data?.data || res?.data;
        if (!data) return;
        const normalizedAvatarUrl = extractAvatarUrl(data);
        const normalizedLatitude = normalizeCoord(data.latitude ?? data.lat);
        const normalizedLongitude = normalizeCoord(data.longitude ?? data.lon ?? data.lng);
        const initialTwoFa =
          data.twoFaEnabled ??
          data.twoFactorEnabled ??
          data.isTwoFaEnabled ??
          false;
        setProfile({
          ...MOCK_USER,
          ...data,
          avatarUrl: normalizedAvatarUrl,
          latitude: normalizedLatitude,
          longitude: normalizedLongitude,
        });
        setTwoFactorEnabled(Boolean(initialTwoFa));
        const employer = Array.isArray(data.roles)
          ? data.roles.some((role) => role.name?.toUpperCase() === "EMPLOYER")
          : false;
        setIsEmployer(employer);
        if (normalizedAvatarUrl && avatarChangeRef.current) {
          avatarChangeRef.current(normalizedAvatarUrl);
        }
        if (profileUpdateRef.current) {
          profileUpdateRef.current({
            ...data,
            avatarUrl: normalizedAvatarUrl,
            latitude: normalizedLatitude,
            longitude: normalizedLongitude,
          });
        }
      } catch (err) {
        console.error("Không thể tải thông tin người dùng:", err);
      } finally {
        setAvatarError(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (isEmployer && activeTab === "career") {
      setActiveTab("info");
    }
  }, [isEmployer, activeTab]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!profile || isEmployer) return;
      try {
        setUserStatsLoading(true);
        const res = await getUserStats();
        const data = res?.data?.data || res?.data || null;
        setUserStats(data);
      } catch (error) {
        console.error("Không thể tải thống kê người dùng:", error);
      } finally {
        setUserStatsLoading(false);
      }
    };

    fetchUserStats();
  }, [profile, isEmployer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAddressPicker = () => {
    if (!isEditing) return;
    setIsLocationModalOpen(true);
  };

  const handleSelectAddress = (address, lat, lon) => {
    const normalizedLat = normalizeCoord(lat);
    const normalizedLon = normalizeCoord(lon);
    setProfile((prev) =>
      prev
        ? {
          ...prev,
          address,
          latitude: normalizedLat ?? prev.latitude,
          longitude: normalizedLon ?? prev.longitude,
        }
        : prev
    );
    setIsLocationModalOpen(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      const payload = {
        ...profile,
        latitude: normalizeCoord(profile.latitude),
        longitude: normalizeCoord(profile.longitude),
        // Đảm bảo preferredSalaryUnit có giá trị mặc định nếu chưa có
        preferredSalaryUnit: profile.preferredSalaryUnit || "VND_PER_HOUR",
      };
      const res = await updateUserInfo(payload);
      const serverProfile = res?.data?.data || res?.data || null;
      const normalizedAvatarUrl = serverProfile ? extractAvatarUrl(serverProfile) : payload.avatarUrl;
      const normalizedLatitude = serverProfile
        ? normalizeCoord(serverProfile.latitude ?? serverProfile.lat)
        : payload.latitude;
      const normalizedLongitude = serverProfile
        ? normalizeCoord(serverProfile.longitude ?? serverProfile.lon ?? serverProfile.lng)
        : payload.longitude;
      const updatedProfile = serverProfile
        ? {
          ...profile,
          ...serverProfile,
          avatarUrl: normalizedAvatarUrl,
          latitude: normalizedLatitude,
          longitude: normalizedLongitude,
        }
        : { ...payload, avatarUrl: normalizedAvatarUrl };

      setProfile(updatedProfile);

      if (normalizedAvatarUrl && onAvatarChange) {
        onAvatarChange(updatedProfile.avatarUrl);
      }

      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ:", error);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("vi-VN");

  const verificationStatusRaw =
    profile?.verificationStatus || "UNVERIFIED";
  const verificationStatus = verificationStatusRaw.toUpperCase();

  const VERIFICATION_BADGES = {
    VERIFIED: {
      label: "Đã xác minh",
      className: "bg-green-100 text-green-700 border border-green-200",
      icon: CheckCircle,
    },
    PENDING: {
      label: "Đang chờ xác minh",
      className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      icon: Clock,
    },
    REJECTED: {
      label: "Bị từ chối xác minh",
      className: "bg-red-100 text-red-700 border border-red-200",
      icon: XCircle,
    },
    UNVERIFIED: {
      label: "Chưa xác minh",
      className: "bg-gray-100 text-gray-600 border border-gray-200",
      icon: AlertCircle,
    },
  };

  const verificationBadge = VERIFICATION_BADGES[verificationStatus] || null;
  const verificationReason =
    profile?.verificationReason ||
    profile?.verificationMessage ||
    profile?.verificationRemark ||
    "";
  const trustBadge = getTrustBadge(profile?.trustScore);

  const isProfileComplete = Boolean(
    profile?.fullName &&
    profile?.contactPhone &&
    profile?.address
  );

  const isVerified = verificationStatus === "VERIFIED";
  const canRequestEmployerUpgrade = isProfileComplete && isVerified;

  const handleUpgradeRequest = async () => {
    if (!canRequestEmployerUpgrade) {
      showError(
        "Vui lòng cập nhật đầy đủ thông tin cá nhân và hoàn tất xác minh CCCD trước khi gửi yêu cầu."
      );
      return;
    }
    if (!profile?.id) {
      showError("Không tìm thấy mã người dùng.");
      return;
    }

    try {
      setIsUpgradeSubmitting(true);
      await upgradeRole(profile.id);
      showSuccess("Nâng cấp nhà tuyển dụng thành công! Vui lòng đăng nhập lại.");
      setIsUpgradeModalOpen(false);

      // Delay logout to allow toast/overlay to be seen
      setTimeout(async () => {
        try {
          await logout();
        } catch (logoutErr) {
          console.warn("Lỗi khi gọi API logout:", logoutErr);
        } finally {
          removeToken();
          window.location.href = "/login";
        }
      }, 1500);
    } catch (error) {
      console.error("Không thể gửi yêu cầu nâng cấp:", error);
      showError("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setIsUpgradeSubmitting(false);
    }
  };

  const handleToggleTwoFactor = async (targetState) => {
    if (twoFactorLoading || targetState === twoFactorEnabled) {
      return;
    }

    setTwoFactorLoading(true);
    try {
      const response = await updateTwoFactorStatus(targetState);
      const enabledResponse =
        response?.data?.enabled ??
        response?.data?.data?.enabled ??
        targetState;
      setTwoFactorEnabled(Boolean(enabledResponse));
      setProfile((prev) =>
        prev
          ? {
            ...prev,
            twoFaEnabled: enabledResponse,
            twoFactorEnabled: enabledResponse,
          }
          : prev
      );
      showSuccess(
        response?.data?.message ||
        (enabledResponse
          ? "Đã bật xác thực hai yếu tố."
          : "Đã tắt xác thực hai yếu tố.")
      );
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Không thể cập nhật trạng thái 2FA. Vui lòng thử lại.";
      showError(errorMessage);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Disable nút chỉnh sửa khi ở các tab không cho phép chỉnh sửa
  const isEditDisabled = ["2fa", "verify", "reviews"].includes(activeTab);

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
            <p className="text-gray-500">Đang tải dữ liệu hồ sơ...</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-gray-300 text-white" disabled>
            Chỉnh sửa
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6 shadow-sm h-64 animate-pulse" />
          <div className="col-span-2 bg-white border rounded-lg p-6 shadow-sm h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Hồ sơ cá nhân
          </h1>
          <p className="text-gray-500">
            Quản lý thông tin và hồ sơ của bạn
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {!isEmployer && (
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="px-4 py-2 rounded-lg border border-cyan-600 text-cyan-700 hover:bg-cyan-50 transition"
            >
              Nâng cấp nhà tuyển dụng
            </button>
          )}
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isEditDisabled}
            className={`px-4 py-2 rounded-lg transition ${isEditDisabled
              ? "bg-gray-400 text-white cursor-not-allowed"
              : isEditing
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-cyan-600 text-white hover:bg-cyan-700"
              }`}
          >
            {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
          </button>
        </div>
      </div>

      {/* Hồ sơ chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex flex-col items-center text-center relative">
            <div className="relative w-24 h-24 mb-3">
              <img
                src={avatarError || !profile?.avatarUrl ? "https://via.placeholder.com/150" : profile.avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border"
                onError={() => {
                  console.error('Lỗi khi tải ảnh avatar:', profile.avatarUrl);
                  setAvatarError(true);
                }}
                onLoad={() => setAvatarError(false)}
              />
              <button
                className={`absolute bottom-0 right-0 p-1.5 rounded-full transition ${isEditing ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"}`}
                title={isEditing ? "Không thể đổi avatar khi đang chỉnh sửa" : "Tải ảnh lên"}
                disabled={isEditing}
                onClick={() => {
                  if (isEditing) return;

                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';

                  input.onchange = async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    try {
                      const uploadRes = await uploadFile(file, "AVATAR");
                      console.log("Kết quả upload avatar:", uploadRes);

                      const newAvatarUrl = uploadRes;

                      setProfile(prev => ({
                        ...prev,
                        avatarUrl: newAvatarUrl
                      }));

                      if (onAvatarChange && newAvatarUrl) {
                        onAvatarChange(newAvatarUrl);
                      }

                    } catch (err) {
                      console.error("Lỗi upload avatar:", err);
                    }
                  };

                  input.click();
                }}
              >
                <Camera size={16} className="text-white" />
              </button>
            </div>

            <h2 className="font-semibold text-lg text-gray-800">
              {profile.fullName}
            </h2>


            {/* Rating và Verification Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-3 mb-3 px-2">
              {verificationBadge && (
                <span
                  className={`${verificationBadge.className} text-xs px-3 py-1 rounded-full flex items-center gap-1`}
                >
                  <verificationBadge.icon size={14} /> {verificationBadge.label}
                </span>
              )}

              {trustBadge && (
                <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${trustBadge.className}`}>
                  <Star className="h-3 w-3" />
                  <span className="font-medium">{trustBadge.label}</span>
                </div>
              )}
            </div>

            {/* Thông tin công việc */}
            {(profile.preferredJobType || profile.availableDays || profile.availableTime) && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2 mb-3 px-2">
                {profile.preferredJobType && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                    {profile.preferredJobType === "FULL_TIME" ? "Toàn thời gian" :
                      profile.preferredJobType === "PART_TIME" ? "Bán thời gian" :
                        profile.preferredJobType === "FREELANCE" ? "Freelance" :
                          profile.preferredJobType}
                  </span>
                )}
                {profile.availableDays && (
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full">
                    {formatWorkingDaysForDisplay(profile.availableDays)}
                  </span>
                )}
                {profile.availableTime && (
                  <span className="bg-cyan-100 text-cyan-700 text-xs px-3 py-1 rounded-full">
                    {profile.availableTime}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <span
                className={`text-xs px-2 py-1 rounded-full ${profile.status === "ACTIVE"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-600"
                  }`}
              >
                {profile.status === "ACTIVE" ? "Đang hoạt động" : "Tạm khóa"}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-600 w-full">
              <div className="flex items-center gap-2">
                <Mail size={16} /> {profile.email}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} /> {profile.address || "Chưa cập nhật"}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} /> Tham gia:{" "}
                {formatDate(profile.createdAt)}
              </div>
            </div>
          </div>

          {/* Thống kê */}
          {!isEmployer && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-3">Thống kê</h3>
              {userStatsLoading ? (
                <p className="text-sm text-gray-500">Đang tải thống kê...</p>
              ) : (
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ClipboardList size={16} /> Tổng lượt ứng tuyển
                    </span>
                    <span className="font-semibold text-gray-800">
                      {userStats?.totalApplications ?? 0}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle size={16} /> Công việc đã hoàn thành
                    </span>
                    <span className="font-semibold text-gray-800">
                      {userStats?.completedApplications ?? 0}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Percent size={16} /> Tỷ lệ hoàn thành
                    </span>
                    <span className="font-semibold text-gray-800">
                      {(() => {
                        const rawRate = Number(userStats?.completionRate ?? 0);
                        const percentValue = Number.isFinite(rawRate)
                          ? (rawRate > 1 ? rawRate : rawRate * 100)
                          : 0;
                        return `${percentValue.toFixed(1)}%`;
                      })()}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Star size={16} /> Đánh giá trung bình
                    </span>
                    <span className="font-semibold text-gray-800">
                      {Number(userStats?.averageRating ?? profile?.trustScore ?? 0).toFixed(1)} / 5.0
                      {` (${userStats?.totalRatings ?? profile.reviewCount ?? 0} lượt)`}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Star size={16} /> Hạng uy tín
                    </span>
                    <span className="font-semibold text-gray-800">
                      {trustBadge?.label || "Chưa xếp hạng"}
                    </span>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Cột phải */}
        <div className="col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
            {[
              { id: "info", label: "Thông tin cá nhân" },
              ...(!isEmployer ? [{ id: "career", label: "Thông tin việc làm" }] : []),
              { id: "2fa", label: "Bật 2FA" },
              { id: "verify", label: "Xác minh CCCD" },
              { id: "reviews", label: "Đánh giá" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            {activeTab === "info" && (
              <InfoTab
                profile={profile}
                isEditing={isEditing}
                handleChange={handleChange}
                onAddressPickerOpen={handleOpenAddressPicker}
              />
            )}

            {!isEmployer && activeTab === "career" && (
              <CareerInfoTab
                profile={profile}
                isEditing={isEditing}
                handleChange={handleChange}
              />
            )}

            {activeTab === "2fa" && (
              <TwoFactorTab
                twoFactorEnabled={twoFactorEnabled}
                isUpdating={twoFactorLoading}
                onToggle={handleToggleTwoFactor}
              />
            )}

            {activeTab === "verify" && (
              <VerifyCCCDTab
                verificationStatus={verificationStatus}
                rejectionReason={verificationReason}
                onVerifySuccess={async (nextStatus = "PENDING") => {
                  setProfile((prev) => {
                    if (!prev) return prev;
                    const updatedProfile = {
                      ...prev,
                      verificationStatus: nextStatus,
                      verificationReason: nextStatus === "PENDING" ? null : prev.verificationReason,
                    };
                    if (onProfileUpdate) {
                      onProfileUpdate(updatedProfile);
                    }
                    return updatedProfile;
                  });

                  try {
                    const refreshed = await getUserInfo();
                    const latest = refreshed?.data?.data;
                    if (latest) {
                      setProfile((prev) => (prev ? { ...prev, ...latest } : latest));
                    }
                  } catch (error) {
                    console.error("Không thể làm mới trạng thái xác minh:", error);
                  }
                }}
              />
            )}

            {activeTab === "reviews" && profile?.id && (
              <ReviewsTab userId={profile.id} />
            )}
          </div>
        </div>
      </div>
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Nâng cấp tài khoản nhà tuyển dụng
              </h2>
              <p className="text-gray-600 mt-1">
                Hãy đảm bảo bạn đã cập nhật hồ sơ và hoàn tất xác minh CCCD trước khi gửi yêu cầu.
              </p>
            </div>

            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${isProfileComplete ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
                <p className="font-medium text-sm text-gray-800">
                  {isProfileComplete ? "✓ Thông tin cá nhân đã đầy đủ" : "• Vui lòng cập nhật đầy đủ họ tên, số điện thoại và địa chỉ"}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isVerified ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
                <p className="font-medium text-sm text-gray-800">
                  {isVerified ? "✓ Đã xác minh CCCD" : "• Cần hoàn tất xác minh CCCD trong tab Xác minh"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleUpgradeRequest}
                disabled={!canRequestEmployerUpgrade || isUpgradeSubmitting}
                className={`px-4 py-2 rounded-lg text-white ${canRequestEmployerUpgrade && !isUpgradeSubmitting
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                {isUpgradeSubmitting ? "Đang xử lý..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}
      <LocationPickerModal
        open={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        defaultQuery={profile?.address || ""}
        onSelect={handleSelectAddress}
        hereApiKey={HERE_API_KEY}
      />
    </div>
  );
};

export default Profile;

