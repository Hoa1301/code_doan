# PROJECT TODO LIST - TTS LEARNING SYSTEM

Quản lý tiến độ triển khai các module backend.

**Ký hiệu:**

- [V] : Hoàn thiện (Entities, DTO, Service, Controller, Module registration)
- [T] : Đang thực hiện (Cần thêm logic chuyên sâu hoặc fix bugs)
- [x] : Chưa bắt đầu

---

## 🔐 1. AUTHENTICATION & AUTHORIZATION

- [V] Entities (User, Role, Permission)
- [V] JWT Authentication System (Login, Register)
- [V] Role-Based Access Control (RBAC) Guards
- [V] Users CRUD
- [x] Social Login (Google/GitHub) - _Optional_

## 💼 2. RECRUITMENT MODULE

- [V] Mentor Requests CRUD
- [V] Recruitment Plans CRUD
- [V] Job Positions CRUD (Auto-code JOB-xxx)
- [V] Candidate CRUD (Hồ sơ ứng viên)
- [V] Interview Management (Lịch phỏng vấn)
- [V] Onboarding CRUD (Quy trình nhận việc)
- [V] Onboarding Step Automation logic (Tự động hóa các bước)
- [V] Auto-convert Candidate to Intern logic (Tự động tạo tài khoản & Intern)

## 🎓 3. TRAINING MODULE

- [V] Intern Management (Auto-code ITS-xxx)
- [V] Learning Path Entity & CRUD
- [V] Training Modules (Stages) logic
- [V] Training Content CRUD
- [V] Exam/Quiz Management
- [V] Quiz Attempt logic (Nộp bài & Tính điểm tự động)
- [V] Task & Mentorship Management
- [V] Task Workflow logic (To Do -> Review -> Rework)
- [V] Comments system on Tasks

## 📊 4. EVALUATION & REPORTING

- [V] Monthly/Weekly Evaluation system
- [V] Scores calculation logic
- [V] Final decision workflow (Official/Extend/End)
- [V] Auto-calculate Overall Score logic
- [V] Final Review & Decision logic (Hire/End program)

## ⚙️ 5. SYSTEM MODULE

- [V] Notification System (Internal)
- [V] Email Templates & Logging
- [V] Audit Logs (Read-only CRUD)
- [V] System Settings (Dynamic Config)
- [V] Object Storage (MinIO) Integration
- [V] File Upload Management (Middleware/Multer)

---

## 🛠️ 6. INFRASTRUCTURE & TOOLS

- [V] Base Entity & Base Service Generic
- [V] Database Connection (PostgreSQL TypeORM)
- [V] Swagger Documentation Setup
- [V] Docker & Docker Compose Setup
- [V] Environment Variables (.env) Setup
- [x] Database Migrations (Cần generate file migration thực tế)
- [x] Seed Data (Roles, Admin, Templates)
- [x] Unit Tests & E2E Tests

---

**Cập nhật lần cuối:** 17/02/2025 19:42 (ICT)
