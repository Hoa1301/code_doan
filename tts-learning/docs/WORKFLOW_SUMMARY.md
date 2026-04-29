# 📋 TÓM TẮT WORKFLOW - HỆ THỐNG QUẢN LÝ TUYỂN DỤNG & ĐÀO TẠO

## 🎯 TỔNG QUAN

**3 quy trình chính:**
1. Tuyển dụng (10 bước)
2. Đào tạo (2 giai đoạn)
3. Đánh giá (3 lần)

---

## 📍 PHẦN 1: TUYỂN DỤNG (10 BƯỚC)

| Bước | Màn hình | Vai trò | Chức năng chính |
|------|----------|---------|-----------------|
| 1 | Mentor Request List | Mentor | Đề xuất nhu cầu tuyển dụng |
| 2 | Recruitment Plan List | HR | Tạo kế hoạch tuyển dụng |
| 3-4 | Director Approvals | Director | Phê duyệt kế hoạch |
| 5 | Recruitment Job List | HR | Đăng tin tuyển dụng |
| 6 | Job Board (Public) | Candidate | Nộp đơn ứng tuyển |
| 7 | CV Screening List | HR | Sàng lọc hồ sơ |
| 8 | Interview Schedule | HR | Lên lịch phỏng vấn |
| 9 | CV Detail | HR | Cập nhật kết quả PV |
| 10 | Onboarding List | HR | Onboarding 4 bước |

---

## 📍 PHẦN 2: ĐÀO TẠO (2 GIAI ĐOẠN)

### Giai đoạn 1: Learning Path
- **Màn hình:** Mentor Learning Path
- **Vai trò:** Mentor + Intern
- **Nội dung:**
  - Học theo lộ trình (modules)
  - Làm quiz/test cuối mỗi module
  - Final Assessment
  - Đánh giá Phase 1
- **Điều kiện qua:** Đạt điểm + Mentor xác nhận

### Giai đoạn 2: Task Management
- **Màn hình:** Mentor Task Management
- **Vai trò:** Mentor + Intern
- **Nội dung:**
  - Mentor giao tasks
  - Intern thực hiện (To Do → In Progress → Done)
  - Mentor review & approve
  - Đánh giá Phase 2

---

## 📍 PHẦN 3: ĐÁNH GIÁ (3 LẦN)

| Đánh giá | Màn hình | Thời điểm | Nội dung |
|----------|----------|-----------|----------|
| Phase 1 | Mentor Eval Phase 1 | Sau Learning Path | Điểm quiz + Thái độ học tập |
| Phase 2 | Mentor Eval Phase 2 | Sau Task Management | Kết quả công việc + Kỹ năng |
| Final | Mentor Eval Final | Cuối chương trình | Tổng hợp + Kết luận |

---

## 🔄 WORKFLOW DIAGRAM

```
TUYỂN DỤNG
├─ Bước 1-4: Lập kế hoạch & Phê duyệt
├─ Bước 5-6: Đăng tin & Nhận hồ sơ
├─ Bước 7-9: Sàng lọc & Phỏng vấn
└─ Bước 10: Onboarding
         ↓
ĐÀO TẠO
├─ Giai đoạn 1: Learning Path (Lý thuyết)
│   └─ Đánh giá Phase 1
└─ Giai đoạn 2: Task Management (Thực hành)
    └─ Đánh giá Phase 2
         ↓
ĐÁNH GIÁ CUỐI KỲ
└─ Kết luận: Chính thức / Gia hạn / Kết thúc
```

---

## 👥 VAI TRÒ

| Vai trò | Quyền hạn chính |
|---------|-----------------|
| **Mentor** | Đề xuất, Thiết kế lộ trình, Giao task, Đánh giá |
| **HR** | Tuyển dụng, Sàng lọc, Phỏng vấn, Onboarding |
| **Director** | Phê duyệt kế hoạch |
| **Intern** | Học tập, Làm task, Nộp báo cáo |

---

## 📊 TRẠNG THÁI CHÍNH

### Candidate Status:
- Pending Review → Shortlisted → Interview Scheduled → Passed Interview → Onboarding

### Onboarding Status:
- In Progress → Completed

### Task Status:
- To Do → In Progress → Under Review → Completed

### Evaluation Result:
- Pass → Tiếp tục
- Fail → Gia hạn/Kết thúc

---

## 📁 FILES QUAN TRỌNG

- **Workflow chi tiết:** `COMPLETE_WORKFLOW.md`
- **Workflow tuyển dụng:** `RECRUITMENT_WORKFLOW_GUIDE.md`
- **Mock data:** `src/constants/MockData.ts`
- **Translations:** `public/locales/{vi|en}/translation.json`

---

**Xem file `COMPLETE_WORKFLOW.md` để biết chi tiết từng bước!**
