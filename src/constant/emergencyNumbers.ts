// Ambulance / medical emergency numbers by ISO 3166-1 alpha-2 country code.
// 112 is the EU-wide emergency number and is the fallback for countries not listed.
export interface EmergencyNumbers {
  ambulance: string;
  secondary?: string;
}

const EU_112: EmergencyNumbers = { ambulance: '112' };

const EMERGENCY_NUMBERS: Record<string, EmergencyNumbers> = {
  // France and overseas departments
  FR: { ambulance: '15', secondary: '112' },
  RE: { ambulance: '15', secondary: '112' },
  GP: { ambulance: '15', secondary: '112' },
  MQ: { ambulance: '15', secondary: '112' },
  GF: { ambulance: '15', secondary: '112' },
  YT: { ambulance: '15', secondary: '112' },
  PF: { ambulance: '15', secondary: '112' },
  NC: { ambulance: '15', secondary: '112' },
  // Europe (112)
  BE: EU_112,
  DE: EU_112,
  ES: EU_112,
  IT: EU_112,
  NL: EU_112,
  PT: EU_112,
  IE: EU_112,
  AT: EU_112,
  LU: EU_112,
  GR: EU_112,
  PL: EU_112,
  SE: EU_112,
  DK: EU_112,
  FI: EU_112,
  CZ: EU_112,
  HU: EU_112,
  RO: EU_112,
  // Other major countries
  GB: { ambulance: '999', secondary: '112' },
  US: { ambulance: '911' },
  CA: { ambulance: '911' },
  CH: { ambulance: '144', secondary: '112' },
  AU: { ambulance: '000' },
  NZ: { ambulance: '111' },
  IN: { ambulance: '108', secondary: '112' },
  AE: { ambulance: '998', secondary: '112' },
  SA: { ambulance: '997', secondary: '112' },
  MA: { ambulance: '15', secondary: '112' },
};

const normalizeCountryCode = (country?: string | null): string => {
  const value = (country || '').trim().toUpperCase();
  if (value.length === 2) return value;
  if (value.length > 3) return value.slice(0, 2);
  return value;
};

export const getEmergencyNumbers = (country?: string | null): EmergencyNumbers => {
  const code = normalizeCountryCode(country);
  return EMERGENCY_NUMBERS[code] || EU_112;
};
