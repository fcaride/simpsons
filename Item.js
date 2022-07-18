import { TouchableOpacity, Text, StyleSheet } from "react-native";
import {
  useRemoteMediaClient,
  useCastState,
  CastState,
} from "react-native-google-cast";
import { useNavigation } from "@react-navigation/native";

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
    <TouchableOpacity style={styles.container} onPress={onPressItem}>
      <Text style={styles.text}>{episodeName}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "grey",
  },
  leftButton: {
    width: "80%",
  },
});
