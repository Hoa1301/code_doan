# THIẾT KẾ DATABASE POSTGRESQL - HỆ THỐNG QUẢN LÝ TUYỂN DỤNG & ĐÀO TẠO THỰC TẬP SINH

## 📋 MỤC LỤC

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Schema Database](#schema-database)
3. [Quan hệ giữa các bảng](#quan-hệ-giữa-các-bảng)
4. [Indexes và Constraints](#indexes-và-constraints)
5. [SQL Scripts](#sql-scripts)

---

## 🏗️ TỔNG QUAN KIẾN TRÚC

### Phân nhóm chức năng:

- **Authentication & Authorization**: Quản lý người dùng, vai trò, quyền hạn
- **Recruitment**: Quy trình tuyển dụng (10 bước)
- **Training**: Quy trình đào tạo (2 giai đoạn)
- **Evaluation**: Đánh giá thực tập sinh
- **System**: Audit logs, notifications, file uploads

---

## 📊 SCHEMA DATABASE

### 1. AUTHENTICATION & AUTHORIZATION

#### 1.1. `users` - Người dùng hệ thống

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role_id UUID NOT NULL REFERENCES roles(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, suspended
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP -- Soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(status);
```

#### 1.2. `roles` - Vai trò

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- admin, hr, mentor, director, intern, candidate
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dữ liệu mặc định
INSERT INTO roles (name, display_name, description) VALUES
('admin', 'Quản trị viên', 'Toàn quyền quản lý hệ thống'),
('hr', 'Nhân sự', 'Quản lý tuyển dụng và onboarding'),
('mentor', 'Người hướng dẫn', 'Quản lý đào tạo và đánh giá TTS'),
('director', 'Giám đốc', 'Phê duyệt kế hoạch tuyển dụng'),
('intern', 'Thực tập sinh', 'Học tập và thực hiện tasks'),
('candidate', 'Ứng viên', 'Nộp hồ sơ ứng tuyển');
```

#### 1.3. `permissions` - Quyền hạn

```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- recruitment.plan.create, intern.evaluate, etc.
    display_name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL, -- recruitment, training, evaluation, admin
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.4. `role_permissions` - Phân quyền

```sql
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);
```

---

### 2. RECRUITMENT MODULE

#### 2.1. `mentor_requests` - Đề xuất tuyển dụng từ Mentor

```sql
CREATE TABLE mentor_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    required_skills TEXT,
    expected_start_date DATE,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mentor_requests_mentor_id ON mentor_requests(mentor_id);
CREATE INDEX idx_mentor_requests_status ON mentor_requests(status);
```

#### 2.2. `recruitment_plans` - Kế hoạch tuyển dụng

```sql
CREATE TABLE recruitment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    batch VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending_approval', -- pending_approval, active, on_hold, closed
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recruitment_plans_status ON recruitment_plans(status);
CREATE INDEX idx_recruitment_plans_created_by ON recruitment_plans(created_by);
```

#### 2.3. `job_positions` - Tin tuyển dụng

```sql
CREATE TABLE job_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- JOB-001, JOB-002
    title VARCHAR(255) NOT NULL,
    recruitment_plan_id UUID REFERENCES recruitment_plans(id),
    department VARCHAR(100) NOT NULL,
    level VARCHAR(50) DEFAULT 'intern', -- intern, fresher, junior
    required_quantity INTEGER NOT NULL,
    filled_quantity INTEGER DEFAULT 0,
    description TEXT,
    requirements TEXT,
    benefits TEXT,
    location VARCHAR(255),
    salary_range VARCHAR(100),
    posted_date DATE,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'draft', -- draft, open, closed, unpublished
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_positions_status ON job_positions(status);
CREATE INDEX idx_job_positions_recruitment_plan_id ON job_positions(recruitment_plan_id);
```

#### 2.4. `candidates` - Ứng viên

```sql
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id), -- Null nếu chưa có tài khoản
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    avatar_url TEXT,
    education TEXT,
    experience TEXT,
    skills TEXT[], -- Array of skills
    resume_url TEXT,
    cover_letter TEXT,
    applied_for_job_id UUID NOT NULL REFERENCES job_positions(id),
    applied_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'pending_review',
    -- pending_review, cv_screened, shortlisted, interview_scheduled,
    -- passed_interview, rejected, converted_to_intern
    match_score INTEGER, -- 0-100
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_applied_for_job_id ON candidates(applied_for_job_id);
CREATE INDEX idx_candidates_status ON candidates(status);
```

#### 2.5. `interviews` - Lịch phỏng vấn

```sql
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    job_id UUID NOT NULL REFERENCES job_positions(id),
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 45,
    format VARCHAR(20) NOT NULL, -- online, in_person
    location TEXT, -- Google Meet link hoặc địa điểm
    interviewer_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled, rescheduled
    result VARCHAR(20), -- passed, failed
    notes TEXT,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX idx_interviews_interview_date ON interviews(interview_date);
CREATE INDEX idx_interviews_status ON interviews(status);
```

#### 2.6. `onboarding` - Quá trình onboarding

```sql
CREATE TABLE onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    intern_id UUID REFERENCES interns(id), -- Sẽ được tạo sau khi onboarding xong
    track VARCHAR(100) NOT NULL,
    mentor_id UUID NOT NULL REFERENCES users(id),
    department VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    current_step INTEGER DEFAULT 0, -- 0: Documents, 1: Account Setup, 2: Orientation, 3: First Assignment
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, delayed, completed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_onboarding_candidate_id ON onboarding(candidate_id);
CREATE INDEX idx_onboarding_status ON onboarding(status);
```

#### 2.7. `onboarding_steps` - Chi tiết các bước onboarding

```sql
CREATE TABLE onboarding_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    onboarding_id UUID NOT NULL REFERENCES onboarding(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL, -- 0, 1, 2, 3
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'wait', -- wait, process, finish, error
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(onboarding_id, step_number)
);

CREATE INDEX idx_onboarding_steps_onboarding_id ON onboarding_steps(onboarding_id);
```

---

### 3. TRAINING MODULE

#### 3.1. `interns` - Thực tập sinh

```sql
CREATE TABLE interns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    code VARCHAR(50) UNIQUE NOT NULL, -- ITS-001, ITS-002
    candidate_id UUID REFERENCES candidates(id), -- Liên kết với hồ sơ ứng tuyển
    track VARCHAR(100) NOT NULL, -- Frontend, Backend, Mobile, etc.
    mentor_id UUID NOT NULL REFERENCES users(id),
    department VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_stage VARCHAR(20) DEFAULT 'stage1', -- stage1, stage2, final_review, completed
    overall_progress INTEGER DEFAULT 0, -- 0-100
    status VARCHAR(20) DEFAULT 'active', -- active, on_hold, completed, terminated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interns_user_id ON interns(user_id);
CREATE INDEX idx_interns_mentor_id ON interns(mentor_id);
CREATE INDEX idx_interns_status ON interns(status);
CREATE INDEX idx_interns_current_stage ON interns(current_stage);
```

#### 3.2. `learning_paths` - Lộ trình học

```sql
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track VARCHAR(100) UNIQUE NOT NULL, -- Frontend Development, Backend Development
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_paths_track ON learning_paths(track);
```

#### 3.3. `modules` - Module học tập

```sql
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'ready', -- ready, in_progress, locked
    passing_score INTEGER DEFAULT 80, -- Điểm tối thiểu để pass
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modules_learning_path_id ON modules(learning_path_id);
```

#### 3.4. `module_contents` - Nội dung module

```sql
CREATE TABLE module_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- video, document, quiz
    title VARCHAR(255) NOT NULL,
    content_url TEXT, -- Link video, file PDF
    metadata JSONB, -- {duration: "10 min", size: "5 MB", etc.}
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_module_contents_module_id ON module_contents(module_id);
```

#### 3.5. `quizzes` - Bài quiz/test

```sql
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES learning_paths(id), -- Null nếu là quiz của module, có giá trị nếu là Final Assessment
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'module', -- module, final_assessment
    passing_score INTEGER DEFAULT 80,
    time_limit_minutes INTEGER,
    total_questions INTEGER,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quizzes_module_id ON quizzes(module_id);
CREATE INDEX idx_quizzes_learning_path_id ON quizzes(learning_path_id);
```

#### 3.6. `quiz_questions` - Câu hỏi quiz

```sql
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice', -- multiple_choice, true_false, short_answer
    options JSONB, -- [{"key": "A", "value": "Option A"}, ...]
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
```

#### 3.7. `quiz_attempts` - Lượt làm quiz

```sql
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id),
    intern_id UUID NOT NULL REFERENCES interns(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    score INTEGER,
    total_points INTEGER,
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, submitted, passed, failed
    answers JSONB, -- {question_id: answer, ...}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_intern_id ON quiz_attempts(intern_id);
```

#### 3.8. `intern_progress` - Tiến độ học tập

```sql
CREATE TABLE intern_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id),
    current_module_id UUID REFERENCES modules(id),
    modules_completed UUID[], -- Array of module IDs
    overall_progress INTEGER DEFAULT 0, -- 0-100
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(intern_id, learning_path_id)
);

CREATE INDEX idx_intern_progress_intern_id ON intern_progress(intern_id);
```

#### 3.9. `tasks` - Công việc giao cho TTS (Giai đoạn 2)

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- TSK-201, TSK-202
    title VARCHAR(255) NOT NULL,
    description TEXT,
    intern_id UUID NOT NULL REFERENCES interns(id),
    mentor_id UUID NOT NULL REFERENCES users(id),
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    due_date DATE,
    status VARCHAR(20) DEFAULT 'to_do', -- to_do, in_progress, under_review, completed, need_rework
    attachments TEXT[], -- Array of file URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_tasks_intern_id ON tasks(intern_id);
CREATE INDEX idx_tasks_mentor_id ON tasks(mentor_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

#### 3.10. `task_comments` - Nhận xét task

```sql
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
```

---

### 4. EVALUATION MODULE

#### 4.1. `evaluations` - Đánh giá

```sql
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID NOT NULL REFERENCES interns(id),
    mentor_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL, -- phase1, phase2, final
    evaluation_date DATE DEFAULT CURRENT_DATE,

    -- Điểm số
    technical_score INTEGER, -- 0-100
    attitude_score INTEGER, -- 0-100
    teamwork_score INTEGER, -- 0-100
    progress_score INTEGER, -- 0-100
    overall_score INTEGER, -- 0-100

    -- Feedback
    strengths TEXT,
    weaknesses TEXT,
    feedback TEXT,

    -- Kết luận (chỉ cho final evaluation)
    decision VARCHAR(30), -- propose_hire, extend_internship, end_program
    decision_reason TEXT,

    status VARCHAR(20) DEFAULT 'completed', -- draft, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evaluations_intern_id ON evaluations(intern_id);
CREATE INDEX idx_evaluations_type ON evaluations(type);
CREATE INDEX idx_evaluations_evaluation_date ON evaluations(evaluation_date);
```

#### 4.2. `reports` - Báo cáo định kỳ

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID NOT NULL REFERENCES interns(id),
    type VARCHAR(20) NOT NULL, -- weekly, monthly
    period VARCHAR(100) NOT NULL, -- "Tuần 3 - Feb 2025"
    title VARCHAR(255) NOT NULL,
    content TEXT,
    challenges TEXT,
    next_plan TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    score INTEGER,
    feedback TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_intern_id ON reports(intern_id);
CREATE INDEX idx_reports_status ON reports(status);
```

---

### 5. SYSTEM TABLES

#### 5.1. `notifications` - Thông báo

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- application_received, interview_scheduled, task_assigned, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

#### 5.2. `email_templates` - Mẫu email

```sql
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- interview_invitation, rejection, offer, etc.
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL, -- HTML template với placeholders {{name}}, {{date}}, etc.
    variables JSONB, -- List of available variables
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.3. `email_logs` - Lịch sử gửi email

```sql
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES email_templates(id),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'sent', -- sent, failed, pending
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_logs_recipient_email ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
```

#### 5.4. `file_uploads` - Quản lý file upload

```sql
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    entity_type VARCHAR(50), -- candidate, task, report, etc.
    entity_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
CREATE INDEX idx_file_uploads_entity ON file_uploads(entity_type, entity_id);
```

#### 5.5. `audit_logs` - Nhật ký hệ thống

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- create, update, delete, login, logout
    entity_type VARCHAR(50) NOT NULL, -- user, candidate, task, etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

#### 5.6. `system_settings` - Cấu hình hệ thống

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    data_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔗 QUAN HỆ GIỮA CÁC BẢNG

### Recruitment Flow:

```
mentor_requests → recruitment_plans → job_positions → candidates → interviews → onboarding → interns
```

### Training Flow:

```
interns → learning_paths → modules → module_contents/quizzes
interns → intern_progress → quiz_attempts
interns → tasks → task_comments
```

### Evaluation Flow:

```
interns → evaluations
interns → reports
```

### Authentication Flow:

```
users → roles → role_permissions → permissions
```

---

## 🔍 INDEXES VÀ CONSTRAINTS

### Composite Indexes (cho query phức tạp):

```sql
-- Tìm candidates theo job và status
CREATE INDEX idx_candidates_job_status ON candidates(applied_for_job_id, status);

-- Tìm tasks theo intern và status
CREATE INDEX idx_tasks_intern_status ON tasks(intern_id, status);

-- Tìm interviews theo date range
CREATE INDEX idx_interviews_date_range ON interviews(interview_date, status);

-- Tìm evaluations theo intern và type
CREATE INDEX idx_evaluations_intern_type ON evaluations(intern_id, type);
```

### Check Constraints:

```sql
-- Đảm bảo điểm số hợp lệ
ALTER TABLE evaluations ADD CONSTRAINT check_scores
    CHECK (technical_score BETWEEN 0 AND 100
       AND attitude_score BETWEEN 0 AND 100
       AND teamwork_score BETWEEN 0 AND 100
       AND progress_score BETWEEN 0 AND 100
       AND overall_score BETWEEN 0 AND 100);

-- Đảm bảo match score hợp lệ
ALTER TABLE candidates ADD CONSTRAINT check_match_score
    CHECK (match_score IS NULL OR match_score BETWEEN 0 AND 100);

-- Đảm bảo progress hợp lệ
ALTER TABLE interns ADD CONSTRAINT check_progress
    CHECK (overall_progress BETWEEN 0 AND 100);
```

### Foreign Key Constraints với ON DELETE:

```sql
-- Khi xóa learning_path, xóa luôn modules
ALTER TABLE modules
    ADD CONSTRAINT fk_modules_learning_path
    FOREIGN KEY (learning_path_id)
    REFERENCES learning_paths(id)
    ON DELETE CASCADE;

-- Khi xóa module, xóa luôn contents
ALTER TABLE module_contents
    ADD CONSTRAINT fk_module_contents_module
    FOREIGN KEY (module_id)
    REFERENCES modules(id)
    ON DELETE CASCADE;
```

---

## 📝 SQL SCRIPTS

### 1. Tạo database và extensions

```sql
CREATE DATABASE tts_learning;

\c tts_learning;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 2. Function tự động cập nhật updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Áp dụng cho tất cả các bảng có updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (áp dụng cho các bảng khác)
```

### 3. Function tính overall_score tự động

```sql
CREATE OR REPLACE FUNCTION calculate_overall_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.overall_score = (
        COALESCE(NEW.technical_score, 0) * 0.4 +
        COALESCE(NEW.attitude_score, 0) * 0.2 +
        COALESCE(NEW.teamwork_score, 0) * 0.2 +
        COALESCE(NEW.progress_score, 0) * 0.2
    )::INTEGER;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_evaluation_score BEFORE INSERT OR UPDATE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION calculate_overall_score();
```

### 4. View thống kê dashboard

```sql
CREATE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM users WHERE status = 'active') AS total_users,
    (SELECT COUNT(*) FROM users WHERE status = 'active' AND last_login_at > CURRENT_DATE - INTERVAL '7 days') AS active_users,
    (SELECT COUNT(*) FROM job_positions WHERE status = 'open') AS open_positions,
    (SELECT COUNT(*) FROM candidates WHERE status = 'pending_review') AS pending_applications,
    (SELECT COUNT(*) FROM interviews WHERE status = 'scheduled' AND interview_date >= CURRENT_DATE) AS upcoming_interviews,
    (SELECT COUNT(*) FROM interns WHERE status = 'active') AS active_interns,
    (SELECT COUNT(*) FROM tasks WHERE status IN ('under_review', 'need_rework')) AS pending_reviews,
    (SELECT ROUND(AVG(match_score)) FROM candidates WHERE status = 'shortlisted') AS avg_match_score;
