import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import type { LookDirection, SkyObject } from '@/data/types';
import { angularDistance, projectToScreen } from '@/services/projection';
import { constellationSegments } from '@/services/constellations';
import { colors } from '@/theme';
import { ObjectMarker } from './ObjectMarker';

type Props = {
  objects: SkyObject[];
  stars: SkyObject[];
  look: LookDirection;
  width: number;
  height: number;
  selectedId: string | null;
  showConstellations: boolean;
  onSelect: (id: string) => void;
};

export function SkyOverlay({
  objects,
  stars,
  look,
  width,
  height,
  selectedId,
  showConstellations,
  onSelect,
}: Props) {
  const projected = useMemo(() => {
    return objects
      .filter((object) => object.kind !== 'constellation' && object.el > -1)
      .map((object) => {
        const point = projectToScreen(object.az, object.el, look, width, height);
        const distance = angularDistance(object.az, object.el, look.heading, look.pitch);
        return { object, point, distance };
      })
      .filter((item) => item.point.visible);
  }, [objects, look, width, height]);

  const figures = useMemo(() => {
    if (!showConstellations) return { lines: [], labels: [] as { id: string; name: string; x: number; y: number }[] };

    const lines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    const buckets = new Map<string, { name: string; xs: number[]; ys: number[] }>();

    for (const segment of constellationSegments(stars)) {
      if (segment.a.el < -8 && segment.b.el < -8) continue;
      const a = projectToScreen(segment.a.az, segment.a.el, look, width, height);
      const b = projectToScreen(segment.b.az, segment.b.el, look, width, height);
      const aDist = angularDistance(segment.a.az, segment.a.el, look.heading, look.pitch);
      const bDist = angularDistance(segment.b.az, segment.b.el, look.heading, look.pitch);
      if (aDist > 85 && bDist > 85) continue;
      if (!a.visible && !b.visible) continue;

      lines.push({
        key: `${segment.id}-${segment.a.id}-${segment.b.id}`,
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
      });

      const bucket = buckets.get(segment.id) ?? { name: segment.name, xs: [], ys: [] };
      if (a.visible) {
        bucket.xs.push(a.x);
        bucket.ys.push(a.y);
      }
      if (b.visible) {
        bucket.xs.push(b.x);
        bucket.ys.push(b.y);
      }
      buckets.set(segment.id, bucket);
    }

    const labels = [...buckets.entries()]
      .filter(([, bucket]) => bucket.xs.length >= 2)
      .map(([id, bucket]) => ({
        id: `const:${id}`,
        name: bucket.name,
        x: bucket.xs.reduce((sum, value) => sum + value, 0) / bucket.xs.length,
        y: bucket.ys.reduce((sum, value) => sum + value, 0) / bucket.ys.length,
      }));

    return { lines, labels };
  }, [showConstellations, stars, look, width, height]);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {showConstellations ? (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
          {figures.lines.map((line) => (
            <Line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(126,224,255,0.42)"
              strokeWidth={1.2}
            />
          ))}
        </Svg>
      ) : null}

      {figures.labels.map((label) => (
        <Pressable
          key={label.id}
          onPress={() => onSelect(label.id)}
          style={[styles.constLabel, { left: label.x - 46, top: label.y - 28 }]}
        >
          <Text style={styles.constText}>{label.name}</Text>
        </Pressable>
      ))}

      {projected.map(({ object, point, distance }) => (
        <ObjectMarker
          key={object.id}
          object={object}
          x={point.x}
          y={point.y}
          showLabel={distance < 12 || object.kind !== 'star' || (object.mag ?? 9) < 0.5}
          selected={selectedId === object.id}
          onPress={() => onSelect(object.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  constLabel: {
    position: 'absolute',
    width: 92,
    alignItems: 'center',
  },
  constText: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 1 },
  },
});
