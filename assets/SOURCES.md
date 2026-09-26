# Nguồn tài nguyên 3D

Các tệp WebP trong `textures/` được giảm kích thước từ bản đồ NASA/JPL để dùng trong trình duyệt. Bản `overview` rộng 512 px được tải khi mở trang; bản `detail` chỉ được tải khi phóng gần. Ảnh NASA vẫn phản ánh thời điểm quan sát hoặc bản ghép dữ liệu, không phải bề mặt theo ngày đang mô phỏng.

| Tệp | Nguồn và ghi chú |
| --- | --- |
| `earth-*.webp` | [NASA Blue Marble](https://svs.gsfc.nasa.gov/2915/), ảnh tổng hợp bề mặt Trái Đất. |
| `earth-night.webp` | [NASA Earth at Night](https://svs.gsfc.nasa.gov/2916/); đã tách điểm sáng thành kênh alpha. |
| `moon-*.webp`, `moon-height.jpg` | [NASA Moon CGI Kit](https://svs.gsfc.nasa.gov/4720/), bản đồ màu và địa hình LRO. |
| `mars-*.webp` | [NASA Mars texture](https://science.nasa.gov/3d-resources/mars/), bản đồ dùng cho mô hình 3D. |
| `jupiter-*.webp` | [NASA Hubble Jupiter global map](https://svs.gsfc.nasa.gov/12021/), ảnh khí quyển ghép năm 2015. |
| `mercury-*.webp` | [NASA MESSENGER enhanced color map](https://science.nasa.gov/resource/enhanced-color-mercury-map/); đã giảm độ bão hòa vì màu gốc là màu tăng cường khoa học. |
| `venus-*.webp` | [NASA/JPL Magellan Venus texture](https://science.nasa.gov/3d-resources/venus/), bản đồ radar tô màu dưới lớp mây. |
| `models/voyager.glb` | [NASA Voyager Probe](https://science.nasa.gov/3d-resources/voyager-probe-b/). |
| `models/iss.glb` | [NASA International Space Station](https://science.nasa.gov/3d-resources/international-space-station-iss-b/). |
| `draco/*` | [Three.js 0.160.0 Draco decoder](https://threejs.org/docs/pages/DRACOLoader.html), tải kèm để giải nén hình học trong hai tệp glTF. Giấy phép Apache 2.0 ở `draco/LICENSE`. |

Bề mặt Sao Thổ, Sao Thiên Vương và Sao Hải Vương hiện vẫn là hình minh họa tạo bằng mã. Thư viện texture của NASA ghi [Saturn](https://science.nasa.gov/3d-resources/saturn/) và [Neptune](https://science.nasa.gov/3d-resources/neptune/) là bản đồ hư cấu, nên không dùng chúng như dữ liệu quan sát.
