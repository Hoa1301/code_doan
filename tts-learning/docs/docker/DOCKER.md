# 🐳 Docker Build Guide (Simple Version)

## 📋 Tổng quan

Dockerfile này được thiết kế đơn giản để **chỉ build project**, không bao gồm Nginx. Bạn có thể tự config Nginx riêng sau khi có thư mục `dist`.

## 🎯 Hai phương án sử dụng

### Phương án 1: Build và chạy với Docker (Sử dụng serve)

Dockerfile chính sử dụng `serve` package để serve static files trong container.

```bash
# Build image
docker build -t tts-learning:latest .

# Run container
docker run -d -p 3000:3000 --name tts-learning-app tts-learning:latest

# Truy cập
http://localhost:3000
```

**Hoặc dùng Docker Compose:**

```bash
# Chạy
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng
docker-compose down
```

### Phương án 2: Chỉ build và copy dist ra ngoài

Sử dụng `Dockerfile.build-only` để chỉ build project, sau đó copy `dist` folder ra ngoài.

```bash
# Build với build-only dockerfile
docker build -f Dockerfile.build-only -t tts-learning-builder --target builder .

# Tạo container tạm để copy dist
docker create --name temp-builder tts-learning-builder

# Copy dist folder ra ngoài
docker cp temp-builder:/app/dist ./dist

# Xóa container tạm
docker rm temp-builder

# Bây giờ bạn có thư mục dist/ để config Nginx riêng
```

**Script tự động:**

```bash
#!/bin/bash
# build-and-extract.sh

echo "Building project..."
docker build -f Dockerfile.build-only -t tts-learning-builder --target builder .

echo "Extracting dist folder..."
docker create --name temp-builder tts-learning-builder
docker cp temp-builder:/app/dist ./dist
docker rm temp-builder

echo "✓ Build complete! Dist folder is ready at ./dist"
echo "You can now configure your own Nginx to serve ./dist"
```

## 📦 Cấu trúc Files

### Dockerfile (Chính)

- **Stage 1 (deps)**: Install dependencies
- **Stage 2 (builder)**: Build project
- **Stage 3 (runtime)**: Serve với `serve` package

### Dockerfile.build-only

- **Stage 1 (builder)**: Build project
- **Stage 2 (dist)**: Chỉ chứa dist folder

## 🔧 Makefile Commands

```bash
# Build image
make build

# Run container
make run

# View logs
make logs

# Stop
make stop

# Clean up
make clean
```

## 🌐 Config Nginx riêng (Sau khi có dist folder)

### Nginx Config Example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Deploy với Nginx

```bash
# Copy dist folder vào server
scp -r ./dist user@server:/var/www/tts-learning

# Trên server, config nginx
sudo nano /etc/nginx/sites-available/tts-learning

# Enable site
sudo ln -s /etc/nginx/sites-available/tts-learning /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## 📊 So sánh hai phương án

| Tiêu chí        | Phương án 1 (serve)  | Phương án 2 (build-only) |
| --------------- | -------------------- | ------------------------ |
| **Dễ dùng**     | ✅ Rất dễ            | ⚠️ Cần config Nginx      |
| **Performance** | ⚠️ Tốt               | ✅ Rất tốt (Nginx)       |
| **Linh hoạt**   | ❌ Hạn chế           | ✅ Cao                   |
| **Production**  | ⚠️ OK cho small apps | ✅ Khuyến nghị           |
| **Kích thước**  | ~200MB               | Chỉ dist (~5-10MB)       |

## 🚀 Khuyến nghị

### Development

- Dùng **Phương án 1** với Docker Compose
- Nhanh, đơn giản, không cần config gì thêm

### Production

- Dùng **Phương án 2** để build
- Config Nginx riêng với SSL, caching, security headers
- Performance tốt hơn, linh hoạt hơn

## 🔍 Troubleshooting

### Build lỗi "yarn: not found"

```bash
# Rebuild without cache
docker build --no-cache -t tts-learning:latest .
```

### Port 3000 đã được sử dụng

```bash
# Đổi port trong docker-compose.yml
ports:
  - "8080:3000"  # Host port 8080, container port 3000
```

### Copy dist lỗi

```bash
# Kiểm tra container có tồn tại không
docker ps -a | grep temp-builder

# Xóa container cũ nếu có
docker rm temp-builder

# Thử lại
```

## 📚 Next Steps

1. **Development**: `docker-compose up -d`
2. **Build for production**: Dùng script `build-and-extract.sh`
3. **Config Nginx**: Tạo config file cho domain của bạn
4. **Deploy**: Upload dist + nginx config lên server

## 🤝 Support

Nếu cần hỗ trợ:

- Check logs: `docker logs tts-learning-app`
- Rebuild: `make build-no-cache`
- Clean all: `make clean`
