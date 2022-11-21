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
import { Home } from "./Home";
import { getSectionsEpisodesStorage } from "./utils";
import { VideoPlayer } from "./VideoPlayer";

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

  const sectionsEpisodes = getSectionsEpisodesStorage();

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
            headerRight: () => (
              <CastButton
                style={{ width: 24, height: 24, tintColor: "black" }}
              />
            ),
            headerLeft: () =>
              castState === CastState.CONNECTED && (
                <TouchableOpacity onPress={randomCast} style={{ padding: 10 }}>
                  <Text>Random</Text>
                </TouchableOpacity>
              ),
          }}
        />
        <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
