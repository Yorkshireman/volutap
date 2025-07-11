import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#F7F7F7',
        tabBarLabelStyle: {
          color: 'white',
          fontSize: 12
        },
        tabBarStyle: {
          backgroundColor: '#27187E',
          borderColor: '#F7F7F7',
          borderTopWidth: 1
        }
      }}
    >
      <Tabs.Screen
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        name='index'
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'clipboard' : 'clipboard-outline'} color={color} size={24} />
          ),
          title: 'Single'
        }}
      />
      <Tabs.Screen
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        name='multiCount'
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} color={color} size={24} />
          ),
          title: 'Multi'
        }}
      />
    </Tabs>
  );
}