```

### 5. View báo cáo tuyển dụng

```sql
CREATE VIEW recruitment_report AS
SELECT
    rp.id AS plan_id,
    rp.name AS plan_name,
    rp.batch,
    rp.status AS plan_status,
    COUNT(DISTINCT jp.id) AS total_positions,
    SUM(jp.required_quantity) AS total_required,
    SUM(jp.filled_quantity) AS total_filled,
    COUNT(DISTINCT c.id) AS total_applications,
    COUNT(DISTINCT CASE WHEN c.status = 'shortlisted' THEN c.id END) AS shortlisted_count,
    COUNT(DISTINCT CASE WHEN c.status = 'passed_interview' THEN c.id END) AS passed_count,
    COUNT(DISTINCT CASE WHEN c.status = 'converted_to_intern' THEN c.id END) AS converted_count
FROM recruitment_plans rp
LEFT JOIN job_positions jp ON jp.recruitment_plan_id = rp.id
LEFT JOIN candidates c ON c.applied_for_job_id = jp.id
GROUP BY rp.id, rp.name, rp.batch, rp.status;
```

### 6. View báo cáo đào tạo

```sql
CREATE VIEW training_report AS
SELECT
    i.id AS intern_id,
    i.code AS intern_code,
    u.full_name AS intern_name,
    i.track,
    i.current_stage,
    i.overall_progress,
    mentor.full_name AS mentor_name,
    COUNT(DISTINCT t.id) AS total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) AS completed_tasks,
    COUNT(DISTINCT qa.id) AS total_quiz_attempts,
    AVG(qa.score) AS avg_quiz_score,
    COUNT(DISTINCT e.id) AS total_evaluations,
    AVG(e.overall_score) AS avg_evaluation_score
