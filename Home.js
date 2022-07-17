import React from "react";
import { CastButton, useRemoteMediaClient } from "react-native-google-cast";
import {
  StyleSheet,
  SectionList,
  View,
  StatusBar,
  TouchableOpacity,
  Text,
} from "react-native";
import { Item } from "./Item";
import { MediaControls } from "./MediaControls";
import { getSectionsEpisodes } from "./utils";

export function Home() {
  const client = useRemoteMediaClient();

  const sectionsEpisodes = getSectionsEpisodes();

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };
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
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.topButtons}>
        <TouchableOpacity onPress={randomCast}>
          <Text>Random</Text>
        </TouchableOpacity>
        <CastButton style={{ width: 24, height: 24, tintColor: "black" }} />
      </View>
      <SectionList
        sections={sectionsEpisodes}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <Item item={item} />}
        renderSectionHeader={({ section: { season } }) => (
          <Text style={styles.header}>{season}</Text>
        )}
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
    padding: 20,
    width: "100%",
  },
  header: {
    backgroundColor: "green",
    padding: 5,
  },
});
