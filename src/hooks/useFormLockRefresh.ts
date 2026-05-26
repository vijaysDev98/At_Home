import { useEffect, useRef, useState } from 'react';
import { serviceRequestApi } from '../services/serviceRequestApi';

interface UseFormLockRefreshProps {
  requestId?: string;
  isLocked?: boolean;
  lockedBy?: string;
  expiresAt?: string;
  currentUserId?: string;
  readOnly?: boolean;
  enabled?: boolean;
  onLockConflict?: () => void;
}

export const useFormLockRefresh = ({
  requestId,
  isLocked,
  lockedBy,
  expiresAt,
  currentUserId,
  readOnly = false,
  enabled = true,
  onLockConflict,
}: UseFormLockRefreshProps) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAttemptedAcquireRef = useRef(false);

  const [ownsLock, setOwnsLock] = useState(false);

  /**
   * null expiresAt is treated as expired
   */
  const isExpired = () => {
    if (!expiresAt) return true;

    return new Date(expiresAt).getTime() <= Date.now();
  };

  /**
   * Acquire / detect lock ownership
   */
  useEffect(() => {
    if (!enabled || !requestId || !currentUserId || readOnly) {
      return;
    }

    const acquireLock = async () => {
      try {
        hasAttemptedAcquireRef.current = true;

        const response = await serviceRequestApi.acquireFormLock(requestId);

        if (response?.success) {
          setOwnsLock(true);
        } else {
          hasAttemptedAcquireRef.current = false;
        }
      } catch (error) {
        hasAttemptedAcquireRef.current = false;
        console.log('Acquire lock error:', error);
      }
    };

    /**
     * Current user already owns lock
     */
    if (isLocked && lockedBy === currentUserId) {
      setOwnsLock(true);
      return;
    }

    /**
     * Another user owns active lock
     */
    if (isLocked && lockedBy && lockedBy !== currentUserId && !isExpired()) {
      setOwnsLock(false);
      onLockConflict?.();
      return;
    }

    /**
     * unlocked OR expired OR expiresAt missing
     */
    if ((!isLocked || isExpired()) && !hasAttemptedAcquireRef.current) {
      acquireLock();
    }
  }, [
    enabled,
    requestId,
    isLocked,
    lockedBy,
    expiresAt,
    currentUserId,
    readOnly,
    onLockConflict,
  ]);

  /**
   * Refresh every 30s while current user owns lock
   */
  useEffect(() => {
    if (!enabled || !requestId || !ownsLock || readOnly) {
      return;
    }

    const refreshLock = async () => {
      try {
        await serviceRequestApi.refreshFormLock(requestId);
      } catch (error) {
        console.log('Refresh lock error:', error);
      }
    };

    intervalRef.current = setInterval(refreshLock, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, requestId, ownsLock, readOnly]);

  /**
   * Release on unmount only
   */
  useEffect(() => {
    return () => {
      if (requestId && ownsLock) {
        serviceRequestApi.releaseFormLock(requestId);
      }
    };
  }, [requestId, ownsLock]);
};
