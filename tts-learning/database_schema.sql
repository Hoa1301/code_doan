-- ============================================================================
-- HỆ THỐNG QUẢN LÝ TUYỂN DỤNG & ĐÀO TẠO THỰC TẬP SINH
-- Database: PostgreSQL 14+
-- ============================================================================

-- Tạo database
-- CREATE DATABASE tts_learning;
-- \c tts_learning;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. AUTHENTICATION & AUTHORIZATION
-- ============================================================================

-- 1.1. Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.2. Users
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

-- 1.3. Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.4. Role Permissions
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================================
-- 2. RECRUITMENT MODULE
-- ============================================================================

-- 2.1. Mentor Requests
CREATE TABLE mentor_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    required_skills TEXT,
    expected_start_date DATE,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.2. Recruitment Plans
CREATE TABLE recruitment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    batch VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending_approval',
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.3. Job Positions
CREATE TABLE job_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    recruitment_plan_id UUID REFERENCES recruitment_plans(id),
    department VARCHAR(100) NOT NULL,
    level VARCHAR(50) DEFAULT 'intern',
    required_quantity INTEGER NOT NULL,
    filled_quantity INTEGER DEFAULT 0,
    description TEXT,
    requirements TEXT,
    benefits TEXT,
    location VARCHAR(255),
    salary_range VARCHAR(100),
    posted_date DATE,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'draft',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.4. Candidates
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    avatar_url TEXT,
    education TEXT,
    experience TEXT,
    skills TEXT[],
    resume_url TEXT,
    cover_letter TEXT,
    applied_for_job_id UUID NOT NULL REFERENCES job_positions(id),
    applied_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'pending_review',
    match_score INTEGER,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_match_score CHECK (match_score IS NULL OR match_score BETWEEN 0 AND 100)
);

-- 2.5. Interviews
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    job_id UUID NOT NULL REFERENCES job_positions(id),
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 45,
    format VARCHAR(20) NOT NULL,
    location TEXT,
    interviewer_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'scheduled',
    result VARCHAR(20),
    notes TEXT,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.6. Onboarding
CREATE TABLE onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    intern_id UUID,
    track VARCHAR(100) NOT NULL,
    mentor_id UUID NOT NULL REFERENCES users(id),
    department VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    current_step INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 2.7. Onboarding Steps
CREATE TABLE onboarding_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    onboarding_id UUID NOT NULL REFERENCES onboarding(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'wait',
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(onboarding_id, step_number)
);

-- ============================================================================
-- 3. TRAINING MODULE
-- ============================================================================

-- 3.1. Interns
CREATE TABLE interns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    candidate_id UUID REFERENCES candidates(id),
    track VARCHAR(100) NOT NULL,
    mentor_id UUID NOT NULL REFERENCES users(id),
    department VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_stage VARCHAR(20) DEFAULT 'stage1',
    overall_progress INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_progress CHECK (overall_progress BETWEEN 0 AND 100)
);

-- Add foreign key to onboarding after interns table is created
ALTER TABLE onboarding ADD CONSTRAINT fk_onboarding_intern 
    FOREIGN KEY (intern_id) REFERENCES interns(id);

-- 3.2. Learning Paths
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.3. Modules
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'ready',
    passing_score INTEGER DEFAULT 80,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.4. Module Contents
CREATE TABLE module_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_url TEXT,
    metadata JSONB,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.5. Quizzes
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES learning_paths(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'module',
    passing_score INTEGER DEFAULT 80,
    time_limit_minutes INTEGER,
    total_questions INTEGER,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.6. Quiz Questions
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice',
    options JSONB,
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.7. Quiz Attempts
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id),
    intern_id UUID NOT NULL REFERENCES interns(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    score INTEGER,
    total_points INTEGER,
    status VARCHAR(20) DEFAULT 'in_progress',
    answers JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.8. Intern Progress
CREATE TABLE intern_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id),
    current_module_id UUID REFERENCES modules(id),
    modules_completed UUID[],
    overall_progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(intern_id, learning_path_id)
);

-- 3.9. Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    intern_id UUID NOT NULL REFERENCES interns(id),
    mentor_id UUID NOT NULL REFERENCES users(id),
    priority VARCHAR(20) DEFAULT 'medium',
    due_date DATE,
    status VARCHAR(20) DEFAULT 'to_do',
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 3.10. Task Comments
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. EVALUATION MODULE
-- ============================================================================

-- 4.1. Evaluations
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID NOT NULL REFERENCES interns(id),
    mentor_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    evaluation_date DATE DEFAULT CURRENT_DATE,
    technical_score INTEGER,
    attitude_score INTEGER,
    teamwork_score INTEGER,
    progress_score INTEGER,
    overall_score INTEGER,
    strengths TEXT,
    weaknesses TEXT,
    feedback TEXT,
    decision VARCHAR(30),
    decision_reason TEXT,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_scores CHECK (
        (technical_score IS NULL OR technical_score BETWEEN 0 AND 100) AND
        (attitude_score IS NULL OR attitude_score BETWEEN 0 AND 100) AND
        (teamwork_score IS NULL OR teamwork_score BETWEEN 0 AND 100) AND
        (progress_score IS NULL OR progress_score BETWEEN 0 AND 100) AND
        (overall_score IS NULL OR overall_score BETWEEN 0 AND 100)
    )
);

