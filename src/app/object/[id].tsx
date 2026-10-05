import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Starfield } from '@/components/Starfield';
import { useSky } from '@/context/SkyContext';
import { formatAzimuth, formatDec, formatElevation, formatRa, kindLabel } from '@/lib/format';
import { riseSetTimes } from '@/services/astronomy';
import { fetchObjectMedia, type MediaCard } from '@/services/media';
import { colors, kindColor } from '@/theme';

export default function ObjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const objectId = decodeURIComponent(id ?? '');
  const { findObject, location, now } = useSky();
  const object = findObject(objectId);
  const [media, setMedia] = useState<MediaCard | null>(null);
  const [mediaForId, setMediaForId] = useState<string | null>(null);
  const loadingMedia = Boolean(object) && mediaForId !== object?.id;

  useEffect(() => {
    if (!object) return;
    const requestedId = object.id;
    let active = true;
    void fetchObjectMedia(object).then((card) => {
      if (!active) return;
      setMedia(card);
      setMediaForId(requestedId);
    });
    return () => {
      active = false;
    };
  }, [object]);

  if (!object) {
    return (
      <View style={styles.root}>
        <Starfield />
        <View style={styles.missing}>
          <Text style={styles.title}>Object not in the current sky set</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const color = kindColor[object.kind];
  const times =
    location && (object.kind === 'planet' || object.kind === 'sun' || object.kind === 'moon')
      ? riseSetTimes(object.name, now, location)
      : null;

  return (
    <View style={styles.root}>
      <Starfield />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Sky</Text>
        </Pressable>

        {loadingMedia ? (
          <View style={styles.heroEmpty}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.loadingText}>Loading NASA / Wikipedia image…</Text>
          </View>
        ) : media?.image ? (
          <Image source={{ uri: media.image }} style={styles.hero} resizeMode="cover" />
        ) : (
          <View style={styles.heroEmpty}>
            <Text style={styles.loadingText}>No public image found for this object yet.</Text>
          </View>
        )}
        {media?.credit ? <Text style={styles.credit}>{media.credit}</Text> : null}

        <Text style={[styles.kind, { color }]}>{kindLabel(object.kind)}</Text>
        <Text style={styles.title}>{object.name}</Text>
        <Text style={styles.sub}>{object.subtitle}</Text>
        <Text style={styles.pos}>
          {formatAzimuth(object.az)} · {formatElevation(object.el)}
        </Text>
        {object.kind !== 'satellite' ? (
          <Text style={styles.eq}>
            RA {formatRa(object.raHours)} · Dec {formatDec(object.decDeg)}
          </Text>
        ) : null}

        {media?.extract ? (
          <View style={styles.story}>
            <Text style={styles.storyLabel}>About</Text>
            <Text style={styles.storyBody}>{media.extract}</Text>
          </View>
        ) : null}

        <View style={styles.panel}>
          {object.facts.map((fact) => (
            <View key={fact.label} style={styles.fact}>
              <Text style={styles.factLabel}>{fact.label}</Text>
              <Text style={styles.factValue}>{fact.value}</Text>
            </View>
          ))}
          {times ? (
            <>
              <View style={styles.fact}>
                <Text style={styles.factLabel}>Rises</Text>
                <Text style={styles.factValue}>{times.rise}</Text>
              </View>
              <View style={styles.fact}>
                <Text style={styles.factLabel}>Sets</Text>
                <Text style={styles.factValue}>{times.set}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.links}>
          {media?.pageUrl ? (
            <Pressable style={styles.linkBtn} onPress={() => void Linking.openURL(media.pageUrl!)}>
              <Text style={styles.linkText}>Open Wikipedia</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={styles.linkBtn}
            onPress={() =>
              void Linking.openURL(
                `https://images.nasa.gov/search?q=${encodeURIComponent(object.name)}&page=1&media=image`,
              )
            }
          >
            <Text style={styles.linkText}>NASA images</Text>
          </Pressable>
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
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  missing: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  back: {
    color: colors.gold,
    fontWeight: '700',
    marginBottom: 18,
  },
  hero: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: colors.bgCard,
  },
  heroEmpty: {
    height: 160,
    borderRadius: 18,
    backgroundColor: colors.bgCard,
    borderColor: colors.line,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  loadingText: {
    color: colors.textDim,
    textAlign: 'center',
  },
  credit: {
    color: colors.textMute,
    fontSize: 11,
    marginTop: 8,
  },
  kind: {
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 18,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
    marginTop: 6,
  },
  sub: {
    color: colors.textDim,
    marginTop: 8,
    lineHeight: 22,
    fontSize: 16,
  },
  pos: {
    color: colors.cyan,
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
  },
  eq: {
    color: colors.textMute,
    marginTop: 4,
  },
  story: {
    marginTop: 20,
  },
  storyLabel: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  storyBody: {
    color: colors.text,
    marginTop: 8,
    lineHeight: 24,
    fontSize: 16,
  },
  panel: {
    marginTop: 22,
    backgroundColor: colors.bgCard,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fact: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
  },
  factLabel: {
    color: colors.textMute,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  factValue: {
    color: colors.text,
    fontSize: 16,
    marginTop: 4,
    lineHeight: 22,
  },
  links: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  linkBtn: {
    flex: 1,
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.bgCard,
  },
  linkText: {
    color: colors.gold,
    fontWeight: '700',
  },
});
