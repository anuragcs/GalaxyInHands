import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SkyObject } from '@/data/types';
import { formatAzimuth, formatElevation, kindLabel } from '@/lib/format';
import { colors, kindColor } from '@/theme';

type Props = {
  object: SkyObject;
  onOpen?: () => void;
};

export function ObjectCard({ object, onOpen }: Props) {
  const color = kindColor[object.kind];
  return (
    <Pressable onPress={onOpen} style={styles.card}>
      <View style={[styles.pip, { backgroundColor: color }]} />
      <View style={styles.body}>
        <Text style={styles.kind}>{kindLabel(object.kind)}</Text>
        <Text style={styles.name}>{object.name}</Text>
        <Text style={styles.sub} numberOfLines={2}>
          {object.subtitle}
        </Text>
        <Text style={styles.meta}>
          {formatAzimuth(object.az)} · {formatElevation(object.el)}
          {object.mag != null ? ` · mag ${object.mag.toFixed(1)}` : ''}
        </Text>
      </View>
      {onOpen ? <Text style={styles.more}>Details</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  pip: {
    width: 8,
    height: 36,
    borderRadius: 8,
  },
  body: {
    flex: 1,
  },
  kind: {
    color: colors.textMute,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  sub: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 2,
  },
  meta: {
    color: colors.cyan,
    fontSize: 12,
    marginTop: 6,
  },
  more: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
});
