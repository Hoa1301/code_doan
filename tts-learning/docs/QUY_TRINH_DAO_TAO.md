## 4) Quy trình đào tạo (2 giai đoạn + đánh giá)

### 4.1 Tổng quan
Quy trình đào tạo thực tập sinh gồm 3 chặng:
1. **Giai đoạn 1**: Học theo lộ trình + quiz/test theo module
2. **Giai đoạn 2**: Thực chiến dự án + quản lý task
3. **Đánh giá cuối kỳ**: Tổng hợp kết quả để ra quyết định nhân sự

Điều kiện chuyển tiếp được kiểm soát bằng:
- Điểm số quiz/test
- Tỷ lệ hoàn thành module/task
- Đánh giá và xác nhận của Mentor

---

### 4.2 Danh sách màn hình cần có

#### A. Nhóm màn cho Thực tập sinh (TTS)
1. **Learning Path (TTS)**
   - Xem lộ trình học theo vị trí (Frontend/Backend/BA/DBA...)
   - Xem danh sách module, trạng thái: Locked / In Progress / Completed
   - Mở tài liệu học (video/link/file), vào quiz/test

2. **Quiz/Test làm bài**
   - Hiển thị câu hỏi theo module
   - Nộp bài, chấm điểm tự động (nếu trắc nghiệm)
   - Xem kết quả và điều kiện pass/fail

3. **Task Board (TTS)**
   - Danh sách task được giao theo Kanban: To do / In progress / Done
   - Cập nhật trạng thái task, nộp kết quả/link/file
   - Xem nhận xét từ Mentor

4. **Progress & Feedback (TTS)**
   - Xem tiến độ học, điểm theo từng giai đoạn
   - Xem feedback tuần/tháng và đánh giá cuối kỳ

#### B. Nhóm màn cho Mentor
5. **Learning Path Management (Mentor)**
   - Tạo/sửa lộ trình học theo track
   - Quản lý module: tài liệu, quiz, test, điều kiện pass
   - Cấu hình điểm tối thiểu qua module/giai đoạn

6. **Quiz Builder / Test Configuration**
   - Tạo ngân hàng câu hỏi, cấu hình số câu/điểm/thời gian
   - Gắn quiz vào module

7. **Learning Progress Review (Mentor)**
   - Theo dõi điểm, tiến độ từng TTS
   - Đánh giá giai đoạn 1 và xác nhận “Đủ tiêu chuẩn” / “Chưa đạt”

8. **Task Assignment (Mentor)**
   - Tạo/giao task (mô tả, deadline, priority, tài liệu liên quan)
   - Theo dõi trạng thái thực hiện của từng TTS
   - Chấm điểm/nhận xét theo chu kỳ

9. **Final Evaluation (Mentor)**
   - Chấm theo tiêu chí: thái độ, chuyên môn, tiến độ, teamwork
   - Tổng hợp điểm giai đoạn 1 + 2
   - Đề xuất: Lên chính thức / Gia hạn / Kết thúc

#### C. Nhóm màn cho HR/Quản trị
10. **Intern List & Profile (HR)**
    - Danh sách TTS, thông tin mentor, phòng ban, trạng thái đào tạo

11. **Training Report (HR)**
    - Xem báo cáo tổng hợp theo đợt/phòng ban/mentor
    - Xem đề xuất cuối kỳ để phục vụ quyết định nhân sự

12. **Configuration (HR/Admin)**
    - Cấu hình thang điểm, trọng số, ngưỡng pass, kỳ đánh giá

### 4.3 Luồng nghiệp vụ chi tiết

#### Luồng 1: Khởi tạo đào tạo (sau tuyển dụng)
1. HR chuyển ứng viên sang TTS và gán Mentor
2. Mentor gán Learning Path phù hợp vị trí
3. Hệ thống mở Module 1 cho TTS (các module sau ở trạng thái Locked)

#### Luồng 2: Giai đoạn 1 (Learning + Quiz/Test)
1. TTS vào màn Learning Path, học tài liệu module hiện tại
2. TTS làm quiz/test cuối module
3. Hệ thống chấm điểm, cập nhật progress
4. Mentor vào màn Progress Review để xem kết quả
5. Nếu đạt điều kiện module -> mở module tiếp theo
6. Kết thúc toàn bộ module giai đoạn 1:
   - Nếu đủ điểm tối thiểu + mentor xác nhận: chuyển giai đoạn 2
   - Nếu chưa đạt: học bù/làm lại theo rule

#### Luồng 3: Giai đoạn 2 (Dự án + Task)
1. Mentor tạo/giao task từ màn Task Assignment
2. TTS thực hiện task và cập nhật trạng thái:
   - To do -> In progress -> Done
3. Mentor review output, feedback/chấm điểm định kỳ
4. Hệ thống tổng hợp hiệu suất giai đoạn 2 (đúng hạn, chất lượng, mức hoàn thành)

#### Luồng 4: Đánh giá cuối kỳ
1. Mentor vào màn Final Evaluation
2. Chấm theo bộ tiêu chí + tổng hợp điểm từ 2 giai đoạn
3. Chọn kết luận:
   - Đề xuất lên chính thức
   - Gia hạn thực tập
   - Kết thúc chương trình
4. HR xem Training Report để ra quyết định nhân sự và lưu hồ sơ

### 4.4 Trạng thái dữ liệu quan trọng (đề xuất)

- **Training Stage**: `Stage1` | `Stage2` | `FinalReview` | `Completed`
- **Module Status**: `Locked` | `InProgress` | `Completed` | `Failed`
- **Quiz Attempt**: `NotStarted` | `Submitted` | `Passed` | `Failed`
- **Task Status**: `ToDo` | `InProgress` | `Done` | `NeedRework`
- **Final Decision**: `ProposeHire` | `ExtendInternship` | `EndProgram`

### 4.5 Quy tắc chuyển giai đoạn (business rules)

- Qua module khi:
  - Điểm test module >= ngưỡng pass
  - Hoàn thành đủ tài liệu/bài tập bắt buộc
- Qua giai đoạn 1 khi:
  - Tất cả module bắt buộc hoàn thành
  - Mentor xác nhận đủ tiêu chuẩn
- Kết thúc chương trình khi:
  - Hoàn tất task giai đoạn 2 theo tiêu chí tối thiểu
  - Có biên bản đánh giá cuối kỳ từ Mentor
