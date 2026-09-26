// ============================================================
//  CELESTIAL CONFIGURATION & ACCURATE ASTRONOMICAL DATA
// ============================================================
import * as Tex from './textures.js';
import { HALLEY_VISUAL_AXIS } from './halley-visual.js';

// --- Time Constants ---
// 1x simulation speed = 1 simulated day per real second.
// The date shown in the UI advances with the same clock used by Keplerian positions.
export const SPEED_FACTOR = 86400;
export const MS_PER_DAY = 24 * 3600 * 1000;
export const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;
export const EPOCH_DATE = new Date('2000-01-01T12:00:00Z');

// 1 AU in 3D world units
export const AU_SCALE = 75.0;

// --- Sun Data ---
export const SUN_DATA = {
  id: 'sun', icon: '☀',
  nameVi: 'Mặt Trời', nameEn: 'Sun (Sol)',
  tagline: 'Trái tim của hệ hành tinh — nguồn cội của mọi năng lượng và sự sống',
  color: '#fbbf24', gradient: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
  gravity: 274, gravityRatio: 27.9,
  radius: 14.0,
  info: {
    physical: [
      ['Đường kính thực', '1.392.700 km (109× Trái Đất)'],
      ['Khối lượng', '1,989 × 10³⁰ kg (333.000× Trái Đất, chiếm 99.86% toàn hệ)'],
      ['Trọng lực bề mặt', '274 m/s² (27,9g)'],
      ['Phân loại sao', 'Sao lùn vàng (G2V dãy chính)'],
    ],
    orbital: [
      ['Tuổi ước tính', '~4,6 tỷ năm (đang ở nửa đời phát triển ổn định)'],
      ['Nhiệt độ bề mặt (Quang cầu)', '5.500°C'],
      ['Nhiệt độ lõi nhiệt hạch', '15.000.000°C'],
      ['Công suất phát xạ', '3,846 × 10²⁶ Watts'],
    ],
    atmosphere: {
      desc: 'Khí quyển gồm Quang cầu, Sắc cầu và Nhật hoa (Corona) nhiệt độ lên tới hàng triệu độ C tạo nên gió Mặt Trời thổi xa qua Vành đai Kuiper.',
      composition: [
        ['H (Hydro)', 73.46], ['He (Heli)', 24.85], ['O (Oxy)', 0.77], ['C (Cacbon)', 0.29],
      ]
    },
    features: 'Mỗi giây, phản ứng nhiệt hạch hợp hạch 600 triệu tấn Hydro thành Heli, giải phóng nguồn năng lượng khổng lồ nuôi dưỡng toàn bộ sinh quyển Trái Đất. Chu kỳ từ trường 11 năm tạo ra các vết đen và bão từ CME.',
  }
};

// --- Moon Data ---
export const MOON_DATA = {
  id: 'moon', icon: '🌙',
  nameVi: 'Mặt Trăng', nameEn: 'The Moon (Luna)',
  tagline: 'Người bạn đồng hành duy nhất của Trái Đất trong đêm tối',
  color: '#cbd5e1', gradient: 'linear-gradient(135deg, #64748b 0%, #cbd5e1 100%)',
  gravity: 1.62, gravityRatio: 0.165,
  radius: 0.33,
  orbitRadius: 3.6,
  info: {
    physical: [
      ['Đường kính', '3.474 km (~27% Trái Đất)'],
      ['Khối lượng', '7,35 × 10²² kg (1/81 Trái Đất)'],
      ['Trọng lực bề mặt', '1,62 m/s² (0,165g — bước nhảy bồng bềnh phi hành gia)'],
      ['Mật độ', '3.344 g/cm³'],
    ],
    orbital: [
      ['Khoảng cách trung bình tới Trái Đất', '384.400 km'],
      ['Chu kỳ quỹ đạo & tự quay', '27,3 ngày (Khóa thủy triều — luôn hướng một mặt về Trái Đất)'],
      ['Vận tốc quỹ đạo', '1,022 km/s'],
    ],
    atmosphere: {
      desc: 'Gần như chân không hoàn hảo (exosphere siêu loãng), không có bầu khí quyển giữ nhiệt hoặc chắn thiên thạch.',
      composition: [
        ['He', 29], ['Ne', 29], ['H₂', 22], ['Ar', 20],
      ]
    },
    temperature: 'Cực đoan: -130°C trong đêm tối tới 120°C dưới ánh nắng',
    features: 'Lực hấp dẫn của Mặt Trăng tạo nên hiện tượng Thủy Triều điều hòa đại dương Trái Đất. Bề mặt lưu giữ dấu chân lịch sử của sứ mệnh Apollo 11 (Neil Armstrong, 1969) và hàng triệu hố va chạm không hề bị xói mòn.',
  }
};

// --- Asteroid Belt Data ---
export const ASTEROID_BELT_DATA = {
  id: 'asteroid-belt', icon: '☄',
  nameVi: 'Vành Đai Tiểu Hành Tinh', nameEn: 'The Asteroid Belt',
  tagline: 'Vùng ranh giới triệu mảnh vỡ giữa Sao Hỏa và Sao Mộc',
  color: '#94a3b8', gradient: 'linear-gradient(135deg, #475569 0%, #94a3b8 100%)',
  gravity: 0.27, gravityRatio: 0.028,
  minAU: 2.2, maxAU: 3.2,
  info: {
    physical: [
      ['Số lượng ước tính', 'Hàng triệu thiên thể từ hạt bụi tới hành tinh lùn'],
      ['Tổng khối lượng', 'Chỉ bằng ~4% khối lượng Mặt Trăng (chủ yếu tập trung ở Ceres)'],
      ['Thiên thể lớn nhất', 'Ceres (đường kính ~940 km), Vesta, Pallas, Hygiea'],
    ],
    orbital: [
      ['Khoảng cách từ Mặt Trời', '329 đến 478 triệu km (2.2 đến 3.2 AU)'],
      ['Chu kỳ quay quanh Mặt Trời', '3 đến 6 năm Trái Đất'],
    ],
    atmosphere: {
      desc: 'Không có khí quyển. Các tiểu hành tinh là mảnh vụn đá và kim loại trơ trụi còn sót lại từ thời kỳ sơ khai của hệ Mặt Trời.',
      composition: [
        ['Silicat (Đá)', 75], ['Sắt - Niken', 15], ['Hợp chất Carbon', 10],
      ]
    },
    features: 'Trọng lực cực mạnh của Sao Mộc đã ngăn các mảnh vỡ này ngưng tụ lại thành một hành tinh hoàn chỉnh. Trái với phim viễn tưởng, khoảng cách trung bình giữa các tiểu hành tinh lên tới gần 1 triệu km, tàu vũ trụ có thể bay qua an toàn mà không va chạm.',
  }
};

