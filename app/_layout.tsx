import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { CollectionsProvider } from './_shared/collections';

export default function RootLayout() {
  return (
    <CollectionsProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: '#050505' },
        }}
      />
    </CollectionsProvider>
  );
}
