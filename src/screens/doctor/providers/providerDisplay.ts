import { Provider } from './providerTypes';

export const getProviderDisplayName = (provider: Provider): string => {
  return (
    provider.providerName ||
    provider.fullName ||
    `${provider.fName || ''} ${provider.lName || ''}`.trim() ||
    'Healthcare Provider'
  );
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
