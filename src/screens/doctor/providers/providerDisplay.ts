import { Provider } from './providerTypes';
import { doctorSpecialities } from '../../../utils/dummyData';
import { getServiceDetails } from '../../../constant/services';

export interface ProviderServiceItem {
  id: string;
  name: string;
  description: string;
}

export const getProviderDisplayName = (
  provider: Provider,
  t?: (key: string) => string,
): string => {
  const fallback = t ? t('Healthcare Provider') : 'Healthcare Provider';
  return (
    provider.providerName ||
    provider.fullName ||
    `${provider.fName || ''} ${provider.lName || ''}`.trim() ||
    fallback
  );
};

export const getProviderSpecialty = (
  provider: Provider,
  t?: (key: string) => string,
): string => {
  const rawSpecialty =
    provider.specialty ||
    provider.profession ||
    '';

  if (!rawSpecialty) {
    if (provider.roles?.includes('serviceProvider')) {
      return t ? t('Healthcare Provider') : 'Healthcare Provider';
    }
    return '';
  }

  // 1. Check if it matches a doctorSpeciality enum value or label
  const matchedSpec = doctorSpecialities.find(
    s =>
      s.value === rawSpecialty ||
      s.label.toLowerCase() === rawSpecialty.toLowerCase(),
  );
  if (matchedSpec) {
    return t ? t(matchedSpec.label) : matchedSpec.label;
  }

  // 2. Return translated raw string
  return t ? t(rawSpecialty) : rawSpecialty;
};

export const getProviderServiceLabels = (provider: Provider): string[] => {
  const raw = provider.serviceDetails || provider.assignedServices || [];
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map(item => {
      if (typeof item === 'string') {
        return item;
      }
      return item?.serviceName || item?.name || '';
    })
    .filter(Boolean);
};

export const getProviderServiceItems = (
  provider: Provider,
): ProviderServiceItem[] => {
  const raw = provider.serviceDetails || provider.assignedServices || [];
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map(item => {
      if (typeof item === 'string') {
        const details = getServiceDetails(item);
        return {
          id: details.id,
          name: details.name || item,
          description: details.description || '',
        };
      }
      if (item && typeof item === 'object') {
        const serviceName = item.serviceName || item.name || '';
        const details = getServiceDetails(item);
        return {
          id: (item as any)._id || (item as any).id || details.id,
          name: serviceName || details.name,
          description: item.description || details.description || '',
        };
      }
      return null;
    })
    .filter((s): s is ProviderServiceItem => !!s && !!s.name);
};

