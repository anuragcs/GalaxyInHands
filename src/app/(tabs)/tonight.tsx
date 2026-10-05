import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ObjectCard } from '@/components/ObjectCard';
import { Starfield } from '@/components/Starfield';
import { useSky } from '@/context/SkyContext';
import { formatClock } from '@/lib/format';
import { riseSetTimes } from '@/services/astronomy';
import { fetchApod, type Apod } from '@/services/nasa';
import { colors } from '@/theme';

export default function TonightScreen() {
  const { now, location, locationLabel, objects, issPass, settings } = useSky();
  const [apod, setApod] = useState<Apod | null>(null);

  useEffect(() => {
    void fetchApod(settings.nasaApiKey).then(setApod);
  }, [settings.nasaApiKey]);

  const planetsUp = objects.filter(
    (item) => (item.kind === 'planet' || item.kind === 'moon' || item.kind === 'sun') && item.el > 0,
  );
  const zenithStars = [...objects]
    .filter((item) => item.kind === 'star' && item.el > 40)
    .sort((a, b) => b.el - a.el)
    .slice(0, 5);
  const holesUp = objects.filter((item) => item.kind === 'blackhole' && item.el > 0);
  const iss = objects.find((item) => item.id === 'sat:25544');

  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const sunMoon = useMemo(() => {
    if (!location) return null;
    const [year, month, day] = dayKey.split('-').map(Number);
    const noon = new Date(year, month, day, 12, 0, 0, 0);
    return {
      sun: riseSetTimes('Sun', noon, location),
      moon: riseSetTimes('Moon', noon, location),
    };
  }, [location, dayKey]);

  return (
    <View style={styles.root}>
      <Starfield />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Tonight</Text>
        <Text style={styles.title}>Sky briefing</Text>
        <Text style={styles.lede}>
          {locationLabel} · {formatClock(now)}
        </Text>

        <View style={styles.grid}>
          <View style={styles.tile}>
            <Text style={styles.tileLabel}>Sunrise</Text>
            <Text style={styles.tileValue}>{sunMoon?.sun.rise ?? '—'}</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileLabel}>Sunset</Text>
            <Text style={styles.tileValue}>{sunMoon?.sun.set ?? '—'}</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileLabel}>Moonrise</Text>
            <Text style={styles.tileValue}>{sunMoon?.moon.rise ?? '—'}</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileLabel}>Moonset</Text>
            <Text style={styles.tileValue}>{sunMoon?.moon.set ?? '—'}</Text>
          </View>
        </View>

        <Text style={styles.section}>International Space Station</Text>
        {iss && iss.el > 0 ? (
          <ObjectCard object={iss} onOpen={() => router.push('/object/sat%3A25544')} />
        ) : issPass ? (
          <View style={styles.pass}>
            <Text style={styles.passTitle}>Next visible pass</Text>
            <Text style={styles.passBody}>
              Starts {issPass.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · peaks{' '}
              {issPass.peak.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} at {issPass.peakEl.toFixed(0)}°
            </Text>
          </View>
        ) : (
          <Text style={styles.empty}>No ISS pass above 10° in the next 12 hours from this location.</Text>
        )}

        <Text style={styles.section}>Solar system above you</Text>
        <View style={styles.stack}>
          {planetsUp.length ? (
            planetsUp.map((item) => (
              <ObjectCard
                key={item.id}
                object={item}
                onOpen={() => router.push(`/object/${encodeURIComponent(item.id)}`)}
              />
            ))
          ) : (
            <Text style={styles.empty}>No planets are above the horizon right now.</Text>
          )}
        </View>

        <Text style={styles.section}>Near zenith</Text>
        <View style={styles.stack}>
          {zenithStars.map((item) => (
            <ObjectCard
              key={item.id}
              object={item}
              onOpen={() => router.push(`/object/${encodeURIComponent(item.id)}`)}
            />
          ))}
        </View>

        <Text style={styles.section}>Black holes in this sky</Text>
        <View style={styles.stack}>
          {holesUp.map((item) => (
            <ObjectCard
              key={item.id}
              object={item}
              onOpen={() => router.push(`/object/${encodeURIComponent(item.id)}`)}
            />
          ))}
        </View>

        {apod ? (
          <>
            <Text style={styles.section}>NASA Astronomy Picture of the Day</Text>
            {apod.mediaType === 'image' ? <Image source={{ uri: apod.url }} style={styles.apod} /> : null}
            <Text style={styles.apodTitle}>{apod.title}</Text>
            <Text style={styles.apodBody} numberOfLines={8}>
              {apod.explanation}
            </Text>
          </>
        ) : null}
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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  tile: {
    width: '47%',
    backgroundColor: colors.bgCard,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  tileLabel: {
    color: colors.textMute,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tileValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  section: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 26,
    marginBottom: 10,
  },
  stack: {
    gap: 10,
  },
  pass: {
    backgroundColor: colors.bgCard,
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  passTitle: {
    color: colors.green,
    fontWeight: '700',
  },
  passBody: {
    color: colors.text,
    marginTop: 6,
    lineHeight: 20,
  },
  empty: {
    color: colors.textDim,
  },
  apod: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    backgroundColor: colors.bgCard,
  },
  apodTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },
  apodBody: {
    color: colors.textDim,
    marginTop: 6,
    lineHeight: 20,
  },
});
