import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SkyObject } from '@/data/types';
import { kindColor } from '@/theme';

type Props = {
  object: SkyObject;
  x: number;
  y: number;
  showLabel: boolean;
  selected: boolean;
  onPress: () => void;
};

function markerSize(object: SkyObject): number {
  if (object.kind === 'sun') return 18;
  if (object.kind === 'moon') return 14;
  if (object.kind === 'blackhole') return 16;
  if (object.kind === 'satellite') return object.id === 'sat:25544' ? 14 : 8;
  if (object.kind === 'planet') return 11;
  const mag = object.mag ?? 3;
  return Math.max(3, 10 - mag * 1.6);
}

export function ObjectMarker({ object, x, y, showLabel, selected, onPress }: Props) {
  const color = kindColor[object.kind] ?? '#fff';
  const size = markerSize(object);
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={[
        styles.wrap,
        {
          left: x - 20,
          top: y - 20,
        },
      ]}
    >
      <View style={styles.hit}>
        {object.kind === 'blackhole' ? (
          <View style={[styles.hole, { borderColor: color, width: size, height: size, borderRadius: size }]}>
            <View style={styles.holeCore} />
          </View>
        ) : (
          <View
            style={[
              styles.dot,
              {
                width: size,
                height: size,
                borderRadius: size,
                backgroundColor: color,
                shadowColor: color,
              },
            ]}
          />
        )}
        {(showLabel || selected) && (
          <Text style={[styles.label, { color }, selected && styles.labelSelected]} numberOfLines={1}>
            {object.name}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: 88,
    alignItems: 'center',
  },
  hit: {
    alignItems: 'center',
  },
  dot: {
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  hole: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeCore: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#05060D',
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
  labelSelected: {
    fontSize: 13,
  },
});
