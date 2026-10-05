import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@/theme';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ color: focused ? colors.gold : colors.textMute, fontSize: 11, fontWeight: '700' }}>
      {label}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.line,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMute,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sky',
          tabBarIcon: ({ focused }) => <TabIcon label="SKY" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => <TabIcon label="CATALOG" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tonight"
        options={{
          title: 'Tonight',
          tabBarIcon: ({ focused }) => <TabIcon label="TONIGHT" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon label="SETUP" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
