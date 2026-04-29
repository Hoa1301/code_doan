# WORKFLOW - HỆ THỐNG QUẢN LÝ TUYỂN DỤNG & ĐÀO TẠO

## 1. QUY TRÌNH TUYỂN DỤNG

### 1.1. Đề xuất tuyển dụng (Mentor Request)

**Actor**: Mentor

```
POST /api/mentor-requests
{
  "title": "Tuyển Frontend Developer",
  "quantity": 3,
  "required_skills": "React, TypeScript"
}

Status: pending → approved/rejected
```

### 1.2. Kế hoạch tuyển dụng

**Actor**: HR, Director

```
POST /api/recruitment-plans
PATCH /api/recruitment-plans/{id}/submit
PATCH /api/recruitment-plans/{id}/approve (Director)

Status: draft → pending_approval → active/rejected
```

### 1.3. Đăng tin tuyển dụng

**Actor**: HR

```
POST /api/job-positions
PATCH /api/job-positions/{id}/publish

Status: draft → open → closed
```

### 1.4. Ứng tuyển

**Actor**: Candidate

```
POST /api/candidates
POST /api/files/upload (CV)

Status: pending_review → cv_screened → shortlisted
→ interview_scheduled → passed_interview → converted_to_intern
```

### 1.5. Phỏng vấn

**Actor**: HR, Interviewer

```
POST /api/interviews
PATCH /api/interviews/{id}/complete

Status: scheduled → completed
Result: passed/failed
```

## 2. QUY TRÌNH ONBOARDING

**Actor**: HR, Mentor

```
POST /api/onboarding
{
  "candidate_id": "uuid",
  "track": "Frontend Development",
  "mentor_id": "uuid"
}

4 Steps:
0. Documents
1. Account Setup
2. Orientation
3. First Assignment

PATCH /api/onboarding/{id}/steps/{stepNumber}
PATCH /api/onboarding/{id}/complete → Auto-create Intern
```

## 3. ĐÀO TẠO - GIAI ĐOẠN 1

### 3.1. Tạo lộ trình

**Actor**: Mentor

```
POST /api/learning-paths
POST /api/learning-paths/{id}/modules
POST /api/modules/{id}/contents
POST /api/quizzes
```

### 3.2. Intern học

**Actor**: Intern

```
GET /api/interns/{id}/progress
POST /api/quizzes/{id}/start
POST /api/quizzes/{id}/submit

Auto-grading → Update progress
```

### 3.3. Đánh giá Phase 1

**Actor**: Mentor

```
POST /api/evaluations
{
  "type": "phase1",
  "technical_score": 85,
  "attitude_score": 90
}

Auto-update: intern.current_stage = "stage2"
```

## 4. ĐÀO TẠO - GIAI ĐOẠN 2

### 4.1. Giao task

**Actor**: Mentor

```
POST /api/tasks
{
  "title": "Build Login Component",
  "intern_id": "uuid"
}

Status: to_do → in_progress → under_review → completed
```

### 4.2. Review task

**Actor**: Mentor

```
PATCH /api/tasks/{id}/complete
PATCH /api/tasks/{id}/rework
```

### 4.3. Đánh giá Phase 2

```
POST /api/evaluations { "type": "phase2" }
Auto-update: intern.current_stage = "final_review"
```

## 5. ĐÁNH GIÁ CUỐI CÙNG

```
POST /api/evaluations
{
  "type": "final",
  "decision": "propose_hire/extend_internship/end_program"
}

Auto-update: intern.current_stage = "completed"
```

## 6. BÁO CÁO

### Intern nộp báo cáo

```
POST /api/reports
{
  "type": "weekly/monthly",
  "content": "..."
}
```

### Mentor review

```
PATCH /api/reports/{id}/review
{
  "score": 85,
  "feedback": "..."
}
```

## 7. PERMISSIONS

| Module            | Admin | HR          | Mentor      | Director     | Intern        | Candidate  |
| ----------------- | ----- | ----------- | ----------- | ------------ | ------------- | ---------- |
| Mentor Requests   | ✅    | ✅          | ✅ (create) | ❌           | ❌            | ❌         |
| Recruitment Plans | ✅    | ✅ (create) | ❌          | ✅ (approve) | ❌            | ❌         |
| Job Positions     | ✅    | ✅          | ✅ (view)   | ✅ (view)    | ✅ (view)     | ✅ (view)  |
| Candidates        | ✅    | ✅          | ❌          | ❌           | ❌            | ✅ (apply) |
| Tasks             | ✅    | ❌          | ✅ (create) | ❌           | ✅ (update)   | ❌         |
| Evaluations       | ✅    | ✅ (view)   | ✅ (create) | ❌           | ✅ (view own) | ❌         |

## 8. NOTIFICATIONS

| Event                | Recipient               | Type           |
| -------------------- | ----------------------- | -------------- |
| Interview scheduled  | Candidate + Interviewer | Email + In-app |
| Task assigned        | Intern                  | Email + In-app |
| Evaluation completed | Intern                  | Email + In-app |
| Report reviewed      | Intern                  | In-app         |
