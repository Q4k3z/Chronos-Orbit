// Physical radii in kilometres. The displayed sphere uses the volumetric mean
// radius; orbital distances use the same astronomical-unit conversion.
// Planet and Pluto radii: https://ssd.jpl.nasa.gov/planets/phys_par.html
// Sun: https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html
// Galilean moons: https://ssd.jpl.nasa.gov/sats/phys_par/sep.html
export const AU_KM = 149597870.7;
export const SUN_RADIUS_KM = 695700;

export const PLANET_RADIUS_KM = Object.freeze({
  mercury: 2439.4,
  venus: 6051.8,
  earth: 6371.0084,
  mars: 3389.5,
  jupiter: 69911,
  saturn: 58232,
  uranus: 25362,
  neptune: 24622,
  pluto: 1188.3
});

export const JUPITER_MOON_RADIUS_KM = Object.freeze({
  io: 1821.49,
  europa: 1560.8,
  ganymede: 2631.2,
  callisto: 2410.3
});

export function kmToSceneUnits(km, unitsPerAU) {
  return km / AU_KM * unitsPerAU;
}
