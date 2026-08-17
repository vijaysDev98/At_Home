import { IMAGES } from '../assets/images';
import { COLORS } from '../utils';

export interface ServiceConfig {
  id: string;
  name: string;
  bgColor: string;
  icon: any;
  description: string;
}

const imgs = IMAGES as any;

export const getServiceIcon = (id: string) => {
  switch (id) {
    case '69ef359fd1c1c4252d4b8d4f': // Antibiotherapy Infusion
      return IMAGES.injectionIcon;
    case '69ef3557d1c1c4252d4b8d2c': // Artificial Nutrition
      return IMAGES.testTubeIcon;
    case '69ef3589d1c1c4252d4b8d45': // CNO
      return IMAGES.nurseIcon;
    case '69eb112a056b86c571c1a44f': // Generic
      return IMAGES.ic_generic;
    case '69ef3592d1c1c4252d4b8d4a': // Hydration Infusion
      return IMAGES.ivfIcon;
    case '69ef353fd1c1c4252d4b8d22': // IV Therapy
      return IMAGES.ivfIcon;
    case '69ef354cd1c1c4252d4b8d27': // Medical Oxygen
      return imgs.ic_oxygen_card || IMAGES.maskIcon;
    case '69ef356cd1c1c4252d4b8d36': // PCA (Pain Management)
      return imgs.ic_pain_mgmt_card || IMAGES.ivfIcon;
    case '69ef357cd1c1c4252d4b8d40': // Parenteral Nutrition (Central Line)
      return IMAGES.testTubeIcon || IMAGES.nurseIcon;
    case '69ef3563d1c1c4252d4b8d31': // Personal Hygiene Care
      return IMAGES.nurseIcon;
    case '69ef3575d1c1c4252d4b8d3b': // Pregnancy Related Care
      return IMAGES.ic_medKit || IMAGES.nurseIcon;
    case '69ef3534d1c1c4252d4b8d1d': // Wound Care
      return imgs.ic_wound_care_card || IMAGES.bandegeIcon;
    default:
      return IMAGES.nurseIcon;
  }
};

export const MASTER_SERVICES_LIST: ServiceConfig[] = [
  {
    id: '69ef359fd1c1c4252d4b8d4f',
    name: 'Antibiotherapy Infusion',
    bgColor: COLORS._0072CE,
    icon: imgs.ic_antibiotic_card || IMAGES.injectionIcon,
    description: 'Administration of antibiotics through infusion therapy',
  },
  {
    id: '69ef3557d1c1c4252d4b8d2c',
    name: 'Artificial Nutrition',
    bgColor: COLORS._F5B700,
    icon: imgs.ic_nutrition_card || IMAGES.testTubeIcon,
    description: 'Nutritional support through medical methods such as enteral feeding',
  },
  {
    id: '69ef3589d1c1c4252d4b8d45',
    name: 'CNO',
    bgColor: COLORS._059669,
    icon: IMAGES.treatmentIcon || IMAGES.nurseIcon,
    description: 'Care coordination and nursing oversight services',
  },
  {
    id: '69eb112a056b86c571c1a44f',
    name: 'Generic',
    bgColor: COLORS._E11D48,
    icon: IMAGES.document_icon || IMAGES.nurseIcon,
    description: 'Basic general care service',
  },
  {
    id: '69ef3592d1c1c4252d4b8d4a',
    name: 'Hydration Infusion',
    bgColor: COLORS._87C038,
    icon: imgs.ic_infusion_card || IMAGES.ivfIcon,
    description: 'Fluid infusion therapy for hydration and recovery',
  },
  {
    id: '69ef353fd1c1c4252d4b8d22',
    name: 'IV Therapy',
    bgColor: COLORS._7C3AED,
    icon: IMAGES.ivfIcon,
    description: 'Intravenous therapy for fluids, medications, and nutrients',
  },
  {
    id: '69ef354cd1c1c4252d4b8d27',
    name: 'Medical Oxygen',
    bgColor: COLORS._008B8B,
    icon: imgs.ic_oxygen_card || IMAGES.maskIcon,
    description: 'Provision and monitoring of oxygen therapy for patients',
  },
  {
    id: '69ef356cd1c1c4252d4b8d36',
    name: 'PCA (Pain Management)',
    bgColor: COLORS._721C63,
    icon: imgs.ic_pain_mgmt_card || IMAGES.ivfIcon,
    description: 'Patient-controlled analgesia and pain management services',
  },
  {
    id: '69ef357cd1c1c4252d4b8d40',
    name: 'Parenteral Nutrition (Central Line)',
    bgColor: COLORS._D97706,
    icon: IMAGES.testTubeIcon || IMAGES.nurseIcon,
    description: 'Nutritional support administered through a central venous line',
  },
  {
    id: '69ef3563d1c1c4252d4b8d31',
    name: 'Personal Hygiene Care',
    bgColor: COLORS._0284C7,
    icon: IMAGES.nurseIcon,
    description: 'Assistance with daily hygiene activities like bathing and grooming',
  },
  {
    id: '69ef3575d1c1c4252d4b8d3b',
    name: 'Pregnancy Related Care',
    bgColor: COLORS._EC4899,
    icon: IMAGES.ic_medKit || IMAGES.nurseIcon,
    description: 'Care and monitoring services for pregnant patients',
  },
  {
    id: '69ef3534d1c1c4252d4b8d1d',
    name: 'Wound Care',
    bgColor: COLORS._EE6C20,
    icon: imgs.ic_wound_care_card || IMAGES.bandegeIcon,
    description: 'Treatment and management of wounds including dressing and healing support',
  },
];

export const getServiceDetails = (serviceOrId: any): ServiceConfig => {
  if (!serviceOrId) return MASTER_SERVICES_LIST[0];

  const id = typeof serviceOrId === 'string' ? serviceOrId : serviceOrId?.id;
  const name = typeof serviceOrId === 'object' ? serviceOrId?.name || serviceOrId?.serviceName : '';

  let match = MASTER_SERVICES_LIST.find(s => s.id === id);
  if (!match && name) {
    const lowerName = name.toLowerCase();
    match = MASTER_SERVICES_LIST.find(
      s => s.name.toLowerCase().includes(lowerName) || lowerName.includes(s.name.toLowerCase())
    );
  }

  if (match) return match;

  return {
    id: id || 'default',
    name: name || 'Medical Service',
    bgColor: '#526674',
    icon: getServiceIcon(id || 'default'),
    description: 'Professional healthcare discharge support service.',
  };
};
