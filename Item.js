import { TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
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
    width: Dimensions.get("window").width,
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "blue",
  },
});
