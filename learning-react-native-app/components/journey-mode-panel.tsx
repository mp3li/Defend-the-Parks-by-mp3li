import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette, SurfaceColors } from '@/constants/theme';
import { useAppStateContext } from '@/context/app-state-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  configureNotificationBehavior,
  getJourneyModeEnabled,
  getJourneyModeLastCheck,
  getLastJourneyModeEvent,
  requestJourneyModePermissions,
  setJourneyModeBaseline,
  setJourneyModeEnabled,
  startJourneyModeTask,
  stopJourneyModeTask,
  type JourneyModeEvent,
} from '@/services/journey-mode';
import type { IndigenousContextData } from '@/types/parks';

type JourneyModePanelProps = {
  currentContext?: IndigenousContextData | null;
  title?: string;
  description?: string;
  showToggle?: boolean;
  statusRefreshKey?: number;
};

function formatEventSignature(signature: string) {
  return signature
    .split('|')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .join(', ');
}

export function JourneyModePanel({
  currentContext,
  title = 'Journey Mode',
  description = 'Optional background checks can notify you when the returned territory context changes during travel.',
  showToggle = true,
  statusRefreshKey = 0,
}: JourneyModePanelProps) {
  const { reportError, showSnackbar } = useAppStateContext();
  const borderColor = useThemeColor({ light: Palette.valleyMoss, dark: Palette.summitBlush }, 'icon');
  const switchTrackColor = useThemeColor({ light: Palette.summitBlush, dark: Palette.gold }, 'tint');

  const [journeyModeEnabled, setJourneyModeEnabledState] = useState(false);
  const [journeyModeMessage, setJourneyModeMessage] = useState('');
  const [journeyLastCheck, setJourneyLastCheck] = useState<string | null>(null);
  const [journeyEvent, setJourneyEvent] = useState<JourneyModeEvent | null>(null);

  const refreshJourneyStatus = useCallback(async () => {
    const [enabled, lastCheck, lastEvent] = await Promise.all([
      getJourneyModeEnabled(),
      getJourneyModeLastCheck(),
      getLastJourneyModeEvent(),
    ]);
    setJourneyModeEnabledState(enabled);
    setJourneyLastCheck(lastCheck);
    setJourneyEvent(lastEvent);
  }, []);

  const toggleJourneyMode = useCallback(
    async (enabled: boolean) => {
      try {
        setJourneyModeMessage('');

        if (!enabled) {
          await setJourneyModeEnabled(false);
          await stopJourneyModeTask();
          setJourneyModeEnabledState(false);
          showSnackbar('Journey Mode turned off.', 'info');
          return;
        }

        const permissionResult = await requestJourneyModePermissions();
        await setJourneyModeEnabled(true);
        setJourneyModeEnabledState(true);

        if (currentContext) {
          await setJourneyModeBaseline(currentContext);
        }

        try {
          await startJourneyModeTask();
          setJourneyModeMessage(
            permissionResult.message ??
              'Journey Mode is on. Background checks will run when this runtime allows them.'
          );
        } catch (taskError) {
          const message =
            taskError instanceof Error
              ? taskError.message
              : 'Journey Mode is saved, but the background task could not start in this runtime.';
          setJourneyModeMessage(message);
        }

        if (!permissionResult.notificationsGranted) {
          setJourneyModeMessage((current) =>
            `${current ? `${current} ` : ''}Notification permission was not granted.`
          );
        }

        showSnackbar('Journey Mode turned on.', 'info');
      } catch (error) {
        reportError(error, 'Unable to update Journey Mode.');
      } finally {
        await refreshJourneyStatus();
      }
    },
    [currentContext, refreshJourneyStatus, reportError, showSnackbar]
  );

  useEffect(() => {
    void configureNotificationBehavior();
    void refreshJourneyStatus();
  }, [refreshJourneyStatus, statusRefreshKey]);

  return (
    <ThemedView style={[styles.card, { borderColor }]}>
      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <ThemedText type="subtitle" lightColor={Palette.cedar} darkColor={Palette.gold}>
            {title}
          </ThemedText>
          <ThemedText>{description}</ThemedText>
        </View>
        {showToggle ? (
          <Switch
            value={journeyModeEnabled}
            onValueChange={(value) => {
              void toggleJourneyMode(value);
            }}
            trackColor={{ false: '#7a8a95', true: switchTrackColor }}
            thumbColor={journeyModeEnabled ? Palette.meadowBloom : Palette.yosemiteIvory}
            accessibilityLabel="Journey Mode"
            accessibilityHint="Turns optional background location notifications on or off"
          />
        ) : null}
      </View>

      {journeyModeMessage ? <ThemedText>{journeyModeMessage}</ThemedText> : null}
      <ThemedText>
        {journeyLastCheck
          ? `Last update: ${new Date(journeyLastCheck).toLocaleString()}`
          : journeyModeEnabled
            ? 'Last update: Journey Mode enabled. Waiting for the next location check.'
            : 'Last update: Journey Mode not yet enabled'}
      </ThemedText>
      {journeyEvent ? (
        <ThemedView style={styles.eventBox}>
          <ThemedText type="defaultSemiBold">Last Journey Mode context change</ThemedText>
          <ThemedText>
            Previous: {formatEventSignature(journeyEvent.previousSignature) || 'Not recorded'}
          </ThemedText>
          <ThemedText>
            Latest: {formatEventSignature(journeyEvent.nextSignature) || 'Not recorded'}
          </ThemedText>
        </ThemedView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    backgroundColor: 'rgba(247, 239, 226, 0.82)',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchText: {
    flex: 1,
    gap: 6,
  },
  eventBox: {
    borderRadius: 8,
    padding: 10,
    gap: 4,
    backgroundColor: SurfaceColors.glassWarm,
  },
});
