import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ObjectCard } from '@/components/ObjectCard';
import { Starfield } from '@/components/Starfield';
import { useSky } from '@/context/SkyContext';
import type { ObjectKind } from '@/data/types';
import { colors } from '@/theme';

const FILTERS: { id: 'all' | ObjectKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'planet', label: 'Planets' },
  { id: 'star', label: 'Stars' },
  { id: 'constellation', label: 'Constellations' },
  { id: 'satellite', label: 'Sats' },
  { id: 'blackhole', label: 'Black holes' },
];

export default function ExploreScreen() {
  const { objects, tleStatus } = useSky();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return objects
      .filter((object) => {
        if (filter === 'planet') return object.kind === 'planet' || object.kind === 'sun' || object.kind === 'moon';
        if (filter !== 'all' && object.kind !== filter) return false;
        if (!q) return true;
        return (
          object.name.toLowerCase().includes(q) ||
          object.constellation.toLowerCase().includes(q) ||
          object.subtitle.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.el - a.el);
  }, [objects, query, filter]);

  const above = list.filter((item) => item.el >= 0).length;

  return (
    <View style={styles.root}>
      <Starfield />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Catalog</Text>
        <Text style={styles.title}>What’s in the sky</Text>
        <Text style={styles.lede}>
          Live positions from your GPS and clock. {above} of {list.length} listed objects are above the horizon.
        </Text>
        <Text style={styles.status}>{tleStatus}</Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Sirius, ISS, Sagittarius A*…"
          placeholderTextColor={colors.textMute}
          style={styles.search}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setFilter(item.id)}
              style={[styles.chip, filter === item.id && styles.chipOn]}
            >
              <Text style={[styles.chipText, filter === item.id && styles.chipTextOn]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.list}>
          {list.map((object) => (
            <ObjectCard
              key={object.id}
              object={object}
              onOpen={() => router.push(`/object/${encodeURIComponent(object.id)}`)}
            />
          ))}
        </View>
      </ScrollView>
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
    paddingBottom: 40,
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
  status: {
    color: colors.cyan,
    marginTop: 8,
    fontSize: 12,
  },
  search: {
    marginTop: 16,
    backgroundColor: colors.bgCard,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 14,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  filters: {
    gap: 8,
    marginTop: 14,
    paddingRight: 16,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipOn: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(245,193,108,0.12)',
  },
  chipText: {
    color: colors.textMute,
    fontWeight: '600',
  },
  chipTextOn: {
    color: colors.gold,
  },
  list: {
    marginTop: 18,
    gap: 10,
  },
});
