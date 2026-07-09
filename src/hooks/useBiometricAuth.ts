import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  isSensorAvailable,
  authenticateWithOptions,
} from '@sbaiahmed1/react-native-biometrics';

/**
 * useBiometricAuth
 * -----------------
 * Gate any sensitive action (e.g. initiating a signature) behind
 * biometric authentication, automatically falling back to the
 * device's PIN / passcode / pattern if:
 *   - no biometric hardware exists,
 *   - no biometrics are enrolled,
 *   - biometric auth fails/is cancelled and device fallback is allowed.
 *
 * Usage:
 *   const { authenticate, isAuthenticating, error } = useBiometricAuth();
 *
 *   const onSignPress = async () => {
 *     const ok = await authenticate({ reason: 'Confirm to sign this document' });
 *     if (ok) startSignatureProcess();
 *   };
 */

export type BiometricAuthOutcome = {
  success: boolean;
  /** How the user actually authenticated, when determinable */
  method: 'biometric' | 'device_credential' | 'unknown' | 'none';
  /** Human readable error, if any */
  error?: string;
  /** Raw platform error code, if any */
  errorCode?: string;
};

export type UseBiometricAuthOptions = {
  /** Title shown in the auth dialog */
  title?: string;
  /** Subtitle shown in the auth dialog */
  subtitle?: string;
  /** Extra description text (iOS mostly ignores, Android shows it) */
  description?: string;
  /** Text for the cancel button */
  cancelLabel?: string;
  /**
   * If true (default), device PIN/passcode/pattern is accepted as a
   * fallback whenever biometrics are unavailable or fail. Set to false
   * for "biometrics-only, no fallback" high-security flows.
   */
  allowDeviceCredentials?: boolean;
};

type AuthenticateArgs = {
  /** Overrides `subtitle`/`description` for this specific call, e.g. "Confirm to sign Invoice #123" */
  reason?: string;
} & Partial<UseBiometricAuthOptions>;

const DEFAULTS: Required<Omit<UseBiometricAuthOptions, 'description'>> & {
  description?: string;
} = {
  title: 'Verify your identity',
  subtitle: 'Authenticate to continue',
  description: undefined,
  cancelLabel: 'Cancel',
  allowDeviceCredentials: true,
};

export function useBiometricAuth(defaultOptions: UseBiometricAuthOptions = {}) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometryType, setBiometryType] = useState<string | undefined>(undefined);

  // avoid double-trigger if the caller taps twice quickly
  const inFlight = useRef(false);

  const options = { ...DEFAULTS, ...defaultOptions };

  /**
   * Checks whether the device has usable biometrics AND/OR a device
   * passcode set. Useful for deciding up-front whether to show the
   * "secure action" UI at all, or force a "please set a passcode" message.
   */
  const checkAvailability = useCallback(async () => {
    try {
      const sensorInfo = await isSensorAvailable();
      setBiometryType(sensorInfo.biometryType);
      return sensorInfo; // { available, biometryType, isDeviceSecure, error, errorCode }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to check biometric availability');
      return null;
    }
  }, []);

  /**
   * Runs the authentication flow:
   *  1. Checks sensor availability.
   *  2. If biometrics are available -> prompts biometrics, with device
   *     credential fallback enabled (unless explicitly disabled).
   *  3. If biometrics are NOT available but the device has a passcode
   *     set -> goes straight to the device-credential prompt so the
   *     user isn't shown a dead-end biometric dialog.
   *  4. If neither biometrics nor a device passcode exist -> fails
   *     with a clear reason so the caller can show its own fallback
   *     (e.g. app password) or block the action.
   */
  const authenticate = useCallback(
    async (args: AuthenticateArgs = {}): Promise<BiometricAuthOutcome> => {
      if (inFlight.current) {
        return { success: false, method: 'none', error: 'Authentication already in progress' };
      }

      inFlight.current = true;
      setIsAuthenticating(true);
      setError(null);

      const merged = { ...options, ...args };
      const promptSubtitle = args.reason ?? merged.subtitle;

      try {
        const sensorInfo = await isSensorAvailable();
        setBiometryType(sensorInfo.biometryType);

        const hasBiometrics = sensorInfo.available;
        const hasDeviceCredential = sensorInfo.isDeviceSecure;

        // Nothing the OS can use to verify identity -> nothing we can do here.
        if (!hasBiometrics && !hasDeviceCredential) {
          const message =
            'No biometrics enrolled and no device passcode set. Please set up a screen lock in your device settings.';
          setError(message);
          return {
            success: false,
            method: 'none',
            error: message,
            errorCode: sensorInfo.errorCode,
          };
        }

        // allowDeviceCredentials lets the OS prompt fall back to PIN/passcode/
        // pattern automatically if biometrics fail, are cancelled, or (on
        // Android) if there's no biometric hardware at all — the OS just
        // shows the device-credential UI directly in that case.
        const result: AuthResult = await authenticateWithOptions({
          title: merged.title,
          subtitle: promptSubtitle,
          description: merged.description,
          cancelLabel: merged.cancelLabel,
          fallbackLabel: Platform.select({ ios: 'Use Passcode', android: 'Use PIN' }),
          allowDeviceCredentials: merged.allowDeviceCredentials,
          disableDeviceFallback: !merged.allowDeviceCredentials,
          returnAuthType: true,
        });

        if (!result.success) {
          setError(result.error ?? 'Authentication failed');
          return {
            success: false,
            method: 'none',
            error: result.error,
            errorCode: result.errorCode,
          };
        }

        const method: BiometricAuthOutcome['method'] =
          result.authType === 'DeviceCredential' || result.authType === 'Passcode'
            ? 'device_credential'
            : result.authType
              ? 'biometric'
              : 'unknown';

        return { success: true, method };
      } catch (e: any) {
        const message = e?.message ?? 'Unexpected authentication error';
        setError(message);
        return { success: false, method: 'none', error: message };
      } finally {
        inFlight.current = false;
        setIsAuthenticating(false);
      }
    },
    [options]
  );

  return {
    /** Call this before starting the sensitive action (e.g. signature init) */
    authenticate,
    /** Check hardware/enrollment/passcode status without prompting */
    checkAvailability,
    isAuthenticating,
    error,
    biometryType, // 'FaceID' | 'TouchID' | 'Fingerprint' | 'Biometrics' | undefined
  };
}