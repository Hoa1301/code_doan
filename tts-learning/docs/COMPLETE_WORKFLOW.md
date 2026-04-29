# 📋 WORKFLOW HOÀN CHỈNH: HỆ THỐNG QUẢN LÝ TUYỂN DỤNG & ĐÀO TẠO THỰC TẬP SINH

## 🎯 TỔNG QUAN HỆ THỐNG

Hệ thống bao gồm **3 quy trình chính**:
1. **Quy trình Tuyển dụng** (10 bước)
2. **Quy trình Đào tạo** (2 giai đoạn)
3. **Quy trình Đánh giá** (3 lần đánh giá)

---

# PHẦN 1: QUY TRÌNH TUYỂN DỤNG (RECRUITMENT)

## 📍 BƯỚC 1: Mentor/Trưởng nhóm đề xuất nhu cầu

### Màn hình: **Mentor Request List**
**Đường dẫn:** `/recruitment/mentor-requests`

### Vai trò: Mentor/Team Lead

### Chức năng:
- Tạo đề xuất tuyển dụng thực tập sinh
- Điền thông tin: vị trí, số lượng, yêu cầu kỹ năng, thời gian dự kiến

### Các bước thực hiện:
1. Truy cập menu: **Quản lý Tuyển dụng (HR)** → **Đề xuất tuyển dụng**
2. Click nút **"+ Tạo đề xuất mới"**
3. Điền form:
   - Loại: Recruitment
   - Tên kế hoạch
   - Tiêu đề đề xuất
   - Phòng ban
   - Độ ưu tiên (High/Medium/Low)
4. Click **"Gửi đề xuất"**
5. Trạng thái: **Pending** (Chờ HR xử lý)

### Output:
- Request được tạo với status "Pending"
- HR nhận được thông báo

---

## 📍 BƯỚC 2: HR tạo kế hoạch tuyển dụng

### Màn hình: **Recruitment Plan List**
**Đường dẫn:** `/recruitment/plans`

### Vai trò: HR

### Chức năng:
- Xem tất cả đề xuất từ các phòng ban
- Tổng hợp và tạo kế hoạch tuyển dụng chính thức
- Xác định timeline, kênh đăng tuyển, lịch phỏng vấn

### Các bước thực hiện:
1. Truy cập menu: **Quản lý Tuyển dụng (HR)** → **Kế hoạch tuyển dụng**
2. Click **"+ Tạo kế hoạch mới"**
3. Điền thông tin qua 4 tabs:

   **Tab 1: Thông tin chung**
   - Tên chiến dịch (VD: "Tuyển dụng Hè 2025")
   - Tên đợt/khóa (VD: "Đợt 1 - Summer Internship")
   - Mô tả chiến dịch

   **Tab 2: Vị trí & Yêu cầu**
   - Thêm các vị trí cần tuyển
   - Số lượng cho mỗi vị trí
   - Yêu cầu chính

   **Tab 3: Lịch trình & Trạng thái**
   - Thời gian bắt đầu - kết thúc
   - Trạng thái: **Pending Approval** (Chờ duyệt)

   **Tab 4: Quy trình phê duyệt**
   - Chọn người duyệt (Giám đốc)

4. Click **"Lưu kế hoạch"**

### Trạng thái:
- **Pending Approval**: Chờ Giám đốc phê duyệt
- **Active (Hiring)**: Đang tuyển dụng
- **On Hold**: Tạm dừng
- **Closed**: Đã đóng

### Output:
- Kế hoạch được tạo với status "Pending Approval"
- Giám đốc nhận được yêu cầu phê duyệt

---

## 📍 BƯỚC 3-4: Giám đốc phê duyệt kế hoạch

### Màn hình: **Director Approvals**
**Đường dẫn:** `/director/approvals`

### Vai trò: Director

### Chức năng:
- Xem danh sách kế hoạch chờ duyệt
- Phê duyệt hoặc yêu cầu điều chỉnh

