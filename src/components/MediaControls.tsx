import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import {
  useRemoteMediaClient,
  useMediaStatus,
  MediaPlayerState,
  useCastState,
  CastState,
} from "../services/useCast";
import { theme } from "../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const MediaControls = (): React.JSX.Element | null => {
  const client = useRemoteMediaClient();
  const mediaStatus = useMediaStatus();
  const castState = useCastState();
  const insets = useSafeAreaInsets();

  if (castState !== CastState.CONNECTED) return null;

  const isPlaying = mediaStatus?.playerState === MediaPlayerState.PLAYING;

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => client?.queuePrev()}
        >
          <Text style={styles.textButton}>Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.playPauseButton]}
          onPress={() => (isPlaying ? client?.pause() : client?.play())}
        >
          <Text style={styles.textButton}>{isPlaying ? "Pause" : "Play"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => client?.queueNext()}
        >
          <Text style={styles.textButton}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
    ...theme.shadows.default,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.secondary,
    borderRadius: 25,
  },
  playPauseButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 30,
    transform: [{ scale: 1.1 }],
  },
  textButton: {
    color: theme.colors.white,
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: 12,
  },
});