FROM interns i
JOIN users u ON u.id = i.user_id
JOIN users mentor ON mentor.id = i.mentor_id
LEFT JOIN tasks t ON t.intern_id = i.id
LEFT JOIN quiz_attempts qa ON qa.intern_id = i.id
LEFT JOIN evaluations e ON e.intern_id = i.id
GROUP BY i.id, i.code, u.full_name, i.track, i.current_stage, i.overall_progress, mentor.full_name;
```

---

## 🎯 MIGRATION STRATEGY

### Phase 1: Core Tables

1. Authentication & Authorization (users, roles, permissions)
2. System tables (notifications, email_templates, file_uploads)

### Phase 2: Recruitment Module

1. Recruitment planning (mentor_requests, recruitment_plans, job_positions)
2. Candidate management (candidates, interviews, onboarding)

### Phase 3: Training Module

1. Learning paths (learning_paths, modules, module_contents)
2. Quizzes (quizzes, quiz_questions, quiz_attempts)
3. Interns & Tasks (interns, tasks, intern_progress)

### Phase 4: Evaluation Module

1. Evaluations & Reports

### Phase 5: Optimization

1. Indexes
2. Views
3. Functions & Triggers

---

## 📊 SAMPLE DATA SEEDS

### Roles

```sql
INSERT INTO roles (name, display_name, description) VALUES
('admin', 'Quản trị viên', 'Toàn quyền quản lý hệ thống'),
('hr', 'Nhân sự', 'Quản lý tuyển dụng và onboarding'),
('mentor', 'Người hướng dẫn', 'Quản lý đào tạo và đánh giá TTS'),
('director', 'Giám đốc', 'Phê duyệt kế hoạch tuyển dụng'),
('intern', 'Thực tập sinh', 'Học tập và thực hiện tasks'),
('candidate', 'Ứng viên', 'Nộp hồ sơ ứng tuyển');
```

### Email Templates

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

### System Settings

```sql
INSERT INTO system_settings (key, value, data_type, description) VALUES
('quiz_passing_score', '80', 'number', 'Điểm tối thiểu để pass quiz'),
('task_deadline_reminder_days', '3', 'number', 'Số ngày trước deadline để gửi reminder'),
('max_quiz_attempts', '3', 'number', 'Số lần làm lại quiz tối đa'),
('onboarding_steps', '["Bổ sung hồ sơ", "Cấp tài khoản & Email", "Đào tạo nhập môn", "Giao Task đầu tiên"]', 'json', 'Các bước onboarding');
```

---

## 🔐 SECURITY BEST PRACTICES

1. **Password Hashing**: Sử dụng bcrypt hoặc argon2 để hash password
2. **Row Level Security (RLS)**: Áp dụng RLS cho các bảng nhạy cảm
3. **Audit Logging**: Ghi log mọi thao tác quan trọng
4. **Soft Delete**: Sử dụng deleted_at thay vì xóa vật lý
5. **Data Encryption**: Mã hóa các trường nhạy cảm (email, phone)

---

## 📈 PERFORMANCE OPTIMIZATION

1. **Partitioning**: Phân vùng bảng audit_logs, email_logs theo thời gian
2. **Materialized Views**: Tạo materialized views cho các báo cáo phức tạp
3. **Connection Pooling**: Sử dụng PgBouncer
4. **Query Optimization**: Sử dụng EXPLAIN ANALYZE để tối ưu queries
5. **Caching**: Cache kết quả queries thường xuyên với Redis

---

## 🎓 KẾT LUẬN

Database này được thiết kế để:

- ✅ Đáp ứng đầy đủ 3 quy trình: Tuyển dụng, Đào tạo, Đánh giá
- ✅ Hỗ trợ 6 vai trò: Admin, HR, Mentor, Director, Intern, Candidate
- ✅ Quản lý toàn bộ vòng đời thực tập sinh từ ứng tuyển đến chính thức
- ✅ Linh hoạt mở rộng và bảo trì
- ✅ Đảm bảo tính toàn vẹn dữ liệu với constraints và indexes
- ✅ Tối ưu hiệu năng với views và functions

**Tổng số bảng**: 32 bảng
**Tổng số indexes**: ~50 indexes
**Tổng số views**: 3 views
**Tổng số functions**: 2 functions
