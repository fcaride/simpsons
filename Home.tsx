import React from "react";
import {
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { Item } from "./Item";
import { MediaControls } from "./MediaControls";
import { theme } from "./theme";
import { ShakeButton } from "./ShakeButton";
import { useEpisodes } from "./hooks/useEpisodes";

export function Home(): React.JSX.Element {
  const { episodes, loading, error } = useEpisodes();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando episodios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>Error al cargar</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>Verifica tu API key en config.ts</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={episodes}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    color: theme.colors.text,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.large,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.medium,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
  },
  errorHint: {
    fontSize: 14,
    color: theme.colors.accent,
    textAlign: "center",
  },
});
