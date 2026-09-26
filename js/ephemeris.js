// Approximate heliocentric positions in the J2000 ecliptic frame.
// Eight planets: JPL Solar System Dynamics, Table 2a/2b (3000 BC–3000 AD).
// https://ssd.jpl.nasa.gov/planets/approx_pos.html
// Pluto: NASA NSSDC J2000 mean elements; two-body approximation.
// https://nssdc.gsfc.nasa.gov/planetary/factsheet/plutofact.html

const DEG = Math.PI / 180;
const DAYS_PER_CENTURY = 36525;
const MS_PER_DAY = 86400000;
const J2000 = Date.UTC(2000, 0, 1, 12);
export const HALLEY_SEMIMAJOR_AXIS_AU = 17.834;
export const HALLEY_ECCENTRICITY = 0.967;

// Each element has its J2000 value followed by its rate per Julian century.
const ELEMENTS = {
  mercury: { a: [0.38709843, 0], e: [0.20563661, 0.00002123], i: [7.00559432, -0.00590158], L: [252.25166724, 149472.67486623], peri: [77.45771895, 0.15940013], node: [48.33961819, -0.12214182] },
  venus: { a: [0.72332102, -0.00000026], e: [0.00676399, -0.00005107], i: [3.39777545, 0.00043494], L: [181.97970850, 58517.81560260], peri: [131.76755713, 0.05679648], node: [76.67261496, -0.27274174] },
  earth: { a: [1.00000018, -0.00000003], e: [0.01673163, -0.00003661], i: [-0.00054346, -0.01337178], L: [100.46691572, 35999.37306329], peri: [102.93005885, 0.31795260], node: [-5.11260389, -0.24123856] },
  mars: { a: [1.52371243, 0.00000097], e: [0.09336511, 0.00009149], i: [1.85181869, -0.00724757], L: [-4.56813164, 19140.29934243], peri: [-23.91744784, 0.45223625], node: [49.71320984, -0.26852431] },
  jupiter: { a: [5.20248019, -0.00002864], e: [0.04853590, 0.00018026], i: [1.29861416, -0.00322699], L: [34.33479152, 3034.90371757], peri: [14.27495244, 0.18199196], node: [100.29282654, 0.13024619], extra: [-0.00012452, 0.06064060, -0.35635438, 38.35125000] },
  saturn: { a: [9.54149883, -0.00003065], e: [0.05550825, -0.00032044], i: [2.49424102, 0.00451969], L: [50.07571329, 1222.11494724], peri: [92.86136063, 0.54179478], node: [113.63998702, -0.25015002], extra: [0.00025899, -0.13434469, 0.87320147, 38.35125000] },
  uranus: { a: [19.18797948, -0.00020455], e: [0.04685740, -0.00001550], i: [0.77298127, -0.00180155], L: [314.20276625, 428.49512595], peri: [172.43404441, 0.09266985], node: [73.96250215, 0.05739699], extra: [0.00058331, -0.97731848, 0.17689245, 7.67025000] },
  neptune: { a: [30.06952752, 0.00006447], e: [0.00895439, 0.00000818], i: [1.77005520, 0.00022400], L: [304.22289287, 218.46515314], peri: [46.68158724, 0.01009938], node: [131.78635853, -0.00606302], extra: [-0.00041348, 0.68346318, -0.10162547, 7.67025000] },
  pluto: { a: [39.48168677, 0], e: [0.24880766, 0], i: [17.14175, 0], L: [238.92881, 145.20780515], peri: [224.06676, 0], node: [110.30347, 0] }
};

const normalizeAngle = angle => ((angle + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

export function solveKepler(meanAnomaly, eccentricity) {
  const M = normalizeAngle(meanAnomaly);
  let E = M + eccentricity * Math.sin(M);
  for (let n = 0; n < 12; n++) {
    const correction = (E - eccentricity * Math.sin(E) - M) / (1 - eccentricity * Math.cos(E));
    E -= correction;
    if (Math.abs(correction) < 1e-12) break;
  }
  return E;
}

export function getPlanetElements(id, date) {
  const source = ELEMENTS[id];
  if (!source) throw new Error(`Unknown body: ${id}`);
  const T = (date.getTime() - J2000) / (MS_PER_DAY * DAYS_PER_CENTURY);
  const value = key => source[key][0] + source[key][1] * T;
  let M = value('L') - value('peri');
  if (source.extra) {
    const [b, c, s, f] = source.extra;
    M += b * T * T + c * Math.cos(f * T * DEG) + s * Math.sin(f * T * DEG);
  }
  return { a: value('a'), e: value('e'), i: value('i') * DEG, peri: value('peri') * DEG, node: value('node') * DEG, M: M * DEG };
}

function orbitalToScene(x, y, i, peri, node) {
  const w = peri - node;
  const cw = Math.cos(w), sw = Math.sin(w);
  const cn = Math.cos(node), sn = Math.sin(node);
  const ci = Math.cos(i), si = Math.sin(i);
  const eclipticX = (cw * cn - sw * sn * ci) * x + (-sw * cn - cw * sn * ci) * y;
  const eclipticY = (cw * sn + sw * cn * ci) * x + (-sw * sn + cw * cn * ci) * y;
  const eclipticZ = sw * si * x + cw * si * y;
  return [eclipticX, eclipticZ, eclipticY];
}

export function getPlanetPositionAU(id, date) {
  const { a, e, i, peri, node, M } = getPlanetElements(id, date);
  const E = solveKepler(M, e);
  return orbitalToScene(a * (Math.cos(E) - e), a * Math.sqrt(1 - e * e) * Math.sin(E), i, peri, node);
}

export function getPlanetOrbitPointAU(id, trueAnomaly, date = new Date(J2000)) {
  const { a, e, i, peri, node } = getPlanetElements(id, date);
  const r = a * (1 - e * e) / (1 + e * Math.cos(trueAnomaly));
  return orbitalToScene(r * Math.cos(trueAnomaly), r * Math.sin(trueAnomaly), i, peri, node);
}

// A single Kepler orbit between Halley's 1986 perihelion passages is illustrative;
// close planetary encounters and outgassing are not modeled.
export function getHalleyPositionAU(date) {
  const a = HALLEY_SEMIMAJOR_AXIS_AU, e = HALLEY_ECCENTRICITY;
  const perihelion = Date.UTC(1986, 1, 5, 21, 29);
  const M = (date.getTime() - perihelion) / (75.3 * 365.25 * MS_PER_DAY) * 2 * Math.PI;
  const E = solveKepler(M, e);
  return orbitalToScene(a * (Math.cos(E) - e), a * Math.sqrt(1 - e * e) * Math.sin(E), 162.3 * DEG, (111.3 + 58.42) * DEG, 58.42 * DEG);
}

export function getHalleyOrbitPointAU(trueAnomaly) {
  const a = HALLEY_SEMIMAJOR_AXIS_AU, e = HALLEY_ECCENTRICITY;
  const r = a * (1 - e * e) / (1 + e * Math.cos(trueAnomaly));
  return orbitalToScene(r * Math.cos(trueAnomaly), r * Math.sin(trueAnomaly), 162.3 * DEG, (111.3 + 58.42) * DEG, 58.42 * DEG);
}
