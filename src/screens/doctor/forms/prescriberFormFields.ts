import { useEffect } from 'react';
import { getCountryCode } from '../../../constant/getCountryCode';

const FACILITY_KEYS = [
  'hospital_name',
  'hospital_address',
  'finess_number',
  'prescriber_finess',
] as const;

const isEmptyValue = (value: any) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '');

const isFacilityKey = (key: string) =>
  FACILITY_KEYS.includes(key as (typeof FACILITY_KEYS)[number]);

export const getPrescriberFormFields = (prescriber?: any) => {
  if (!prescriber || typeof prescriber !== 'object') {
    return {};
  }

  const phone =
    prescriber.phoneNumber ||
    prescriber.phone ||
    prescriber.mobileNumber ||
    prescriber.contactNumber ||
    '';
  const countryCode = getCountryCode(prescriber.country) || '';
  const formattedPhone = phone
    ? `${countryCode}${countryCode ? ' ' : ''}${phone}`.trim()
    : '';
  const firstName = prescriber.fName || '';
  const lastName = prescriber.lName || '';
  const facilityName =
    prescriber.facilityName ||
    prescriber.hospitalName ||
    prescriber.placeOfPractice ||
    '';
  const facilityAddress =
    prescriber.businessAddress ||
    prescriber.address ||
    prescriber.hospitalAddress ||
    '';
  const finess =
    prescriber.finessNumber || prescriber.finess || prescriber.prescriber_finess || '';

  const isResident = Boolean(
    prescriber.isMedicalResident === true ||
    prescriber.isMedicalResident === 'true' ||
    prescriber.is_medical_resident === true ||
    prescriber.is_medical_resident === 'true'
  );

  const headOfDeptFirstName =
    prescriber.headOfDepartmentFirstName ||
    prescriber.head_of_department_first_name ||
    '';
  const headOfDeptLastName =
    prescriber.headOfDepartmentLastName ||
    prescriber.head_of_department_last_name ||
    '';
  const headOfDeptFullName = [headOfDeptFirstName, headOfDeptLastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const headOfDeptName =
    prescriber.headOfDepartmentName ||
    prescriber.head_of_department_name ||
    (headOfDeptFullName ? `Dr. ${headOfDeptFullName}` : '');

  const headOfDeptRpps =
    prescriber.headOfDepartmentRppsNumber ||
    prescriber.head_of_department_rpps ||
    '';

  const rppsId = isResident
    ? (headOfDeptRpps || prescriber.rppsNumber || prescriber.rppsId || '')
    : (prescriber.rppsNumber || prescriber.rppsId || '');

  return {
    prescriber_last_name: lastName,
    prescriber_first_name: firstName,
    prescriber_phone: formattedPhone,
    prescriber_emergency_phone: formattedPhone,
    prescriber_contact_phone: formattedPhone,
    rpps_id: rppsId,
    hospital_name: facilityName,
    hospital_address: facilityAddress,
    finess_number: finess,
    prescriber_finess: finess,
    doctor_name: `${firstName} ${lastName}`.trim(),
    is_medical_resident: isResident,
    head_of_department_first_name: headOfDeptFirstName,
    head_of_department_last_name: headOfDeptLastName,
    head_of_department_name: headOfDeptName,
    head_of_department_rpps: headOfDeptRpps,
  };
};

export const fillEmptyPrescriberFields = (
  state: any,
  prescriber?: any,
  existingFormData?: any,
) => {
  const fields = getPrescriberFormFields(prescriber);
  if (!state || !Object.keys(fields).length) {
    return state;
  }

  const hasSavedForm =
    existingFormData &&
    typeof existingFormData === 'object' &&
    Object.keys(existingFormData).length > 0;

  let changed = false;
  const next = { ...state };
  Object.entries(fields).forEach(([key, value]) => {
    // Never change facility values that already exist on a saved/draft form
    if (isFacilityKey(key) && hasSavedForm) {
      return;
    }
    // Never overwrite a facility value already present on the form
    if (isFacilityKey(key) && !isEmptyValue(next[key])) {
      return;
    }
    if (!isEmptyValue(value) && isEmptyValue(next[key])) {
      next[key] = value;
      changed = true;
    }
  });

  return changed ? next : state;
};

export const usePrescriberFieldSync = (
  setState: (updater: any) => void,
  prescriber?: any,
  initialData?: any,
) => {
  const prescriberId = prescriber?.id || prescriber?._id || '';
  const existingFormData = initialData?.formData;

  useEffect(() => {
    if (!prescriber) {
      return;
    }
    setState((prev: any) =>
      fillEmptyPrescriberFields(prev, prescriber, existingFormData),
    );
  }, [prescriberId, existingFormData, setState]);
};
