# ============================================================
# STAGE 1: Build — compile TypeScript → JavaScript
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifest trước để tận dụng Docker cache layer
COPY package.json yarn.lock ./

# Cài TOÀN BỘ dependencies (bao gồm devDependencies để build)
RUN yarn install --frozen-lockfile

# Copy source và build
COPY . .
RUN yarn build

# ============================================================
# STAGE 2: Production deps — chỉ cài production dependencies
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./

# Báo cho yarn và một số bindings C++ biết là đang ở mode production
ENV NODE_ENV=production

# Cài chỉ production deps + dọn cache + xoá thư mục thừa/file rác để tiết kiệm thêm 20-30MB
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean && \
    find node_modules -type f -name "*.md" -delete && \
    find node_modules -type f -name "*.map" -delete

# ============================================================
# STAGE 3: Final — image chạy production, nhỏ nhất có thể
# ============================================================
FROM node:20-alpine

WORKDIR /app

# Khai báo môi trường để NestJS & Express chạy nhanh hơn, tắt các debug log
ENV NODE_ENV=production

# Thêm user non-root để bảo mật (không chạy với quyền root)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy từ các stage trước — CHỈ những gì cần thiết
COPY --from=deps   --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist         ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Chuyển sang user non-root
USER nestjs

# Expose port (khớp với NestJS config)
EXPOSE 3001

# Health check để container orchestrator biết app đã sẵn sàng
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

# Start app với node trực tiếp (không qua nest CLI)
CMD ["node", "dist/main"]
