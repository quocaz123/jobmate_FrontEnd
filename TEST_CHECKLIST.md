# Checklist Test OAuth Google trên Cloudflare Pages

## ✅ Đã hoàn thành

- [x] Code đã được push lên GitHub
- [x] Cloudflare Pages đã deploy thành công
- [x] Environment variables đã được cấu hình:
  - [x] `VITE_GOOGLE_CLIENT_ID`
  - [ ] `VITE_OAUTH_REDIRECT_URI` (cần kiểm tra)
  - [ ] `VITE_API_GATEWAY` (cần kiểm tra)

## 🧪 Các bước test

### 1. Kiểm tra Environment Variables trong Cloudflare Pages

1. Vào Cloudflare Dashboard → **Pages** → Chọn project `jobmate_FrontEnd`
2. Vào **Settings** → **Environment variables**
3. Kiểm tra các biến sau đã được set chưa:

**Production:**
```
VITE_GOOGLE_CLIENT_ID=529882234039-emb0404sjs59gor95pf3chjujm3drm7v.apps.googleusercontent.com
VITE_OAUTH_REDIRECT_URI=https://jobmate.fun/authenticate
VITE_API_GATEWAY=https://api.jobmate.fun/api/v1
```

### 2. Kiểm tra Google Cloud Console

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn đúng **Project**
3. Vào **APIs & Services** → **Credentials**
4. Tìm Client ID: `529882234039-emb0404sjs59gor95pf3chjujm3drm7v.apps.googleusercontent.com`
5. Kiểm tra **Authorized redirect URIs** có:
   ```
   https://jobmate.fun/authenticate
   http://localhost:5173/authenticate
   ```

### 3. Test trên Browser

1. Mở `https://jobmate.fun` trong browser
2. Mở **Browser Console** (F12)
3. Vào tab **Console**
4. Click nút **"Đăng nhập với Google"**
5. Kiểm tra console logs:
   - ✅ Nếu thấy: `OAuth Config: { clientId: '✅ Set', redirectUri: '...', ... }`
   - ❌ Nếu thấy: `❌ VITE_GOOGLE_CLIENT_ID không được set!` → Cần cấu hình lại

### 4. Test OAuth Flow

1. Click **"Đăng nhập với Google"**
2. Chọn tài khoản Google
3. Cho phép quyền truy cập
4. Kiểm tra:
   - ✅ Redirect về `https://jobmate.fun/authenticate?code=...`
   - ✅ Thấy loading "Authenticating..."
   - ✅ Đăng nhập thành công và redirect đến dashboard
   - ❌ Nếu lỗi → Xem console logs để debug

### 5. Kiểm tra Network Requests

1. Mở **Network tab** trong Browser DevTools (F12)
2. Thử đăng nhập bằng Google
3. Tìm request: `POST /api/v1/jobmate/auth/outbound/authentication`
4. Kiểm tra:
   - ✅ Status: `200 OK`
   - ✅ Response có `token`
   - ❌ Nếu `500 Internal Server Error` → Kiểm tra backend
   - ❌ Nếu `401 Unauthorized` → Kiểm tra Client ID và Redirect URI

## 🔍 Debug Tips

### Nếu gặp lỗi "invalid_client" (401):

1. Kiểm tra `VITE_GOOGLE_CLIENT_ID` trong Cloudflare Pages
2. Kiểm tra Client ID trong Google Console có đúng không
3. Đảm bảo Client ID đang ở trạng thái **Enabled**

### Nếu gặp lỗi "redirect_uri_mismatch":

1. Kiểm tra `VITE_OAUTH_REDIRECT_URI` trong Cloudflare Pages
2. Đảm bảo URI khớp với **Authorized redirect URIs** trong Google Console
3. Kiểm tra có dấu `/` ở cuối không (không nên có)

### Nếu gặp lỗi 500 Internal Server Error:

1. Kiểm tra backend API có hoạt động không
2. Kiểm tra backend có nhận được `code` và `redirect_uri` không
3. Kiểm tra backend logs để xem lỗi cụ thể

## 📝 Ghi chú

- Sau khi thay đổi Environment Variables, Cloudflare Pages sẽ tự động rebuild
- Có thể trigger rebuild thủ công: **Deployments** → **Retry deployment**
- Thời gian rebuild thường mất 2-5 phút

