export const capitalizeFirstLetter = (text: string) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const isTruthyFlag = (value: any) =>
  value === true || value === 1 || value === '1' || value === 'true';

export const isDelegatedToProvider = (item?: any): boolean => {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const candidates = [
    item.delegateFormToProvider,
    item.delegatedToProvider,
    item.isDelegatedToProvider,
    item.formDelegatedToProvider,
    item.delegateToProvider,
    item.isFormDelegated,
    item.formDelegated,
    item.delegate_form_to_provider,
    item.delegated_to_provider,
    item.is_delegated_to_provider,
    item.preRequest?.delegateFormToProvider,
    item.metadata?.delegateFormToProvider,
  ];

  return candidates.some(isTruthyFlag);
};
