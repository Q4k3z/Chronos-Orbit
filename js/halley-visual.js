import { HALLEY_SEMIMAJOR_AXIS_AU, HALLEY_ECCENTRICITY } from './ephemeris.js';

// The overview stretches Halley's perihelion away from the enlarged visual Sun.
// Its dated Kepler position and the true-scale orbit remain unchanged.
export const HALLEY_VISUAL_ECCENTRICITY = 0.8;
export const HALLEY_VISUAL_AXIS = 165;

export function getHalleyVisualPosition(positionAU) {
  const radiusAU = Math.hypot(...positionAU);
  if (!Number.isFinite(radiusAU) || radiusAU <= 0) return [0, 0, 0];
  const a = HALLEY_SEMIMAJOR_AXIS_AU;
  const e = HALLEY_ECCENTRICITY;
  const cosTrueAnomaly = Math.max(-1, Math.min(1,
    (a * (1 - e * e) / radiusAU - 1) / e
  ));
  const visualRadius = HALLEY_VISUAL_AXIS *
    (1 - HALLEY_VISUAL_ECCENTRICITY ** 2) /
    (1 + HALLEY_VISUAL_ECCENTRICITY * cosTrueAnomaly);
  const scale = visualRadius / radiusAU;
  return positionAU.map(component => component * scale);
}
