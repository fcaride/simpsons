// In App.js in a new project

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  CastButton,
  CastState,
  useCastState,
  useRemoteMediaClient,
} from "react-native-google-cast";
import { Home } from "./Home";
import { getSectionsEpisodes } from "./utils";
import { VideoPlayer } from "./VideoPlayer";
import { theme } from "./theme";

const Stack = createNativeStackNavigator();

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

function App() {
  const client = useRemoteMediaClient();
  const castState = useCastState();

  const sectionsEpisodes = getSectionsEpisodes();

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
            headerLeft: () =>
              castState === CastState.CONNECTED && (
                <TouchableOpacity onPress={randomCast} style={styles.randomButton}>
                  <Text style={styles.randomButtonText}>Random Play</Text>
                </TouchableOpacity>
              ),
          }}
        />
        <Stack.Screen name="VideoPlayer" component={VideoPlayer} options={{ headerShown: false }} />
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
