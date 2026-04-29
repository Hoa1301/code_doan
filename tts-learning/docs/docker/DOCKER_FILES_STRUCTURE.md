# 📂 Docker Files Structure

```
tts-learning/
│
├── 🐳 Docker Configuration Files
│   ├── Dockerfile                      # Main: Build + Serve với 'serve' package
│   ├── Dockerfile.build-only           # Alternative: Chỉ build, output dist
│   ├── .dockerignore                   # Loại trừ files không cần thiết
│   ├── docker-compose.yml              # Orchestration (frontend + json-server)
│   └── nginx.conf                      # Nginx config reference
│
├── ⚙️ Configuration
│   ├── .env.production.example         # Environment variables template
│   └── Makefile                        # Docker shortcuts commands
│
├── 📜 Scripts
│   └── scripts/
│       ├── build-and-extract.sh        # Build và extract dist folder
│       └── validate-docker.sh          # Validate Docker setup
│
└── 📚 Documentation
    ├── DOCKER_QUICKSTART.md            # Quick start guide
    ├── DOCKER.md                       # Chi tiết hướng dẫn
    └── DOCKER_SETUP_SUMMARY.md         # Tổng quan setup
```

## 🎯 File Purposes

### Core Docker Files

| File                    | Purpose                   | When to Use                  |
| ----------------------- | ------------------------- | ---------------------------- |
| `Dockerfile`            | Build + serve với Node.js | Development, Testing         |
| `Dockerfile.build-only` | Chỉ build project         | Production (với Nginx riêng) |
| `.dockerignore`         | Exclude unnecessary files | Always (tự động)             |
| `docker-compose.yml`    | Orchestrate services      | Development                  |

### Configuration

| File                      | Purpose                        | When to Use      |
| ------------------------- | ------------------------------ | ---------------- |
| `nginx.conf`              | Nginx configuration reference  | Production setup |
| `.env.production.example` | Environment variables template | Before build     |
| `Makefile`                | Shortcuts for Docker commands  | Development      |

### Scripts

| File                   | Purpose                   | When to Use        |
| ---------------------- | ------------------------- | ------------------ |
| `build-and-extract.sh` | Auto build & extract dist | Production build   |
| `validate-docker.sh`   | Validate setup            | Before first build |

### Documentation

| File                      | Purpose        | When to Use                |
| ------------------------- | -------------- | -------------------------- |
| `DOCKER_QUICKSTART.md`    | Quick start    | First time setup           |
| `DOCKER.md`               | Detailed guide | Deep dive                  |
| `DOCKER_SETUP_SUMMARY.md` | Overview       | Understanding architecture |

## 🚀 Usage Flow

### Development Flow

```
1. docker-compose up -d
   ↓
2. Access http://localhost:3000
   ↓
3. docker-compose logs -f (if needed)
   ↓
4. docker-compose down (when done)
```

### Production Flow

```
1. ./docs/docker/docs/docker/scripts/build-and-extract.sh
   ↓
2. ./dist folder is ready
   ↓
3. Configure Nginx (use nginx.conf as reference)
   ↓
4. Deploy dist to server
```

## 📋 Checklist

### Before First Build

- [ ] Review `DOCKER_QUICKSTART.md`
- [ ] Run `./docs/docker/docs/docker/scripts/validate-docker.sh`
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Update environment variables

### Development

- [ ] Run `docker-compose up -d`
- [ ] Check `http://localhost:3000`
- [ ] Use `make logs` to debug

### Production

- [ ] Run `./docs/docker/docs/docker/scripts/build-and-extract.sh`
- [ ] Review `nginx.conf`
- [ ] Configure SSL/HTTPS
- [ ] Deploy `dist` folder

## 🎓 Learning Path

1. **Start here**: `DOCKER_QUICKSTART.md`
2. **Understand**: `DOCKER_SETUP_SUMMARY.md`
3. **Deep dive**: `DOCKER.md`
4. **Reference**: `nginx.conf`, `Makefile`

## 💡 Tips

- Use `make help` to see all available commands
- Use `Dockerfile` for development (easier)
- Use `Dockerfile.build-only` for production (optimized)
- Keep `nginx.conf` as reference even if not using it immediately
- Run `validate-docker.sh` if something doesn't work
