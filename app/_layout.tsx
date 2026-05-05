import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AccountProvider } from './_shared/account';
import { ActivityProvider } from './_shared/activity';
import { CollectionsProvider } from './_shared/collections';

export default function RootLayout() {
  return (
    <AccountProvider>
      <ActivityProvider>
        <CollectionsProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={({ route }) => {
              const routeName = route.name;
              const isPrimarySurface =
                routeName === 'dashboard' || routeName === 'discover' || routeName === 'map';
              const isUtilitySurface =
                routeName === 'locations' ||
                routeName === 'moves' ||
                routeName === 'evolutions' ||
                routeName === 'profile';

              return {
                headerShown: false,
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
                animationTypeForReplace: 'push' as const,
                animationDuration: 240,
                animation: isPrimarySurface
                  ? ('fade' as const)
                  : isUtilitySurface
                    ? ('slide_from_right' as const)
                    : ('default' as const),
                contentStyle: { backgroundColor: '#050505' },
              };
            }}
          />
        </CollectionsProvider>
      </ActivityProvider>
    </AccountProvider>
  );
}
