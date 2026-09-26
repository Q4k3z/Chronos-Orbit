// English content is kept separate from simulation parameters and Vietnamese data.
const physical = values => ['Diameter', 'Mass', 'Surface gravity', 'Density'].map((label, i) => [label, values[i]]);
const orbital = values => ['Mean distance', 'Orbital eccentricity', 'Orbital inclination', 'Orbital period', 'Rotation period'].map((label, i) => [label, values[i]]);
export const bodyEnglish = {
  sun: {
    tagline: 'The star at the heart of our planetary system',
    info: {
      physical: [['Actual diameter', '1,392,700 km (109× Earth)'], ['Mass', '1.989 × 10³⁰ kg (333,000× Earth; 99.86% of the system)'], ['Surface gravity', '274 m/s² (27.9g)'], ['Star class', 'Yellow dwarf (G2V main sequence)']],
      orbital: [['Estimated age', '~4.6 billion years'], ['Photosphere temperature', '5,500°C'], ['Fusion core temperature', '15,000,000°C'], ['Radiated power', '3.846 × 10²⁶ W']],
      atmosphere: { desc: 'The photosphere, chromosphere and corona form the solar atmosphere. The corona reaches millions of degrees and produces the solar wind, which extends beyond the Kuiper Belt.' },
      features: 'Fusion converts about 600 million tonnes of hydrogen into helium every second. The 11-year magnetic cycle produces sunspots and coronal mass ejections.'
    }
  },
  moon: {
    tagline: "Earth's companion in the night sky",
    info: {
      physical: physical(['3,474 km (~27% of Earth)', '7.35 × 10²² kg (1/81 of Earth)', '1.62 m/s² (0.165g)', '3.344 g/cm³']),
      orbital: [['Mean distance from Earth', '384,400 km'], ['Orbit & rotation period', '27.3 days (tidally locked; one face points toward Earth)'], ['Orbital speed', '1.022 km/s']],
      atmosphere: { desc: 'An extremely thin exosphere, almost a vacuum, provides no meaningful heat retention or protection from meteoroids.' },
      temperature: '-130°C at night to 120°C in daylight',
      features: "The Moon's gravity produces tides on Earth. Its surface preserves Apollo 11 footprints and millions of impact craters without weather-driven erosion."
    }
  },
  'asteroid-belt': {
    tagline: 'A region of rocky remnants between Mars and Jupiter',
    info: {
      physical: [['Estimated population', 'Millions of bodies, from dust to dwarf planets'], ['Total mass', '~4% of the Moon; much of it concentrated in Ceres'], ['Largest bodies', 'Ceres (~940 km diameter), Vesta, Pallas, Hygiea']],
      orbital: [['Distance from the Sun', '329–478 million km (2.2–3.2 AU)'], ['Orbital period', '3–6 Earth years']],
      atmosphere: { desc: 'No atmosphere. These rocky and metallic remnants date from the early Solar System.' },
      features: 'Jupiter’s gravitational influence prevented this region from forming a single planet. Unlike movie depictions, asteroids are widely separated; spacecraft can pass through the belt.'
    }
  },
  mercury: {
    tagline: 'The smallest planet and the closest to the Sun',
    info: {
      physical: physical(['4,879 km (0.38× Earth)', '3.3 × 10²³ kg (0.055× Earth)', '3.7 m/s² (0.38g)', '5.427 g/cm³']),
      orbital: orbital(['57.9 million km (0.387 AU)', '0.2056 (highly elliptical)', '7.00° to the ecliptic', '88 Earth days', '58.6 days']),
      atmosphere: { desc: 'An extremely thin exosphere. Surface pressure is only about 10⁻¹⁵ bar.' },
      temperature: '-180°C at night to 430°C in daylight', moons: 'No moons',
      biosphere: 'No known biosphere. There is no liquid surface water, and the exosphere and extreme temperatures cannot support familiar life.',
      features: 'A highly eccentric orbit and an enormous iron core occupying about 85% of its radius. Caloris Basin is an impact basin about 1,550 km across.'
    }
  },
  venus: {
    tagline: 'The morning star and the hottest planet',
    info: {
      physical: physical(['12,104 km (0.95× Earth)', '4.87 × 10²⁴ kg (0.815× Earth)', '8.87 m/s² (0.90g)', '5.243 g/cm³']),
      orbital: orbital(['108.2 million km (0.723 AU)', '0.0067 (almost circular)', '3.39° to the ecliptic', '224.7 Earth days', '243 days (retrograde)']),
      atmosphere: { desc: 'A very dense atmosphere with a surface pressure of 92 atm, comparable to a depth of 900 m in Earth’s oceans. A powerful greenhouse effect heats the surface.' },
      temperature: '462°C average — hot enough to melt lead', moons: 'No moons',
      biosphere: 'No known surface biosphere. Researchers study whether conditions in the clouds at 50–60 km altitude could support microorganisms.',
      features: 'Similar in size to Earth, but with retrograde rotation and dense sulfuric-acid clouds. The Sun rises in the west.'
    }
  },
  earth: {
    tagline: 'The blue planet — the only known home of life',
    info: {
      physical: physical(['12,742 km (1.0× reference)', '5.97 × 10²⁴ kg', '9.81 m/s² (1.00g reference)', '5.514 g/cm³ (highest planetary mean density)']),
      orbital: orbital(['149.6 million km (1.000 AU reference)', '0.0167', '0.00° (ecliptic reference plane)', '365.25 days', '23 hours 56 minutes 4 seconds']),
      atmosphere: { desc: 'Five layers: troposphere, stratosphere with its UV-filtering ozone layer, mesosphere, thermosphere and exosphere.' },
      temperature: '15°C average — recorded extremes: -89.2°C in Antarctica to 56.7°C in Death Valley',
      moons: 'One large natural satellite: the Moon',
      biosphere: '🌍 A RICH BIOSPHERE:\n• Oceans cover 71% of the surface.\n• Millions of species occupy habitats from deep ocean trenches to mountain peaks.\n• The molten iron core generates a magnetic field that helps shield the planet from the solar wind.',
      features: 'Plate tectonics recycles minerals and helps regulate the climate. The water cycle sustains Earth’s diverse ecosystems.'
    }
  },
  mars: {
    tagline: 'The red planet — a destination for future exploration',
    info: {
      physical: physical(['6,779 km (0.53× Earth)', '6.42 × 10²³ kg (0.107× Earth)', '3.72 m/s² (0.38g)', '3.934 g/cm³']),
      orbital: orbital(['227.9 million km (1.524 AU)', '0.0934 (elliptical)', '1.85° to the ecliptic', '687 Earth days (~1.88 years)', '24 hours 37 minutes 22 seconds (one sol)']),
      atmosphere: { desc: 'A thin atmosphere with a surface pressure of 6.1 mbar, below 1% of Earth’s. Dust storms can cover the entire planet.' },
      temperature: '-63°C average; equatorial summers can reach 20°C and polar winters -140°C',
      moons: 'Two moons: Phobos and Deimos',
      biosphere: 'No living biosphere has been confirmed. Ancient rivers, lakes and extensive subsurface ice suggest that conditions could have supported life about 3.8 billion years ago.',
      features: 'Olympus Mons is a volcano about 21.9 km high. Valles Marineris extends roughly 4,000 km and reaches depths of 7 km. Both poles have persistent ice caps.'
    }
  },
  jupiter: {
    tagline: 'The largest planet, with a world of swirling clouds',
    info: {
      physical: physical(['139,820 km (11× Earth)', '1.9 × 10²⁷ kg (318× Earth; more than the other planets combined)', '24.79 m/s² (2.53g)', '1.326 g/cm³']),
      orbital: orbital(['778.5 million km (5.204 AU)', '0.0485', '1.30° to the ecliptic', '11.86 Earth years', '9 hours 56 minutes (fastest planetary rotation)']),
      atmosphere: { desc: 'A gas giant without a clearly defined solid surface. Equatorial winds reach about 620 km/h and shape its ammonia-rich cloud layers.' },
      temperature: '-110°C at cloud tops; the metallic-hydrogen core reaches about 24,000°C',
      moons: '95+ moons in this reference data, including Io, Europa, Ganymede and Callisto',
      biosphere: 'No known life on Jupiter. Europa’s subsurface ocean makes it an important target in the search for life beyond Earth.',
      features: 'The Great Red Spot is a long-lived giant storm. Jupiter’s diameter is about 11 times Earth’s.'
    }
  },
  saturn: {
    tagline: 'The ringed jewel of the Solar System',
    info: {
      physical: physical(['116,460 km (9.14× Earth)', '5.68 × 10²⁶ kg (95× Earth)', '10.44 m/s² (1.06g)', '0.687 g/cm³ (less dense than water)']),
      orbital: orbital(['1,434 million km (9.582 AU)', '0.0555', '2.49° to the ecliptic', '29.46 Earth years', '10 hours 42 minutes']),
      atmosphere: { desc: 'High-altitude winds can reach 1,800 km/h. A distinctive hexagonal atmospheric pattern surrounds the north pole.' },
      temperature: '-140°C at cloud tops; the core reaches about 11,700°C',
      moons: '146+ moons in this reference data. Titan has a dense atmosphere and methane lakes; Enceladus ejects water-rich plumes.',
      biosphere: 'No known biosphere on Saturn. Titan and Enceladus have subsurface oceans and complex organic chemistry.',
      features: 'Its extensive rings reach about 282,000 km across and are composed mainly of water ice.'
    }
  },
  uranus: {
    tagline: 'An ice giant that rolls through its orbit on its side',
    info: {
      physical: physical(['50,724 km (3.98× Earth)', '8.68 × 10²⁵ kg (14.5× Earth)', '8.87 m/s² (0.90g)', '1.270 g/cm³']),
      orbital: orbital(['2,871 million km (19.20 AU)', '0.0463', '0.77° to the ecliptic', '84 Earth years', '17 hours 14 minutes (retrograde)']),
      atmosphere: { desc: 'Methane absorbs red light, giving the atmosphere its cyan appearance. Deeper layers contain ammonia and water clouds.' },
      temperature: '-224°C — the coldest planetary atmosphere in this reference data',
      moons: '28 moons in this reference data; many names come from Shakespeare’s works',
      biosphere: 'No known biosphere. Extreme pressure and low temperatures are unsuitable for familiar organic cells.',
      features: 'Its rotation axis is tilted about 97.77°, almost in the orbital plane. Each pole experiences decades of continuous winter darkness.'
    }
  },
  neptune: {
    tagline: 'A distant ice giant swept by powerful storms',
    info: {
      physical: physical(['49,244 km (3.86× Earth)', '1.02 × 10²⁶ kg (17× Earth)', '11.15 m/s² (1.14g)', '1.638 g/cm³ (densest ice giant)']),
      orbital: orbital(['4,495 million km (30.05 AU)', '0.0095 (almost circular)', '1.77° to the ecliptic', '164.8 Earth years', '16 hours 6 minutes']),
      atmosphere: { desc: 'A turbulent atmosphere with some of the Solar System’s fastest winds, exceeding 2,100 km/h.' },
      temperature: '-214°C at cloud tops',
      moons: '16 moons in this reference data. Triton is known for nitrogen geysers reaching heights of about 8 km.',
      biosphere: 'No known biosphere on the planet.',
      features: 'Urbain Le Verrier predicted its position mathematically before it was identified through a telescope.'
    }
  },
  pluto: {
    tagline: 'A dwarf planet on the edge of the Kuiper Belt',
    info: {
      physical: physical(['2,376 km (0.186× Earth; smaller than the Moon)', '1.3 × 10²² kg (0.002× Earth)', '0.62 m/s² (0.063g)', '1.854 g/cm³']),
      orbital: orbital(['5,906 million km (39.48 AU)', '0.2488 (perihelion at 29.65 AU)', '17.16° to the ecliptic', '248 Earth years', '6.39 days (retrograde)']),
      atmosphere: { desc: 'A thin atmosphere of nitrogen, methane and carbon monoxide. As Pluto moves away from the Sun, atmospheric gases can freeze onto the surface.' },
      temperature: '-232°C to -223°C', moons: 'Five moons: Charon, Styx, Nix, Kerberos and Hydra',
      biosphere: 'No known biosphere. New Horizons observations suggest the possibility of a subsurface water ocean containing ammonia.',
      features: 'A strongly inclined orbit and the bright, heart-shaped Tombaugh Regio. Sputnik Planitia is a broad plain of nitrogen ice.'
    }
  },
  io: { tagline: 'The most volcanically active moon in the Solar System', info: { physical: [['Diameter', '3,643 km'], ['Mass', '8.93 × 10²² kg'], ['Features', 'More than 400 active volcanoes']] } },
  europa: { tagline: 'An icy world with a potentially habitable subsurface ocean', info: { physical: [['Diameter', '3,122 km'], ['Mass', '4.80 × 10²² kg'], ['Features', 'A deep liquid-water ocean beneath the ice']] } },
  ganymede: { tagline: 'The largest moon, bigger than Mercury', info: { physical: [['Diameter', '5,268 km'], ['Mass', '1.48 × 10²³ kg'], ['Features', 'The only moon with its own intrinsic magnetic field']] } },
  callisto: { tagline: 'An ancient surface covered in impact craters', info: { physical: [['Diameter', '4,821 km'], ['Mass', '1.08 × 10²³ kg'], ['Features', 'Little geological activity for about four billion years']] } },
  titan: { tagline: 'A moon with a thick atmosphere and surface lakes', info: { physical: [['Diameter', '5,150 km (larger than the Moon)'], ['Atmosphere', '95% nitrogen, 5% methane; pressure 1.45 atm'], ['Features', 'Liquid methane and ethane lakes, rivers and methane rain']] } },
  voyager1: {
    tagline: 'The most distant human-made spacecraft',
    info: { physical: [['Reference distance', '~24.3 billion km (162.5 AU)'], ['Speed', '17.0 km/s (61,200 km/h)'], ['Launch date', '5 September 1977'], ['Location', 'Interstellar space']], features: 'Carries the Golden Record: sounds, images and greetings from humanity for any civilization that might encounter it.' }
  },
  voyager2: {
    tagline: 'The only spacecraft to visit all four giant planets',
    info: { physical: [['Reference distance', '~20.4 billion km (136.2 AU)'], ['Speed', '15.3 km/s (55,000 km/h)'], ['Launch date', '20 August 1977'], ['Flybys', 'Jupiter (1979), Saturn (1981), Uranus (1986), Neptune (1989)']], features: 'Provided the first close-up spacecraft observations of Uranus and Neptune.' }
  },
  iss: {
    tagline: 'A microgravity laboratory orbiting about 408 km above Earth',
    info: { physical: [['Orbital altitude', '408 km (low Earth orbit)'], ['Speed', '27,600 km/h (~92 minutes per orbit)'], ['Dimensions', '109 m × 73 m (about a football field)'], ['Crew', 'Seven resident astronauts in this reference data']], features: 'Astronauts aboard the ISS see about 16 sunrises and 16 sunsets each day.' }
  },
  halley: {
    tagline: 'A famous periodic comet returning about every 76 years',
    info: {
      physical: [['Icy nucleus size', '15 km × 8 km'], ['Mass', '2.2 × 10¹⁴ kg'], ['Composition', 'Water ice, carbon dust, frozen methane and ammonia'], ['Density', '0.6 g/cm³ (porous and less dense than water)']],
      orbital: [['Perihelion', '87.8 million km (0.586 AU; between Mercury and Venus)'], ['Aphelion', '5.27 billion km (35.1 AU; beyond Neptune)'], ['Orbital period', '~75.3 Earth years'], ['Direction', 'Retrograde, opposite to the planets']],
      features: 'Near the Sun, heat sublimates ice and releases gas and dust, forming a straight ion tail and a curved dust tail extending millions of kilometers.'
    }
  }
};

const compositionNames = {
  'H (Hydro)': 'H (Hydrogen)', 'He (Heli)': 'He (Helium)', 'O (Oxy)': 'O (Oxygen)', 'C (Cacbon)': 'C (Carbon)',
  'N₂ (Nitơ)': 'N₂ (Nitrogen)', 'O₂ (Oxy)': 'O₂ (Oxygen)', 'H₂ (Hydro)': 'H₂ (Hydrogen)', 'CH₄ (Metan)': 'CH₄ (Methane)',
  'Silicat (Đá)': 'Silicates (rock)', 'Sắt - Niken': 'Iron–nickel', 'Hợp chất Carbon': 'Carbon compounds'
};
export function englishBody(data) {
  const translation = bodyEnglish[data.id];
  if (!translation) return data;
  const info = { ...translation.info };
  if (info.atmosphere) {
    info.atmosphere = { ...info.atmosphere,
      composition: data.info?.atmosphere?.composition?.map(([name, percent]) => [compositionNames[name] || name, percent]) };
  }
  return { ...data, tagline: translation.tagline, info };
}
