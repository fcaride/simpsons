import { useNavigation } from "@react-navigation/native";
import { Dimensions, StyleSheet, Text, TouchableOpacity } from "react-native";
import {
  CastState,
  useCastState,
  useRemoteMediaClient,
} from "react-native-google-cast";

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
            images: [
              {
                url: "https://e0.pxfuel.com/wallpapers/728/318/desktop-wallpaper-the-simpsons-family-watching-tv-resolution-tv-series-and-background.jpg",
              },
            ],
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
    borderBottomWidth: 0.3,
    borderColor: "black",
    backgroundColor: "#fff5ce",
  },
  text: {
    fontSize: 16,
    color: "#07537f",

    fontFamily: "VarelaRound_400Regular",
  },
});
