export const GENDER = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export type PatientFilterType = 'All' | 'Recently Added' | 'Recently Updated';

export const PATIENT_FILTERS: PatientFilterType[] = [
  'All',
  'Recently Added',
  'Recently Updated',
];
