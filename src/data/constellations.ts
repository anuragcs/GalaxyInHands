export type ConstellationDef = {
  id: string;
  name: string;
  wiki: string;
  lines: [string, string][];
};

export const CONSTELLATIONS: ConstellationDef[] = [
  {
    id: 'orion',
    name: 'Orion',
    wiki: 'Orion_(constellation)',
    lines: [
      ['betelgeuse', 'meissa'],
      ['bellatrix', 'meissa'],
      ['bellatrix', 'mintaka'],
      ['mintaka', 'alnilam'],
      ['alnilam', 'alnitak'],
      ['betelgeuse', 'alnitak'],
      ['alnitak', 'saiph'],
      ['saiph', 'rigel'],
      ['rigel', 'mintaka'],
    ],
  },
  {
    id: 'ursa-major',
    name: 'Ursa Major',
    wiki: 'Ursa_Major',
    lines: [
      ['dubhe', 'merak'],
      ['merak', 'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar', 'alkaid'],
      ['megrez', 'dubhe'],
    ],
  },
  {
    id: 'ursa-minor',
    name: 'Ursa Minor',
    wiki: 'Ursa_Minor',
    lines: [
      ['polaris', 'kochab'],
      ['kochab', 'pherkad'],
    ],
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia',
    wiki: 'Cassiopeia_(constellation)',
    lines: [
      ['caph', 'schedar'],
      ['schedar', 'cih'],
      ['cih', 'ruchbah'],
      ['ruchbah', 'segin'],
    ],
  },
  {
    id: 'cygnus',
    name: 'Cygnus',
    wiki: 'Cygnus_(constellation)',
    lines: [
      ['deneb', 'sadr'],
      ['sadr', 'albireo'],
      ['gienah-cyg', 'sadr'],
      ['sadr', 'delta-cyg'],
    ],
  },
  {
    id: 'lyra',
    name: 'Lyra',
    wiki: 'Lyra',
    lines: [
      ['vega', 'sheliak'],
      ['sheliak', 'sulafat'],
      ['sulafat', 'vega'],
    ],
  },
  {
    id: 'aquila',
    name: 'Aquila',
    wiki: 'Aquila_(constellation)',
    lines: [
      ['tarazed', 'altair'],
      ['altair', 'alshain'],
    ],
  },
  {
    id: 'taurus',
    name: 'Taurus',
    wiki: 'Taurus_(constellation)',
    lines: [
      ['aldebaran', 'elnath'],
      ['aldebaran', 'ain'],
      ['ain', 'alcyone'],
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    wiki: 'Gemini_(constellation)',
    lines: [
      ['castor', 'pollux'],
      ['pollux', 'alhena'],
      ['castor', 'tejat'],
      ['tejat', 'propus'],
    ],
  },
  {
    id: 'leo',
    name: 'Leo',
    wiki: 'Leo_(constellation)',
    lines: [
      ['regulus', 'algieba'],
      ['algieba', 'zosma'],
      ['zosma', 'chertan'],
      ['chertan', 'denebola'],
      ['zosma', 'denebola'],
    ],
  },
  {
    id: 'scorpius',
    name: 'Scorpius',
    wiki: 'Scorpius',
    lines: [
      ['dschubba', 'graffias'],
      ['dschubba', 'antares'],
      ['antares', 'wei'],
      ['wei', 'sargas'],
      ['sargas', 'shaula'],
      ['shaula', 'lesath'],
    ],
  },
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    wiki: 'Sagittarius_(constellation)',
    lines: [
      ['kaus-borealis', 'kaus-media'],
      ['kaus-media', 'kaus-australis'],
      ['kaus-australis', 'nunki'],
    ],
  },
  {
    id: 'virgo',
    name: 'Virgo',
    wiki: 'Virgo_(constellation)',
    lines: [
      ['porrima', 'spica'],
      ['vindemiatrix', 'porrima'],
    ],
  },
  {
    id: 'bootes',
    name: 'Boötes',
    wiki: 'Boötes',
    lines: [
      ['muphrid', 'arcturus'],
      ['arcturus', 'izar'],
    ],
  },
  {
    id: 'canis-major',
    name: 'Canis Major',
    wiki: 'Canis_Major',
    lines: [
      ['mirzam', 'sirius'],
      ['sirius', 'adhara'],
      ['adhara', 'wezen'],
      ['wezen', 'aludra'],
    ],
  },
  {
    id: 'canis-minor',
    name: 'Canis Minor',
    wiki: 'Canis_Minor',
    lines: [['procyon', 'gomeisa']],
  },
  {
    id: 'crux',
    name: 'Crux',
    wiki: 'Crux',
    lines: [
      ['acrux', 'gacrux'],
      ['mimosa', 'delta-cru'],
    ],
  },
  {
    id: 'centaurus',
    name: 'Centaurus',
    wiki: 'Centaurus',
    lines: [
      ['hadar', 'rigil-kentaurus'],
      ['hadar', 'menkent'],
    ],
  },
  {
    id: 'pegasus',
    name: 'Pegasus',
    wiki: 'Pegasus_(constellation)',
    lines: [
      ['markab', 'scheat'],
      ['scheat', 'alpheratz'],
      ['alpheratz', 'algenib'],
      ['algenib', 'markab'],
      ['enif', 'scheat'],
    ],
  },
  {
    id: 'andromeda',
    name: 'Andromeda',
    wiki: 'Andromeda_(constellation)',
    lines: [
      ['alpheratz', 'mirach'],
      ['mirach', 'almaak'],
    ],
  },
  {
    id: 'perseus',
    name: 'Perseus',
    wiki: 'Perseus_(constellation)',
    lines: [['algol', 'mirfak']],
  },
  {
    id: 'auriga',
    name: 'Auriga',
    wiki: 'Auriga_(constellation)',
    lines: [
      ['capella', 'menkalinan'],
      ['capella', 'hassaleh'],
    ],
  },
  {
    id: 'aries',
    name: 'Aries',
    wiki: 'Aries_(constellation)',
    lines: [
      ['hamal', 'sheratan'],
      ['sheratan', 'mesarthim'],
    ],
  },
  {
    id: 'libra',
    name: 'Libra',
    wiki: 'Libra_(constellation)',
    lines: [['zubenelgenubi', 'zubeneschamali']],
  },
  {
    id: 'corvus',
    name: 'Corvus',
    wiki: 'Corvus_(constellation)',
    lines: [
      ['gienah-crv', 'algorab'],
      ['algorab', 'kraz'],
      ['kraz', 'minkar'],
      ['minkar', 'gienah-crv'],
    ],
  },
  {
    id: 'draco',
    name: 'Draco',
    wiki: 'Draco_(constellation)',
    lines: [
      ['etamin', 'rastaban'],
      ['rastaban', 'thuban'],
    ],
  },
  {
    id: 'cepheus',
    name: 'Cepheus',
    wiki: 'Cepheus_(constellation)',
    lines: [['alderamin', 'alfirk']],
  },
  {
    id: 'corona-borealis',
    name: 'Corona Borealis',
    wiki: 'Corona_Borealis',
    lines: [['alphecca', 'nusakan']],
  },
];
