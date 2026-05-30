import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import { fetchIndigenousContextByCoordinates } from '@/services/native-land-api';
import type { IndigenousContextData } from '@/types/parks';

export const JOURNEY_MODE_TASK_NAME = 'journey-mode-location-task';

const JOURNEY_MODE_ENABLED_KEY = 'journeyModeEnabled';
const JOURNEY_MODE_SIGNATURE_KEY = 'journeyModeLastTerritorySignature';
const JOURNEY_MODE_LAST_CHECK_KEY = 'journeyModeLastCheck';
const JOURNEY_MODE_LAST_EVENT_KEY = 'journeyModeLastEvent';

export type JourneyModeEvent = {
  previousSignature: string;
  nextSignature: string;
  checkedAt: string;
  latitude: number;
  longitude: number;
};

export function getTerritorySignature(context: IndigenousContextData | null) {
  if (!context) {
    return '';
  }

  return [...context.territories]
    .map((territory) => territory.trim().toLowerCase())
    .filter((territory) => territory.length > 0)
    .sort((left, right) => left.localeCompare(right))
    .join('|');
}

export async function getJourneyModeEnabled() {
  return (await AsyncStorage.getItem(JOURNEY_MODE_ENABLED_KEY)) === 'true';
}

export async function setJourneyModeEnabled(enabled: boolean) {
  await AsyncStorage.setItem(JOURNEY_MODE_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function getJourneyModeLastCheck() {
  return AsyncStorage.getItem(JOURNEY_MODE_LAST_CHECK_KEY);
}

export async function setJourneyModeLastCheck(checkedAt: string) {
  await AsyncStorage.setItem(JOURNEY_MODE_LAST_CHECK_KEY, checkedAt);
}

export async function setJourneyModeBaseline(context: IndigenousContextData | null) {
  const signature = getTerritorySignature(context);
  if (signature) {
    await AsyncStorage.setItem(JOURNEY_MODE_SIGNATURE_KEY, signature);
  }
}

export async function getLastJourneyModeEvent() {
  const stored = await AsyncStorage.getItem(JOURNEY_MODE_LAST_EVENT_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as JourneyModeEvent;
  } catch {
    return null;
  }
}

export async function configureNotificationBehavior() {
  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestJourneyModePermissions() {
  const Notifications = await import('expo-notifications');
  const notificationPermission = await Notifications.requestPermissionsAsync();
  const backgroundAvailable = await Location.isBackgroundLocationAvailableAsync();

  if (!backgroundAvailable) {
    return {
      notificationsGranted: notificationPermission.granted,
      backgroundGranted: false,
      message: 'Background location is not available in this runtime.',
    };
  }

  const foregroundPermission = await Location.requestForegroundPermissionsAsync();
  if (!foregroundPermission.granted) {
    return {
      notificationsGranted: notificationPermission.granted,
      backgroundGranted: false,
      message: 'Location permission is needed before Journey Mode can run.',
    };
  }

  const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
  return {
    notificationsGranted: notificationPermission.granted,
    backgroundGranted: backgroundPermission.granted,
    message: backgroundPermission.granted
      ? undefined
      : 'Background location permission was not granted. Journey Mode is saved, but background checks may not run.',
  };
}

export async function startJourneyModeTask() {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(JOURNEY_MODE_TASK_NAME);
  if (hasStarted) {
    return;
  }

  await Location.startLocationUpdatesAsync(JOURNEY_MODE_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 1609,
    deferredUpdatesDistance: 1609,
    deferredUpdatesInterval: 10 * 60 * 1000,
    pausesUpdatesAutomatically: true,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Journey Mode is active',
      notificationBody: 'Checking for changes in Indigenous territory context.',
    },
  });
}

export async function stopJourneyModeTask() {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(JOURNEY_MODE_TASK_NAME);
  if (hasStarted) {
    await Location.stopLocationUpdatesAsync(JOURNEY_MODE_TASK_NAME);
  }
}

export async function processJourneyModeLocation(latitude: number, longitude: number) {
  const enabled = await getJourneyModeEnabled();
  if (!enabled) {
    return null;
  }

  const context = await fetchIndigenousContextByCoordinates(String(latitude), String(longitude));
  const nextSignature = getTerritorySignature(context);
  const previousSignature = (await AsyncStorage.getItem(JOURNEY_MODE_SIGNATURE_KEY)) ?? '';
  const checkedAt = new Date().toISOString();

  await AsyncStorage.setItem(JOURNEY_MODE_LAST_CHECK_KEY, checkedAt);

  if (!nextSignature) {
    return null;
  }

  await AsyncStorage.setItem(JOURNEY_MODE_SIGNATURE_KEY, nextSignature);

  if (previousSignature && previousSignature !== nextSignature) {
    const Notifications = await import('expo-notifications');
    const event: JourneyModeEvent = {
      previousSignature,
      nextSignature,
      checkedAt,
      latitude,
      longitude,
    };

    await AsyncStorage.setItem(JOURNEY_MODE_LAST_EVENT_KEY, JSON.stringify(event));
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Journey Mode update',
        body: 'Your Indigenous territory context may have changed. Open Where Are We? to review the latest records.',
      },
      trigger: null,
    });

    return event;
  }

  return null;
}
