import { useEffect, useRef } from 'react';
import { serviceRequestApi } from '../services/serviceRequestApi';
import { SHOW_TOAST } from '../constant';

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
  useEffect(() => {
    if (!enabled || !requestId || !currentUserId || readOnly) {
      return;
    }

    const isExpired = () => {
      if (!expiresAt) return false;

      return new Date(expiresAt).getTime() <= Date.now();
    };

    const acquireLock = async () => {
      try {
        await serviceRequestApi.acquireFormLock(requestId);
        SHOW_TOAST("acquired lock");
      } catch (error) {
        console.log('Acquire lock error:', error);
      }
    };

    const refreshLock = async () => {
      try {
        await serviceRequestApi.refreshFormLock(requestId);
        SHOW_TOAST("refreshed lock");
      } catch (error) {
        console.log('Refresh lock error:', error);
      }
    };

    const releaseLock = async () => {
      try {
        await serviceRequestApi.releaseFormLock(requestId);
        SHOW_TOAST("released lock");
      } catch (error) {
        console.log('Release lock error:', error);
      }
    };

    const handleLock = async () => {
      /**
       * No active lock → acquire
       */
      if (!isLocked) {
        await acquireLock();
        return;
      }

      /**
       * Current user owns lock → refresh immediately
       */
      if (lockedBy === currentUserId) {
        await refreshLock();
        return;
      }

      /**
       * Someone else owns it but expired → acquire
       */
      if (lockedBy !== currentUserId && isExpired()) {
        await acquireLock();
        return;
      }

      /**
       * Locked by another active user
       */
      onLockConflict?.();
    };

    handleLock();

    const shouldRefresh =
      isLocked &&
      lockedBy === currentUserId;

    if (shouldRefresh) {
      intervalRef.current = setInterval(() => {
        refreshLock();
      }, 30000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (lockedBy === currentUserId) {
        releaseLock();
      }
    };
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
};