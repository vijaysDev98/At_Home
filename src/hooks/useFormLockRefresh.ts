import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
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
  const isFocused = useIsFocused();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAttemptedAcquireRef = useRef(false);
  const ownsLockRef = useRef(false);

  const [ownsLock, setOwnsLock] = useState(false);

  const updateOwnsLock = (owned: boolean) => {
    ownsLockRef.current = owned;
    setOwnsLock(owned);
  };

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
    if (!isFocused || !enabled || !requestId || !currentUserId || readOnly) {
      return;
    }

    const acquireLock = async () => {
      try {
        hasAttemptedAcquireRef.current = true;

        const response = await serviceRequestApi.acquireFormLock(requestId);

        if (response?.success) {
          updateOwnsLock(true);
        } else {
          hasAttemptedAcquireRef.current = false;
        }
      } catch (error) {
        hasAttemptedAcquireRef.current = false;
      }
    };

    /**
     * Current user already owns lock
     */
    if (isLocked && lockedBy === currentUserId) {
      updateOwnsLock(true);
      return;
    }

    /**
     * Another user owns active lock
     */
    if (isLocked && lockedBy && lockedBy !== currentUserId && !isExpired()) {
      updateOwnsLock(false);
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
    isFocused,
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
    if (!isFocused || !enabled || !requestId || !ownsLock || readOnly) {
      return;
    }

    const refreshLock = async () => {
      try {
        await serviceRequestApi.refreshFormLock(requestId);
      } catch (error) {
      }
    };

    intervalRef.current = setInterval(refreshLock, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isFocused, enabled, requestId, ownsLock, readOnly]);

  /**
   * Release when the screen loses focus or unmounts so the
   * request is not left locked under this user after navigation.
   */
  useFocusEffect(
    useCallback(() => {
      return () => {
        hasAttemptedAcquireRef.current = false;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (requestId && ownsLockRef.current) {
          serviceRequestApi.releaseFormLock(requestId);
          updateOwnsLock(false);
        }
      };
    }, [requestId]),
  );
};