// --- Real Planetary Data ---
// a: Semi-major axis in AU
// e: Orbital eccentricity
// inc: Orbital inclination in degrees
// w: Argument of periapsis in degrees
// radius: illustrative relative radius for visual/comparison mode (Earth = 1.2).
// True-scale radii are defined in physical-scale.js in kilometres.
export const PLANETS = [
  {
    id: 'mercury', nameVi: 'Sao Thủy', nameEn: 'Mercury', icon: '☿',
    tagline: 'Hành tinh nhỏ nhất và gần Mặt Trời nhất',
    a: 0.387, e: 0.2056, inc: 7.00, w: 29.1,
    radius: 0.46, orbitalSpeed: 4.15, rotationPeriod: 58.646,
    tilt: 0.03, texFn: Tex.texMercury, bumpFn: Tex.bumpMercury,
    atmosphere: null,
    gravity: 3.7, gravityRatio: 0.38,
    color: '#94a3b8', orbitColor: 0x94a3b8, gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
    info: {
      physical: [
        ['Đường kính', '4.879 km (0.38× Trái Đất)'],
        ['Khối lượng', '3,3 × 10²³ kg (0.055× Trái Đất)'],
        ['Trọng lực bề mặt', '3,7 m/s² (0,38g)'],
        ['Mật độ', '5.427 g/cm³'],
      ],
      orbital: [
        ['Khoảng cách trung bình', '57,9 triệu km (0.387 AU)'],
        ['Độ lệch tâm quỹ đạo', '0.2056 (rất dẹt)'],
        ['Độ nghiêng quỹ đạo', '7.00° so với hoàng đạo'],
        ['Chu kỳ quỹ đạo', '88 ngày Trái Đất'],
        ['Chu kỳ tự quay', '58.6 ngày'],
      ],
      atmosphere: {
        desc: 'Cực kỳ mỏng (exosphere), hầu như không tồn tại. Áp suất bề mặt chỉ ~10⁻¹⁵ bar.',
        composition: [
          ['O₂', 42], ['Na', 29], ['H₂', 22], ['He', 6],
        ]
      },
      temperature: 'Dao động cực đoan: -180°C (đêm) đến 430°C (ngày)',
      moons: '0 vệ tinh',
      biosphere: 'Không có sinh quyển. Không có nước lỏng, khí quyển quá mỏng, nhiệt độ quá khắc nghiệt để duy trì sự sống.',
      features: 'Quỹ đạo dẹt thứ 2 trong hệ (chỉ sau Pluto). Lõi sắt khổng lồ chiếm 85% bán kính. Caloris Basin đường kính 1.550 km là một trong những hố va chạm lớn nhất vũ trụ.',
    }
  },
  {
    id: 'venus', nameVi: 'Sao Kim', nameEn: 'Venus', icon: '♀',
    tagline: '"Ngôi sao mai" - hành tinh nóng nhất hệ Mặt Trời',
    a: 0.723, e: 0.0067, inc: 3.39, w: 54.9,
    radius: 1.14, orbitalSpeed: 1.62, rotationPeriod: -243.025,
    tilt: 2.64, texFn: Tex.texVenus,
    atmosphere: { color: '#fbbf24', intensity: 1.8, power: 2.0, scale: 1.12 },
    gravity: 8.87, gravityRatio: 0.90,
    color: '#f59e0b', orbitColor: 0xf59e0b, gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    info: {
      physical: [
        ['Đường kính', '12.104 km (0.95× Trái Đất)'],
        ['Khối lượng', '4,87 × 10²⁴ kg (0.815× Trái Đất)'],
        ['Trọng lực bề mặt', '8,87 m/s² (0,90g)'],
        ['Mật độ', '5.243 g/cm³'],
      ],
      orbital: [
        ['Khoảng cách trung bình', '108,2 triệu km (0.723 AU)'],
        ['Độ lệch tâm quỹ đạo', '0.0067 (gần như tròn tuyệt đối)'],
        ['Độ nghiêng quỹ đạo', '3.39° so với hoàng đạo'],
        ['Chu kỳ quỹ đạo', '224.7 ngày Trái Đất'],
        ['Chu kỳ tự quay', '243 ngày (nghịch hành)'],
      ],
      atmosphere: {
        desc: 'Khí quyển cực kỳ dày đặc, áp suất bề mặt 92 atm (gấp 92 lần Trái Đất, tương đương đáy biển sâu 900m). Hiệu ứng nhà kính cực độ.',
        composition: [
          ['CO₂', 96.5], ['N₂', 3.5],
        ]
      },
      temperature: '462°C (trung bình) - đủ nóng làm tan chảy chì',
      moons: '0 vệ tinh',
      biosphere: 'Không có sinh quyển trên bề mặt. Tuy nhiên ở độ cao 50-60 km trong tầng mây, nhiệt độ (~30°C) và áp suất lý tưởng, các nhà khoa học đang tìm kiếm vi sinh vật trôi nổi.',
      features: 'Hành tinh sinh đôi với Trái Đất về kích thước. Tự quay ngược chiều (Mặt Trời mọc hướng Tây). Mây axit sulfuric dày đặc.',
    }
  },
  {
    id: 'earth', nameVi: 'Trái Đất', nameEn: 'Earth', icon: '🌍',
    tagline: '"Hành tinh Xanh" - cái nôi duy nhất của sự sống được biết đến',
    a: 1.000, e: 0.0167, inc: 0.00, w: 102.9,
    radius: 1.20, orbitalSpeed: 1.0, rotationPeriod: 0.997,
    tilt: 0.41, texFn: Tex.texEarth, bumpFn: Tex.bumpEarth, hasClouds: true, hasRoughness: true,
    atmosphere: { color: '#78baff', intensity: 0.58, power: 4.5, scale: 1.012 },
    gravity: 9.81, gravityRatio: 1.0,
    color: '#38bdf8', orbitColor: 0x38bdf8, gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    info: {
      physical: [
        ['Đường kính', '12.742 km (Chuẩn 1.0×)'],
        ['Khối lượng', '5,97 × 10²⁴ kg'],
        ['Trọng lực bề mặt', '9,81 m/s² (1,00g chuẩn)'],
        ['Mật độ', '5.514 g/cm³ (cao nhất hệ Mặt Trời)'],
      ],
      orbital: [
        ['Khoảng cách trung bình', '149,6 triệu km (1.000 AU chuẩn)'],
        ['Độ lệch tâm quỹ đạo', '0.0167'],
        ['Độ nghiêng quỹ đạo', '0.00° (mặt phẳng chuẩn hoàng đạo)'],
        ['Chu kỳ quỹ đạo', '365,25 ngày'],
        ['Chu kỳ tự quay', '23 giờ 56 phút 4 giây'],
      ],
      atmosphere: {
        desc: 'Khí quyển hoàn hảo 5 tầng: Đối lưu, Bình lưu (tầng Ozone lọc tia cực tím), Trung lưu, Nhiệt lưu, Ngoại lưu.',
        composition: [
          ['N₂ (Nitơ)', 78.08], ['O₂ (Oxy)', 20.95], ['Ar (Argon)', 0.93], ['CO₂', 0.04],
        ]
      },
      temperature: '15°C (trung bình) — Kỷ lục: -89,2°C (Nam Cực) đến 56,7°C (Thung lũng Chết)',
      moons: '1 vệ tinh tự nhiên lớn: Mặt Trăng (Moon)',
      biosphere: '🌍 SINH QUYỂN PHỒN VINH BẬC NHẤT VŨ TRỤ:\n• Thủy quyển: 71% bề mặt bao phủ bởi đại dương nước lỏng.\n• Sinh quyển: Hơn 8.7 triệu loài sinh vật sống hòa hợp từ đáy biển sâu Mariana tới đỉnh Everest.\n• Địa từ quyển: Lõi sắt nóng chảy tạo lá chắn bảo vệ sự sống khỏi gió Mặt Trời.',
      features: 'Hành tinh duy nhất có kiến tạo mảng liên tục tái sinh khoáng chất và điều hòa khí hậu. Chu trình nước tự nhiên hỗ trợ sự sống vĩnh cửu.',
    }
  },
  {
    id: 'mars', nameVi: 'Sao Hỏa', nameEn: 'Mars', icon: '🔴',
    tagline: '"Hành tinh Đỏ" - đích đến định cư tiếp theo của nhân loại',
    a: 1.524, e: 0.0934, inc: 1.85, w: 286.5,
    radius: 0.64, orbitalSpeed: 0.53, rotationPeriod: 1.026,
    tilt: 0.44, texFn: Tex.texMars, bumpFn: Tex.bumpMars,
    atmosphere: { color: '#f97316', intensity: 0.7, power: 3.5, scale: 1.05 },
    gravity: 3.72, gravityRatio: 0.38,
    color: '#f97316', orbitColor: 0xf97316, gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    info: {
      physical: [
        ['Đường kính', '6.779 km (0.53× Trái Đất)'],
        ['Khối lượng', '6,42 × 10²³ kg (0.107× Trái Đất)'],
        ['Trọng lực bề mặt', '3,72 m/s² (0,38g)'],
        ['Mật độ', '3.934 g/cm³'],
      ],
      orbital: [
        ['Khoảng cách trung bình', '227,9 triệu km (1.524 AU)'],
        ['Độ lệch tâm quỹ đạo', '0.0934 (khá dẹt)'],
        ['Độ nghiêng quỹ đạo', '1.85° so với hoàng đạo'],
        ['Chu kỳ quỹ đạo', '687 ngày Trái Đất (~1.88 năm)'],
        ['Chu kỳ tự quay (1 Sol)', '24 giờ 37 phút 22 giây'],
      ],
      atmosphere: {
        desc: 'Khí quyển mỏng manh, áp suất bề mặt chỉ 6.1 mbar (dưới 1% Trái Đất). Thường xuyên xuất hiện bão bụi phủ kín toàn cầu.',
        composition: [
          ['CO₂', 95.3], ['N₂', 2.7], ['Ar', 1.6], ['O₂', 0.13],
        ]
      },
      temperature: '-63°C (trung bình) — Mùa hè xích đạo lên tới 20°C, mùa đông cực hạ tới -140°C',
      moons: '2 vệ tinh: Phobos và Deimos',
      biosphere: 'Hiện chưa xác nhận sinh quyển đang sống. Tuy nhiên bằng chứng sông hồ cổ đại và các túi băng nước ngầm khổng lồ cho thấy Sao Hỏa từng có môi trường thuận lợi cho sự sống cách đây 3.8 tỷ năm.',
      features: 'Olympus Mons: Núi lửa cao 21.9 km (gấp 2.5 lần Everest). Valles Marineris: Hẻm núi lớn nhất hệ Mặt Trời dài 4.000 km, sâu 7 km. Hai chỏm băng vĩnh cửu.',
    }
  },
  {
    id: 'jupiter', nameVi: 'Sao Mộc', nameEn: 'Jupiter', icon: '🟤', oblate: 0.935,
    tagline: '"Chúa tể các hành tinh" - người bảo vệ thầm lặng của Trái Đất',
    a: 5.204, e: 0.0485, inc: 1.30, w: 273.9,
    radius: 13.16, orbitalSpeed: 0.084, rotationPeriod: 0.414,
    tilt: 0.05, texFn: Tex.texJupiter,
    atmosphere: { color: '#fbbf24', intensity: 0.85, power: 3.0, scale: 1.06 },
    gravity: 24.79, gravityRatio: 2.53,
    color: '#fbbf24', orbitColor: 0xfbbf24, gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    info: {
      physical: [
        ['Đường kính', '139.820 km (11× Trái Đất)'],
        ['Khối lượng', '1,9 × 10²⁷ kg (318× Trái Đất, lớn hơn tất cả hành tinh khác gộp lại)'],
        ['Trọng lực bề mặt', '24,79 m/s² (2,53g)'],
        ['Mật độ', '1.326 g/cm³'],
      ],
      orbital: [
        ['Khoảng cách trung bình', '778,5 triệu km (5.204 AU)'],
        ['Độ lệch tâm quỹ đạo', '0.0485'],
        ['Độ nghiêng quỹ đạo', '1.30° so với hoàng đạo'],
        ['Chu kỳ quỹ đạo', '11,86 năm Trái Đất'],
        ['Chu kỳ tự quay', '9 giờ 56 phút (quay nhanh nhất)'],
      ],
      atmosphere: {
        desc: 'Khổng lồ khí không có bề mặt rắn phân định. Gió xích đạo lên đến 620 km/h xé nhỏ các tầng mây amoniac và lưu huỳnh.',
        composition: [
          ['H₂ (Hydro)', 89.8], ['He (Heli)', 10.2],
        ]
      },
      temperature: '-110°C (đỉnh mây) — Nhiệt độ lõi hydro kim loại đạt ~24.000°C',
      moons: '95+ vệ tinh đã biết. Nổi bật là 4 vệ tinh Galileo: Io, Europa, Ganymede, Callisto',
      biosphere: 'Không có sự sống trên Sao Mộc. Tuy nhiên vệ tinh Europa là ứng cử viên số 1 tìm kiếm sự sống ngoài Trái Đất nhờ đại dương nước lỏng ngầm có lượng nước gấp 2 lần toàn bộ đại dương Trái Đất.',
      features: 'Vết Đỏ Lớn (Great Red Spot): Cơn bão xoáy khổng lồ tồn tại hơn 350 năm, đường kính lớn hơn cả Trái Đất. Kích thước khổng lồ gấp 11 lần Trái Đất.',
    }
  },
  {
    id: 'saturn', nameVi: 'Sao Thổ', nameEn: 'Saturn', icon: '🪐', oblate: 0.902,
    tagline: '"Vương miện của hệ Mặt Trời" - hệ thống vành đai lộng lẫy nhất',
    a: 9.582, e: 0.0555, inc: 2.49, w: 339.4,
    radius: 10.97, orbitalSpeed: 0.034, rotationPeriod: 0.444,
    tilt: 0.47, texFn: Tex.texSaturn, hasRings: true,
    atmosphere: { color: '#facc15', intensity: 0.8, power: 3.0, scale: 1.06 },
    gravity: 10.44, gravityRatio: 1.06,
    color: '#facc15', orbitColor: 0xfacc15, gradient: 'linear-gradient(135deg, #ca8a04 0%, #facc15 100%)',
    info: {
      physical: [
        ['Đường kính', '116.460 km (9.14× Trái Đất)'],
        ['Khối lượng', '5,68 × 10²⁶ kg (95× Trái Đất)'],
        ['Trọng lực bề mặt', '10,44 m/s² (1,06g)'],
        ['Mật độ', '0.687 g/cm³ (nhẹ hơn nước)'],
      ],
      orbital: [
        ['Khoảng cách trung bình', '1.434 triệu km (9.582 AU)'],
        ['Độ lệch tâm quỹ đạo', '0.0555'],
        ['Độ nghiêng quỹ đạo', '2.49° so với hoàng đạo'],
        ['Chu kỳ quỹ đạo', '29,46 năm Trái Đất'],
        ['Chu kỳ tự quay', '10 giờ 42 phút'],
      ],
      atmosphere: {
        desc: 'Gió tầng cao đạt vận tốc kinh hoàng 1.800 km/h. Tại cực Bắc có cơn bão xoáy hình lục giác hoàn hảo độc nhất vô nhị.',
        composition: [
          ['H₂', 96.3], ['He', 3.25], ['CH₄ (Metan)', 0.45],
        ]
      },
      temperature: '-140°C (đỉnh mây) — Lõi đạt ~11.700°C',
      moons: '146+ vệ tinh (nhiều nhất hệ). Titan có khí quyển dày đặc và hồ metan; Enceladus phun các cột mạch nước ngầm.',
      biosphere: 'Không có sinh quyển trên bề mặt Sao Thổ. Nhưng Titan và Enceladus chứa các đại dương ngầm và phân tử hữu cơ phức tạp.',
      features: 'Hệ thống vành đai khổng lồ đường kính lên đến 282.000 km, cấu tạo từ 99% băng nước tinh khiết lấp lánh.',
    }
  },
  {
    id: 'uranus', nameVi: 'Sao Thiên Vương', nameEn: 'Uranus', icon: '🔵',
    tagline: '"Hành tinh lăn" - thế giới băng giá nghiêng mình bí ẩn',
    a: 19.20, e: 0.0463, inc: 0.77, w: 96.9,
    radius: 4.78, orbitalSpeed: 0.012, rotationPeriod: -0.718,
    tilt: 1.71, texFn: Tex.texUranus,
    atmosphere: { color: '#22d3ee', intensity: 0.95, power: 2.8, scale: 1.07 },
    gravity: 8.87, gravityRatio: 0.90,
    color: '#22d3ee', orbitColor: 0x22d3ee, gradient: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)',
    info: {
      physical: [
        ['Đường kính', '50.724 km (3.98× Trái Đất)'],
        ['Khối lượng', '8,68 × 10²⁵ kg (14,5× Trái Đất)'],
        ['Trọng lực bề mặt', '8,87 m/s² (0,90g)'],
        ['Mật độ', '1.270 g/cm³'],
      ],
      orbital: [
        ['Khoảng cách trung bình', '2.871 triệu km (19.20 AU)'],
        ['Độ lệch tâm quỹ đạo', '0.0463'],
        ['Độ nghiêng quỹ đạo', '0.77° so với hoàng đạo'],
        ['Chu kỳ quỹ đạo', '84 năm Trái Đất'],
        ['Chu kỳ tự quay', '17 giờ 14 phút (nghịch hành)'],
      ],
      atmosphere: {
        desc: 'Khí quyển màu xanh ngọc tuyệt đẹp do khí metan hấp thụ dải ánh sáng đỏ. Khí quyển tầng thấp chứa mây amoniac và nước.',
        composition: [
          ['H₂', 83], ['He', 15], ['CH₄', 2],
        ]
      },
      temperature: '-224°C — Hành tinh có nhiệt độ khí quyển thấp nhất trong hệ Mặt Trời',
      moons: '28 vệ tinh (đặt theo các tác phẩm của Shakespeare)',
      biosphere: 'Không có sinh quyển. Áp suất nén cực đại và nhiệt độ cực lạnh không cho phép tế bào hữu cơ duy trì hoạt động.',
      features: 'Độ nghiêng trục tự quay lên tới 97.77° — gần như "lăn" trên mặt phẳng quỹ đạo. Mỗi cực trải qua 42 năm liên tục trong bóng tối mùa đông.',
    }
  },
  {
    id: 'neptune', nameVi: 'Sao Hải Vương', nameEn: 'Neptune', icon: '🔵',
    tagline: '"Vua biển cả" - vương quốc bão tố xa xăm',
    a: 30.05, e: 0.0095, inc: 1.77, w: 273.2,
    radius: 4.63, orbitalSpeed: 0.006, rotationPeriod: 0.671,
    tilt: 0.49, texFn: Tex.texNeptune,
    atmosphere: { color: '#3b82f6', intensity: 1.1, power: 2.7, scale: 1.07 },
    gravity: 11.15, gravityRatio: 1.14,
    color: '#60a5fa', orbitColor: 0x60a5fa, gradient: 'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)',
    info: {
      physical: [
        ['Đường kính', '49.244 km (3.86× Trái Đất)'],
        ['Khối lượng', '1,02 × 10²⁶ kg (17× Trái Đất)'],
        ['Trọng lực bề mặt', '11,15 m/s² (1,14g)'],
        ['Mật độ', '1.638 g/cm³ (khổng lồ băng đặc nhất)'],
      ],
      orbital: [
        ['Khoảng cách trung bình', '4.495 triệu km (30.05 AU)'],
        ['Độ lệch tâm quỹ đạo', '0.0095 (gần như tròn)'],
        ['Độ nghiêng quỹ đạo', '1.77° so với hoàng đạo'],
        ['Chu kỳ quỹ đạo', '164,8 năm Trái Đất'],
        ['Chu kỳ tự quay', '16 giờ 6 phút'],
      ],
      atmosphere: {
        desc: 'Khí quyển dữ dội với những luồng gió nhanh nhất hệ Mặt Trời vượt quá 2.100 km/h (vượt cả tốc độ âm thanh Mach 1.7).',
        composition: [
          ['H₂', 80], ['He', 19], ['CH₄', 1.5],
        ]
      },
      temperature: '-214°C (đỉnh mây)',
      moons: '16 vệ tinh đã biết. Nổi bật nhất là Triton với các geyser phun nitơ lỏng cao 8 km',
      biosphere: 'Không có sinh quyển trên bề mặt hành tinh.',
      features: 'Hành tinh đầu tiên được phát hiện bằng tính toán toán học thuần túy của Urbain Le Verrier trước khi kính thiên văn nhìn thấy.',
    }
  },
  {
    id: 'pluto', nameVi: 'Sao Diêm Vương', nameEn: 'Pluto', icon: '❄',
    tagline: '"Hành tinh lùn huyền thoại" - người gác cổng Vành đai Kuiper',
    a: 39.48, e: 0.2488, inc: 17.16, w: 113.8,
    radius: 0.23, orbitalSpeed: 0.004, rotationPeriod: -6.387,
    tilt: 0.3, texFn: Tex.texPluto,
    atmosphere: { color: '#c084fc', intensity: 0.5, power: 3.5, scale: 1.05 },
    gravity: 0.62, gravityRatio: 0.063,
    color: '#c084fc', orbitColor: 0xc084fc, gradient: 'linear-gradient(135deg, #7e22ce 0%, #c084fc 100%)',
    info: {
      physical: [
        ['Đường kính', '2.376 km (0.186× Trái Đất, nhỏ hơn Mặt Trăng)'],
        ['Khối lượng', '1,3 × 10²² kg (0.002× Trái Đất)'],
        ['Trọng lực bề mặt', '0,62 m/s² (0,063g — bật nhảy cao gấp 16 lần)'],
        ['Mật độ', '1.854 g/cm³'],
      ],
      orbital: [
        ['Khoảng cách trung bình', '5.906 triệu km (39.48 AU)'],
        ['Độ lệch tâm quỹ đạo', '0.2488 (cực kỳ dẹt, điểm cận nhật 29.65 AU gần hơn cả Neptune!)'],
        ['Độ nghiêng quỹ đạo', '17.16° (nghiêng mạnh nhất, lệch hẳn khỏi mặt phẳng hoàng đạo)'],
        ['Chu kỳ quỹ đạo', '248 năm Trái Đất'],
        ['Chu kỳ tự quay', '6,39 ngày (nghịch hành)'],
      ],
      atmosphere: {
        desc: 'Khí quyển siêu mỏng gồm Nitơ, Metan và CO. Khi Pluto xa Mặt Trời, khí quyển đóng băng rơi xuống bề mặt.',
        composition: [
          ['N₂', 98], ['CH₄', 1.5], ['CO', 0.5],
        ]
      },
      temperature: '-232°C đến -223°C (cực lạnh)',
      moons: '5 vệ tinh: Charon (hệ hành tinh lùn kép), Styx, Nix, Kerberos, Hydra',
      biosphere: 'Không có sinh quyển. Dù vậy dữ liệu tàu New Horizons cho thấy khả năng tồn tại đại dương nước pha amoniac lỏng dưới lớp băng dày.',
      features: 'Quỹ đạo nghiêng 17.16° độc nhất vô nhị. Trái tim Tombaugh Regio (Sputnik Planitia): Biển băng nitơ khổng lồ hình trái tim nhẵn mịn.',
    }
  }
];

