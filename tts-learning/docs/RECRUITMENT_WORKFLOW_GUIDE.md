# 📋 HƯỚNG DẪN LUỒNG TUYỂN DỤNG THỰC TẬP SINH

## 🎯 Tổng quan luồng

Hệ thống quản lý tuyển dụng thực tập sinh bao gồm 10 bước chính, từ đề xuất nhu cầu của Mentor đến khi thực tập sinh hoàn thành Onboarding.

---

## 📍 BƯỚC 1: Mentor/Trưởng nhóm đề xuất nhu cầu tuyển dụng

### Màn hình: **Recruitment Requests**

**Đường dẫn:** `/training/mentor/requests`

### Chức năng:

- Mentor/Trưởng nhóm tạo đề xuất tuyển dụng cho phòng ban của mình.
- Điền thông tin: vị trí, số lượng, yêu cầu kỹ năng, thời gian dự kiến.

### Cách sử dụng:

1. Truy cập menu: **Cổng thông tin Mentor** → **Đề xuất tuyển dụng**
2. Click nút **"+ Tạo đề xuất mới"**
3. Điền form:
    - Loại đề xuất (VD: Recruitment)
    - Tên kế hoạch (VD: Tuyển dụng ReactJS)
    - Tiêu đề đề xuất
    - Phòng ban (Tự động lấy theo Mentor hoặc chọn thủ công)
    - Độ ưu tiên (Cao/Trung bình/Thấp)
    - Các vị trí cần tuyển & Số lượng tương ứng
4. Click **"Gửi"**
5. Trạng thái mặc định: **Pending** (Chờ HR xử lý)

---

## 📍 BƯỚC 2: HR tạo kế hoạch tuyển dụng

### Màn hình: **Recruitment Plan List**

**Đường dẫn:** `/recruitment/plans`

### Chức năng:

- HR xem các đề xuất từ Mentor và tổng hợp thành kế hoạch tuyển dụng chính thức.
- Xác định timeline, ngân sách và người phê duyệt.

### Cách sử dụng:

1. Truy cập menu: **Quản lý Tuyển dụng (HR)** → **Kế hoạch tuyển dụng**
2. Click **"+ Tạo kế hoạch mới"**
3. Điền thông tin qua các Tab:
    - **Tab "Thông tin chung":** Tên chiến dịch, tên đợt/khóa, mô tả.
    - **Tab "Vị trí & Yêu cầu":** Thêm các vị trí từ đề xuất của Mentor, quy định yêu cầu kỹ năng.
    - **Tab "Lịch trình & Trạng thái":** Quy định thời gian bắt đầu/kết thúc. Trạng thái mặc định: **Pending Approval**.
    - **Tab "Quy trình phê duyệt":** Chọn Giám đốc thực hiện phê duyệt.
4. Click **"Lưu kế hoạch"**

---

## 📍 BƯỚC 3-4: Giám đốc phê duyệt kế hoạch

### Màn hình: **Plan Approvals**

**Đường dẫn:** `/admin/director/approvals`

### Chức năng:

- Giám đốc xem chi tiết các kế hoạch và thực hiện phê duyệt hoặc từ chức.

### Cách sử dụng:

1. Truy cập menu: **Cổng thông tin Giám đốc** → **Phê duyệt kế hoạch**
2. Chọn kế hoạch đang ở trạng thái **Pending** từ danh sách bên trái.
3. Xem chi tiết thông tin, vị trí, yêu cầu và tác động tài chính ở màn hình bên phải.
4. Thực hiện hành động:
    - **Phê duyệt (Approve)**: Kế hoạch chuyển sang trạng thái **Active**.
    - **Yêu cầu điều chỉnh (Adjustment)**: Gửi phản hồi yêu cầu HR sửa đổi.
    - **Từ chối (Reject)**: Hủy bỏ kế hoạch.

---

## 📍 BƯỚC 5: HR đăng tin tuyển dụng

### Màn hình: **Recruitment Job List**

**Đường dẫn:** `/recruitment/jobs`

### Chức năng:

- Sau khi kế hoạch được duyệt, HR đăng các tin tuyển dụng chi tiết lên bảng tin công khai.

### Cách sử dụng:

1. Truy cập menu: **Quản lý Tuyển dụng (HR)** → **Tin tuyển dụng**
2. Click **"+ Tạo bài đăng mới"**
3. Chọn chiến dịch (từ các kế hoạch đã được phê duyệt).
4. Nhập tiêu đề công việc, cấp bậc, mô tả chi tiết (JD), kỹ năng yêu cầu.
5. Thiết lập trạng thái: **Đang đăng (Published)** để hiển thị ra bên ngoài.
6. Click **"Lưu"**

---

## 📍 BƯỚC 6: Ứng viên nộp đơn ứng tuyển

### Màn hình: **Job Board (Public)**

**Đường dẫn:** `/jobs` (Dành cho ứng viên bên ngoài)

### Chức năng:

- Ứng viên xem danh sách các vị trí đang tuyển và nộp CV.

### Cách sử dụng:

1. Ứng viên truy cập trang `/jobs`.
2. Chọn vị trí mong muốn → Click **"Xem chi tiết"**.
3. Click **"Ứng tuyển ngay"**.
4. Điền thông tin cá nhân và tải lên CV (PDF/Doc).
5. Click **"Gửi hồ sơ"**.

---

## 📍 BƯỚC 7: HR sàng lọc hồ sơ (CV Screening)

