// In App.js in a new project

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { Text, TouchableOpacity } from "react-native";
import {
  CastButton,
  CastState,
  useCastState,
  useRemoteMediaClient,
} from "react-native-google-cast";

import {
  useFonts,
  VarelaRound_400Regular,
} from "@expo-google-fonts/varela-round";
import { Home } from "./Home";
import { getSectionsEpisodes } from "./utils";
import { VideoPlayer } from "./VideoPlayer";

const Stack = createNativeStackNavigator();

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

function App() {
  let [fontsLoaded] = useFonts({
    VarelaRound_400Regular,
  });

  const client = useRemoteMediaClient();
  const castState = useCastState();

  const sectionsEpisodes = getSectionsEpisodes();
  if (!fontsLoaded) {
    return null;
  }
  const randomCast = () => {
    const flattenList = sectionsEpisodes.map((section) => section.data).flat();
    const items = flattenList.map((episode) => {
      const { url, episodeName, season } = episode;
      return {
        mediaInfo: {
          contentUrl: url,
          metadata: {
            title: episodeName,
            subtitle: season,
          },
        },
        preloadTime: 30,
      };
    });
    shuffleArray(items);
    client?.loadMedia({
      queueData: {
        items,
      },
    });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
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
            headerLeft: () =>
              castState === CastState.CONNECTED && (
                <TouchableOpacity onPress={randomCast} style={{ padding: 10 }}>
                  <Text style={{ fontFamily: "VarelaRound_400Regular" }}>
                    Random
                  </Text>
                </TouchableOpacity>
              ),
          }}
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
