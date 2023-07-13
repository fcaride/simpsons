import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { Item } from "./Item";
import { MediaControls } from "./MediaControls";
import { getSectionsEpisodes } from "./utils";

export function Home() {
  const sectionsEpisodes = getSectionsEpisodes();
  const [query, setQuery] = useState("");

  const episodes = useMemo(() => {
    const filteredSections = sectionsEpisodes.map((sectionEpisode) => ({
      ...sectionEpisode,
      data: sectionEpisode.data.filter(({ episodeName }) =>
        episodeName.includes(query)
      ),
    }));

    return filteredSections.filter(({ data }) => data.length > 0);
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.inputSearch}
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar episodio"
      />
      <SectionList
        sections={query ? episodes : sectionsEpisodes}
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
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    backgroundColor: "#D2B17D",
    paddingLeft: 15,
    paddingVertical: 10,
    fontSize: 20,
    flex: 1,
    color: "#07537f",
    fontFamily: "VarelaRound_400Regular",
  },
  inputSearch: {
    paddingVertical: 10,
    paddingLeft: 15,
    fontSize: 16,
    alignSelf: "flex-start",
    fontFamily: "VarelaRound_400Regular",
    backgroundColor: "white",
    width: "100%",
  },
});
