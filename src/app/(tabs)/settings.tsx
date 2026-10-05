import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Starfield } from '@/components/Starfield';
import { useSky } from '@/context/SkyContext';
import { useOrientation } from '@/hooks/useOrientation';
import { formatAzimuth } from '@/lib/format';
import { colors } from '@/theme';

export default function SettingsScreen() {
  const { settings, updateSettings, refreshTles, tleStatus, calibrateWith, location } = useSky();
  const look = useOrientation(settings.compassOffset);
  const [busy, setBusy] = useState(false);

  return (
    <View style={styles.root}>
      <Starfield />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Setup</Text>
        <Text style={styles.title}>Instruments</Text>
        <Text style={styles.lede}>
          GIH calculates the sky on-device. No paid API is required. Tokens below are optional extras.
        </Text>

        <Text style={styles.section}>Layers</Text>
        <Row label="Stars" value={settings.showStars} onChange={(v) => void updateSettings({ showStars: v })} />
        <Row label="Sun, Moon & planets" value={settings.showPlanets} onChange={(v) => void updateSettings({ showPlanets: v })} />
        <Row label="Satellites" value={settings.showSatellites} onChange={(v) => void updateSettings({ showSatellites: v })} />
        <Row label="Black holes" value={settings.showBlackHoles} onChange={(v) => void updateSettings({ showBlackHoles: v })} />
        <Row label="Live constellations" value={settings.showConstellations} onChange={(v) => void updateSettings({ showConstellations: v })} />
        <Row label="Live camera overlay" value={settings.cameraEnabled} onChange={(v) => void updateSettings({ cameraEnabled: v })} />

        <Text style={styles.section}>Magnitude limit</Text>
        <Text style={styles.help}>Hide stars fainter than this (lower = fewer, brighter stars).</Text>
        <View style={styles.stepRow}>
          <Pressable style={styles.step} onPress={() => void updateSettings({ minMagnitude: Math.max(-1, settings.minMagnitude - 0.2) })}>
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>{settings.minMagnitude.toFixed(1)}</Text>
          <Pressable style={styles.step} onPress={() => void updateSettings({ minMagnitude: Math.min(6, settings.minMagnitude + 0.2) })}>
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Satellite cap</Text>
        <Text style={styles.help}>How many orbiting objects to keep on screen at once (closest first, ISS always prioritized).</Text>
        <View style={styles.stepRow}>
          <Pressable style={styles.step} onPress={() => void updateSettings({ maxSatellites: Math.max(5, settings.maxSatellites - 5) })}>
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>{settings.maxSatellites}</Text>
          <Pressable style={styles.step} onPress={() => void updateSettings({ maxSatellites: Math.min(80, settings.maxSatellites + 5) })}>
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Compass calibration</Text>
        <Text style={styles.help}>
          Phone magnetometers drift near metal and cars. Point the camera at the Sun or Moon, then lock the offset.
          Current heading {formatAzimuth(look.heading)} · offset {settings.compassOffset.toFixed(1)}°.
        </Text>
        <View style={styles.stepRow}>
          <Pressable style={styles.step} onPress={() => void updateSettings({ compassOffset: settings.compassOffset - 1 })}>
            <Text style={styles.stepText}>−1°</Text>
          </Pressable>
          <Pressable style={styles.step} onPress={() => void updateSettings({ compassOffset: 0 })}>
            <Text style={styles.stepText}>Reset</Text>
          </Pressable>
          <Pressable style={styles.step} onPress={() => void updateSettings({ compassOffset: settings.compassOffset + 1 })}>
            <Text style={styles.stepText}>+1°</Text>
          </Pressable>
        </View>
        <View style={styles.actions}>
          <Pressable
            style={styles.button}
            disabled={!location}
            onPress={() => void calibrateWith('sun', look.heading)}
          >
            <Text style={styles.buttonText}>Calibrate on Sun</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            disabled={!location}
            onPress={() => void calibrateWith('moon', look.heading)}
          >
            <Text style={styles.buttonText}>Calibrate on Moon</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Satellite orbits (CelesTrak)</Text>
        <Text style={styles.help}>{tleStatus}. Free TLE files, no token. Refresh every few hours for best ISS/Starlink-class accuracy.</Text>
        <Pressable
          style={styles.button}
          onPress={async () => {
            setBusy(true);
            await refreshTles();
            setBusy(false);
          }}
        >
          <Text style={styles.buttonText}>{busy ? 'Refreshing…' : 'Refresh TLE data'}</Text>
        </Pressable>

        <Text style={styles.section}>Optional NASA key</Text>
        <Text style={styles.help}>
          Only used for Astronomy Picture of the Day on Tonight. Get a free key at api.nasa.gov. Leave blank to use NASA’s DEMO_KEY (rate-limited).
        </Text>
        <TextInput
          value={settings.nasaApiKey}
          onChangeText={(nasaApiKey) => void updateSettings({ nasaApiKey })}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="NASA API key (optional)"
          placeholderTextColor={colors.textMute}
          style={styles.input}
        />

        <Text style={styles.section}>Not needed</Text>
        <Text style={styles.help}>
          N2YO, AstronomyAPI, API-Ninjas, and Aviation Edge are optional commercial feeds. GIH already computes stars, planets, black-hole coordinates, and satellite look angles locally with astronomy-engine + SGP4.
        </Text>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.line, true: colors.goldDim }}
        thumbColor={value ? colors.gold : colors.textMute}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingTop: 64,
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  kicker: {
    color: colors.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginTop: 6,
  },
  lede: {
    color: colors.textDim,
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 26,
    marginBottom: 8,
  },
  help: {
    color: colors.textDim,
    lineHeight: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  step: {
    backgroundColor: colors.bgCard,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  stepText: {
    color: colors.gold,
    fontWeight: '700',
  },
  stepValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    minWidth: 48,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.gold,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.bgCard,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 14,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
