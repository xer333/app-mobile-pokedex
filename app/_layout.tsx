import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AccountProvider } from '../src/_shared/account';
import { AdventureProvider } from '../src/_shared/adventure';
import { ActivityProvider } from '../src/_shared/activity';
import { CollectionsProvider } from '../src/_shared/collections';
import { PlanningProvider } from '../src/_shared/planning-provider';
import { ShinyHuntsProvider } from '../src/_shared/shiny-hunts-provider';
import { HuntFoundCoordinator } from '../src/_shared/hunt-found-coordinator';
import { RestoreBootstrap } from '../src/_shared/restore-bootstrap';

export default function RootLayout() {
  return (
    <RestoreBootstrap>
    <AccountProvider>
      <AdventureProvider>
        <ActivityProvider>
          <CollectionsProvider>
            <PlanningProvider>
              <ShinyHuntsProvider>
              <HuntFoundCoordinator>
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
                const isWorkspaceSurface = routeName === 'collection' || routeName === 'registered' || routeName === 'projects' || routeName === 'planner' || routeName === 'hunts';

              return {
                headerShown: false,
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
                animationTypeForReplace: 'push' as const,
                animationDuration: 240,
                  animation: isPrimarySurface
                    ? ('fade' as const)
                    : isUtilitySurface || isWorkspaceSurface
                    ? ('slide_from_right' as const)
                    : ('default' as const),
                contentStyle: { backgroundColor: '#050505' },
              };
              }}
              />
              </HuntFoundCoordinator>
              </ShinyHuntsProvider>
            </PlanningProvider>
          </CollectionsProvider>
        </ActivityProvider>
      </AdventureProvider>
    </AccountProvider>
    </RestoreBootstrap>
  );
}
