import { countryCodes } from "react-native-country-codes-picker";

export const getCountryCode = (country?: string): string => {
    if (!country) return '+1'; // Default to US

    const countryData = countryCodes.find(
        item =>
            item.code?.toLowerCase() === country.toLowerCase() ||
            item.name?.en?.toLowerCase() === country.toLowerCase()
    );

    return countryData?.dial_code || '+1';
};

const findStoredDialCode = (country?: string | null): string | null => {
  const value = String(country || '').trim();
  if (!value) return null;
  const countryData = countryCodes.find(
    item =>
      item.code?.toLowerCase() === value.toLowerCase() ||
      item.name?.en?.toLowerCase() === value.toLowerCase(),
  );
  return countryData?.dial_code || null;
};

export const toDialablePhone = (
  phone?: string | null,
  country?: string | null,
): string => {
  const compact = String(phone || '').replace(/[^\d+]/g, '');
  if (!compact) return '';

  const dialCode = findStoredDialCode(country);
  if (!dialCode) return compact;

  const dialDigits = dialCode.replace(/\D/g, '');
  let national = compact.replace(/^\+/, '').replace(/^00/, '');
  if (dialDigits && national.startsWith(dialDigits)) {
    national = national.slice(dialDigits.length);
  }
  national = national.replace(/^0+/, '');
  return `${dialCode}${national}`;
};