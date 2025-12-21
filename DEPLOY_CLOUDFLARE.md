# Hướng dẫn Deploy lên Cloudflare Pages

## Chuẩn bị

1. **Đảm bảo dự án build thành công:**
   ```bash
   npm run build
   ```
   Build output sẽ nằm trong thư mục `dist/`

2. **Kiểm tra các biến môi trường cần thiết:**
   - `VITE_API_GATEWAY` - URL của API Gateway
   - `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID
   - `VITE_OAUTH_REDIRECT_URI` - OAuth Redirect URI (phải khớp với domain Cloudflare Pages)
   - `VITE_HERE_API_KEY` - HERE API Key

## Cách 1: Deploy qua Cloudflare Dashboard (Khuyến nghị)

### Bước 1: Đăng nhập Cloudflare Dashboard
1. Truy cập [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Đăng nhập vào tài khoản của bạn

### Bước 2: Tạo Project mới
1. Vào **Pages** → **Create a project**
2. Chọn **Connect to Git** (GitHub, GitLab, hoặc Bitbucket)
3. Chọn repository chứa code của bạn
4. Click **Begin setup**

### Bước 3: Cấu hình Build Settings
- **Framework preset:** `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (hoặc để trống)

### Bước 4: Cấu hình Environment Variables
Trong phần **Environment variables**, thêm các biến sau:

**Production:**
```
VITE_API_GATEWAY=https://your-api-gateway.com/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_OAUTH_REDIRECT_URI=https://your-domain.pages.dev/authenticate
VITE_HERE_API_KEY=your-here-api-key
```

**Preview (cho các branch khác):**
```
VITE_API_GATEWAY=https://your-api-gateway.com/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_OAUTH_REDIRECT_URI=https://your-preview-domain.pages.dev/authenticate
VITE_HERE_API_KEY=your-here-api-key
```

**Lưu ý:** 
- Thay `your-domain.pages.dev` bằng domain thực tế của bạn
- Đảm bảo `VITE_OAUTH_REDIRECT_URI` khớp với domain Cloudflare Pages

### Bước 5: Deploy
1. Click **Save and Deploy**
2. Cloudflare sẽ tự động build và deploy dự án
3. Sau khi hoàn tất, bạn sẽ nhận được URL như: `https://your-project.pages.dev`

## Cách 2: Deploy bằng Wrangler CLI

### Bước 1: Cài đặt Wrangler
```bash
npm install -g wrangler
# hoặc
npm install --save-dev wrangler
```

### Bước 2: Đăng nhập Cloudflare
```bash
wrangler login
```

### Bước 3: Tạo file `wrangler.toml` (tùy chọn)
File này đã được tạo sẵn trong dự án với cấu hình cơ bản.

### Bước 4: Deploy
```bash
# Build trước
npm run build

# Deploy
wrangler pages deploy dist
```

Hoặc deploy trực tiếp từ Git:
```bash
wrangler pages project create jobmate-fe
wrangler pages deployment create --project-name=jobmate-fe
```

## Cách 3: Deploy tự động qua GitHub Actions

Tạo file `.github/workflows/deploy-cloudflare.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_GATEWAY: ${{ secrets.VITE_API_GATEWAY }}
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
          VITE_OAUTH_REDIRECT_URI: ${{ secrets.VITE_OAUTH_REDIRECT_URI }}
          VITE_HERE_API_KEY: ${{ secrets.VITE_HERE_API_KEY }}
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: jobmate-fe
          directory: dist
```

**Lưu ý:** Cần thêm các secrets vào GitHub repository:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_API_GATEWAY`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_OAUTH_REDIRECT_URI`
- `VITE_HERE_API_KEY`

## Cấu hình Custom Domain

1. Vào **Pages** → Chọn project của bạn
2. Vào tab **Custom domains**
3. Click **Set up a custom domain**
4. Nhập domain của bạn và làm theo hướng dẫn
5. Cập nhật lại `VITE_OAUTH_REDIRECT_URI` với domain mới

## Xử lý Routing (SPA)

File `public/_redirects` đã được tạo để xử lý routing cho Single Page Application. File này sẽ redirect tất cả các route về `/index.html` với status code 200.

## Troubleshooting

### Build fails
- Kiểm tra lại các biến môi trường đã được cấu hình đúng chưa
- Xem logs trong Cloudflare Dashboard để biết lỗi cụ thể

### Routing không hoạt động
- Đảm bảo file `public/_redirects` đã được commit vào Git
- Kiểm tra lại cấu hình trong Cloudflare Pages

### Environment variables không được áp dụng
- Đảm bảo các biến bắt đầu bằng `VITE_`
- Rebuild lại project sau khi thay đổi environment variables

## Tài liệu tham khảo

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#cloudflare-pages)