### Các bước thực hiện:
1. Truy cập menu: **Cổng thông tin Giám đốc** → **Phê duyệt kế hoạch**
2. Xem danh sách kế hoạch có trạng thái **Pending**
3. Click **"Xem chi tiết"** để xem đầy đủ thông tin
4. Thực hiện hành động:
   - **Phê duyệt**: Click **"Approve"** → Kế hoạch chuyển sang **Active**
   - **Yêu cầu điều chỉnh**: Click **"Request Changes"** → Nhập lý do → Gửi lại HR
   - **Từ chối**: Click **"Reject"** → Nhập lý do

### Output:
- Nếu **Approved**: Kế hoạch → status "Active" → HR có thể đăng tin tuyển dụng
- Nếu **Rejected/Changes**: HR nhận thông báo và cập nhật lại

---

## 📍 BƯỚC 5: HR đăng tin tuyển dụng

### Màn hình: **Recruitment Job List**
**Đường dẫn:** `/recruitment/jobs`

### Vai trò: HR

### Chức năng:
- Tạo tin tuyển dụng chi tiết cho từng vị trí
- Đăng lên website công khai

### Các bước thực hiện:
1. Truy cập menu: **Quản lý Tuyển dụng (HR)** → **Tin tuyển dụng**
2. Click **"+ Tạo tin tuyển dụng"**
3. Điền thông tin:
   - Tiêu đề vị trí (VD: "Frontend ReactJS Intern")
   - Mô tả công việc
   - Yêu cầu ứng viên
   - Quyền lợi
   - Số lượng cần tuyển
   - Deadline nộp hồ sơ
   - Trạng thái: **Open** (Đang tuyển)
4. Click **"Đăng tin"**

### Trạng thái:
- **Open**: Đang nhận hồ sơ
- **Closed**: Đã đóng
- **Draft**: Nháp

### Output:
- Tin tuyển dụng xuất hiện trên Job Board công khai
- Ứng viên có thể xem và nộp đơn

---

## 📍 BƯỚC 6: Ứng viên nộp đơn

### Màn hình: **Job Board** (Public)
**Đường dẫn:** `/jobs` (public page)

### Vai trò: Candidate

### Chức năng:
- Xem danh sách vị trí tuyển dụng
- Xem chi tiết job description
- Nộp hồ sơ ứng tuyển

### Các bước thực hiện:
1. Truy cập website công ty → **Careers/Jobs**
2. Xem danh sách vị trí (chỉ hiển thị jobs có status "Open")
3. Click vào job để xem chi tiết
4. Click **"Apply Now"**
5. Điền form ứng tuyển:
   - Họ tên
   - Email
   - Số điện thoại
   - Địa chỉ
   - Trường học/Chuyên ngành
   - Kinh nghiệm
   - Kỹ năng
   - Upload CV (PDF)
   - Cover letter (optional)
6. Click **"Submit Application"**

### Output:
- Hồ sơ được tạo với status "Pending Review"
- HR nhận được thông báo có hồ sơ mới

---

## 📍 BƯỚC 7: HR sàng lọc hồ sơ (CV Screening)

### Màn hình: **CV Screening List**
**Đường dẫn:** `/candidate/cv-list`

### Vai trò: HR

### Chức năng:
- Xem danh sách hồ sơ ứng tuyển
- Sàng lọc hồ sơ (Shortlist/Reject)
- Xem chi tiết CV

### Dashboard Statistics:
- **Total Applications**: Tổng số hồ sơ
- **Pending Review**: Chờ xem xét
- **Shortlisted**: Đã chọn lọc
- **Rejected**: Đã loại

### Các bước thực hiện:
1. Truy cập menu: **Quản lý Tuyển dụng (HR)** → **Sàng lọc hồ sơ**
2. Xem danh sách candidates với thông tin:
   - Avatar + Name + Email
   - Job Title (vị trí ứng tuyển)
   - Applied Date
   - Status tag
   - Match Score (progress bar)
3. Filter/Search:
   - Filter by status (All/Pending/Shortlisted/Rejected)
   - Search by name, email, position
4. Thực hiện actions:
   - **View**: Click vào candidate → Xem CV Detail
   - **Shortlist**: Click "Shortlist Candidate" → Status → "Shortlisted"
   - **Reject**: Click "Reject Candidate" → Nhập lý do → Status → "Rejected"
   - **Batch Actions**: Chọn nhiều candidates → Shortlist/Reject hàng loạt

