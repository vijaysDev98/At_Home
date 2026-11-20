import { Storage } from '../constant/storage';
import { API } from '../api';

export interface ProviderContactEvent {
  id: string; // place_id or provider._id
  name: string;
  phone?: string;
  category?: 'ambulance' | 'provider';
  timestamp: number;
}

export interface ProviderContactSummary {
  byId: Record<string, number>;
  byPhone: Record<string, number>;
  totalContacts: number;
  maxContactCount: number;
  frequentlyContactedName?: string;
}

const cleanPhone = (phone?: string) => (phone || '').replace(/[^\d+]/g, '');

const getStorageKey = (userId?: string) => {
  const safeId = (userId || 'current_user').trim();
  return `@provider_contacts_${safeId}`;
};

/**
 * Record a contact event with an ambulance provider.
 * 1. Persists locally in Storage for immediate local availability.
 * 2. Syncs to the backend via POST /common/nearby-places/log-contact so it survives re-installs.
 */
export const recordProviderContact = async (
  userId: string | undefined,
  event: {
    id: string;
    name: string;
    phone?: string;
    category?: 'ambulance' | 'provider';
  },
): Promise<void> => {
  try {
    const key = getStorageKey(userId);
    const raw = await Storage.get(key);
    let history: ProviderContactEvent[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          history = parsed;
        }
      } catch {}
    }

    // Keep up to 30 days of data, discard older records
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    history = history.filter(item => item && item.timestamp >= thirtyDaysAgo);

    history.push({
      id: event.id,
      name: event.name,
      phone: event.phone,
      category: event.category || 'ambulance',
      timestamp: Date.now(),
    });

    await Storage.save(key, JSON.stringify(history));

    // Sync to backend database so history survives app uninstalls
    API.Instance.post(API.API_ROUTES.nearbyPlaces + '/log-contact', {
      placeId: event.id,
      providerName: event.name,
      phone: event.phone,
      category: event.category || 'ambulance',
    }).catch(e => {
      console.log('Unable to sync contact to backend:', e?.message || e);
    });
  } catch (error) {
    console.log('Error recording provider contact:', error);
  }
};

/**
 * Get aggregated contact counts for the logged-in doctor in the last N days (default: 7 days).
 * 1. Reads local cache first for zero latency.
 * 2. Fetches authoritative counts & logs from backend (GET /common/nearby-places/contact-counts)
 *    so counts are fully restored even after app uninstalls or device changes.
 * 3. Rehydrates local storage cache with backend records.
 */
export const getProviderContactSummary = async (
  userId: string | undefined,
  days: number = 7,
): Promise<ProviderContactSummary> => {
  const result: ProviderContactSummary = {
    byId: {},
    byPhone: {},
    totalContacts: 0,
    maxContactCount: 0,
  };

  const key = getStorageKey(userId);

  // 1. Check local storage cache first
  try {
    const raw = await Storage.get(key);
    if (raw) {
      const history: ProviderContactEvent[] = JSON.parse(raw);
      if (Array.isArray(history)) {
        const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
        const recent = history.filter(
          item => item && item.timestamp >= threshold,
        );

        result.totalContacts = recent.length;

        for (const item of recent) {
          if (item.id) {
            result.byId[item.id] = (result.byId[item.id] || 0) + 1;
            if (result.byId[item.id] > result.maxContactCount) {
              result.maxContactCount = result.byId[item.id];
              result.frequentlyContactedName = item.name;
            }
          }
          const phone = cleanPhone(item.phone);
          if (phone) {
            result.byPhone[phone] = (result.byPhone[phone] || 0) + 1;
            if (result.byPhone[phone] > result.maxContactCount) {
              result.maxContactCount = result.byPhone[phone];
              result.frequentlyContactedName = item.name;
            }
          }
        }
      }
    }
  } catch (error) {
    console.log('Error reading local provider contact cache:', error);
  }

  // 2. Fetch authoritative counts from the backend API (survives app re-install)
  try {
    const response: any = await API.Instance.get(
      API.API_ROUTES.nearbyPlaces + '/contact-counts',
      { params: { days } },
    );

    const remoteData = response?.data?.data || response?.data;
    if (remoteData?.byId && typeof remoteData.byId === 'object') {
      for (const [placeId, count] of Object.entries(remoteData.byId)) {
        const numCount = Number(count) || 0;
        result.byId[placeId] = Math.max(result.byId[placeId] || 0, numCount);
        if (result.byId[placeId] > result.maxContactCount) {
          result.maxContactCount = result.byId[placeId];
        }
      }
    }

    if (remoteData?.byPhone && typeof remoteData.byPhone === 'object') {
      for (const [phone, count] of Object.entries(remoteData.byPhone)) {
        const numCount = Number(count) || 0;
        result.byPhone[phone] = Math.max(result.byPhone[phone] || 0, numCount);
        if (result.byPhone[phone] > result.maxContactCount) {
          result.maxContactCount = result.byPhone[phone];
        }
      }
    }

    if (Number.isFinite(remoteData?.totalContacts)) {
      result.totalContacts = Math.max(
        result.totalContacts,
        remoteData.totalContacts,
      );
    }

    // Rehydrate local storage cache if backend returned logs
    if (Array.isArray(remoteData?.logs) && remoteData.logs.length > 0) {
      await Storage.save(key, JSON.stringify(remoteData.logs));
    }
  } catch (apiError) {
    // If backend is momentarily unreachable, fallback to local cache
  }

  return result;
};

/**
 * Helper to get the 7-day contact count for a specific provider by id or phone.
 */
export const getContactCountFor = (
  summary: ProviderContactSummary | null | undefined,
  id?: string,
  phone?: string,
): number => {
  if (!summary) return 0;
  if (id && summary.byId[id]) {
    return summary.byId[id];
  }
  const cleaned = cleanPhone(phone);
  if (cleaned && summary.byPhone[cleaned]) {
    return summary.byPhone[cleaned];
  }
  return 0;
};
