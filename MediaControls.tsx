import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import {
  useRemoteMediaClient,
  useMediaStatus,
  MediaPlayerState,
  useCastState,
  CastState,
} from "react-native-google-cast";
import { theme } from "./theme";

export const MediaControls = (): React.JSX.Element | null => {
  const client = useRemoteMediaClient();
  const mediaStatus = useMediaStatus();
  const castState = useCastState();

  const statusButton =
    mediaStatus?.playerState === MediaPlayerState.PLAYING ? (
      <TouchableOpacity
        style={[styles.button, styles.playPauseButton]}
        onPress={() => client?.pause()}
      >
        <Text style={styles.textButton}>Pause</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={[styles.button, styles.playPauseButton]}
        onPress={() => client?.play()}
      >
        <Text style={styles.textButton}>Play</Text>
      </TouchableOpacity>
    );

  if (castState !== CastState.CONNECTED) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => client?.queuePrev()}
        >
          <Text style={styles.textButton}>Prev</Text>
        </TouchableOpacity>

        {statusButton}

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
    paddingBottom: 20, // SafeArea
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
