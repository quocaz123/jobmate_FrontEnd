# Jobmate FE (React + Vite)

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create an `.env` (or `.env.local`) file at the project root and add your HERE API key:
   ```bash
   VITE_HERE_API_KEY=your_here_api_key
   ```
   - You can obtain this key from the HERE developer dashboard (Apps and Credentials).
   - Never commit the real key—keep it only in your local `.env`.
3. Run the app:
   ```bash
   npm run dev
   ```

## Environment Variables

Tạo file `.env` hoặc `.env.local` ở thư mục gốc với các biến sau:

| Variable                  | Required | Description                                             |
| ------------------------- | -------- | ------------------------------------------------------- |
| `VITE_API_GATEWAY`        | No       | API Gateway URL (mặc định: http://localhost:8888/api/v1) |
| `VITE_GOOGLE_CLIENT_ID`   | No       | Google OAuth Client ID                                  |
| `VITE_OAUTH_REDIRECT_URI` | No       | OAuth Redirect URI (mặc định: http://localhost:5173/authenticate) |
| `VITE_HERE_API_KEY`       | Yes      | HERE Geocoding & Search API key used by location modal. |

**Lưu ý:** 
- Các biến `VITE_*` sẽ được embed vào build, đảm bảo cấu hình đúng trước khi build production
- Xem file `DEPLOY.md` để biết cách cấu hình cho production deployment

The `LocationPickerModal` automatically falls back to `import.meta.env.VITE_HERE_API_KEY`, but you can override it per-usage via the `hereApiKey` prop if needed.

## Build & Deploy

### Build cho production
```bash
npm run build
```

### Preview build local
```bash
npm run preview
```

### Serve dist folder (cho Cloudflare Tunnel)
```bash
npm run serve:dist
```

**Chi tiết về deployment:** Xem file [DEPLOY.md](./DEPLOY.md) để biết cách triển khai với Cloudflare Tunnel và các phương pháp khác.

## Tech Highlights

- React 19 + Vite for fast development
- Tailwind CSS utility classes in components
- HERE Autocomplete + Reverse Geocoding inside `LocationPickerModal`
- Environment-based configuration cho development và production
