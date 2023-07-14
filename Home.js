import React, { useMemo, useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { Item } from "./Item";
import { ShakeButton } from "./ShakeButton";
import { getSectionsEpisodes, playRandom } from "./utils";

export function Home({ navigation }) {
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
      <ImageBackground
        source={require("./assets/nubecitas.jpeg")}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <SectionList
          sections={query ? episodes : sectionsEpisodes}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => <Item item={item} />}
          renderSectionHeader={({ section: { season } }) => (
            <Text style={styles.header}>{season}</Text>
          )}
        />
      </ImageBackground>

      <ShakeButton onPress={playRandom} />
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
    backgroundColor: "#07537f",
    paddingLeft: 15,
    paddingVertical: 10,
    fontSize: 20,
    flex: 1,
    color: "white",
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
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#07537f",
    alignItems: "center",
    justifyContent: "center",
  },
});
