import React from "react";
import { CastButton, useRemoteMediaClient } from "react-native-google-cast";
import {
  StyleSheet,
  FlatList,
  View,
  StatusBar,
  TouchableOpacity,
  Text,
} from "react-native";
import { episodes } from "./episodes";
import { Item } from "./Item";
import { MediaControls } from "./MediaControls";
import { formatName } from "./utils";

export default function App() {
  const client = useRemoteMediaClient();

  const renderItem = ({ item }) => <Item name={item} />;
  const filteredEpisodes = episodes.filter((episode) =>
    episode.endsWith(".mp4")
  );

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };
  const randomCast = () => {
    const items = filteredEpisodes.slice(0, 400).map((episode) => {
      const { url, episodeName, season } = formatName(episode);
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
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.topButtons}>
        <TouchableOpacity onPress={randomCast}>
          <Text>Random</Text>
        </TouchableOpacity>
        <CastButton style={{ width: 24, height: 24, tintColor: "black" }} />
      </View>
      <FlatList
        data={filteredEpisodes}
        renderItem={renderItem}
        keyExtractor={(item) => item}
      />
      <MediaControls />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  topButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
    padding: 20,
    width: "100%",
  },
});
