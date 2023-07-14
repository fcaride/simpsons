// In App.js in a new project

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { CastButton } from "react-native-google-cast";

import {
  useFonts,
  VarelaRound_400Regular,
} from "@expo-google-fonts/varela-round";
import * as Updates from "expo-updates";
import { AppState } from "react-native";
import { Home } from "./Home";
import { VideoPlayer } from "./VideoPlayer";

const Stack = createNativeStackNavigator();

async function onFetchUpdateAsync() {
  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {}
}

function App() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        onFetchUpdateAsync();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  let [fontsLoaded] = useFonts({
    VarelaRound_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={({ navigation }) => ({
            headerTitle: "",
            headerStyle: {
              backgroundColor: "#FED811",
            },
            headerTitleStyle: {
              color: "#07537f",
            },
            headerRight: () => (
              <CastButton
                style={{ width: 24, height: 24, tintColor: "black" }}
              />
            ),
          })}
        />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayer}
          options={{
            headerTitle: "",
            headerStyle: {
              backgroundColor: "#FED811",
            },
            headerTitleStyle: {
              color: "#07537f",
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
