import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SkyProvider } from '@/context/SkyContext';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SkyProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="object/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      </Stack>
    </SkyProvider>
  );
}
