import { StyleSheet, Text, View } from 'react-native';
import type { GeoLocation, LookDirection } from '@/data/types';
import { formatAzimuth, formatClock, formatElevation, formatLatLon, formatUtc } from '@/lib/format';
import { colors } from '@/theme';

type Props = {
  look: LookDirection;
  now: Date;
  location: GeoLocation | null;
  locationLabel: string;
};

export function CompassHUD({ look, now, location, locationLabel }: Props) {
  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.brand}>GIH</Text>
        <Text style={styles.sub}>Galaxy In Hands</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.heading}>{formatAzimuth(look.heading)}</Text>
        <Text style={styles.meta}>alt {formatElevation(look.pitch)} · roll {look.roll.toFixed(0)}°</Text>
        <Text style={styles.meta}>{formatClock(now)} · {formatUtc(now)}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {location ? formatLatLon(location.latitude, location.longitude) : locationLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  brand: {
    color: colors.gold,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 4,
  },
  sub: {
    color: colors.textDim,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  right: {
    alignItems: 'flex-end',
    maxWidth: '62%',
  },
  heading: {
    color: colors.cyan,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
});
