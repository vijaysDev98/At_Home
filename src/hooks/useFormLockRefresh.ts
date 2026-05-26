import { useEffect, useRef } from 'react';
import { serviceRequestApi } from '../services/serviceRequestApi';

interface UseFormLockRefreshProps {
  requestId?: string;
  isLocked?: boolean;
  lockedBy?: string;
  currentUserId?: string;
  readOnly?: boolean;
}

/**
 * Custom hook to refresh form lock every 45 seconds
 * Prevents lock expiration (60s timeout) while user is actively editing
 * Only refreshes if current user is the lock owner
 */
export const useFormLockRefresh = ({
  requestId,
  isLocked,
  lockedBy,
  currentUserId,
  readOnly = false,
}: UseFormLockRefreshProps) => {

  const lockRefreshIntervalRef = useRef<any>(null);

  useEffect(() => {
    // Exit early if conditions not met
    if (readOnly || !requestId || !isLocked) {
      return;
    }

    // Only refresh if current user is the lock owner
    if (!lockedBy || !currentUserId || lockedBy !== currentUserId) {
      return;
    }

    const refreshLock = async () => {
      try {
        await serviceRequestApi.refreshFormLock(requestId);
        console.log('Form lock refreshed');
      } catch (error) {
        console.log('Error refreshing form lock:', error);
      }
    };

    // Start refresh interval every 55 seconds (5s buffer before 60s auto-unlock)
    lockRefreshIntervalRef.current = setInterval(refreshLock, 55000);

    // Cleanup: clear interval on unmount or when dependencies change
    return () => {
      if (lockRefreshIntervalRef.current) {
        clearInterval(lockRefreshIntervalRef.current);
        lockRefreshIntervalRef.current = null;
      }
    };
  }, [requestId, isLocked, lockedBy, currentUserId, readOnly]);
};
