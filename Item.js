import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { useRemoteMediaClient } from "react-native-google-cast";

import * as Linking from "expo-linking";
import { formatName } from "./utils";

export const Item = ({ name }) => {
  const { url, episodeName, nameWithSeason, season } = formatName(name);

  const client = useRemoteMediaClient();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.text}
        onPress={() =>
          client?.loadMedia({
            mediaInfo: {
              contentUrl: url,
              metadata: {
                title: episodeName,
                subtitle: season,
              },
            },
          })
        }
      >
        <Text style={styles.text}>{nameWithSeason}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL(url)}>
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
  },
  text: {
    width: "80%",
  },
});
