# Chronos Orbit

Explore the Solar System in interactive 3D with detailed planets, orbital simulations, true-scale views, and mobile-friendly controls.

**English** · [Tiếng Việt](#tiếng-việt)

## Features

- Explore the Sun, planets, moons, Halley’s Comet, the asteroid belt, Voyager 1/2, and the ISS.
- Switch between an illustrative view and a true scale using common units for sizes and distances.
- Select a date to view approximate planetary orbital positions.
- Inspect detailed surfaces, Earth’s clouds and night lights, lunar terrain, and Saturn’s rings.
- Control animation speed, pause/resume, zoom, and reset the camera.
- Customize labels, orbits, moons, spacecraft, and Halley’s visibility; preferences are saved in your browser.
- Use fullscreen mode to hide the interface, labels, and orbit lines. Exit with the corner button or Escape.
- Touch controls and responsive layouts for portrait and landscape; collapse the information panel on portrait phones.

## Run locally

### Windows

1. Download or clone this repository.
2. Open its folder and double-click `start.bat`.
3. Open the address shown by the local server, normally `http://localhost:8000/`.

Alternatively, run this from the project folder in PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ./server.ps1
```

### Other platforms

Serve the project with a static HTTP server. For example, with Python 3 installed:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000/`. Opening `index.html` directly with `file://` does not support the app’s JavaScript modules.

The app needs a modern browser with WebGL. An internet connection is required for Three.js and web fonts; textures and spacecraft models are included in `assets/`. No application build or npm installation is required to run it.

## Controls

| Action | Desktop | Touchscreen |
| --- | --- | --- |
| Rotate the view | Drag | Drag with one finger |
| Zoom | Mouse wheel or + / − buttons | Pinch or + / − buttons |
| Pan | Right-button drag | Drag with two fingers |
| Select a body | Click it or use the body menu | Tap it or use the body menu |
| Reset the view | ↺ button | ↺ button |

At **1×**, the orbital clock advances one simulated day per real second. Earth’s surface turns once every **30 real seconds**; other planetary spins use their rotation-period ratios. Surface animation and dated orbital positions use separate clocks.

## Tests

With a supported Node.js version and npm installed:

```sh
npm ci
npm test
```

Start the local server and open `/tests/browser.html` for the WebGL integration tests. See [tests/README.md](tests/README.md) for details. Physical multitouch behavior and rendering performance still need checks on actual devices.

## Accuracy and asset credits

This is an educational visualization. Planetary positions are approximate calculations from orbital elements; comet, moon, and spacecraft motion is illustrative. The visual scale enlarges bodies separately from distances. Surface textures are observation mosaics or procedural illustrations, not live images for the selected date.

NASA/JPL surface maps and spacecraft models, along with the Draco decoder, are documented in [assets/SOURCES.md](assets/SOURCES.md). Some surfaces are generated procedurally. Preserve third-party credits and licenses when redistributing assets.

The project’s source code is licensed under the [MIT License](LICENSE). Third-party materials retain their respective terms.

---

## Tiếng Việt

Khám phá Hệ Mặt Trời 3D với hành tinh chi tiết, mô phỏng quỹ đạo, chế độ tỉ lệ thực và điều khiển phù hợp trên điện thoại.

### Tính năng

- Khám phá Mặt Trời, các hành tinh, vệ tinh, sao chổi Halley, vành đai tiểu hành tinh, Voyager 1/2 và ISS.
- Chuyển giữa chế độ trực quan và tỉ lệ thực dùng chung đơn vị cho kích thước và khoảng cách.
- Chọn ngày để xem vị trí quỹ đạo hành tinh được tính gần đúng.
- Xem bề mặt chi tiết, mây và đèn đêm Trái Đất, địa hình Mặt Trăng và vành đai Sao Thổ.
- Điều chỉnh tốc độ, dừng/tiếp tục, phóng gần/xa và đặt lại góc nhìn.
- Bật/tắt nhãn, quỹ đạo, vệ tinh, tàu vũ trụ và Halley; lưu lựa chọn trên trình duyệt.
- Toàn màn hình ẩn giao diện, nhãn và đường quỹ đạo; thoát bằng nút ở góc hoặc Escape.
- Giao diện cảm ứng phù hợp màn hình dọc/ngang; bảng thông tin có thể thu gọn trên điện thoại dọc.

### Chạy trên máy

**Windows:** tải dự án, mở thư mục rồi nhấp đúp `start.bat`. Truy cập địa chỉ máy chủ hiển thị, thường là `http://localhost:8000/`.

**Nền tảng khác:** dùng máy chủ HTTP tĩnh, chẳng hạn `python -m http.server 8000` khi đã cài Python 3. Không mở trực tiếp `index.html` bằng `file://`.

Cần trình duyệt hiện đại hỗ trợ WebGL và kết nối mạng để tải Three.js, font chữ. Ảnh bề mặt và mô hình tàu được lưu trong `assets/`. Không cần build hoặc cài npm để chạy ứng dụng.

### Thao tác

- **Xoay:** kéo chuột hoặc vuốt một ngón.
- **Phóng:** cuộn chuột, chụm/tách hai ngón hoặc dùng nút + / −.
- **Di chuyển góc nhìn:** kéo chuột phải hoặc kéo hai ngón.
- **Chọn thiên thể:** bấm/chạm trực tiếp hoặc chọn trong menu.
- **Đặt lại góc nhìn:** nút ↺.

Ở **1×**, lịch mô phỏng tiến một ngày mỗi giây thực. Trái Đất tự quay **30 giây thực/vòng**; các hành tinh khác giữ tỉ lệ chu kỳ tự quay so với Trái Đất. Đồng hồ tự quay bề mặt được tách khỏi đồng hồ vị trí quỹ đạo theo ngày.

### Kiểm thử

Chạy `npm ci` và `npm test` khi đã cài Node.js tương thích và npm. Sau khi mở máy chủ, truy cập `/tests/browser.html` để chạy kiểm thử trên mô phỏng WebGL thật. Hướng dẫn chi tiết ở [tests/README.md](tests/README.md).

### Độ chính xác và nguồn tài nguyên

Đây là mô phỏng phục vụ khám phá và học tập. Vị trí hành tinh được tính gần đúng; chuyển động sao chổi, vệ tinh và tàu vũ trụ mang tính minh họa. Chế độ trực quan phóng đại kích thước riêng với khoảng cách. Ảnh bề mặt là bản ghép quan sát hoặc hình tạo bằng mã, không phải ảnh trực tiếp theo ngày đang chọn.

Nguồn ảnh NASA/JPL, mô hình tàu và giấy phép Draco được ghi tại [assets/SOURCES.md](assets/SOURCES.md). Giữ các ghi chú nguồn và giấy phép đi kèm khi phân phối lại tài nguyên.

Mã nguồn dự án dùng [giấy phép MIT](LICENSE); tài nguyên bên thứ ba giữ điều khoản riêng.
