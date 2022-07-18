import React, { useEffect } from "react";
import { StyleSheet, SectionList, SafeAreaView, Text } from "react-native";
import { Item } from "./Item";
import { MediaControls } from "./MediaControls";
import { getSectionsEpisodes } from "./utils";

export function Home() {
  const sectionsEpisodes = getSectionsEpisodes();

  useEffect(() => {
    const flattenList = sectionsEpisodes.map((section) => section.data).flat();
    flattenList.forEach(async (episode) => {
      fetch(episode.url).then((response) => console.log(response));
      await new Promise((r) => setTimeout(r, 2000));
    });
  }, [sectionsEpisodes]);

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
