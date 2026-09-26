// Surface animation uses a separate display clock from dated orbital positions.
export const EARTH_TURN_SECONDS = 30;
export const EARTH_ROTATION_DAYS = 0.997;
const TAU = 2 * Math.PI;

export function rotationStep(deltaSeconds, speed, periodDays) {
  if (!Number.isFinite(periodDays) || periodDays === 0) return 0;
  return deltaSeconds * speed * TAU * EARTH_ROTATION_DAYS
    / (EARTH_TURN_SECONDS * periodDays);
}

export function advanceRotation(angle, deltaSeconds, speed, periodDays) {
  return (angle + rotationStep(deltaSeconds, speed, periodDays)) % TAU;
}
