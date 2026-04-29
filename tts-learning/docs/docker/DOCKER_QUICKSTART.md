# 🐳 Quick Start - Docker Build

## 📌 Tóm tắt

Dự án có **2 cách sử dụng Docker**:

### ✅ Cách 1: Build và chạy với Docker (Khuyến nghị cho dev)

Sử dụng `serve` package để chạy app trong container.

```bash
# Build và chạy
docker-compose up -d

# Truy cập
http://localhost:3000

# Xem logs
docker-compose logs -f

# Dừng
docker-compose down
```

**Hoặc dùng Makefile:**

```bash
make build    # Build image
make run      # Chạy container
make logs     # Xem logs
make stop     # Dừng
```

### ✅ Cách 2: Chỉ build và lấy dist folder (Khuyến nghị cho production)

Dùng script để build và extract thư mục `dist`, sau đó bạn tự config Nginx.

```bash
# Chạy script
./docs/docke./docs/docker/docs/docker/scripts/build-and-extract.sh

# Kết quả: Thư mục ./dist đã sẵn sàng
# Bạn có thể copy dist lên server và config Nginx riêng
```

## 📁 Files quan trọng

| File                           | Mục đích                         |
| ------------------------------ | -------------------------------- |
| `Dockerfile`                   | Build và chạy với serve (Cách 1) |
| `Dockerfile.build-only`        | Chỉ build project (Cách 2)       |
| `docker-compose.yml`           | Orchestration cho Cách 1         |
| `docs/docker/scripts/build-and-extract.sh` | Script tự động cho Cách 2        |
| `DOCKER.md`                    | Hướng dẫn chi tiết               |

## 🎯 Khi nào dùng cách nào?

| Tình huống        | Dùng cách | Lý do                                   |
| ----------------- | --------- | --------------------------------------- |
| Development local | Cách 1    | Nhanh, đơn giản                         |
| Testing           | Cách 1    | Dễ debug                                |
| Production        | Cách 2    | Performance tốt, linh hoạt config Nginx |
| CI/CD             | Cách 2    | Build dist và deploy riêng              |

## 🚀 Next Steps

### Development

```bash
docker-compose up -d
```

### Production

```bash
# 1. Build và lấy dist
./docs/docker/docs/docker/scripts/build-and-extract.sh

# 2. Config Nginx (example)
server {
    listen 80;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 3. Deploy
scp -r ./dist user@server:/var/www/tts-learning
```

## 📚 Chi tiết

Xem `DOCKER.md` để biết thêm chi tiết về:

- Cấu trúc Dockerfile
- Nginx configuration
- Troubleshooting
- Advanced usage