// --- 4 Galilean Moons of Jupiter ---
export const JUPITER_MOONS = [
  {
    id: 'io', nameVi: 'Io', nameEn: 'Io', icon: '🌕',
    radius: 0.36, orbitRadius: 18.0, periodDays: 1.769,
    color: '#fbbf24', texFn: Tex.texIo,
    tagline: 'Vệ tinh núi lửa hoạt động mạnh nhất hệ Mặt Trời',
    info: {
      physical: [['Đường kính', '3.643 km'], ['Khối lượng', '8,93 × 10²² kg'], ['Đặc điểm', 'Hơn 400 ngọn núi lửa đang phun trào liên tục']]
    }
  },
  {
    id: 'europa', nameVi: 'Europa', nameEn: 'Europa', icon: '❄️',
    radius: 0.31, orbitRadius: 23.5, periodDays: 3.551,
    color: '#93c5fd', texFn: Tex.texEuropa,
    tagline: 'Thế giới băng giá chứa đại dương ngầm tiềm năng sự sống',
    info: {
      physical: [['Đường kính', '3.122 km'], ['Khối lượng', '4,80 × 10²² kg'], ['Đặc điểm', 'Đại dương nước lỏng ngầm sâu 100km dưới lớp băng']]
    }
  },
  {
    id: 'ganymede', nameVi: 'Ganymede', nameEn: 'Ganymede', icon: '🌑',
    radius: 0.52, orbitRadius: 30.0, periodDays: 7.155,
    color: '#cbd5e1', texFn: Tex.texGanymede,
    tagline: 'Vệ tinh tự nhiên lớn nhất hệ Mặt Trời (lớn hơn cả Sao Thủy)',
    info: {
      physical: [['Đường kính', '5.268 km'], ['Khối lượng', '1,48 × 10²³ kg'], ['Đặc điểm', 'Vệ tinh duy nhất có từ quyển riêng']]
    }
  },
  {
    id: 'callisto', nameVi: 'Callisto', nameEn: 'Callisto', icon: '🌑',
    radius: 0.48, orbitRadius: 38.0, periodDays: 16.689,
    color: '#94a3b8', texFn: Tex.texCallisto,
    tagline: 'Bề mặt cổ xưa nhất với mật độ hố va chạm dày đặc nhất',
    info: {
      physical: [['Đường kính', '4.821 km'], ['Khối lượng', '1,08 × 10²³ kg'], ['Đặc điểm', 'Hầu như không có hoạt động địa chất trong 4 tỷ năm']]
    }
  }
];

