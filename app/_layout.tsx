import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AccountProvider } from './_shared/account';
import { CollectionsProvider } from './_shared/collections';

export default function RootLayout() {
  return (
    <AccountProvider>
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
    </AccountProvider>
  );
}