### Output:
- Candidates được phân loại:
  - **Shortlisted**: Đủ điều kiện phỏng vấn
  - **Rejected**: Không phù hợp
- Email tự động gửi đến candidates

---

## 📍 BƯỚC 8: Lên lịch phỏng vấn (Interview Scheduling)

### Màn hình: **Interview Schedule**
**Đường dẫn:** `/recruitment/interviews`

### Vai trò: HR

### Chức năng:
- Chọn candidates đã Shortlisted
- Cấu hình thông tin phỏng vấn
- Gửi email mời phỏng vấn

### Layout 2 cột:

**Cột trái: Candidate Queue**
- Danh sách candidates có status "Shortlisted"
- Checkbox để chọn
- Match score tag
- Search box

**Cột phải: Configure & Send**
- **Interview Details:**
  - Date picker: Chọn ngày phỏng vấn
  - Time range picker: Giờ bắt đầu - kết thúc
  - Format toggle: Online / In-person
  - Location/Link input: Google Meet link hoặc địa điểm

- **Email Communication:**
  - Template selector (Standard/Technical/Rejection)
  - Subject input (với variables {Role})
  - Email preview (HTML format với dynamic tags)
  - Edit template button

### Các bước thực hiện:
1. Truy cập menu: **Quản lý Tuyển dụng (HR)** → **Lên lịch phỏng vấn**
2. Chọn candidates từ queue (click để toggle selection)
3. Cấu hình interview details:
   - Chọn ngày
   - Chọn giờ (VD: 9:00 AM - 10:00 AM)
   - Chọn format (Online/In-person)
   - Nhập link họp hoặc địa điểm
4. Chọn email template và xem preview
5. Click **"Schedule & Send"** (hiển thị số lượng đã chọn)

### Validation:
- Phải chọn ít nhất 1 candidate
- Phải chọn date và time
- Phải có location/link

### Output:
- Interview records được tạo cho từng candidate
- Status → "Interview Scheduled"
- Email mời phỏng vấn được gửi tự động
- Calendar event được tạo

---

## 📍 BƯỚC 9: Cập nhật kết quả phỏng vấn

### Màn hình: **CV Detail**
**Đường dẫn:** `/candidate/cv-detail/:id`

### Vai trò: HR

### Chức năng:
- Xem chi tiết hồ sơ candidate
- Cập nhật kết quả phỏng vấn
- Đánh dấu đạt/không đạt

### Thông tin hiển thị:
- **Header:**
  - Avatar (large)
  - Name, Email, Phone, Location
  - Status tag (color-coded)
  - Action buttons

- **Tabs:**
  - Overview: Thông tin cơ bản
  - Experience & Skills
  - Cover Letter
  - Timeline: Lịch sử trạng thái

### Action Buttons (theo status):

**Nếu status = "Interview Scheduled":**
- **Pass Interview** (green button): Đánh dấu đạt phỏng vấn
  - Click → Status → "Passed Interview"
  - Email chúc mừng gửi tự động
- **Reject** (red button): Đánh dấu không đạt
  - Click → Modal nhập lý do → Status → "Rejected"
  - Email từ chối gửi tự động

**Nếu status = "Passed Interview":**
- **Convert to Intern** (purple button): Chuyển thành thực tập sinh
  - Mở modal (xem Bước 10)

**Nếu status = "Pending Review" hoặc "Shortlisted":**
- **Shortlist Candidate**: Chuyển sang Shortlisted
- **Reject Candidate**: Loại ứng viên

### Output:
- Candidate status được cập nhật
- Email tự động gửi theo kết quả
- Timeline được ghi nhận

---

## 📍 BƯỚC 10: Onboarding - Chuyển ứng viên → Thực tập sinh

### Màn hình 1: **CV Detail** (Convert Modal)
**Đường dẫn:** `/candidate/cv-detail/:id`

### Vai trò: HR

### Chức năng: Convert to Intern

