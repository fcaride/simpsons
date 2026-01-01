// In App.js in a new project

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { StyleSheet, AppState } from "react-native";
import * as Updates from "expo-updates";
import { CastButton } from "./services/useCast";
import { Home } from "./Home";
import { VideoPlayer } from "./VideoPlayer";
import { theme } from "./theme";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const onFetchUpdateAsync = React.useCallback(async () => {
    if (__DEV__) {
      return;
    }
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.log(`Error fetching latest Expo update: ${error}`);
    }
  }, []);

  React.useEffect(() => {
    onFetchUpdateAsync();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        onFetchUpdateAsync();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [onFetchUpdateAsync]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            title: "The Simpsons",
            headerRight: () => (
              <CastButton
                style={{ width: 24, height: 24, tintColor: theme.colors.black }}
              />
            ),
          }}
        />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayer}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  randomButton: {
    marginRight: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
  },
  randomButtonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default App;
