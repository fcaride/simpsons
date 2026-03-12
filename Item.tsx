import React, { useCallback } from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { CastState } from "./services/useCast";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "./theme";
import { Episode, RootStackParamList } from "./types";

interface ItemProps {
  item: Episode;
  castState: CastState;
  castClient: ReturnType<typeof import("./services/useCast").useRemoteMediaClient>;
}

export const Item = React.memo(
  ({ item, castState, castClient }: ItemProps): React.JSX.Element => {
    const { episodeName, url, season } = item;
    const navigation =
      useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const onPressItem = useCallback(() => {
      if (castState === CastState.CONNECTED && castClient) {
        castClient.loadMedia({
          mediaInfo: {
            contentUrl: url,
            metadata: {
              title: episodeName,
              subtitle: season,
            } as any,
          },
        });
      } else {
        navigation.navigate("VideoPlayer", { url, episodeName, season });
      }
    }, [castState, castClient, url, episodeName, season, navigation]);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPressItem}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name="play-circle"
            size={32}
            color={theme.colors.secondary}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {episodeName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    marginVertical: theme.spacing.small / 2,
    marginHorizontal: theme.spacing.medium,
    borderRadius: 12, // Increased roundness
    padding: theme.spacing.medium,
    flexDirection: "row",
    alignItems: "center",
    ...theme.shadows.default,
  },
  iconContainer: {
    marginRight: theme.spacing.medium,
  },
  content: {
    flex: 1,
  },
  title: {
    ...theme.typography.title,
    fontSize: 16, // Slightly clearer
    color: theme.colors.text,
  },
});
