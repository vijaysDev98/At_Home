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