# IMPLEMENTATION PLAN - BACKEND TTS LEARNING

## TỔNG QUAN

Xây dựng backend NestJS với PostgreSQL cho hệ thống quản lý tuyển dụng và đào tạo thực tập sinh.

**Tech Stack**:

- NestJS + TypeORM + PostgreSQL
- JWT Authentication
- Class Validator
- Swagger Documentation

**Timeline**: 6 tuần

---

## PHASE 1: CORE SETUP (Week 1)

### 1.1. Database Configuration

**Files to create**:

- `src/config/database.config.ts`
- `src/config/jwt.config.ts`
- `src/config/email.config.ts`

**Environment variables** (.env):

```env
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=tts_admin
DB_PASSWORD=your_password
DB_NAME=tts_learning
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### 1.2. Migrations

**Create 6 migration files**:

1. `001_create_auth_tables.ts` - users, roles, permissions, role_permissions
2. `002_create_recruitment_tables.ts` - mentor_requests, recruitment_plans, job_positions, candidates, interviews
3. `003_create_onboarding_tables.ts` - onboarding, onboarding_steps
4. `004_create_training_tables.ts` - interns, learning_paths, modules, quizzes, tasks
5. `005_create_evaluation_tables.ts` - evaluations, reports
6. `006_create_system_tables.ts` - notifications, email_templates, file_uploads, audit_logs

**Run migrations**:

```bash
yarn migration:run
```

### 1.3. Seed Data

**Create seed files**:

- `seeds/roles.seed.ts` - 6 roles (admin, hr, mentor, director, intern, candidate)
- `seeds/permissions.seed.ts` - All permissions
- `seeds/email-templates.seed.ts` - Email templates
- `seeds/admin-user.seed.ts` - Default admin user

### 1.4. Base Entities & Common

**Create**:

- `common/entities/base.entity.ts` - Base entity với id, timestamps
- `common/decorators/` - @Roles(), @CurrentUser(), @Public()
- `common/guards/` - JwtAuthGuard, RolesGuard
- `common/interceptors/` - TransformInterceptor, AuditLogInterceptor
- `common/constants/` - Enums (roles, status, permissions)

---

## PHASE 2: AUTHENTICATION (Week 1)

### 2.1. Auth Module

**Structure**:

```
modules/auth/
├── entities/
│   ├── user.entity.ts
│   ├── role.entity.ts
│   ├── permission.entity.ts
│   └── role-permission.entity.ts
├── dto/
│   ├── register.dto.ts
│   ├── login.dto.ts
│   └── update-user.dto.ts
├── auth.service.ts
├── auth.controller.ts
└── auth.module.ts
```

**API Endpoints**:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `PATCH /api/auth/profile`
- `POST /api/auth/change-password`

**Features**:

- JWT token generation
- Password hashing (bcrypt)
- Email verification
- Role-based access control

---

## PHASE 3: RECRUITMENT MODULE (Week 2)

### 3.1. Mentor Requests

**Files**:

- `modules/recruitment/mentor-requests/mentor-request.entity.ts`
- `modules/recruitment/mentor-requests/mentor-request.service.ts`
- `modules/recruitment/mentor-requests/mentor-request.controller.ts`
- `modules/recruitment/mentor-requests/dto/`

**API Endpoints**:

- `POST /api/mentor-requests` - Create (Mentor)
- `GET /api/mentor-requests` - List
- `PATCH /api/mentor-requests/:id/approve` - Approve (HR)
- `PATCH /api/mentor-requests/:id/reject` - Reject (HR)

### 3.2. Recruitment Plans

**API Endpoints**:

- `POST /api/recruitment-plans` - Create (HR)
- `PATCH /api/recruitment-plans/:id/submit` - Submit for approval
- `PATCH /api/recruitment-plans/:id/approve` - Approve (Director)
- `PATCH /api/recruitment-plans/:id/reject` - Reject (Director)

### 3.3. Job Positions

**API Endpoints**:

- `POST /api/job-positions` - Create (HR)
- `GET /api/job-positions` - List (Public for open positions)
- `PATCH /api/job-positions/:id/publish` - Publish (HR)
- `PATCH /api/job-positions/:id/close` - Close (HR)

**Business Logic**:

- Auto-generate code: JOB-001, JOB-002
- Track filled_quantity vs required_quantity

### 3.4. Candidates

**API Endpoints**:

- `POST /api/candidates` - Apply (Public/Candidate)
- `GET /api/candidates` - List (HR)
- `PATCH /api/candidates/:id/screen` - Screen CV (HR)
- `PATCH /api/candidates/:id/shortlist` - Shortlist (HR)

**Features**:

- CV file upload
- Match score calculation
- Email notifications

### 3.5. Interviews

**API Endpoints**:

- `POST /api/interviews` - Schedule (HR)
- `PATCH /api/interviews/:id/complete` - Complete with result (Interviewer)
- `PATCH /api/interviews/:id/cancel` - Cancel (HR)

### 3.6. Onboarding

**API Endpoints**:

- `POST /api/onboarding` - Start onboarding (HR)
- `PATCH /api/onboarding/:id/steps/:stepNumber` - Update step
- `PATCH /api/onboarding/:id/complete` - Complete (auto-create intern)

**4 Steps**: 0. Documents

1. Account Setup
2. Orientation
3. First Assignment

---

## PHASE 4: TRAINING MODULE (Week 3-4)

### 4.1. Interns

**API Endpoints**:

- `GET /api/interns` - List (Mentor sees their interns)
- `GET /api/interns/:id` - Detail
- `GET /api/interns/:id/progress` - Progress detail

**Features**:

- Auto-generate code: ITS-001, ITS-002
- Track current_stage: stage1, stage2, final_review, completed

### 4.2. Learning Paths & Modules

**API Endpoints**:

- `POST /api/learning-paths` - Create (Mentor)
- `POST /api/learning-paths/:id/modules` - Add module
- `POST /api/modules/:id/contents` - Add content
- `GET /api/modules/:id/contents` - List contents

### 4.3. Quizzes

**API Endpoints**:

- `POST /api/quizzes` - Create (Mentor)
- `POST /api/quizzes/:id/questions` - Add questions
- `POST /api/quizzes/:id/start` - Start attempt (Intern)
- `POST /api/quizzes/:id/submit` - Submit answers (Intern)

**Features**:

- Auto-grading for multiple choice
- Manual grading for short answer
- Update progress when pass

### 4.4. Tasks (Phase 2 Training)

**API Endpoints**:

- `POST /api/tasks` - Create (Mentor)
- `GET /api/tasks` - List
- `PATCH /api/tasks/:id` - Update status (Intern)
- `POST /api/tasks/:id/comments` - Add comment
- `PATCH /api/tasks/:id/complete` - Complete (Mentor)
- `PATCH /api/tasks/:id/rework` - Request rework (Mentor)

**Status Flow**:

```
to_do → in_progress → under_review → completed/need_rework
```

---

## PHASE 5: EVALUATION MODULE (Week 5)

### 5.1. Evaluations

**API Endpoints**:

- `POST /api/evaluations` - Create (Mentor)
- `GET /api/evaluations` - List
- `GET /api/interns/:id/evaluations` - Get all for intern

**Types**:

- phase1 - After completing learning path
- phase2 - After completing tasks
- final - Final decision

**Scores**:

- technical_score (0-100)
- attitude_score (0-100)
- teamwork_score (0-100)
- progress_score (0-100)
- overall_score (auto-calculated)

**Decision** (final only):

- propose_hire
- extend_internship
- end_program

### 5.2. Reports

**API Endpoints**:

- `POST /api/reports` - Submit (Intern)
- `GET /api/reports` - List
- `PATCH /api/reports/:id/review` - Review (Mentor)

**Types**:

- weekly
- monthly

---

## PHASE 6: SYSTEM MODULES (Week 1 & 6)

### 6.1. Notifications

**API Endpoints**:

- `GET /api/notifications` - List for current user
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

### 6.2. Email Service

**Email Templates**:

- interview_invitation
- interview_result
- onboarding_welcome
- task_assigned
- evaluation_completed
- report_reviewed

### 6.3. File Upload

**API Endpoints**:

- `POST /api/files/upload`
- `GET /api/files/:id`
- `DELETE /api/files/:id`

**Validation**:

- Max size: 10MB (CV), 20MB (attachments)
- Allowed types: .pdf, .doc, .docx, .jpg, .png

### 6.4. Audit Logs

**Implementation**:

- Interceptor auto-log all important actions
- Store old_values and new_values

**API Endpoints**:

- `GET /api/audit-logs` - List (Admin only)

---

## CẤU TRÚC THƯ MỤC

```
src/
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── email.config.ts
├── common/
│   ├── entities/base.entity.ts
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── constants/
├── modules/
│   ├── auth/
│   ├── recruitment/
│   │   ├── mentor-requests/
│   │   ├── recruitment-plans/
│   │   ├── job-positions/
│   │   ├── candidates/
│   │   ├── interviews/
│   │   └── onboarding/
│   ├── training/
│   │   ├── interns/
│   │   ├── learning-paths/
│   │   ├── modules/
│   │   ├── quizzes/
│   │   └── tasks/
│   ├── evaluation/
│   │   ├── evaluations/
│   │   └── reports/
│   └── system/
│       ├── notifications/
│       ├── email/
│       ├── file-upload/
│       └── audit-logs/
├── migrations/
└── seeds/
```

---

## VERIFICATION PLAN

### Unit Tests

```bash
yarn test
yarn test:cov
```

**Coverage targets**:

- Services: 80%+
- Controllers: 70%+

### Integration Tests

```bash
yarn test:integration
```

### E2E Tests

```bash
yarn test:e2e
```

**Critical flows**:

1. Recruitment: Request → Plan → Job → Candidate → Interview → Onboarding → Intern
2. Training Phase 1: Learning path → Module → Quiz → Progress
3. Training Phase 2: Task → Comment → Complete
4. Evaluation: Report → Evaluation → Decision

---

## DEPLOYMENT CHECKLIST

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Seed data loaded
- [ ] SSL configured
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Error tracking (Sentry)
- [ ] API documentation (Swagger)
- [ ] Health check endpoint

---

## TIMELINE

| Phase   | Duration | Deliverables                   |
| ------- | -------- | ------------------------------ |
| Phase 1 | Week 1   | Database, Auth, System modules |
| Phase 2 | Week 2   | Recruitment modules            |
| Phase 3 | Week 3-4 | Training modules               |
| Phase 4 | Week 5   | Evaluation modules             |
| Phase 5 | Week 6   | Testing & Deployment           |

---

## NEXT STEPS

1. ✅ Review plan
2. Setup development environment
3. Run migrations
4. Start Phase 1: Core Setup
