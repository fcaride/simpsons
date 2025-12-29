import React from "react";
import {
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Item } from "./Item";
import { MediaControls } from "./MediaControls";
import { getSectionsEpisodes } from "./utils";
import { theme } from "./theme";
import { ShakeButton } from "./ShakeButton";

export function Home(): React.JSX.Element {
  const sectionsEpisodes = getSectionsEpisodes();

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sectionsEpisodes}
        keyExtractor={(item, index) => `${item.episodeName}-${index}`}
        renderItem={({ item }) => <Item item={item} />}
        renderSectionHeader={({ section: { season } }) => (
          <View style={styles.headerContainer}>
            <Text style={styles.header}>{season}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
      />
      <MediaControls />
      <ShakeButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingBottom: 100, // Space for media controls
  },
  headerContainer: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    marginVertical: theme.spacing.small,
    marginHorizontal: theme.spacing.medium,
    borderRadius: 8,
    ...theme.shadows.default,
  },
  header: {
    ...theme.typography.header,
    color: theme.colors.text,
  },
});
