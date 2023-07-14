// In App.js in a new project

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { TouchableOpacity } from "react-native";
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
import { FontAwesome } from "@expo/vector-icons";
import * as Updates from "expo-updates";
import { AppState } from "react-native";
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

  const client = useRemoteMediaClient();
  const castState = useCastState();

  const sectionsEpisodes = getSectionsEpisodes();
  if (!fontsLoaded) {
    return null;
  }
  const random = (navigation) => () => {
    const flattenList = sectionsEpisodes.map((section) => section.data).flat();

    if (castState === CastState.CONNECTED) {
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
    } else {
      const { url } = flattenList[0];
      navigation.navigate("VideoPlayer", { url });
    }
  };

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
            headerLeft: () => (
              <TouchableOpacity
                onPress={random(navigation)}
                style={{ padding: 10 }}
              >
                <FontAwesome name="random" size={24} color="black" />
              </TouchableOpacity>
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
