import { useVideoPlayer, VideoView } from "expo-video";
import * as ScreenOrientation from "expo-screen-orientation";
import { useRef, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View, Button } from "react-native";

export function VideoPlayer({ route }) {
  const { url } = route.params;
  const [isPreloading, setIsPreloading] = useState(true);
  const [isError, setIsError] = useState(false);

  const player = useVideoPlayer(url, (player) => {
    player.play();
  });

  /*
    expo-video automatically handles fullscreen transitions locally in the view.
    If we need specific orientation locking logic, we can listen to player events,
    but the default behavior usually works well for simple players.
    We'll keep the ScreenOrientation import in case we need to re-add it,
    but removing the manual listener for now as VideoView handles it differently.
  */

  return (
    <View style={styles.container}>
      {isPreloading && <ActivityIndicator size="large" />}
      <VideoView
        player={player}
        style={{ width: Dimensions.get("window").width, height: 200 }}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="cover"
        onRide={() => setIsPreloading(false)}
      />
      {isError && (
        <Button
          title="Retry"
          onPress={() => {
            player.replace(url);
            player.play();
            setIsError(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
  },
});
