# 🎯 MASTER TODO LIST - TTS LEARNING SYSTEM

Bảng tổng hợp tất cả các task hoàn thiện của hệ thống, phân loại theo Module và Thứ tự ưu tiên (Priority).

---

## 🏗️ 1. INFRASTRUCTURE & DEV-OPS (NỀN TẢNG)

| Task                          |  Priority  | Status | Ghi chú                                                    |
| :---------------------------- | :--------: | :----: | :--------------------------------------------------------- |
| Tích hợp MinIO Object Storage |  **High**  |   ✅   | Cấu hình Docker, Service & Controller hoàn tất.            |
| Docker & Docker Compose Setup |  **High**  |   ✅   | Toàn bộ hệ thống chạy qua container.                       |
| Automated Seed Data Logic     |  **High**  |   ✅   | Đã có script `npm run seed` khởi tạo dữ liệu mẫu.          |
| Database Migrations           | **Medium** |   ⏳   | Chuyển từ `synchronize: true` sang file migration thực tế. |
| Unit & E2E Tests              | **Medium** |   ⏳   | Cần viết test cho các business logic lõi.                  |

---

## 🔐 2. AUTHENTICATION & SECURITY

| Task                         |  Priority  | Status | Ghi chú                               |
| :--------------------------- | :--------: | :----: | :------------------------------------ |
| JWT Login / Register / RBAC  |  **High**  |   ✅   | Đã có Guards và Roles.                |
| Users Management (CRUD)      |  **High**  |   ✅   | Phân quyền Admin, HR, Mentor, Intern. |
| Dashboard Stats API          |  **High**  |   ✅   | Thống kê tổng quan cho màn thống kê.  |
| Refresh Token Logic          | **Medium** |   ⏳   | Cần thêm logic để tăng bảo mật.       |
| Social Login (Google/GitHub) |  **Low**   |   ⏳   | Tùy chọn mở rộng sau này.             |

---

## 🤝 3. RECRUITMENT MODULE (TUYỂN DỤNG)

| Task                              |  Priority  | Status | Ghi chú                                                 |
| :-------------------------------- | :--------: | :----: | :------------------------------------------------------ |
| Candidate-to-Intern Conversion    |  **High**  |   ✅   | Transaction tạo User & Intern tự động.                  |
| Core CRUDs (Plan, Job, Candidate) |  **High**  |   ✅   | Đầy đủ logic tạo mã tự động (JOB-xxx).                  |
| CV Upload Integration             |  **High**  |   ✅   | Đã có endpoint `apply-with-cv` kết nối với MinIO.       |
| Batch Email Invitations           |  **High**  |   ✅   | Đã có `BatchMailService` gửi email hàng loạt linh hoạt. |
| Onboarding Automation             | **Medium** |   ✅   | Quản lý các bước chuẩn bị (máy tính, mail...).          |

---

## 🎓 4. TRAINING MODULE (ĐÀO TẠO)

| Task                           |  Priority  | Status | Ghi chú                                |
| :----------------------------- | :--------: | :----: | :------------------------------------- |
| Learning Path & Modules Logic  |  **High**  |   ✅   | Cấu trúc lộ trình học đa tầng.         |
| Quiz Attempt & Auto-grading    |  **High**  |   ✅   | Tự động chấm điểm và xét Pass/Fail.    |
| Task Workflow (ToDo -> Review) |  **High**  |   ✅   | Luồng tương tác giữa Intern & Mentor.  |
| Documents Storage (MinIO)      | **Medium** |   ✅   | Đã có API upload tài liệu học tập.     |
| Intern Progress Details        | **Medium** |   ✅   | API xem chi tiết tiến độ từng cá nhân. |

---

## 📊 5. EVALUATION & SYSTEM

| Task                            |  Priority  | Status | Ghi chú                                       |
| :------------------------------ | :--------: | :----: | :-------------------------------------------- |
| Evaluation Score Logic          |  **High**  |   ✅   | Tính điểm trung bình (Technical/Attitude...). |
| Final Decision Workflow         |  **High**  |   ✅   | Chốt kết quả cuối khóa (Hire/End).            |
| Director Approval Queue         |  **High**  |   ✅   | Hệ thống phê duyệt tập trung cho Giám đốc.    |
| Notification System (Socket.io) | **Medium** |   ✅   | Đã có cấu trúc Socket, cần thêm event cụ thể. |
| System Settings (Global Config) |  **Low**   |   ✅   | Cấu hình tham số hệ thống động.               |

---

### 🚀 TRỌNG TÂM TIẾP THEO:

1. **Frontend Integration**: Ghép nối các API mới (Approval, Dashboard, Quiz) vào giao diện.
2. **Unit Testing**: Tăng độ bao phủ test cho các service quan trọng.
3. **Refine UI/UX**: Tối ưu hóa trải nghiệm người dùng dựa trên API mới.

**Cập nhật cuối cùng:** 21/02/2025 (ICT)
