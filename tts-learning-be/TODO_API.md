# 📋 DANH SÁCH API CẦN CHO FRONTEND (API TODO)

Dưới đây là danh sách các API quan trọng đã được triển khai và đồng bộ với cấu trúc Frontend để hoàn thiện quy trình nghiệp vụ.

## 🤝 1. MODULE TUYỂN DỤNG (RECRUITMENT)

- [x] **Sàng lọc hồ sơ (CV Screening)**:
  - `PATCH /candidates/:id`: Cập nhật trạng thái (`CV_SCREENED`, `REJECTED`).
- [x] **Quản lý Phỏng vấn (Interview)**:
  - `POST /interviews`: Lên lịch phỏng vấn mới.
- [x] **Chuyển đổi thực tập sinh (Conversion)**:
  - `PATCH /candidates/:id/convert-to-intern`: **(MỚI)** Đồng bộ với frontend function `convertCandidateToIntern`.
- [x] **Gửi Email hàng loạt**:
  - `POST /recruitment/mail/batch`: **(MỚI)** HR gửi mail mời phỏng vấn/thông báo kết quả cho nhiều ứng viên.

## 📖 2. MODULE ĐÀO TẠO (TRAINING)

- [x] **Lộ trình học theo chuyên ngành (Track)**:
  - `GET /learning-paths/track/:track`: **(MỚI)** Lấy lộ trình chi tiết dựa trên track của TTS (FE dùng trong dashboard).
- [x] **Học tập & Tài liệu**:
  - `GET /training-content/contents/:moduleId`: Lấy danh sách video/PDF theo module.
- [x] **Làm bài Kiểm tra (Quiz)**:
  - `GET /quizzes`: **(MỚI)** Lấy danh sách quiz.
  - `GET /quizzes/:id`: **(MỚI)** Lấy chi tiết quiz và câu hỏi.
  - `POST /quizzes/:id/submit`: **(MỚI)** Nộp bài quiz (Đã đồng bộ path `/quizzes` với FE).

## 🛠️ 3. QUẢN LÝ NHIỆM VỤ & TTS (MANAGEMENT)

- [x] **Tiến độ học tập**:
  - `GET /interns/:id/progress`: **(MỚI)** Mentor/Admin xem tiến độ của từng TTS.
- [x] **Luồng Task**:
  - `PATCH /tasks/:id/status`: TTS cập nhật trạng thái hoặc Mentor review.
- [x] **Thống kê Dashboard**:
  - `GET /dashboardStats`: **(MỚI)** Cung cấp số liệu tổng quan (User, TTS, Job...) cho Dashboard.

## 📊 4. ĐÁNH GIÁ & PHÊ DUYỆT (EVALUATION & APPROVAL)

- [x] **Quyết định cuối cùng**:
  - `PATCH /evaluations/:id/decision`: **(MỚI)** Chốt kết quả đánh giá (FE function `finalDecision`).
- [x] **Hàng đợi Phê duyệt (Director)**:
  - `GET /approvals`: **(MỚI)** Giám đốc xem danh sách cần phê duyệt.
  - `PATCH /approvals/:id`: **(MỚI)** Phê duyệt hoặc từ chối yêu cầu.

## 👥 5. HỆ THỐNG (SYSTEM)

- [x] **Quản lý User**:
  - `GET /users`: **(MỚI)** Danh sách người dùng (Dành cho Admin).
  - `PATCH /users/:id`: Cập nhật thông tin người dùng.

---

_Ghi chú: Tất cả các API quan trọng đã được đồng bộ hóa với Frontend Service. Các bạn FE có thể yên tâm sử dụng! 🚀🏆🏆_
