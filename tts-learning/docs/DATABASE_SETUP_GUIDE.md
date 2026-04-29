# HƯỚNG DẪN SETUP VÀ MIGRATION DATABASE

## 📋 MỤC LỤC

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt PostgreSQL](#cài-đặt-postgresql)
3. [Tạo Database](#tạo-database)
4. [Chạy Migration](#chạy-migration)
5. [Seed Data](#seed-data)
6. [Backup & Restore](#backup--restore)
7. [Troubleshooting](#troubleshooting)

---

## 🖥️ YÊU CẦU HỆ THỐNG

### Phần mềm cần thiết:

- **PostgreSQL**: Version 14.x hoặc cao hơn
- **Node.js**: Version 18.x hoặc cao hơn (cho backend)
- **npm/yarn**: Package manager
- **pgAdmin** (Optional): GUI tool để quản lý database

### Cấu hình tối thiểu:

- **RAM**: 4GB (8GB khuyến nghị)
- **Disk**: 20GB trống
- **CPU**: 2 cores (4 cores khuyến nghị)

---

## 📦 CÀI ĐẶT POSTGRESQL

### Ubuntu/Debian:

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

### macOS (Homebrew):

```bash
# Install PostgreSQL
brew install postgresql@14

# Start service
brew services start postgresql@14

# Verify installation
psql --version
```

### Windows:

1. Download PostgreSQL installer từ [postgresql.org](https://www.postgresql.org/download/windows/)
2. Chạy installer và làm theo hướng dẫn
3. Nhớ password cho user `postgres`
4. Cài đặt pgAdmin 4 (đi kèm trong installer)

---

## 🗄️ TẠO DATABASE

### Bước 1: Kết nối PostgreSQL

```bash
# Linux/macOS
sudo -u postgres psql

# Windows (PowerShell)
psql -U postgres
```

### Bước 2: Tạo database và user

```sql
-- Tạo database
CREATE DATABASE tts_learning;

-- Tạo user cho application
CREATE USER tts_admin WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant quyền
GRANT ALL PRIVILEGES ON DATABASE tts_learning TO tts_admin;

-- Kết nối vào database
\c tts_learning

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO tts_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tts_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tts_admin;

-- Exit
\q
```

### Bước 3: Kiểm tra kết nối

```bash
# Test connection
psql -U tts_admin -d tts_learning -h localhost

# Nếu thành công, bạn sẽ thấy prompt:
# tts_learning=>
```

---

## 🚀 CHẠY MIGRATION

### Phương pháp 1: Chạy trực tiếp SQL file

```bash
# Chạy schema script
psql -U tts_admin -d tts_learning -f database_schema.sql

# Kiểm tra kết quả
psql -U tts_admin -d tts_learning -c "\dt"
```

### Phương pháp 2: Sử dụng Migration Tool (Khuyến nghị)

#### Setup với Node.js + node-pg-migrate

```bash
# Install migration tool
npm install -g node-pg-migrate

# Hoặc thêm vào project
npm install --save-dev node-pg-migrate
```

#### Tạo migration files:

**1. Create migration folder structure:**

```bash
mkdir -p migrations
```

**2. Create migration files:**

**migrations/001_create_auth_tables.sql:**

```sql
-- Up Migration
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role_id UUID NOT NULL REFERENCES roles(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Down Migration (Rollback)
-- DROP TABLE users;
-- DROP TABLE roles;
```

**3. Run migrations:**

```bash
# Set environment variable
export DATABASE_URL="postgresql://tts_admin:your_password@localhost:5433/tts_learning"

# Run all migrations
node-pg-migrate up

# Rollback last migration
node-pg-migrate down
```

### Phương pháp 3: Sử dụng ORM (TypeORM/Prisma)

#### Setup với Prisma:

```bash
# Install Prisma
npm install -D prisma
npm install @prisma/client

# Initialize Prisma
npx prisma init
```

**prisma/schema.prisma:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id              String    @id @default(uuid())
  fullName        String    @map("full_name")
  email           String    @unique
  passwordHash    String    @map("password_hash")
  phone           String?
  avatarUrl       String?   @map("avatar_url")
  roleId          String    @map("role_id")
  status          String    @default("active")
  emailVerified   Boolean   @default(false) @map("email_verified")
  emailVerifiedAt DateTime? @map("email_verified_at")
  lastLoginAt     DateTime? @map("last_login_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")

  role            Role      @relation(fields: [roleId], references: [id])

  @@map("users")
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  displayName String   @map("display_name")
  description String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  users       User[]

  @@map("roles")
}
```

**Run Prisma migration:**

```bash
# Generate migration
npx prisma migrate dev --name init

# Apply migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

---

## 🌱 SEED DATA

### Tạo seed script:

**seeds/001_roles.sql:**

```sql
INSERT INTO roles (name, display_name, description) VALUES
('admin', 'Quản trị viên', 'Toàn quyền quản lý hệ thống'),
('hr', 'Nhân sự', 'Quản lý tuyển dụng và onboarding'),
('mentor', 'Người hướng dẫn', 'Quản lý đào tạo và đánh giá TTS'),
('director', 'Giám đốc', 'Phê duyệt kế hoạch tuyển dụng'),
('intern', 'Thực tập sinh', 'Học tập và thực hiện tasks'),
('candidate', 'Ứng viên', 'Nộp hồ sơ ứng tuyển');
```

**seeds/002_admin_user.sql:**

```sql
-- Password: Admin@123 (hashed with bcrypt)
INSERT INTO users (full_name, email, password_hash, role_id, status, email_verified)
SELECT
    'Admin Hệ Thống',
    'admin@tts-learning.com',
    '$2b$10$YourHashedPasswordHere',
    id,
    'active',
    true
FROM roles WHERE name = 'admin';
```

**seeds/003_email_templates.sql:**

```sql
INSERT INTO email_templates (code, name, subject, body, variables) VALUES
('interview_invitation', 'Mời phỏng vấn', 'Lịch phỏng vấn - {{position}}',
'<p>Xin chào {{name}},</p><p>Chúng tôi xin mời bạn tham gia phỏng vấn vị trí {{position}} vào {{date}} lúc {{time}}.</p><p>Địa điểm: {{location}}</p>',
'{"name", "position", "date", "time", "location"}'::jsonb),

('rejection', 'Từ chối ứng viên', 'Kết quả ứng tuyển - {{position}}',
'<p>Xin chào {{name}},</p><p>Cảm ơn bạn đã quan tâm đến vị trí {{position}}. Rất tiếc, chúng tôi không thể tiếp tục với hồ sơ của bạn lần này.</p>',
'{"name", "position"}'::jsonb),

('offer', 'Thông báo trúng tuyển', 'Chúc mừng - Bạn đã trúng tuyển!',
'<p>Xin chào {{name}},</p><p>Chúc mừng! Bạn đã trúng tuyển vị trí {{position}}. Ngày bắt đầu dự kiến: {{start_date}}.</p>',
'{"name", "position", "start_date"}'::jsonb);
```

**Chạy seed:**

```bash
# Chạy từng file seed
psql -U tts_admin -d tts_learning -f seeds/001_roles.sql
psql -U tts_admin -d tts_learning -f seeds/002_admin_user.sql
psql -U tts_admin -d tts_learning -f seeds/003_email_templates.sql

# Hoặc chạy tất cả cùng lúc
for file in seeds/*.sql; do
    psql -U tts_admin -d tts_learning -f "$file"
done
```

---

## 💾 BACKUP & RESTORE

### Backup Database

#### Full Backup:

```bash
# Backup toàn bộ database
pg_dump -U tts_admin -d tts_learning -F c -b -v -f backup_$(date +%Y%m%d_%H%M%S).dump

# Backup dạng SQL text
pg_dump -U tts_admin -d tts_learning > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Backup chỉ schema:

```bash
pg_dump -U tts_admin -d tts_learning --schema-only > schema_backup.sql
```

#### Backup chỉ data:

```bash
pg_dump -U tts_admin -d tts_learning --data-only > data_backup.sql
```

#### Backup specific tables:

```bash
pg_dump -U tts_admin -d tts_learning -t users -t roles > users_roles_backup.sql
```

### Restore Database

#### Restore từ dump file:

```bash
# Drop database cũ (nếu cần)
dropdb -U postgres tts_learning

# Tạo database mới
createdb -U postgres tts_learning

# Restore
pg_restore -U tts_admin -d tts_learning -v backup_20250216_120000.dump
```

#### Restore từ SQL file:

```bash
psql -U tts_admin -d tts_learning < backup_20250216_120000.sql
```

### Automated Backup Script

**backup.sh:**

```bash
#!/bin/bash

# Configuration
DB_NAME="tts_learning"
DB_USER="tts_admin"
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup
pg_dump -U $DB_USER -d $DB_NAME -F c -b -v -f $BACKUP_DIR/backup_$DATE.dump

# Compress
gzip $BACKUP_DIR/backup_$DATE.dump

# Delete old backups
find $BACKUP_DIR -name "backup_*.dump.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: backup_$DATE.dump.gz"
```

**Cron job (chạy mỗi ngày lúc 2:00 AM):**

```bash
# Edit crontab
crontab -e

# Add line:
0 2 * * * /path/to/backup.sh >> /var/log/postgresql_backup.log 2>&1
```

---

## 🔧 TROUBLESHOOTING

### Lỗi 1: "FATAL: Peer authentication failed"

**Nguyên nhân:** PostgreSQL sử dụng peer authentication

**Giải pháp:**

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Thay đổi từ:
local   all             all                                     peer

# Thành:
local   all             all                                     md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Lỗi 2: "Connection refused"

**Nguyên nhân:** PostgreSQL không lắng nghe trên network

**Giải pháp:**

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Uncomment và sửa:
listen_addresses = '*'

# Restart
sudo systemctl restart postgresql
```

### Lỗi 3: "Permission denied for schema public"

**Giải pháp:**

```sql
-- Kết nối với user postgres
sudo -u postgres psql -d tts_learning

-- Grant permissions
GRANT ALL ON SCHEMA public TO tts_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tts_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tts_admin;
```

### Lỗi 4: "Too many connections"

**Giải pháp:**

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Tăng max_connections
max_connections = 200

# Restart
sudo systemctl restart postgresql
```

### Lỗi 5: Migration fails với foreign key constraint

**Giải pháp:**

```sql
-- Tạm thời disable foreign key checks
SET session_replication_role = 'replica';

-- Chạy migration

-- Enable lại
SET session_replication_role = 'origin';
```

---

## 📊 MONITORING & MAINTENANCE

### Check Database Size:

```sql
SELECT
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'tts_learning';
```

### Check Table Sizes:

```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Active Connections:

```sql
SELECT
    datname,
    count(*) as connections
FROM pg_stat_activity
GROUP BY datname;
```

### Vacuum Database (Dọn dẹp):

```sql
-- Vacuum all tables
VACUUM ANALYZE;

-- Vacuum specific table
VACUUM ANALYZE users;

-- Full vacuum (cần downtime)
VACUUM FULL;
```

### Reindex:

```sql
-- Reindex all tables
REINDEX DATABASE tts_learning;

-- Reindex specific table
REINDEX TABLE users;
```

---

## 🔐 SECURITY BEST PRACTICES

### 1. Tạo read-only user:

```sql
CREATE USER tts_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE tts_learning TO tts_readonly;
GRANT USAGE ON SCHEMA public TO tts_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO tts_readonly;
```

### 2. Enable SSL:

```bash
# Generate SSL certificate
sudo openssl req -new -x509 -days 365 -nodes -text -out server.crt -keyout server.key

# Move to PostgreSQL data directory
sudo mv server.crt server.key /var/lib/postgresql/14/main/

# Set permissions
sudo chmod 600 /var/lib/postgresql/14/main/server.key
sudo chown postgres:postgres /var/lib/postgresql/14/main/server.*

# Edit postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'

# Restart
sudo systemctl restart postgresql
```

### 3. Row Level Security:

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY user_isolation_policy ON users
    USING (id = current_user_id());
```

---

## 📝 ENVIRONMENT VARIABLES

**Tạo file `.env`:**

```env
# Database
DATABASE_URL=postgresql://tts_admin:your_password@localhost:5433/tts_learning
DB_HOST=localhost
DB_PORT=5433
DB_NAME=tts_learning
DB_USER=tts_admin
DB_PASSWORD=your_password
DB_SSL=false

# Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=10

# Backup
BACKUP_DIR=/var/backups/postgresql
BACKUP_RETENTION_DAYS=30
```

---

## 🎯 CHECKLIST SETUP

- [ ] PostgreSQL đã được cài đặt
- [ ] Database `tts_learning` đã được tạo
- [ ] User `tts_admin` đã được tạo và có đủ quyền
- [ ] Schema đã được migrate thành công
- [ ] Seed data đã được chạy
- [ ] Indexes đã được tạo
- [ ] Views đã được tạo
- [ ] Functions và Triggers đã được tạo
- [ ] Backup script đã được setup
- [ ] Cron job backup đã được cấu hình
- [ ] Connection từ application đã được test
- [ ] Environment variables đã được cấu hình

---

## 📚 TÀI LIỆU THAM KHẢO

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [node-pg-migrate](https://github.com/salsita/node-pg-migrate)

---

## 🆘 HỖ TRỢ

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra logs: `sudo tail -f /var/log/postgresql/postgresql-14-main.log`
2. Kiểm tra status: `sudo systemctl status postgresql`
3. Kiểm tra connections: `psql -U tts_admin -d tts_learning -c "SELECT * FROM pg_stat_activity;"`

---

**Chúc bạn setup thành công! 🎉**
