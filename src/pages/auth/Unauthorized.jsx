export default function Unauthorized() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold text-red-600">403 - Không có quyền truy cập</h1>
      <p className="text-gray-500 mt-2">Bạn không được phép vào trang này.</p>
      <a href="/" className="text-blue-600 hover:underline mt-4 block">Quay về trang chủ</a>
    </div>
  );
}
