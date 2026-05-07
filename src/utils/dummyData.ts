import { IMAGES } from '../assets/images';
export const doctorSpecialities = [
  { label: 'General Practitioner', value: 'generalPractice' },
  { label: 'Cardiology', value: 'cardiology' },
  { label: 'Pediatrician', value: 'pediatrics' },
  { label: 'Dermatologist', value: 'dermatology' },
  { label: 'Ophthalmologist', value: 'orthopedics' },
  { label: 'Neurology', value: 'neurology' },
  { label: 'Other', value: 'other' },
];

export interface PatientListProps {
  id: string;
  name: string;
  phone: string;
  status: string;
  statusColor: string;
  statusBg: string;
  avatar?: string;
  initials?: string;
}

export const patientsList: PatientListProps[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    phone: '(555) 123-4567',
    status: 'Recently Added',
    statusColor: '#2ECA7F',
    statusBg: '#E5F7ED',
    avatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
  },
  {
    id: '2',
    name: 'Michael Chen',
    phone: '(555) 987-6543',
    status: 'Recently Updated',
    statusColor: '#FFB800',
    statusBg: '#FFF4E5',
    initials: 'MC',
  },
  {
    id: '3',
    name: 'Robert Davis',
    phone: '(555) 456-7890',
    status: 'Recently Updated',
    statusColor: '#526674',
    statusBg: '#E8EDF1',
    avatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
  },
  {
    id: '4',
    name: 'Emily Wilson',
    phone: '(555) 234-5678',
    status: 'Recently Added',
    statusColor: '#2ECA7F',
    statusBg: '#E5F7ED',
    avatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
  },
  {
    id: '5',
    name: 'James Taylor',
    phone: '(555) 876-5432',
    status: 'Recently Added',
    statusColor: '#FFB800',
    statusBg: '#FFF4E5',
    initials: 'JT',
  },
];

export const creatRequestPatientsList = [
  {
    id: 'patient_1',
    name: 'Eleanor Pena',
    avatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
    pid: '#P-8492',
    age: '68yo',
  },
  {
    id: 'patient_2',
    name: 'Albert Flores',
    avatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
    pid: '#P-3310',
    age: '42yo',
  },
  {
    id: 'patient_3',
    name: 'Kathryn Murphy',
    avatar: null,
    initials: 'KJ',
    pid: '#P-9921',
    age: '55yo',
  },
  {
    id: 'patient_4',
    name: 'Wade Warren',
    avatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
    pid: '#P-1120',
    age: '38yo',
  },
];

export type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export const services: Service[] = [
  {
    id: 'generic',
    title: 'Generic',
    description: 'General medical assessment and basic nursing care.',
    icon: IMAGES.nurseIcon,
  },
  {
    id: 'wound_care',
    title: 'Wound Care',
    description: 'Dressing changes, cleaning, and wound monitoring.',
    icon: IMAGES.bandegeIcon,
  },
  {
    id: 'iv_therapy',
    title: 'IV Therapy',
    description: 'Intravenous fluids and medication administration.',
    icon: IMAGES.injectionIcon,
  },
  {
    id: 'medical_oxygen',
    title: 'Medical Oxygen',
    description: 'Respiratory therapy and oxygen saturation monitoring.',
    icon: IMAGES.maskIcon,
  },
  {
    id: 'artificial_nutrition',
    title: 'Artificial Nutrition',
    description: 'Home nutritional supplements and enteral support.',
    icon: IMAGES.testTubeIcon,
  },
  {
    id: 'personal_hygiene',
    title: 'Personal Hygiene care',
    description: 'Assistance with daily personal care and hygiene.',
    icon: IMAGES.nurseIcon,
  },
  {
    id: 'pca',
    title: 'PCA(Pain management)',
    description: 'Patient-controlled analgesia and pain monitoring.',
    icon: IMAGES.ivfIcon,
  },
  {
    id: 'pregnancy_care',
    title: 'Pregnancy related care',
    description: 'Specialized monitoring and care during pregnancy.',
    icon: IMAGES.nurseIcon,
  },
  {
    id: 'parenteral_nutrition',
    title: 'Parenteral nutrition (central line)',
    description: 'IV nutrition support and central line management.',
    icon: IMAGES.ivfIcon,
  },
  {
    id: 'cno',
    title: 'CNO',
    description: 'Clinical Nursing Operations and specialized protocols.',
    icon: IMAGES.stethoscopeIcon,
  },
  {
    id: 'hydration_infusion',
    title: 'Hydration Infusion',
    description: 'Fluid replacement and hydration therapy.',
    icon: IMAGES.ivfIcon,
  },
  {
    id: 'antibiotherapy_infusion',
    title: 'Antibiothérapie infusion',
    description: 'IV antibiotic administration and monitoring.',
    icon: IMAGES.injectionIcon,
  },
];

export const serviceRequests = [
  {
    id: 1,
    name: 'John Doe',
    initials: 'JD',
    service: 'Physical Therapy',
    requestId: '#6534',
    formStatus: 'Draft',
    status: 'Draft',
    action: 'Continue Form',
  },
  {
    id: 2,
    name: 'John Doe',
    initials: 'JD',
    service: 'Physical Therapy',
    requestId: '#6534',
    formStatus: 'Submitted',
    status: 'Submitted',
    action: 'Update & Sign',
  },
  {
    id: 3,
    name: 'John Doe',
    initials: 'JD',
    service: 'Physical Therapy',
    requestId: '#6534',
    formStatus: 'Signed',
    status: 'Submitted',
    action: null,
  },
  {
    id: 4,
    name: 'John Doe',
    initials: 'JD',
    service: 'Physiotherapy',
    requestId: '#6534',
    formStatus: 'Signed',
    status: 'In Progress',
    action: null,
  },
  {
    id: 5,
    name: 'Alice Smith',
    initials: 'AS',
    service: 'Physiotherapy',
    requestId: '#6534',
    formStatus: 'Signed',
    status: 'Returned',
    action: 'Update & Re-sign',
  },
  {
    id: 6,
    name: 'John Doe',
    initials: 'JD',
    service: 'Physiotherapy',
    requestId: '#6534',
    formStatus: 'Signed',
    status: 'Completed',
    action: null,
  },
];
