import React from "react";
import { StyleSheet, SectionList, View, Text } from "react-native";
import { Item } from "./Item";
import { MediaControls } from "./MediaControls";
import { getSectionsEpisodes } from "./utils";

export function Home() {
  const sectionsEpisodes = getSectionsEpisodes();

  return (
    <View style={styles.container}>
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
    backgroundColor: "yellow",
    padding: 5,
  },
});