// --- Titan (Saturn's Giant Moon) ---
export const TITAN_DATA = {
  id: 'titan', nameVi: 'Titan', nameEn: 'Titan', icon: '🪐',
  radius: 0.51, orbitRadius: 34.0, periodDays: 15.945,
  color: '#f97316', texFn: Tex.texTitan,
  tagline: 'Vệ tinh duy nhất có khí quyển dày và hồ chất lỏng trên bề mặt',
  info: {
    physical: [['Đường kính', '5.150 km (lớn hơn Mặt Trăng)'], ['Khí quyển', 'Nitơ 95%, Metan 5% (áp suất 1.45 atm)'], ['Đặc điểm', 'Sông hồ chứa metan và etan lỏng, chu trình mưa metan']]
  }
};

// --- Historic Spacecraft ---
export const SPACECRAFT_DATA = [
  {
    id: 'voyager1', nameVi: 'Tàu Voyager 1', nameEn: 'Voyager 1', icon: '🛰️',
    type: 'spacecraft',
    tagline: 'Vật thể nhân tạo bay xa Trái Đất nhất trong lịch sử (>24 tỷ km)',
    color: '#38bdf8', gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    distAU: 162.5, speedKmS: 17.0, launchYear: 1977,
    info: {
      physical: [
        ['Khoảng cách hiện tại', '~24,3 tỷ km (162.5 AU)'],
        ['Vận tốc bay', '17.0 km/s (61.200 km/h)'],
        ['Năm phóng', '05/09/1977 (Đã hoạt động hơn 48 năm)'],
        ['Vị trí', 'Không gian liên sao (Interstellar Space)'],
      ],
      features: 'Mang theo Đĩa Ghi Vàng (Golden Record) chứa âm thanh, hình ảnh và lời chào từ nhân loại gửi tới nền văn minh ngoài hành tinh.'
    }
  },
  {
    id: 'voyager2', nameVi: 'Tàu Voyager 2', nameEn: 'Voyager 2', icon: '🛰️',
    type: 'spacecraft',
    tagline: 'Tàu thám hiểm duy nhất từng ghé thăm cả 4 hành tinh khổng lồ',
    color: '#818cf8', gradient: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
    distAU: 136.2, speedKmS: 15.3, launchYear: 1977,
    info: {
      physical: [
        ['Khoảng cách hiện tại', '~20,4 tỷ km (136.2 AU)'],
        ['Vận tốc bay', '15.3 km/s (55.000 km/h)'],
        ['Năm phóng', '20/08/1977'],
        ['Thành tựu', 'Tiếp cận Sao Mộc (1979), Sao Thổ (1981), Sao Thiên Vương (1986), Sao Hải Vương (1989)'],
      ],
      features: 'Con tàu duy nhất cung cấp những hình ảnh cận cảnh đầu tiên về Sao Thiên Vương và Sao Hải Vương trong lịch sử nhân loại.'
    }
  },
  {
    id: 'iss', nameVi: 'Trạm Vũ Trụ ISS', nameEn: 'International Space Station', icon: '🛰️',
    type: 'spacecraft',
    tagline: 'Phòng thí nghiệm vi trọng lực bay quanh Trái Đất ở độ cao 408 km',
    color: '#e2e8f0', gradient: 'linear-gradient(135deg, #64748b 0%, #e2e8f0 100%)',
    orbitRadius: 2.1, periodMinutes: 92.68,
    info: {
      physical: [
        ['Độ cao quỹ đạo', '408 km (Quỹ đạo Trái Đất tầm thấp LEO)'],
        ['Vận tốc', '27.600 km/h (quay 1 vòng Trái Đất mất ~92 phút)'],
        ['Kích thước', '109m × 73m (bằng sân bóng đá)'],
        ['Phi hành đoàn', '7 nhà du hành vũ trụ thường trực'],
      ],
      features: 'Mỗi ngày phi hành gia trên ISS được ngắm 16 lần bình minh và 16 lần hoàng hôn!'
    }
  }
];

