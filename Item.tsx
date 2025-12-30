import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import {
  useRemoteMediaClient,
  useCastState,
  CastState,
} from "./services/useCast";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "./theme";
import { Episode, RootStackParamList } from "./types";

interface ItemProps {
  item: Episode;
}

export const Item = ({ item }: ItemProps): React.JSX.Element => {
  const { episodeName, url, season } = item;
  const castState = useCastState();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const client = useRemoteMediaClient();

  const onPressItem = () => {
    if (castState === CastState.CONNECTED) {
      client?.loadMedia({
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
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPressItem}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="play-circle" size={32} color={theme.colors.secondary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {episodeName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

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
