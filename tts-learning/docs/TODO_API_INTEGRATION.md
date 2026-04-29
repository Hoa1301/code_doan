# 📋 DANH SÁCH TIẾN ĐỘ GHÉP API (FRONTEND - BACKEND)

Tài liệu này theo dõi quá trình chuyển đổi từ Mock Data sang API thực tế từ Backend NestJS.

## ⚙️ 1. CẤU TRÚC HỆ THỐNG (CORE)

- [x] **HttpClient (`http.ts`)**: Cấu hình Axios Interceptors, tự động xử lý Bearer Token và bóc tách `response.data`.
- [x] **Service Types (`ServiceResponse.ts`)**: Cấu trúc lại Response khớp với `errorCode` và `data` của Backend.
- [x] **Auth Service**:
    - [x] Đăng nhập (`POST /auth/login`) - Map token và thông tin user.
    - [x] Đăng ký (`POST /auth/register`).
    - [x] Lấy Profile (`GET /auth/profile`).

## 🤝 2. MODULE TUYỂN DỤNG (RECRUITMENT)

- [x] **Quản lý Ứng viên (Candidates)**:
    - [x] Lấy danh sách (`GET /candidates`).
    - [x] Chi tiết ứng viên (`GET /candidates/:id`).
    - [x] Tạo mới hồ sơ (`POST /candidates`).
    - [x] Cập nhật trạng thái/Shortlist/Reject (`PATCH /candidates/:id`).
    - [x] Xóa hồ sơ (`DELETE /candidates/:id`).
    - [x] Chuyển đổi thành Intern (`POST /candidates/:id/convert-to-intern`).
- [x] **Quản lý Phỏng vấn (Interviews)**:
    - [x] Lấy danh sách (`GET /interviews`).
    - [x] Lên lịch phỏng vấn (`POST /interviews`).
    - [x] Cập nhật kết quả (`PATCH /interviews/:id`).
    - [x] Xóa lịch (`DELETE /interviews/:id`).
- [x] **Onboarding**:
    - [x] Danh sách tiến độ (`GET /onboarding`).
    - [x] Chi tiết tiến độ (`GET /onboarding/:id`).
    - [x] Tạo quy trình Onboarding (`POST /onboarding`).
    - [x] Cập nhật các bước Onboarding (`PATCH /onboarding-steps/:id/status`).
- [x] **Kế hoạch & Yêu cầu**:
    - [x] Danh sách vị trí tuyển dụng (`GET /job-positions`).
    - [x] Yêu cầu Mentor (`GET /mentor-requests`).
    - [x] Kế hoạch tuyển dụng (`GET /recruitment-plans`).

## 📖 3. MODULE ĐÀO TẠO (TRAINING)

- [x] **Quản lý Thực tập sinh (Interns)**:
    - [x] Danh sách thực tập sinh (`GET /interns`).
    - [x] Chi tiết thực tập sinh (`GET /interns/:id`).
    - [x] Cập nhật thông tin/trạng thái Intern (`PATCH /interns/:id`).
    - [x] Lấy tiến độ học tập (`GET /interns/me/progress`).
- [x] **Quản lý Nhiệm vụ (Tasks)**:
    - [x] Danh sách nhiệm vụ (`GET /tasks`).
    - [x] Chi tiết & Thảo luận (`GET /tasks/:id`).
    - [x] Giao nhiệm vụ mới (`POST /tasks`).
    - [x] Cập nhật trạng thái/Status (`PATCH /tasks/:id/status`).
    - [x] Thêm nhận xét - Comment (`POST /tasks/:id/comments`).
    - [x] Xóa nhiệm vụ (`DELETE /tasks/:id`).
- [x] **Học tập & Nội dung**:
    - [x] Danh sách nội dung/tài liệu (`GET /training-content/contents/:moduleId`).
    - [x] Quản lý Lộ trình học (`GET /learning-path`).
    - [x] Nộp bài bài kiểm tra - Quiz (`POST /quizzes/:id/submit`).

## 📊 4. ĐÁNH GIÁ & KẾT THÚC (EVALUATION)

- [x] **Dashboard**:
    - [x] Thống kê Dashboard (`GET /dashboardStats`).
- [x] **Đánh giá Mentor**:
    - [x] Tạo phiếu đánh giá định kỳ (`POST /evaluations`).
    - [x] Chốt kết quả cuối cùng (`PATCH /evaluations/:id`).
- [x] **Báo cáo (Reports)**:
    - [x] Gửi báo cáo tuần/tháng (`POST /reports`).
    - [x] Duyệt/Phản hồi báo cáo (`PATCH /reports/:id`).

## 🛠️ 5. QUẢN TRỊ (ADMIN/SYSTEM)

- [x] **User & Permission**:
    - [x] Quản lý User (`/users`).
    - [x] Quản lý Role & Permission (`/roles`).
- [ ] **System Settings**:
    - [ ] Cài đặt Email Template.
    - [ ] Cài đặt hệ thống chung.

---

_Cập nhật lần cuối: 19/02/2026_
