import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useFocusEffect } from 'expo-router';
import { CompassHUD } from '@/components/CompassHUD';
import { FilterChips } from '@/components/FilterChips';
import { ObjectCard } from '@/components/ObjectCard';
import { SkyOverlay } from '@/components/SkyOverlay';
import { Starfield } from '@/components/Starfield';
import { useSky } from '@/context/SkyContext';
import { useOrientation } from '@/hooks/useOrientation';
import { angularDistance } from '@/services/projection';
import { colors } from '@/theme';

export default function SkyScreen() {
  useKeepAwake();
  const [focused, setFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  const { width, height } = useWindowDimensions();
  const { now, location, locationLabel, locationError, settings, objects, allStars, updateSettings } = useSky();
  const look = useOrientation(settings.compassOffset);
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cameraOn = settings.cameraEnabled && Boolean(permission?.granted) && focused;

  const selected = objects.find((item) => item.id === selectedId) ?? null;
  const nearest = useMemo(() => {
    let best = objects[0];
    let bestDist = 999;
    for (const object of objects) {
      if (object.kind === 'constellation' || object.el < 0) continue;
      const dist = angularDistance(object.az, object.el, look.heading, look.pitch);
      if (dist < bestDist) {
        best = object;
        bestDist = dist;
      }
    }
    return bestDist < 8 ? best : null;
  }, [objects, look]);

  const card = selected ?? nearest;

  return (
    <View style={styles.root}>
      {cameraOn ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          <Starfield />
        </View>
      )}
      <View style={styles.scrim} />

      {focused && (
        <SkyOverlay
          objects={objects}
          stars={allStars}
          look={look}
          width={width}
          height={height}
          selectedId={card?.id ?? null}
          showConstellations={settings.showConstellations}
          onSelect={(id) => {
            setSelectedId(id);
            router.push(`/object/${encodeURIComponent(id)}`);
          }}
        />
      )}

      <View pointerEvents="none" style={styles.crosshair}>
        <View style={styles.crossH} />
        <View style={styles.crossV} />
      </View>

      <View style={styles.ui}>
        <CompassHUD look={look} now={now} location={location} locationLabel={locationLabel} />

        {locationError ? <Text style={styles.warn}>{locationError}</Text> : null}

        {!permission?.granted && settings.cameraEnabled ? (
          <Pressable style={styles.permit} onPress={() => void requestPermission()}>
            <Text style={styles.permitText}>Enable camera for live sky overlay</Text>
          </Pressable>
        ) : null}

        <View style={styles.bottom}>
          <FilterChips
            settings={settings}
            onToggle={(key) => {
              const current = settings[key];
              if (typeof current === 'boolean') void updateSettings({ [key]: !current });
            }}
          />
          {card ? (
            <View style={styles.cardWrap}>
              <ObjectCard object={card} onOpen={() => router.push(`/object/${encodeURIComponent(card.id)}`)} />
            </View>
          ) : (
            <Text style={styles.hint}>Sweep the sky. Objects lock to azimuth and elevation on every axis.</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  fallback: {
    backgroundColor: colors.bg,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(5,6,13,0.18)',
  },
  ui: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingBottom: 12,
  },
  warn: {
    color: colors.orange,
    paddingHorizontal: 16,
    marginTop: 10,
    fontSize: 12,
  },
  permit: {
    alignSelf: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(245,193,108,0.16)',
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  permitText: {
    color: colors.gold,
    fontWeight: '700',
  },
  bottom: {
    gap: 12,
  },
  cardWrap: {
    paddingHorizontal: 16,
  },
  hint: {
    color: colors.textDim,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontSize: 13,
  },
  crosshair: {
    position: 'absolute',
    left: '50%',
    top: '46%',
    width: 22,
    height: 22,
    marginLeft: -11,
    marginTop: -11,
  },
  crossH: {
    position: 'absolute',
    left: 0,
    top: 10,
    width: 22,
    height: 1,
    backgroundColor: 'rgba(126,224,255,0.7)',
  },
  crossV: {
    position: 'absolute',
    left: 10,
    top: 0,
    width: 1,
    height: 22,
    backgroundColor: 'rgba(126,224,255,0.7)',
  },
});
