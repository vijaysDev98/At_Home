import { STRING } from './strings';

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

export const NUTRITION_CATEGORIES = [
  { label: STRING.diabeticRange, value: 'Diabetic Range' },
  {
    label: STRING.standardCarbohydrateRange,
    value: 'Standard Carbohydrate Range',
  },
];

export const NUTRITION_PRODUCT_TYPES = [
  { label: STRING.onsDrink15KcalMl, value: 'ONS drink 1.5 kcal/ml' },
  {
    label: STRING.onsDrink15KcalMlFiber,
    value: 'ONS drink 1.5 kcal/ml + fiber',
  },
  { label: STRING.onsDrink2KcalMl, value: 'ONS drink 2 kcal/ml' },
  {
    label: STRING.onsConcentrated2KcalMl,
    value: 'ONS concentrated 2 kcal/ml',
  },
  { label: STRING.onsCream15KcalMl, value: 'ONS cream 1.5 kcal/ml' },
  { label: STRING.onsSoup15Kcal, value: 'ONS soup 1.5 kcal' },
  {
    label: STRING.blendedHighProteinMeal,
    value: 'Blended high-protein meal (300g, 500 kcal)',
  },
  { label: STRING.fruitJuiceOns, value: 'Fruit juice ONS' },
  {
    label: STRING.compote250Kcal,
    value: 'Compote (250 kcal, 6–9g protein)',
  },
];