### Các bước thực hiện:
1. Từ CV Detail của candidate có status "Passed Interview"
2. Click **"Chuyển thành thực tập sinh"** (Convert to Intern)
3. Modal hiển thị form:
   - **Track** (required): Chọn chuyên ngành thực tập
     - Frontend Development
     - Backend Development
     - Full Stack Development
     - Mobile Development
     - DevOps
     - UI/UX Design
     - QA Testing
   - **Mentor** (required): Chọn mentor phụ trách
     - Michael Ross
     - Sarah Chen
     - David Kim
     - Emily Johnson
     - Alex Martinez
   - **Department** (required): Chọn phòng ban
     - Engineering
     - Product
     - Design
     - QA
     - DevOps
   - **Internship Period** (required): Chọn thời gian thực tập
     - Start Date
     - End Date
4. Click **"Tạo hồ sơ thực tập sinh"**

### Output:
- Onboarding record được tạo với:
  - currentStep: 0
  - status: "In Progress"
  - 4 steps: Documents → Account Setup → Orientation → First Assignment
- Success message hiển thị
- Candidate được chuyển sang Onboarding List

---

### Màn hình 2: **Onboarding List**
**Đường dẫn:** `/recruitment/onboarding`

### Vai trò: HR

### Chức năng:
- Theo dõi tiến độ onboarding của thực tập sinh mới
- Quản lý 4 bước onboarding

### 4 Bước Onboarding:
1. **Documents**: Bổ sung hồ sơ (CMND, bằng cấp, hợp đồng)
2. **Account Setup**: Cấp tài khoản & Email doanh nghiệp
3. **Orientation**: Đào tạo nhập môn (giới thiệu công ty, quy định)
4. **First Assignment**: Giao task đầu tiên

### Layout:

**Cột trái (18/24): Onboarding List**
- Card cho mỗi intern:
  - Avatar + Name + Track
  - Status tag (In Progress/Delayed/Completed)
  - 4-step progress bar (horizontal)
  - Action buttons:
    - **Advance**: Tiến lên bước tiếp theo
    - **More** dropdown:
      - Send Reminder
      - Approve Step
      - Cancel Onboarding

**Cột phải (6/24): Statistics**
- **Quick Stats:**
  - In Onboarding: Count
  - Delayed: Count (red)
  - Ready for Work: Count (green)
- **Next Steps:**
  - Reminders cho các bước cần xử lý

### Các bước thực hiện:
1. Xem danh sách interns đang onboarding
2. Click **"Advance"** để chuyển intern sang bước tiếp theo
3. Khi hoàn thành bước 4 → Status → "Completed"
4. Intern sẵn sàng bắt đầu đào tạo chính thức

### Output:
- Intern hoàn thành onboarding
- Status → "Completed"
- Chuyển sang Giai đoạn 1: Learning Path

---

# PHẦN 2: QUY TRÌNH ĐÀO TẠO (TRAINING)

## 📍 GIAI ĐOẠN 1: Learning Path (Lý thuyết + Test)

### Màn hình: **Mentor Learning Path**
**Đường dẫn:** `/mentor/learning-path`

### Vai trò: Mentor

### Mục tiêu:
- Thực tập sinh học theo lộ trình được thiết kế sẵn
- Hoàn thành các module với bài test cuối mỗi module
- Đạt điểm tối thiểu để qua giai đoạn 1

### Cấu trúc Learning Path:

**Mỗi lộ trình gồm:**
- Track title (VD: "Frontend Development")
- Nhiều modules (VD: Module 1, 2, 3...)
- Final Assessment (Quiz cuối khóa)

**Mỗi module gồm:**
- Module title
- Status (Ready/In Progress/Locked)
- Content items:
  - **Video**: Video bài giảng (với duration)
  - **Document**: PDF/tài liệu tham khảo
  - **Quiz**: Bài tập/câu hỏi

### Layout 2 cột:

**Sidebar (320px):**
- Path title (editable)
- Modules list:
  - Drag-drop để sắp xếp
  - Status tag
  - Preview 2 items đầu
- Final Assessment card
- Add module button

**Main Content:**
- Module title (editable)
- Module content items (cards):
  - Icon (Video/PDF/Quiz)
  - Title + Metadata
  - Edit/Drag buttons
- Settings & Delete module buttons