### Màn hình: **CV Screening**

**Đường dẫn:** `/recruitment/cvs`

### Chức năng:

- HR xem danh sách toàn bộ CV và thực hiện sàng lọc bước đầu.

### Cách sử dụng:

1. Truy cập menu: **Quản lý Tuyển dụng (HR)** → **Quản lý hồ sơ (CV)**
2. Xem danh sách ứng viên. Click vào từng dòng để xem chi tiết thông tin và xem trước (Preview) CV.
3. Thực hiện hành động:
    - **Chọn lọc (Shortlist)**: Đưa ứng viên vào danh sách tiềm năng để phỏng vấn.
    - **Loại (Reject)**: Loại bỏ các hồ sơ không phù hợp (hệ thống sẽ chuẩn bị gửi mail từ chối).

---

## 📍 BƯỚC 8: Lên lịch phỏng vấn

### Màn hình: **Lên lịch phỏng vấn**

**Đường dẫn:** `/recruitment/interviews`

### Chức năng:

- Chọn các ứng viên từ danh sách **Shortlisted** để gửi thư mời phỏng vấn.

### Cách sử dụng:

1. Truy cập menu: **Quản lý Tuyển dụng (HR)** → **Lịch phỏng vấn**
2. Tại tab **"Hàng đợi ứng viên"**, chọn các ứng viên cần lên lịch.
3. Click **"Tiếp tục"** để cấu hình:
    - Thời gian, khung giờ.
    - Hình thức: Trực tuyến (Link Meet) hoặc Trực tiếp (Địa chỉ).
    - Chọn mẫu Email mời phỏng vấn.
4. Click **"Lên lịch & Gửi"**. Ứng viên sẽ nhận được email và trạng thái chuyển thành **Interview Scheduled**.

---

## 📍 BƯỚC 9: Cập nhật kết quả phỏng vấn

### Màn hình: **CV Detail**

**Đường dẫn:** `/recruitment/cvs/:id`

### Chức năng:

- Cập nhật kết quả sau khi phỏng vấn xong.

### Cách sử dụng:

1. Tìm ứng viên trong danh sách **CV Management** hoặc từ **Interview List**.
2. Tại màn hình chi tiết ứng viên, chọn hành động:
    - **Đánh dấu Đạt phỏng vấn (Pass Interview)**: Chuyển trạng thái thành **Passed Interview**.
    - **Loại (Reject)**: Chuyển trạng thái thành **Rejected**.
3. Hệ thống sẽ lưu lại lịch sử thay đổi trạng thái trong phần **Timeline**.

---

## 📍 BƯỚC 10: Chuyển thành Thực tập sinh & Onboarding

### Màn hình: **Management Onboarding**

**Đường dẫn:** `/recruitment/onboarding`

### Chức năng:

- Chuyển ứng viên trúng tuyển sang danh sách Onboarding và theo dõi các bước nhập môn.

### Cách sử dụng:

1. **Khởi tạo Onboarding**:

    - Tại màn hình **CV Detail** của ứng viên đã **Passed Interview**, click nút **"Chuyển thành thực tập sinh"**.
    - Chọn **Mentor phụ trách**, **Chuyên ngành (Track)** và **Thời gian thực tập**.
    - Click **"Tạo hồ sơ thực tập sinh"**.

2. **Theo dõi tiến độ Onboarding**:
    - Truy cập menu: **Quản lý Tuyển dụng (HR)** → **Quy trình Onboarding**.
    - Bạn sẽ thấy thực tập sinh đi qua 4 bước (Hồ sơ, Tài khoản, Nhập môn, Task đầu tiên).
    - Click **"Tiến cấp" (Advance)** sau khi TTS hoàn thành mỗi bước.
    - Khi hoàn thành tất cả, TTS sẽ chính thức xuất hiện trong **Danh sách thực tập sinh** (`/recruitment/interns`).

---

## 🎨 DANH SÁCH MENU THEO VAI TRÒ (Dành cho HR/Admin)

| Menu                        | Chức năng                           | Đường dẫn                 |
| :-------------------------- | :---------------------------------- | :------------------------ |
| **Kế hoạch tuyển dụng**     | Quản lý kế hoạch và đề xuất         | `/recruitment/plans`      |
| **Tin tuyển dụng**          | Quản lý các bài đăng công khai      | `/recruitment/jobs`       |
| **Quản lý hồ sơ (CV)**      | Sàng lọc và chi tiết ứng viên       | `/recruitment/cvs`        |
| **Lịch phỏng vấn**          | Lên lịch và gửi email mời           | `/recruitment/interviews` |
| **Quy trình Onboarding**    | Chuyển đổi TTS và theo dõi tiến độ  | `/recruitment/onboarding` |
| **Danh sách thực tập sinh** | Quản lý TTS đã chính thức nhận việc | `/recruitment/interns`    |

---

## 📝 GHI CHÚ KỸ THUẬT

- **Dữ liệu**: Đồng bộ trực tiếp với Backend NestJS qua API.
- **Backend API**: Chạy tại `http://localhost:3001` (hoặc cấu hình tại `.env`).
- **Frontend App**: Chạy tại `http://localhost:5173`.
- **Phân quyền**: Các đường dẫn `/admin/*` yêu cầu quyền Director hoặc Administrator.

---

**Cập nhật lần cuối:** 2026-03-03
**Phiên bản:** 2.0 (Cập nhật theo mã nguồn thực tế)
