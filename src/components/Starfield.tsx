import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

const POINTS = Array.from({ length: 80 }, (_, i) => ({
  left: ((i * 47) % 100) + (i % 7),
  top: ((i * 29) % 100) + (i % 5),
  size: i % 9 === 0 ? 2.4 : 1.2,
  opacity: 0.25 + ((i * 13) % 50) / 100,
}));

export function Starfield() {
  const stars = useMemo(() => POINTS, []);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((star, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: `${star.left % 100}%`,
            top: `${star.top % 100}%`,
            width: star.size,
            height: star.size,
            borderRadius: star.size,
            backgroundColor: '#F8F4E8',
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  );
}