### Luồng thực hiện:

**Mentor:**
1. Thiết kế lộ trình học cho track
2. Thêm modules
3. Thêm content items (video/document/quiz)
4. Cấu hình passing score cho quiz
5. Publish lộ trình

**Thực tập sinh:**
1. Được assign vào learning path theo track
2. Học tài liệu theo từng module
3. Làm quiz cuối mỗi module
4. Hệ thống ghi nhận điểm/tiến độ
5. Hoàn thành tất cả modules
6. Làm Final Assessment

**Mentor:**
1. Xem kết quả quiz của TTS
2. Đánh giá giai đoạn 1 (xem Evaluation Phase 1)
3. Xác nhận "Đủ tiêu chuẩn" để qua giai đoạn 2

### Điều kiện qua Giai đoạn 1:
- ✅ Hoàn thành tất cả modules
- ✅ Đạt điểm tối thiểu (VD: 80% cho Final Assessment)
- ✅ Được mentor xác nhận "Đủ tiêu chuẩn"

### Output:
- TTS hoàn thành Phase 1
- Chuyển sang Giai đoạn 2: Task Management

---

## 📍 GIAI ĐOẠN 2: Task Management (Thực chiến dự án)

### Màn hình: **Mentor Task Management**
**Đường dẫn:** `/mentor/tasks`

### Vai trò: Mentor

### Mục tiêu:
- Mentor giao tasks thực tế cho TTS
- TTS thực hiện công việc theo quy trình
- Mentor đánh giá và chấm điểm theo chu kỳ

### Layout:

**Cột trái (6/24): Statistics & Activity**
- **Stats:**
  - Active Interns: 4
  - Open Tasks: 15
  - Completed: 42
- **Activity Feed:**
  - Recent actions (submitted, started, requested review)
  - Timestamps

**Cột phải (18/24): Task Table**
- **Columns:**
  - Task ID
  - Task Title
  - Intern (với avatar)
  - Priority (High/Medium/Low)
  - Due Date
  - Status (To Do/In Progress/Under Review/Completed)
  - Actions dropdown

- **Filters:**
  - Filter by Intern
  - Filter by Status
  - Search by task title

### Luồng thực hiện:

**Mentor tạo/giao task:**
1. Click **"+ Assign Task"**
2. Điền form:
   - Task Title (required)
   - Intern (required): Chọn TTS
   - Due Date (required)
   - Priority (required): High/Medium/Low
   - Description (optional)
3. Click **"Submit"**
4. Task được tạo với status "To Do"

**Thực tập sinh thực hiện:**
1. Xem task được giao (trong Intern Task Board)
2. Cập nhật status:
   - **To Do** → **In Progress**: Bắt đầu làm
   - **In Progress** → **Under Review**: Hoàn thành, chờ mentor review
3. Có thể comment/upload files

**Mentor review:**
1. Xem task có status "Under Review"
2. Thực hiện actions:
   - **Approve/Complete**: Task → "Completed"
   - **Request Revision**: Task → "In Progress" (yêu cầu sửa)
   - **View Details**: Xem chi tiết + comments

**Đánh giá theo chu kỳ:**
- Mentor đánh giá TTS theo tuần/tháng
- Chấm điểm dựa trên:
  - Số lượng tasks hoàn thành
  - Chất lượng công việc
  - Đúng deadline
  - Thái độ làm việc

### Output:
- TTS tích lũy điểm từ tasks
- Mentor có dữ liệu để đánh giá Phase 2

---

# PHẦN 3: QUY TRÌNH ĐÁNH GIÁ (EVALUATION)

## 📍 ĐÁNH GIÁ GIAI ĐOẠN 1 (Phase 1 Evaluation)

### Màn hình: **Mentor Eval Phase 1**
**Đường dẫn:** `/mentor/eval-phase1`

### Vai trò: Mentor

### Thời điểm: Sau khi TTS hoàn thành Learning Path

### Nội dung đánh giá:
- **Điểm số từ quiz/test:**
  - Điểm trung bình các modules
  - Điểm Final Assessment
- **Đánh giá của mentor:**
  - Thái độ học tập
  - Khả năng tiếp thu kiến thức
  - Tính chủ động
  - Kỹ năng tự học

