import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { AppState, View } from "react-native";
import * as Updates from "expo-updates";
import { CastButton } from "./services/useCast";
import { Home } from "./screens/Home";
import { VideoPlayer } from "./screens/VideoPlayer";
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
              <View style={{ justifyContent: "center", alignItems: "center", height: "100%" }}>
                <CastButton
                  style={{ width: 24, height: 24, tintColor: theme.colors.black }}
                />
              </View>
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

export default App;
