import { AU_KM, SUN_RADIUS_KM, PLANET_RADIUS_KM } from './physical-scale.js';

const format = (number, digits = 0) => new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: digits
}).format(number);

export function describeScale(mode, body = null) {
  const reference = body && (PLANET_RADIUS_KM[body.id] || ['moon', 'sun'].includes(body.id))
    ? body : { id: 'earth', nameVi: 'Trái Đất', a: 1 };
  const radius = reference.id === 'sun' ? SUN_RADIUS_KM
    : reference.id === 'moon' ? 1737.4 : PLANET_RADIUS_KM[reference.id];
  const facts = [`Đường kính ${reference.nameVi}: ${format(radius * 2)} km.`];
  if (reference.id === 'moon') {
    facts.push('Khoảng cách trung bình đến Trái Đất: 384.400 km.');
  } else if (Number.isFinite(reference.a)) {
    facts.push(`Khoảng cách trung bình đến Mặt Trời: ${format(reference.a * AU_KM / 1e6, 1)} triệu km (${format(reference.a, 3)} AU).`);
  }
  const real = mode === 'true';
  return {
    title: real ? 'Tỉ lệ thực — cùng một thước đo' : 'Trực quan — dễ quan sát',
    description: real
      ? 'Đường kính và khoảng cách dùng chung một tỉ lệ. Các hành tinh rất nhỏ vì khoảng cách Trái Đất–Mặt Trời lớn gấp khoảng 11.741 lần đường kính Trái Đất. Chọn một thiên thể để xem gần.'
      : 'Kích thước thiên thể và khoảng cách được phóng đại riêng để dễ xem. Quỹ đạo Halley cũng được nới rộng để tránh Mặt Trời hiển thị. Không dùng hình minh họa này để đo khoảng cách.',
    facts
  };
}
