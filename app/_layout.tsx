import { CountingModeProvider } from '../components';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <CountingModeProvider>
      <Stack>
        <Stack.Screen name='index' options={{ headerShown: false }} />
      </Stack>
      <StatusBar style='light' />
    </CountingModeProvider>
  );
}