### Kết quả:
- **Pass**: Đủ tiêu chuẩn → Chuyển sang Phase 2
- **Fail**: Chưa đạt → Gia hạn học lại hoặc kết thúc

---

## 📍 ĐÁNH GIÁ GIAI ĐOẠN 2 (Phase 2 Evaluation)

### Màn hình: **Mentor Eval Phase 2**
**Đường dẫn:** `/mentor/eval-phase2`

### Vai trò: Mentor

### Thời điểm: Sau khi TTS hoàn thành các tasks trong Phase 2

### Nội dung đánh giá:
- **Kết quả công việc:**
  - Số lượng tasks hoàn thành
  - Chất lượng công việc
  - Tỷ lệ đúng deadline
- **Kỹ năng chuyên môn:**
  - Kỹ năng coding/technical
  - Khả năng giải quyết vấn đề
  - Độc lập trong công việc
- **Soft skills:**
  - Communication
  - Teamwork
  - Time management

### Kết quả:
- Điểm số Phase 2
- Nhận xét chi tiết
- Đề xuất cho Final Evaluation

---

## 📍 ĐÁNH GIÁ CUỐI KỲ (Final Evaluation)

### Màn hình: **Mentor Eval Final**
**Đường dẫn:** `/mentor/eval-final`

### Vai trò: Mentor

### Thời điểm: Kết thúc chương trình thực tập

### Nội dung đánh giá:
- **Tổng hợp điểm:**
  - Điểm Phase 1 (40%)
  - Điểm Phase 2 (60%)
  - Tổng điểm cuối kỳ
- **Đánh giá tổng thể:**
  - Thái độ làm việc
  - Chuyên môn
  - Tiến độ phát triển
  - Khả năng teamwork
  - Tiềm năng phát triển
- **Kết luận:**
  - **Đề xuất lên chính thức**: Đủ năng lực → Offer full-time
  - **Gia hạn thực tập**: Cần thêm thời gian
  - **Kết thúc**: Không phù hợp

### Output:
- Báo cáo đánh giá cuối kỳ
- HR xem báo cáo để quyết định nhân sự
- Email thông báo kết quả cho TTS

---

# PHẦN 4: TỔNG KẾT WORKFLOW

## 📊 WORKFLOW HOÀN CHỈNH

```
┌─────────────────────────────────────────────────────────────┐
│                  QUY TRÌNH TUYỂN DỤNG                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
    Bước 1: Mentor đề xuất nhu cầu
                            ↓
    Bước 2: HR tạo kế hoạch tuyển dụng
                            ↓
    Bước 3-4: Giám đốc phê duyệt
                            ↓
    Bước 5: HR đăng tin tuyển dụng
                            ↓
    Bước 6: Ứng viên nộp đơn
                            ↓
    Bước 7: HR sàng lọc hồ sơ (CV Screening)
                            ↓
    Bước 8: Lên lịch phỏng vấn
                            ↓
    Bước 9: Cập nhật kết quả phỏng vấn
                            ↓
    Bước 10: Onboarding (4 steps)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   QUY TRÌNH ĐÀO TẠO                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
    Giai đoạn 1: Learning Path
    ├─ Học theo lộ trình (modules)
    ├─ Làm quiz/test cuối mỗi module
    ├─ Final Assessment
    └─ Đánh giá Phase 1
                            ↓
         [Điều kiện: Pass Phase 1]
                            ↓
    Giai đoạn 2: Task Management
    ├─ Mentor giao tasks
    ├─ TTS thực hiện (To Do → In Progress → Done)
    ├─ Mentor review & approve
    └─ Đánh giá Phase 2
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  ĐÁNH GIÁ CUỐI KỲ                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
    Final Evaluation
    ├─ Tổng hợp điểm Phase 1 + Phase 2
    ├─ Đánh giá tổng thể
    └─ Kết luận
                            ↓
        ┌───────────────┬───────────────┬───────────────┐
        ↓               ↓               ↓               ↓
   Chính thức      Gia hạn         Kết thúc      Không quyết định
   (Full-time)   (Extend Intern)   (Terminate)      (Pending)
```

