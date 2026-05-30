import { Platform } from 'react-native';

type WebOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

type PermissionCapableOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

export async function startWebTiltingCompass(setHeading: (heading: number | null) => void) {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
    return null;
  }

  const orientationEvent = DeviceOrientationEvent as PermissionCapableOrientationEvent;
  if (typeof orientationEvent.requestPermission === 'function') {
    const permission = await orientationEvent.requestPermission();
    if (permission !== 'granted') {
      setHeading(null);
      return null;
    }
  }

  const handleOrientation = (event: WebOrientationEvent) => {
    const iOSCompassHeading = event.webkitCompassHeading;
    const alphaHeading = typeof event.alpha === 'number' ? 360 - event.alpha : null;
    const nextHeading =
      typeof iOSCompassHeading === 'number' && iOSCompassHeading >= 0
        ? iOSCompassHeading
        : alphaHeading;

    setHeading(typeof nextHeading === 'number' && Number.isFinite(nextHeading) ? nextHeading : null);
  };

  window.addEventListener('deviceorientation', handleOrientation, true);

  return () => {
    window.removeEventListener('deviceorientation', handleOrientation, true);
  };
}
