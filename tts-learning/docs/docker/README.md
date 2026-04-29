# 🐳 Docker Documentation

Tất cả tài liệu và scripts liên quan đến Docker đã được tổ chức trong thư mục này.

## 📂 Cấu trúc

```
docs/docker/
├── scripts/
│   ├── build-and-extract.sh       # Build project và extract dist folder
│   └── validate-docker.sh         # Validate Docker setup
│
├── DOCKER_QUICKSTART.md           # Quick start guide
├── DOCKER.md                      # Detailed documentation
├── DOCKER_SETUP_SUMMARY.md        # Architecture overview
└── DOCKER_FILES_STRUCTURE.md      # File structure guide
```

## 🚀 Quick Start

### Development (Chạy với Docker)

```bash
# Từ root project
docker-compose up -d

# Hoặc
make run
```

### Production (Build dist)

```bash
# Từ root project
./docs/docke./docs/docker/docs/docker/scripts/build-and-extract.sh

# Kết quả: ./dist folder sẵn sàng
```

## 📚 Documentation

1. **[DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)** - Bắt đầu nhanh
2. **[DOCKER.md](./DOCKER.md)** - Hướng dẫn chi tiết
3. **[DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md)** - Tổng quan kiến trúc
4. **[DOCKER_FILES_STRUCTURE.md](./DOCKER_FILES_STRUCTURE.md)** - Cấu trúc files

## 🔧 Scripts

### build-and-extract.sh

Build project và extract dist folder để deploy với Nginx riêng.

```bash
./docs/docke./docs/docker/docs/docker/scripts/build-and-extract.sh
```

### validate-docker.sh

Kiểm tra Docker setup trước khi build.

```bash
./docs/docke./docs/docker/docs/docker/scripts/validate-docker.sh
```

## 💡 Lưu ý

- Các files trong thư mục này **đã được ignore** trong `.dockerignore`
- Điều này giúp giảm kích thước Docker build context
- Scripts vẫn có thể chạy từ root project

## 🎯 Core Docker Files (ở root)

Các files Docker chính vẫn ở root project:

- `Dockerfile` - Main dockerfile
- `Dockerfile.build-only` - Build-only dockerfile
- `docker-compose.yml` - Orchestration
- `.dockerignore` - Ignore rules
- `nginx.conf` - Nginx config reference
- `Makefile` - Shortcuts commands
