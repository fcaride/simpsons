import { useState, useRef } from "react";
import { View, StyleSheet, Button, ActivityIndicator } from "react-native";
import { Video, AVPlaybackStatus } from "expo-av";

export function VideoPlayer({ route }) {
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [isPreloading, setIsPreloading] = useState();
  const { url } = route.params;

  return (
    <View style={styles.container}>
      {isPreloading && <ActivityIndicator size="large" />}
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: url,
        }}
        useNativeControls
        resizeMode="contain"
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        onLoadStart={() => setIsPreloading(true)}
        onReadyForDisplay={() => setIsPreloading(false)}
      />
      <View style={styles.buttons}>
        <Button
          title={status.isPlaying ? "Pause" : "Play"}
          onPress={() =>
            status.isPlaying
              ? video.current.pauseAsync()
              : video.current.playAsync()
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
  },
  video: {
    alignSelf: "center",
    width: 320,
    height: 200,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