---

## 🎯 VAI TRÒ & QUYỀN HẠN

| Vai trò | Quyền truy cập |
|---------|----------------|
| **Mentor/Team Lead** | - Tạo đề xuất tuyển dụng<br>- Thiết kế Learning Path<br>- Giao tasks cho TTS<br>- Đánh giá TTS (Phase 1, 2, Final) |
| **HR** | - Tạo kế hoạch tuyển dụng<br>- Đăng tin tuyển dụng<br>- Sàng lọc hồ sơ<br>- Lên lịch phỏng vấn<br>- Cập nhật kết quả PV<br>- Quản lý Onboarding<br>- Xem báo cáo đánh giá |
| **Director** | - Phê duyệt kế hoạch tuyển dụng<br>- Xem báo cáo tổng hợp |
| **Thực tập sinh** | - Nộp đơn ứng tuyển<br>- Xem Learning Path<br>- Làm quiz/test<br>- Xem tasks được giao<br>- Cập nhật trạng thái tasks<br>- Nộp báo cáo |

---

## 📈 METRICS & KPIs

### Recruitment Metrics:
- **Time to Hire**: Thời gian từ đăng tin đến offer
- **Conversion Rate**: Tỷ lệ chuyển đổi từ ứng viên → intern
- **Source Effectiveness**: Hiệu quả các kênh tuyển dụng
- **Candidate Quality**: Match score trung bình

### Training Metrics:
- **Phase 1 Pass Rate**: Tỷ lệ pass giai đoạn 1
- **Average Quiz Score**: Điểm trung bình quiz
- **Task Completion Rate**: Tỷ lệ hoàn thành tasks đúng hạn
- **Mentor Satisfaction**: Đánh giá của mentor

### Final Metrics:
- **Full-time Conversion**: Tỷ lệ chuyển chính thức
- **Program Completion Rate**: Tỷ lệ hoàn thành chương trình
- **Average Final Score**: Điểm trung bình cuối kỳ
- **Retention Rate**: Tỷ lệ ở lại sau 6 tháng

---

## 🔔 NOTIFICATIONS & EMAILS

### Tự động gửi email khi:
1. **Recruitment:**
   - Nhận được hồ sơ mới
   - Hồ sơ được shortlisted
   - Hồ sơ bị reject
   - Mời phỏng vấn
   - Kết quả phỏng vấn (pass/fail)
   - Chuyển thành intern

2. **Training:**
   - Được assign vào learning path
   - Hoàn thành module
   - Pass/Fail quiz
   - Được giao task mới
   - Task deadline sắp đến
   - Task được approve/reject

3. **Evaluation:**
   - Hoàn thành Phase 1
   - Hoàn thành Phase 2
   - Kết quả Final Evaluation

---

## 📝 GHI CHÚ QUAN TRỌNG

### Mock Data:
- Tất cả màn hình đều có mock data để demo
- Mock data nằm trong `src/constants/MockData.ts`
- Khi integrate backend, thay thế mock data bằng API calls

### i18n:
- Toàn bộ text đã được internationalize
- Hỗ trợ tiếng Việt và tiếng Anh
- Translation files: `public/locales/{vi|en}/translation.json`

### Responsive:
- Tất cả màn hình đều responsive
- Hỗ trợ desktop, tablet, mobile
- Breakpoints: xs (mobile), lg (desktop)

### State Management:
- Sử dụng React Query cho data fetching
- Automatic caching & refetching
- Optimistic updates

---

## 🚀 NEXT STEPS

### Để hoàn thiện hệ thống:
1. ✅ Thêm mock data cho các màn hình còn thiếu
2. ✅ Implement quiz/test system
3. ✅ Add file upload functionality
4. ✅ Implement notification system
5. ✅ Add reporting & analytics
6. ✅ Backend integration
7. ✅ Testing (unit + integration)
8. ✅ Deployment

---

**Tài liệu này mô tả workflow hoàn chỉnh của hệ thống quản lý tuyển dụng và đào tạo thực tập sinh.**

**Version:** 1.0  
**Last Updated:** 2026-02-07  
**Author:** Development Team
