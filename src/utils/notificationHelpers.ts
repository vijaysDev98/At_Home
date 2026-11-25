/** In-app adminManual notifications that celebrate account approval / activation (not warnings). */
export const isPositiveAdminAccountNotification = (
  type: string,
  metadata?: Record<string, unknown> | null,
  title?: string,
): boolean => {
  if (type !== 'adminManual') {
    return false;
  }

  const status = metadata?.status;
  if (status === 'approved' || status === 'active') {
    return true;
  }
  if (metadata?.activatedAt != null) {
    return true;
  }

  const normalizedTitle = (title || '').trim().toLowerCase();
  const approvalTitleHints = [
    'registration approved',
    'inscription approuvée',
    'account activated',
    'compte activé',
    'account approved',
  ];
  return approvalTitleHints.some(hint => normalizedTitle.includes(hint));
};