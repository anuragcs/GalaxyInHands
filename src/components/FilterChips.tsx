import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { AppSettings, LayerKey } from '@/data/types';
import { colors } from '@/theme';

const LAYERS: { key: LayerKey; label: string; setting: keyof AppSettings }[] = [
  { key: 'stars', label: 'Stars', setting: 'showStars' },
  { key: 'constellations', label: 'Constellations', setting: 'showConstellations' },
  { key: 'planets', label: 'System', setting: 'showPlanets' },
  { key: 'satellites', label: 'Sats', setting: 'showSatellites' },
  { key: 'blackHoles', label: 'Black holes', setting: 'showBlackHoles' },
];

type Props = {
  settings: AppSettings;
  onToggle: (key: keyof AppSettings) => void;
};

export function FilterChips({ settings, onToggle }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {LAYERS.map((layer) => {
        const on = Boolean(settings[layer.setting]);
        return (
          <Pressable
            key={layer.key}
            onPress={() => onToggle(layer.setting)}
            style={[styles.chip, on && styles.chipOn]}
          >
            <Text style={[styles.text, on && styles.textOn]}>{layer.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  chip: {
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(11,14,24,0.7)',
  },
  chipOn: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(245,193,108,0.12)',
  },
  text: {
    color: colors.textMute,
    fontSize: 12,
    fontWeight: '600',
  },
  textOn: {
    color: colors.gold,
  },
});
