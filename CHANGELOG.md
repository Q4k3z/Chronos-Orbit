# Changelog

## v0.1.5 — 2026-09-26

### English

#### Added

- Dedicated mobile interface with a body selector, date picker and settings in the header, plus a compact bottom toolbar.
- A More menu for comparison, sound, scale explanations and control help.
- A dismissible first-visit touch hint that keeps the simulation accessible.
- `favicon.png` as the website favicon and Apple touch icon.

#### Changed

- Portrait views show collapsible body information below the 3D scene; landscape views place information alongside it.
- The renderer and camera fit the actual scene area when panels open, collapse or the device rotates.
- Mobile immersive mode hides the interface within the current browser viewport, avoiding native fullscreen resizing issues in embedded browsers.
- Mobile menus and settings use bounded, scrollable panels and larger touch targets.
- Updated project and testing documentation for the new mobile layout.

#### Fixed

- Controls overlapping body information and navigation buttons moving outside their panel.
- Offscreen planet labels expanding the page beyond the viewport.
- Automatic help dialogs dimming or blocking the mobile interface.
- Desktop camera offsets clipping mobile close-ups.
- Stale overlays after layout and immersive-mode changes.
- Keyboard viewport changes being mistaken for a device rotation.

#### Validation

- 18 automated unit checks and 22 browser integration checks passed.
- Layout checks cover portrait widths of 320, 360, 390 and 412 pixels, a large portrait viewport, and landscape layouts.
- Visual checks performed in the browser for Vietnamese and English, body details, settings, menus and immersive mode.
- Physical multitouch interaction and performance still require validation on actual phones.

### Tiếng Việt

#### Thêm mới

- Giao diện mobile riêng với chọn thiên thể, ngày và cài đặt ở thanh trên; điều khiển gọn ở thanh dưới.
- Menu Thêm chứa so sánh, âm thanh, giải thích tỉ lệ và hướng dẫn thao tác.
- Gợi ý cảm ứng lần đầu có thể đóng, không khóa mô phỏng.
- Dùng `favicon.png` làm favicon và biểu tượng Apple touch.

#### Thay đổi

- Màn hình dọc hiển thị thông tin có thể thu gọn bên dưới cảnh 3D; màn hình ngang đặt thông tin bên cạnh.
- Khung vẽ và camera cập nhật theo vùng 3D thực tế khi mở bảng, thu gọn hoặc xoay thiết bị.
- Chế độ ẩn giao diện trên mobile sử dụng khung nhìn hiện tại, tránh lỗi đổi kích thước do toàn màn hình gốc trong trình duyệt nhúng.
- Menu và cài đặt mobile có giới hạn kích thước, cuộn nội dung và nút dễ chạm hơn.
- Cập nhật tài liệu dự án và kiểm thử cho bố cục mobile mới.

#### Sửa lỗi

- Thanh điều khiển đè thông tin và nút trở lại bị đẩy ra ngoài bảng.
- Nhãn hành tinh ngoài màn hình kéo giãn trang.
- Hướng dẫn tự mở làm tối hoặc khóa giao diện mobile.
- Góc nhìn cận cảnh mobile bị cắt do cách bù camera của desktop.
- Lớp phủ còn sót khi đổi bố cục hoặc chế độ ẩn giao diện.
- Bàn phím làm thay đổi khung nhìn bị hiểu nhầm là xoay thiết bị.

#### Kiểm tra

- Đạt 18 kiểm tra tự động và 22 kiểm tra tích hợp trên trình duyệt.
- Kiểm tra bố cục dọc rộng 320, 360, 390 và 412 pixel, khung dọc lớn và bố cục ngang.
- Đã xem trực tiếp giao diện Việt/Anh, thông tin thiên thể, cài đặt, menu và chế độ ẩn giao diện trong trình duyệt.
- Thao tác đa điểm và hiệu năng cần được xác nhận thêm trên điện thoại thật.