// --- Famous Comets Data ---
export const COMETS = [
  {
    id: 'halley',
    nameVi: 'Sao Chổi Halley',
    nameEn: '1P/Halley',
    icon: '☄️',
    tagline: 'Sao chổi chu kỳ nổi tiếng nhất lịch sử nhân loại (~76 năm)',
    a: 17.834,
    e: 0.967,
    inc: 162.3,
    w: 111.3,
    periodYears: 75.3,
    radius: 0.45,
    color: '#38bdf8',
    orbitColor: 0x38bdf8,
    info: {
      physical: [
        ['Kích thước nhân đá băng', '15 km × 8 km (nhỏ như hòn than xốp)'],
        ['Khối lượng', '2,2 × 10¹⁴ kg'],
        ['Thành phần', 'Băng nước, bụi carbon, methane và amoniac đóng băng'],
        ['Mật độ', '0,6 g/cm³ (rất xốp, nhẹ hơn nước)'],
      ],
      orbital: [
        ['Cận điểm (Perihelion)', '87,8 triệu km (0.586 AU - giữa Sao Thủy và Sao Kim)'],
        ['Viễn điểm (Aphelion)', '5,27 tỷ km (35.1 AU - vượt xa Sao Hải Vương)'],
        ['Chu kỳ quỹ đạo', '~75,3 năm Trái Đất'],
        ['Chiều quay', 'Nghịch hành (Retrograde — ngược chiều các hành tinh)'],
      ],
      features: 'Mỗi lần tiếp cận gần Mặt Trời, nhiệt độ làm thăng hoa hàng tấn băng mỗi giây, tạo thành 2 dải đuôi tuyệt mỹ dài hơn 100 triệu km: Đuôi ion xanh neon thẳng tắp và Đuôi bụi vàng uốn cong theo gió Mặt Trời!'
    }
  }
];

