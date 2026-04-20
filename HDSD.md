# HƯỚNG DẪN SỬ DỤNG - HỆ THỐNG QUẢN LÝ SDC (SDC ADMIN)

Tài liệu này cung cấp hướng dẫn chi tiết từng bước sử dụng Hệ thống quản lý SDC dành riêng cho Ban quản trị và Cán bộ nhân viên của Trung tâm.

---

## MỤC LỤC
1. [Giới thiệu Chung](#1-giới-thiệu-chung)
2. [Đăng nhập & Tổng quan (Dashboard)](#2-đăng-nhập--tổng-quan-dashboard)
3. [Quản lý Hệ thống (System Settings)](#3-quản-lý-hệ-thống-system-settings)
4. [Quản lý Học viên (Tạo và cấp Mã Học viên)](#4-quản-lý-học-viên-tạo-và-cấp-mã-học-viên)
5. [Quản lý Kỳ thi & Lớp học](#5-quản-lý-kỳ-thi--lớp-học)
6. [Quản lý Tài chính (Thanh toán & Lệ phí)](#6-quản-lý-tài-chính-thanh-toán--lệ-phí)
7. [In ấn (Biên lai, Chứng chỉ)](#7-in-ấn-biên-lai-chứng-chỉ)
8. [Báo cáo & Thu thập số liệu (Xuất Excel)](#8-báo-cáo--thu-thập-số-liệu-xuất-excel)
9. [Hỗ trợ Sự cố (Troubleshooting)](#9-hỗ-trợ-sự-cố-troubleshooting)

---

## 1. Giới thiệu Chung
Hệ thống quản lý SDC (Software Development Center / Skills Development Center) được xây dựng nhằm tin học hóa quy trình quản lý học viên, thi cử và thanh toán học phí. 
- **Vai trò đăng nhập:** Có 2 vai trò chính là Quản trị viên (Admin) và Nhân viên (Staff). Tùy vào vai trò mà menu chức năng sẽ được thiết lập khác nhau.
- **Tính năng nổi bật:** Đồng bộ hóa tài chính theo thời gian thực (real-time), tự động sinh mã học viên đảm bảo tính duy nhất, xuất file Excel định dạng chuẩn không chứa dữ liệu rác, và in biên lai động tùy biến theo kỳ thi.

## 2. Đăng nhập & Tổng quan (Dashboard)

### 2.1. Thao tác đăng nhập
1. Mở trình duyệt web (Khuyến nghị Google Chrome hoặc Microsoft Edge).
2. Truy cập vào URL của trang Quản trị SDC.
3. Tại giao diện đăng nhập, nhập chính xác **Email** (hoặc Username) và **Mật khẩu**.
4. Nhấn **Đăng nhập** (`Login`).
5. Nếu là lần đầu tiên đăng nhập, hệ thống có thể sẽ yêu cầu bạn đổi mật khẩu mặc định (tùy cấu hình phân quyền).

### 2.2. Bảng điều khiển (Dashboard)
Ngay sau khi đăng nhập thành công, bạn sẽ thấy Bảng điều khiển:
- **Thẻ tóm tắt (Summary Cards):** Hiển thị tổng số Học viên, tổng số kỳ thi đang mở, và Doanh thu lệ phí ước tính trong tháng.
- **Biểu đồ (Charts):** Cung cấp cái nhìn trực quan về số lượng đăng ký và doanh thu trong 30 ngày gần nhất.
- **Hoạt động gần đây (Recent Activities):** Xem ai thao tác gì (vd: Sinh viên A vừa nộp tiền).
- **Thanh điều hướng (Sidebar):** Cột bên trái để truy cập nhanh đến mọi tính năng của hệ thống.

## 3. Quản lý Hệ thống (System Settings)
*(Lưu ý: Chỉ tài khoản Admin mới được thao tác)*

- **Quản lý Tài khoản (Users):** Cho phép bạn thêm các Nhân viên mới vào hệ thống, phân quyền (Role) cho họ và đặt lại mật khẩu nếu bị quên.
- **Cấu hình biểu mẫu:** Cập nhật tên Trung tâm, Logo, và chữ ký mặc định để in trên Biên lai / Chứng chỉ.
- **Chính sách chung (Policies):** Chỉnh sửa các quy định, điều khoản sử dụng hiển thị trên trang của học viên.

## 4. Quản lý Học viên (Tạo và cấp Mã Học viên)

Quản lý thông tin đầu vào của học viên là yếu tố cốt lõi của hệ thống.

### 4.1. Thêm mới học viên
1. Vào menu **Học viên > Danh sách học viên**.
2. Nhấn nút **+ Thêm mới** (Add New).
3. Điền các trường bắt buộc (Có dấu `*`): *Họ và tên, Ngày sinh, Căn cước công dân (CCCD), Số điện thoại, Email.*
4. Bấm **Lưu (Save)**.
5. **Cấp Mã tự động:** Sau khi lưu thành công, hệ thống sẽ tự động đối chiếu cơ sở dữ liệu và cấp phát một **Mã Học Viên (Mã HV)** chuẩn định dạng. Đảm bảo mã này không bao giờ trùng lặp, dùng làm ID nhận dạng xuyên suốt khóa học và kỳ thi.

### 4.2. Sửa và Xóa thông tin
- Để cập nhật số điện thoại hay thông tin cá nhân, bạn chỉ cần tìm kiếm tên hoặc Mã HV của người đó > Bấm vào biểu tượng **Cây bút (Edit)**.
- Phím Xóa chỉ được thực hiện khi học viên đó chưa phát sinh bất kỳ giao dịch tài chính hay kết quả thi nào.

## 5. Quản lý Kỳ thi & Lớp học
Tính năng này tự động hóa việc đưa học viên vào phòng thi theo chứng chỉ/khóa học.

### 5.1. Khởi tạo Kỳ thi
1. Vào mục **Kỳ thi > Quản lý Kỳ thi**.
2. Bấm **Thêm mới**. Yêu cầu điền: *Tên kỳ thi (VD: K10 Tiếng Anh B1), Loại chứng chỉ, Ngày thi, Sức chứa tối đa (Capacity).*
3. Nhấn **Lưu** để mở cổng đăng ký nội bộ.

### 5.2. Danh sách Học viên đủ điều kiện (Exam Paid List)
1. Chỉ những học viên đã thanh toán Lệ phí thi và được xác nhận trên hệ thống mới hiển thị trong phần **Exam Paid List**.
2. Bạn có thể sử dụng giao diện này để phân bổ Số Báo Danh (SBD) hoặc xếp phòng thi tự động.

## 6. Quản lý Tài chính (Thanh toán & Lệ phí)
Chức năng Tài chính yêu cầu độ chính xác cao. Hệ thống được lập trình để thay đổi ở mục thanh toán sẽ đồng bộ ngay với danh sách dự thi.

### 6.1. Thiết lập Mức phí (Payment Rates)
1. Vào **Thanh toán > Bảng giá Lệ phí (Payment Rates)**.
2. Tại đây có danh sách toàn bộ các loại phí (Ví dụ: Thi Tiếng Anh B1 - 500,000 NVĐ, Thi Tin học - 350,000 VNĐ).
3. Khi cần điều chỉnh, bạn chọn Cập nhật và đổi giá. Các mức giá mới chỉ áp dụng cho người đăng ký mới.

### 6.2. Cập nhật Trạng thái Thanh toán
Khi Học viên nộp tiền mặt hoặc chuyển khoản thành công:
1. Bạn vào menu **Thanh toán > Chờ Xử Lý**. Tìm tên Học viên hoặc Mã HV.
2. Bấm vào chi tiết giao dịch, xác nhận số tiền đã nhận.
3. Chuyển trạng thái từ `Pending` (Chờ xử lý) sang `Completed` (Đã thanh toán) (hoặc `Paid`).
4. **Lưu ý Quan trọng:** Ngay khi bạn bấm xác nhận thành công, học viên này sẽ lập tức được hệ thống đẩy vào `Danh sách Kỳ thi đã cấp phép (Exam Paid List)`, loại bỏ sự chậm trễ giữa Kế toán và Giáo vụ.

## 7. In ấn (Biên lai, Chứng chỉ)

### 7.1. In Biên Lai Thu Tiền tự động (Dynamic Receipt)
- Thay vì sử dụng biên lai tĩnh, SDC Admin cung cấp tính năng sinh biên lai động.
- Tại giao dịch đã `Completed`, bạn bấm **In Biên lai**.
- Khổ giấy mặc định là A5. Thông tin trên biên lai sẽ được cá nhân hóa bao gồm: Tên Khóa thi, Số tiền, Thời gian, Tên Học viên, Mã HV. Các trường này được kéo trực tiếp từ Database. 
- Trình duyệt sẽ hiện cửa sổ PDF, bạn chỉ việc chọn máy in và bấm Print (hoặc lưu lại dạng PDF gửi qua Zalo/Email cho học viên).

### 7.2. In Chứng nhận / Chứng chỉ
- Vào danh sách sinh viên Trúng tuyển/Đạt điểm thi.
- Đánh dấu các học viên cần In chứng chỉ.
- Bấm **In Chứng Chỉ**. Định dạng mẫu chứng chỉ đã được set trong quản trị hệ thống trước.

## 8. Báo cáo & Thu thập số liệu (Xuất Excel)
Hệ thống được nâng cấp bộ tính năng xuất Excel chuẩn hóa văn phòng:
1. Truy cập vào lưới dữ liệu bất kỳ (VD: Danh sách Học viên toàn trường, Danh sách thi K10).
2. Lọc (Filter) thông tin cần thiết.
3. Bấm icon **Xuất Excel (Direct .xlsx)**.
4. **Một số tối ưu của file xuất ra:**
   - Format trực tiếp là `.xlsx` (không phải CSV dễ bị lỗi font chữ Tiếng Việt).
   - Column Header là Tiếng Việt rõ ràng: "Họ và Tên", "Số Điện Thoại", "Trạng thái",...
   - Hệ thống tự loại bỏ các mã hệ thống (UUID, timestamps `created_at`, `updated_at`) để khi mở file ra, sếp hoặc nhân viên có thể sử dụng và in ấn ngay, tránh mất thời gian xóa cột dữ liệu kỹ thuật rác.

## 9. Hỗ trợ Sự cố (Troubleshooting)
1. **Lỗi không đăng nhập được:** Thử xóa cache (Ctrl + F5), kiểm tra lại Email và Mật khẩu. 
2. **Không thấy Học viên trong phòng thi:** Học viên phải có trạng thái Thanh toán là `Paid/Completed` thì mới hiện trong mục `Exam Paid List`. Kế toán cần kiểm tra lại lệnh xác nhận.
3. **Lỗi xuất Excel vòng lặp chờ (Loading):** Có thể lượng đăng ký quá lớn (trên 10,000 bản ghi), xin chờ trong vài giây hoặc liên hệ IT.

---
*Mọi vướng mắc về vận hành ngoài tài liệu, cán bộ vui lòng liên hệ đến Nhóm Quản trị phần mềm Web_SDC để kiểm tra đường truyền và Cơ sở dữ liệu.*
