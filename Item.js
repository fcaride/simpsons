import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export const Item = ({ item }) => {
  const { episodeName, url, season } = item;
  const navigation = useNavigation();

  const onPressItem = () => navigation.navigate("VideoPlayer", { url });

  return (
    <TouchableOpacity style={styles.container} onPress={onPressItem}>
      <Text style={styles.text}>{episodeName}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderBottomWidth: 0.3,
    borderColor: "black",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  text: {
    fontSize: 16,
    color: "black",

    fontFamily: "VarelaRound_400Regular",
  },
});