// --- Dual Scale Modes Configuration ---
export const SCALE_MODES = {
  VISUAL: 'visual',
  TRUE: 'true'
};

// Visual distances mapped for clear desktop visibility
export const VISUAL_DISTANCES = {
  mercury: 30.0,
  venus: 45.0,
  earth: 62.0,
  mars: 82.0,
  'asteroid-belt': 108.0,
  jupiter: 145.0,
  saturn: 192.0,
  uranus: 242.0,
  neptune: 295.0,
  pluto: 345.0,
  halley: HALLEY_VISUAL_AXIS
};

// Visual radii so planets are clearly visible while viewing the whole system
export const VISUAL_RADII = {
  sun: 12.0,
  mercury: 1.1,
  venus: 1.9,
  earth: 2.0,
  moon: 0.55,
  mars: 1.4,
  jupiter: 6.8,
  saturn: 5.5,
  uranus: 3.4,
  neptune: 3.3,
  pluto: 0.9,
  halley: 0.75
};

// --- Geological Interior Cutaway Data ---
export const CORE_STRUCTURES = {
  sun: {
    id: 'sun',
    nameVi: 'Cấu Trúc Lõi Mặt Trời',
    layers: [
      { name: 'Lõi Nhiệt Hạch (Core)', radiusRatio: 0.28, color: '#fffbeb', emissive: '#fef08a', emissiveIntensity: 1.5, temp: '15.000.000°C', desc: 'Nơi diễn ra phản ứng hợp hạch 600 triệu tấn Hydro mỗi giây' },
      { name: 'Tầng Bức Xạ (Radiative Zone)', radiusRatio: 0.70, color: '#f97316', emissive: '#ea580c', emissiveIntensity: 0.8, temp: '7.000.000°C', desc: 'Năng lượng truyền qua photon mất tới 100.000 năm mới thoát ra' },
      { name: 'Tầng Đối Lưu (Convection Zone)', radiusRatio: 0.99, color: '#eab308', emissive: '#ca8a04', emissiveIntensity: 0.5, temp: '2.000.000°C', desc: 'Plasma sôi sùng sục tạo nên các tế bào quang cầu bề mặt' },
    ]
  },
  earth: {
    id: 'earth',
    nameVi: 'Cấu Trúc Địa Chất Trái Đất',
    layers: [
      { name: 'Lõi Trong Sắt Rắn (Inner Core)', radiusRatio: 0.22, color: '#fef08a', emissive: '#fef08a', emissiveIntensity: 0.6, temp: '5.400°C (nóng ngang bề mặt Mặt Trời)', desc: 'Hợp kim Sắt - Niken rắn chắc dưới áp suất 3,6 triệu atm' },
      { name: 'Lõi Ngoài Nóng Chảy (Outer Core)', radiusRatio: 0.55, color: '#ea580c', emissive: '#c2410c', emissiveIntensity: 0.4, temp: '4.000°C', desc: 'Biển kim loại lỏng đối lưu phát sinh từ trường bảo vệ sinh quyển' },
      { name: 'Tầng Manti Dẻo (Mantle)', radiusRatio: 0.96, color: '#991b1b', temp: '1.000 - 3.700°C', desc: 'Đá silicat dẻo nhớt dày 2.900 km điều khiển kiến tạo mảng' },
      { name: 'Vỏ Trái Đất (Crust)', radiusRatio: 0.99, color: '#15803d', temp: '15°C', desc: 'Lớp vỏ thạch quyển mỏng 5-70 km chứa lục địa và đại dương' },
    ]
  },
  mars: {
    id: 'mars',
    nameVi: 'Cấu Trúc Lõi Sao Hỏa',
    layers: [
      { name: 'Lõi Kim Loại (Metallic Core)', radiusRatio: 0.45, color: '#d97706', temp: '1.500°C', desc: 'Sắt, Niken và Sulfur đông đặc, từ trường đã tắt từ 4 tỷ năm trước' },
      { name: 'Manti Silicat (Silicate Mantle)', radiusRatio: 0.95, color: '#9a3412', temp: '800 - 1.200°C', desc: 'Đá silicat giàu sắt, từng nuôi dưỡng siêu núi lửa Olympus Mons' },
      { name: 'Vỏ Đá Bazan (Crust)', radiusRatio: 0.99, color: '#c2410c', temp: '-63°C', desc: 'Lớp vỏ cứng dày 50 km phủ đầy rỉ sét oxit sắt (Fe₂O₃)' },
    ]
  },
  jupiter: {
    id: 'jupiter',
    nameVi: 'Cấu Trúc Khổng Lồ Khí Sao Mộc',
    layers: [
      { name: 'Lõi Đá & Kim Loại Nặng (Dense Core)', radiusRatio: 0.18, color: '#334155', temp: '20.000°C', desc: 'Khối đá đặc gấp 15 lần Trái Đất dưới áp suất 100 triệu atm' },
      { name: 'Hydro Kim Loại (Metallic Hydrogen)', radiusRatio: 0.78, color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.5, temp: '10.000°C', desc: 'Hydro bị nén thành kim loại lỏng siêu dẫn phát sinh từ trường khủng' },
      { name: 'Hydro Phân Tử Lỏng (Molecular Hydrogen)', radiusRatio: 0.99, color: '#b45309', temp: '-110°C (đỉnh mây)', desc: 'Đại dương hydro lỏng hòa lẫn với các tầng mây khí quyển ngoài' },
    ]
  }
};

