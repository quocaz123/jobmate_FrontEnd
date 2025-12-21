import React from "react";
import { X, Users, Briefcase, Shield, Star, MessageCircle, Bell, Search, CheckCircle } from "lucide-react";

const GuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-8 py-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">🎓 Hướng dẫn sử dụng JobMate</h2>
            <p className="text-blue-100">Nền tảng kết nối sinh viên với cơ hội việc làm part-time</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-8 space-y-8">
          {/* Giới thiệu */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-indigo-600" />
              </div>
              Giới thiệu về JobMate
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              JobMate là nền tảng thông minh giúp sinh viên tìm kiếm việc làm part-time phù hợp với lịch học, 
              kỹ năng và vị trí địa lý. Chúng tôi sử dụng công nghệ AI matching để kết nối ứng viên và nhà tuyển dụng 
              một cách hiệu quả nhất.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">500+</p>
                <p className="text-sm text-gray-600">Công việc bán thời gian</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">2,000+</p>
                <p className="text-sm text-gray-600">Sinh viên đã xác minh</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">4.8⭐</p>
                <p className="text-sm text-gray-600">Đánh giá 2 chiều</p>
              </div>
            </div>
          </section>

          {/* 3 Vai trò */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              Ba vai trò chính
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sinh viên */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-bold text-lg mb-2">Sinh viên</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Tìm việc phù hợp kỹ năng & lịch học</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Ứng tuyển & quản lý profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Xác minh CCCD để tăng uy tín</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Đánh giá & nhận đánh giá</span>
                  </li>
                </ul>
              </div>

              {/* Nhà tuyển dụng */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-bold text-lg mb-2">Nhà tuyển dụng</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Đăng tin tuyển dụng miễn phí</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>AI gợi ý ứng viên phù hợp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Quản lý ứng tuyển & lời mời</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Xây dựng uy tín thương hiệu</span>
                  </li>
                </ul>
              </div>

              {/* Admin */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-bold text-lg mb-2">Quản trị viên</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Xác minh CCCD sinh viên</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Duyệt & kiểm duyệt tin tuyển dụng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Xử lý báo cáo vi phạm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Theo dõi hệ thống & audit log</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tính năng nổi bật */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              Tính năng nổi bật
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Tìm kiếm thông minh</h5>
                  <p className="text-sm text-gray-600">
                    AI matching dựa trên 10+ yếu tố: kỹ năng, vị trí, lịch học, mức lương, kinh nghiệm...
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Thông báo realtime</h5>
                  <p className="text-sm text-gray-600">
                    Nhận email & notification khi có ứng tuyển, lời mời, thay đổi trạng thái qua Kafka/Redis.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Chat trực tiếp</h5>
                  <p className="text-sm text-gray-600">
                    Giao tiếp realtime với nhà tuyển dụng qua Socket.IO, chia sẻ file CV/portfolio.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Bảo mật cao</h5>
                  <p className="text-sm text-gray-600">
                    Xác minh CCCD, JWT authentication, mã hóa dữ liệu, 2FA cho tài khoản quan trọng.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <div className="bg-yellow-100 p-2 rounded-lg flex-shrink-0">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Đánh giá 2 chiều</h5>
                  <p className="text-sm text-gray-600">
                    Sinh viên đánh giá nhà tuyển dụng, nhà tuyển dụng đánh giá sinh viên để xây dựng uy tín.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Báo cáo vi phạm</h5>
                  <p className="text-sm text-gray-600">
                    Hệ thống báo cáo, kiểm duyệt và xử lý vi phạm tự động để đảm bảo môi trường an toàn.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quy trình */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">🚀 Quy trình sử dụng</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Đăng ký & Xác minh</h5>
                  <p className="text-sm text-gray-600">
                    Đăng ký tài khoản qua email hoặc Google OAuth. Sinh viên nên xác minh CCCD để tăng uy tín.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Hoàn thiện hồ sơ</h5>
                  <p className="text-sm text-gray-600">
                    Cập nhật kỹ năng, kinh nghiệm, lịch rảnh, vị trí để AI gợi ý việc làm chính xác hơn.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Tìm kiếm & Ứng tuyển</h5>
                  <p className="text-sm text-gray-600">
                    Duyệt danh sách việc làm, lọc theo khoảng cách/lương/kỹ năng, ứng tuyển hoặc chờ lời mời.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Chat & Làm việc</h5>
                  <p className="text-sm text-gray-600">
                    Sau khi được chấp nhận, chat trực tiếp với nhà tuyển dụng để thống nhất chi tiết công việc.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  5
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Đánh giá & Badge</h5>
                  <p className="text-sm text-gray-600">
                    Sau khi hoàn thành công việc, đánh giá lẫn nhau để tích lũy uy tín và nhận badge.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">⚙️ Công nghệ sử dụng</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-gray-900">Backend</p>
                <p className="text-gray-600 text-xs mt-1">Spring Boot, PostgreSQL, Redis, Kafka, Elasticsearch</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-gray-900">Frontend</p>
                <p className="text-gray-600 text-xs mt-1">React 19, Vite, Tailwind CSS</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-gray-900">Real-time</p>
                <p className="text-gray-600 text-xs mt-1">Socket.IO, MongoDB, Kafka</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-gray-900">Security</p>
                <p className="text-gray-600 text-xs mt-1">JWT, OAuth2, CCCD verification</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-8 py-6 rounded-b-2xl border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            📧 Liên hệ hỗ trợ: <span className="font-semibold text-blue-600">support@jobmate.vn</span>
          </p>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:scale-105 transition-all shadow-md"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;

