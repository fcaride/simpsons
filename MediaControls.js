import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  CastState,
  MediaPlayerState,
  useCastState,
  useMediaStatus,
  useRemoteMediaClient,
} from "react-native-google-cast";

export const MediaControls = () => {
  const client = useRemoteMediaClient();
  const mediaStatus = useMediaStatus();
  const castState = useCastState();

  const statusButton =
    mediaStatus?.playerState === MediaPlayerState.PLAYING ? (
      <TouchableOpacity style={styles.button} onPress={() => client?.pause()}>
        <Text style={styles.textButton}>Pause</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity style={styles.button} onPress={() => client?.play()}>
        <Text style={styles.textButton}>Play</Text>
      </TouchableOpacity>
    );

  return (
    castState === CastState.CONNECTED && (
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
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    backgroundColor: "#D2B17D",
    width: "100%",
  },
  button: {
    padding: 15,
  },
  textButton: {
    color: "white",
  },
});