// --- Scale Comparison Mode (True Proportional Radii: Sun = 10x Jupiter, Jupiter = 11x Earth) ---
export const SCALE_COMPARISON_CONFIG = {
  sun:     { posX: -80.0, targetScale: 55.0 / 14.0 },   // Radius 55.0 (10x Jupiter!)
  jupiter: { posX: -7.5,  targetScale: 5.5 / 6.8 },     // Radius 5.5
  saturn:  { posX: 16.6,  targetScale: 4.58 / 5.5 },    // Radius 4.58
  uranus:  { posX: 39.8,  targetScale: 2.00 / 3.4 },    // Radius 2.00
  neptune: { posX: 51.7,  targetScale: 1.94 / 3.3 },    // Radius 1.94
  earth:   { posX: 61.1,  targetScale: 0.501 / 2.0 },   // Radius 0.501 (1/10.9 of Jupiter)
  venus:   { posX: 67.1,  targetScale: 0.476 / 1.9 },   // Radius 0.476
  mars:    { posX: 72.9,  targetScale: 0.266 / 1.4 },   // Radius 0.266
  mercury: { posX: 77.9,  targetScale: 0.192 / 1.1 },   // Radius 0.192
  pluto:   { posX: 82.2,  targetScale: 0.093 / 0.9 },   // Radius 0.093
};

export const SCALE_COMPARISON_DATA = [
  { id: 'sun', radius: 55.0, spacing: 70.0 },
  { id: 'jupiter', radius: 5.5, spacing: 20.0 },
  { id: 'saturn', radius: 4.58, spacing: 20.0 },
  { id: 'uranus', radius: 2.0, spacing: 9.0 },
  { id: 'neptune', radius: 1.94, spacing: 7.0 },
  { id: 'earth', radius: 0.501, spacing: 3.5 },
  { id: 'venus', radius: 0.476, spacing: 3.0 },
  { id: 'mars', radius: 0.266, spacing: 2.5 },
  { id: 'mercury', radius: 0.192, spacing: 2.2 },
  { id: 'pluto', radius: 0.093, spacing: 2.0 }
];

