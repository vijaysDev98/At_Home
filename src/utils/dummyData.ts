import { IMAGES } from "../assets/images";

export const doctorSpecialities = [
  { label: 'General Practitioner', value: 'General Practitioner' },
  { label: 'Cardiologist', value: 'Cardiologist' },
  { label: 'Pediatrician', value: 'Pediatrician' },
  { label: 'Neurologist', value: 'Neurologist' },
  { label: 'Dermatologist', value: 'Dermatologist' },
  { label: 'Ophthalmologist', value: 'Ophthalmologist' },
]



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
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
    pid: '#P-8492',
    age: '68yo',
  },
  {
    id: 'patient_2',
    name: 'Albert Flores',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
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
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
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
  { id: 'wound', title: 'Wound Care', description: 'Dressing changes, cleaning, and monitoring.', icon: IMAGES.bandegeIcon },
  { id: 'iv', title: 'IV Therapy', description: 'Intravenous fluids and medication admin.', icon: IMAGES.ivfIcon },
  { id: 'oxygen', title: 'Oxygen Support', description: 'Respiratory therapy and monitoring.', icon: IMAGES.maskIcon },
  { id: 'nursing', title: 'General Nursing', description: 'Vital signs, medication, daily care.', icon: IMAGES.nurseIcon },
  { id: 'physio', title: 'Physiotherapy', description: 'Rehabilitation and mobility exercises.', icon: IMAGES.injectionIcon },
  { id: 'lab', title: 'Lab Collection', description: 'Blood draws and sample collection.', icon: IMAGES.testTubeIcon },
];


export const serviceRequests = [
  {
    id: 1,
    name: "John Doe",
    initials: "JD",
    service: "Physical Therapy",
    requestId: "#6534",
    formStatus: "Draft",
    status: "Draft",
    action: "Continue Form",
  },
  {
    id: 2,
    name: "John Doe",
    initials: "JD",
    service: "Physical Therapy",
    requestId: "#6534",
    formStatus: "Submitted",
    status: "Submitted",
    action: "Update & Sign",
  },
  {
    id: 3,
    name: "John Doe",
    initials: "JD",
    service: "Physical Therapy",
    requestId: "#6534",
    formStatus: "Signed",
    status: "Submitted",
    action: null,
  },
  {
    id: 4,
    name: "John Doe",
    initials: "JD",
    service: "Physiotherapy",
    requestId: "#6534",
    formStatus: "Signed",
    status: "In Progress",
    action: null,
  },
  {
    id: 5,
    name: "Alice Smith",
    initials: "AS",
    service: "Physiotherapy",
    requestId: "#6534",
    formStatus: "Signed",
    status: "Returned",
    action: "Update & Re-sign",
  },
  {
    id: 6,
    name: "John Doe",
    initials: "JD",
    service: "Physiotherapy",
    requestId: "#6534",
    formStatus: "Signed",
    status: "Completed",
    action: null,
  },
];