-- 4.2. Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID NOT NULL REFERENCES interns(id),
    type VARCHAR(20) NOT NULL,
    period VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    challenges TEXT,
    next_plan TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    score INTEGER,
    feedback TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. SYSTEM TABLES
-- ============================================================================

-- 5.1. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5.2. Email Templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5.3. Email Logs
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES email_templates(id),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5.4. File Uploads
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5.5. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5.6. System Settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    data_type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(status);

-- Mentor Requests
CREATE INDEX idx_mentor_requests_mentor_id ON mentor_requests(mentor_id);
CREATE INDEX idx_mentor_requests_status ON mentor_requests(status);

-- Recruitment Plans
CREATE INDEX idx_recruitment_plans_status ON recruitment_plans(status);
CREATE INDEX idx_recruitment_plans_created_by ON recruitment_plans(created_by);

-- Job Positions
CREATE INDEX idx_job_positions_status ON job_positions(status);
CREATE INDEX idx_job_positions_recruitment_plan_id ON job_positions(recruitment_plan_id);

-- Candidates
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_applied_for_job_id ON candidates(applied_for_job_id);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_job_status ON candidates(applied_for_job_id, status);

-- Interviews
CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX idx_interviews_interview_date ON interviews(interview_date);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_date_range ON interviews(interview_date, status);

-- Onboarding
CREATE INDEX idx_onboarding_candidate_id ON onboarding(candidate_id);
CREATE INDEX idx_onboarding_status ON onboarding(status);

-- Onboarding Steps
CREATE INDEX idx_onboarding_steps_onboarding_id ON onboarding_steps(onboarding_id);

-- Interns
CREATE INDEX idx_interns_user_id ON interns(user_id);
CREATE INDEX idx_interns_mentor_id ON interns(mentor_id);
CREATE INDEX idx_interns_status ON interns(status);
CREATE INDEX idx_interns_current_stage ON interns(current_stage);

-- Learning Paths
CREATE INDEX idx_learning_paths_track ON learning_paths(track);

-- Modules
CREATE INDEX idx_modules_learning_path_id ON modules(learning_path_id);

-- Module Contents
CREATE INDEX idx_module_contents_module_id ON module_contents(module_id);

-- Quizzes
CREATE INDEX idx_quizzes_module_id ON quizzes(module_id);
CREATE INDEX idx_quizzes_learning_path_id ON quizzes(learning_path_id);

-- Quiz Questions
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- Quiz Attempts
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_intern_id ON quiz_attempts(intern_id);

-- Intern Progress
CREATE INDEX idx_intern_progress_intern_id ON intern_progress(intern_id);

-- Tasks
CREATE INDEX idx_tasks_intern_id ON tasks(intern_id);
CREATE INDEX idx_tasks_mentor_id ON tasks(mentor_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_intern_status ON tasks(intern_id, status);

-- Task Comments
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);

-- Evaluations
CREATE INDEX idx_evaluations_intern_id ON evaluations(intern_id);
CREATE INDEX idx_evaluations_type ON evaluations(type);
CREATE INDEX idx_evaluations_evaluation_date ON evaluations(evaluation_date);
CREATE INDEX idx_evaluations_intern_type ON evaluations(intern_id, type);

-- Reports
CREATE INDEX idx_reports_intern_id ON reports(intern_id);
CREATE INDEX idx_reports_status ON reports(status);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Email Logs
CREATE INDEX idx_email_logs_recipient_email ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);

-- File Uploads
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
CREATE INDEX idx_file_uploads_entity ON file_uploads(entity_type, entity_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentor_requests_updated_at BEFORE UPDATE ON mentor_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruitment_plans_updated_at BEFORE UPDATE ON recruitment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_positions_updated_at BEFORE UPDATE ON job_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_updated_at BEFORE UPDATE ON onboarding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_steps_updated_at BEFORE UPDATE ON onboarding_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interns_updated_at BEFORE UPDATE ON interns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_contents_updated_at BEFORE UPDATE ON module_contents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intern_progress_updated_at BEFORE UPDATE ON intern_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto calculate overall_score
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

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Dashboard Stats
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

-- Recruitment Report
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

-- Training Report
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

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Roles
INSERT INTO roles (name, display_name, description) VALUES
('admin', 'Quản trị viên', 'Toàn quyền quản lý hệ thống'),
('hr', 'Nhân sự', 'Quản lý tuyển dụng và onboarding'),
('mentor', 'Người hướng dẫn', 'Quản lý đào tạo và đánh giá TTS'),
('director', 'Giám đốc', 'Phê duyệt kế hoạch tuyển dụng'),
('intern', 'Thực tập sinh', 'Học tập và thực hiện tasks'),
('candidate', 'Ứng viên', 'Nộp hồ sơ ứng tuyển');

-- Email Templates
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

-- System Settings
INSERT INTO system_settings (key, value, data_type, description) VALUES
('quiz_passing_score', '80', 'number', 'Điểm tối thiểu để pass quiz'),
('task_deadline_reminder_days', '3', 'number', 'Số ngày trước deadline để gửi reminder'),
('max_quiz_attempts', '3', 'number', 'Số lần làm lại quiz tối đa'),
('onboarding_steps', '["Bổ sung hồ sơ", "Cấp tài khoản & Email", "Đào tạo nhập môn", "Giao Task đầu tiên"]', 'json', 'Các bước onboarding');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
    