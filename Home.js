import React from "react";
import { SafeAreaView, SectionList, StyleSheet, Text } from "react-native";
import { Item } from "./Item";
import { MediaControls } from "./MediaControls";
import { getSectionsEpisodesStorage } from "./utils";

export function Home() {
  const sectionsEpisodes = getSectionsEpisodesStorage();

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sectionsEpisodes}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <Item item={item} />}
        renderSectionHeader={({ section: { season } }) => (
          <Text style={styles.header}>{season}</Text>
        )}
      />
      <MediaControls />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    backgroundColor: "yellow",
    padding: 5,
    fontSize: 20,
    flex: 1,
  },
});
