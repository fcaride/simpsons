import { TouchableOpacity, Text, StyleSheet, Dimensions, View } from "react-native";
import {
  useRemoteMediaClient,
  useCastState,
  CastState,
} from "react-native-google-cast";
import { useNavigation } from "@react-navigation/native";
import { theme } from "./theme";

export const Item = ({ item }) => {
  const { episodeName, url, season } = item;
  const castState = useCastState();
  const navigation = useNavigation();

  const client = useRemoteMediaClient();

  const onPressItem = () => {
    if (castState === CastState.CONNECTED) {
      client?.loadMedia({
        mediaInfo: {
          contentUrl: url,
          metadata: {
            title: episodeName,
            subtitle: season,
          },
        },
      });
    } else {
      navigation.navigate("VideoPlayer", { url });
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPressItem} activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {episodeName}
        </Text>
        <Text style={styles.subtitle}>{season}</Text>
      </View>
      <View style={styles.indicator} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    marginVertical: theme.spacing.small / 2,
    marginHorizontal: theme.spacing.medium,
    borderRadius: 8,
    padding: theme.spacing.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...theme.shadows.default,
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    ...theme.typography.title,
    marginBottom: 4,
  },
  subtitle: {
    ...theme.typography.subtitle,
  },
  indicator: {
    width: 6,
    height: "80%",
    borderRadius: 3,
    backgroundColor: theme.colors.secondary,
  },
});
