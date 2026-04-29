# 📦 Docker Setup Summary

## ✅ Đã hoàn thành

Tôi đã tạo một Docker setup hoàn chỉnh cho dự án TTS-Learning với **2 phương án sử dụng linh hoạt**.

### 📁 Files đã tạo

```
tts-learning/
├── Dockerfile                          # Main Dockerfile (build + serve)
├── Dockerfile.build-only               # Build-only (chỉ tạo dist)
├── .dockerignore                       # Loại trừ files không cần thiết
├── docker-compose.yml                  # Orchestration config
├── nginx.conf                          # Nginx config (reference)
├── .env.production.example             # Environment variables template
├── Makefile                            # Shortcuts commands
├── DOCKER.md                           # Hướng dẫn chi tiết
├── DOCKER_QUICKSTART.md                # Quick start guide
└── scripts/
    ├── build-and-extract.sh            # Script build và extract dist
    └── validate-docker.sh              # Validation script
```

## 🎯 Hai phương án sử dụng

### Phương án 1: Build và chạy với Docker (Development)

**Dockerfile chính** sử dụng `serve` package để serve static files.

```bash
# Quick start
docker-compose up -d

# Hoặc
make build && make run

# Truy cập: http://localhost:3000
```

**Ưu điểm:**

- ✅ Đơn giản, nhanh chóng
- ✅ Phù hợp development và testing
- ✅ Không cần config gì thêm

**Nhược điểm:**

- ⚠️ Performance không tối ưu bằng Nginx
- ⚠️ Kích thước image lớn hơn (~200MB)

### Phương án 2: Chỉ build và lấy dist (Production)

**Dockerfile.build-only** chỉ build project, bạn tự config Nginx riêng.

```bash
# Chạy script
./docs/docker/docs/docker/scripts/build-and-extract.sh

# Kết quả: ./dist folder sẵn sàng để deploy
```

**Ưu điểm:**

- ✅ Performance tối ưu với Nginx riêng
- ✅ Linh hoạt config SSL, caching, security
- ✅ Kích thước nhỏ (chỉ dist ~5-10MB)
- ✅ Phù hợp CI/CD pipeline

**Nhược điểm:**

- ⚠️ Cần config Nginx riêng

## 🏗️ Kiến trúc Dockerfile

### Dockerfile chính (Multi-stage)

```
Stage 1: Dependencies (node:20-alpine)
    ↓ Install yarn dependencies

Stage 2: Builder (node:20-alpine)
    ↓ Copy dependencies + Build Vite app

Stage 3: Runtime (node:20-alpine)
    ↓ Copy dist + Install serve
    ↓ Serve static files on port 3000
```

**Tối ưu hóa:**

- ✅ Layer caching cho dependencies
- ✅ Multi-stage build giảm kích thước
- ✅ Non-root user (security)
- ✅ Health check built-in
- ✅ Alpine Linux (minimal base)

### Dockerfile.build-only (Simple)

```
Stage 1: Builder (node:20-alpine)
    ↓ Install dependencies + Build

Stage 2: Dist (scratch)
    ↓ Chỉ chứa dist folder
```

## 🚀 Quick Commands

### Development

```bash
# Build và chạy
make run

# Xem logs
make logs

# Dừng
make stop

# Clean up
make clean
```

### Production Build

```bash
# Build và extract dist
./docs/docker/docs/docker/scripts/build-and-extract.sh

# Hoặc manual
docker build -f Dockerfile.build-only -t builder --target builder .
docker create --name temp builder
docker cp temp:/app/dist ./dist
docker rm temp
```

## 📊 So sánh

| Tiêu chí             | Phương án 1 | Phương án 2    |
| -------------------- | ----------- | -------------- |
| **Dễ sử dụng**       | ⭐⭐⭐⭐⭐  | ⭐⭐⭐         |
| **Performance**      | ⭐⭐⭐      | ⭐⭐⭐⭐⭐     |
| **Linh hoạt**        | ⭐⭐        | ⭐⭐⭐⭐⭐     |
| **Production-ready** | ⭐⭐⭐      | ⭐⭐⭐⭐⭐     |
| **Kích thước**       | ~200MB      | ~5-10MB (dist) |

## 🔧 Configuration

### Environment Variables

```bash
# Copy template
cp .env.production.example .env.production

# Edit values
VITE_API_BASE_URL=https://your-api.com
VITE_APP_NAME=Your App Name
```

### Nginx Config (Nếu dùng Phương án 2)

File `nginx.conf` đã được tạo sẵn làm reference. Bạn có thể:

1. **Sử dụng trực tiếp** file này
2. **Customize** theo nhu cầu (SSL, proxy, etc.)
3. **Integrate** vào Nginx server hiện có

**Key features trong nginx.conf:**

- ✅ Gzip compression
- ✅ Static assets caching
- ✅ Security headers
- ✅ SPA routing (fallback to index.html)
- ✅ Health check endpoint

## 🎓 Khuyến nghị sử dụng

### Scenario 1: Local Development

```bash
docker-compose up -d
```

→ Nhanh nhất, đơn giản nhất

### Scenario 2: Testing/Staging

```bash
docker-compose up -d
```

→ Giống production nhưng dễ debug

### Scenario 3: Production Deployment

```bash
./docs/docker/docs/docker/scripts/build-and-extract.sh
# → Deploy dist với Nginx riêng
```

→ Performance tốt nhất, linh hoạt nhất

### Scenario 4: CI/CD Pipeline

```bash
# In CI/CD script
docker build -f Dockerfile.build-only --target builder -t builder .
docker create --name temp builder
docker cp temp:/app/dist ./dist
docker rm temp
# → Upload dist to S3/CDN/Server
```

→ Tích hợp dễ dàng vào pipeline

## 🐛 Troubleshooting

### Build lỗi

```bash
make build-no-cache
```

### Port bị chiếm

```bash
# Đổi port trong docker-compose.yml
ports:
  - "8080:3000"
```

### Container không start

```bash
docker logs tts-learning-app
make health
```

## 📚 Documentation

- **Quick Start**: `DOCKER_QUICKSTART.md`
- **Chi tiết**: `DOCKER.md`
- **Makefile commands**: `make help`

## 🎯 Kết luận

Bạn có **2 cách linh hoạt** để sử dụng Docker:

1. **Cách 1 (serve)**: Dễ, nhanh, phù hợp dev/test
2. **Cách 2 (build-only)**: Tối ưu, linh hoạt, phù hợp production

**Nginx config** đã được chuẩn bị sẵn để bạn tham khảo hoặc sử dụng trực tiếp khi cần.

---

**Tạo bởi:** Backend Specialist Agent  
**Ngày:** 2026-02-15  
**Dự án:** TTS-Learning (React 19 + Vite + TypeScript)
