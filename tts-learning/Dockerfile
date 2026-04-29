# ================================
# Stage 1: Build Stage
# ================================
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# ================================
# Stage 2: Production Stage (Ultimate Smallest Size)
# ================================
# Busybox is only ~1.2MB. Total image will be ~5MB.
FROM busybox:1.36-musl

# Create a non-root user
RUN adduser -D staticuser

WORKDIR /home/staticuser

# Copy built assets from builder stage
COPY --from=builder /app/dist ./www

# Health check file
RUN echo "healthy" > ./www/health

USER staticuser

# Expose port (Busybox httpd default or custom)
EXPOSE 8081

# Start Busybox httpd
# -f: run in foreground
# -p 8080: port
# -h /home/staticuser/www: document root
CMD ["httpd", "-f", "-p", "8081", "-h", "/home/staticuser/www"]
