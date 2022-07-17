import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { useRemoteMediaClient } from "react-native-google-cast";
import { useNavigation } from "@react-navigation/native";

import { formatName } from "./utils";

export const Item = ({ item }) => {
  const { episodeName, url } = item;
  //const { url, episodeName, nameWithSeason, season } = formatName(name);
  const navigation = useNavigation();

  const client = useRemoteMediaClient();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.leftButton}
        onPress={() =>
          client?.loadMedia({
            mediaInfo: {
              contentUrl: url,
              metadata: {
                title: episodeName,
              },
            },
          })
        }
      >
        <Text style={styles.text}>{episodeName}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("VideoPlayer", { url })}
      >
        <Text>Link</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
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
