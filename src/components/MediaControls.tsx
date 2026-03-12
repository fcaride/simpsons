import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useRemoteMediaClient,
  useMediaStatus,
  MediaPlayerState,
  useCastState,
  CastState,
  CastContext,
} from "../services/useCast";
import { theme } from "../theme";

export const MediaControls = (): React.JSX.Element | null => {
  const client = useRemoteMediaClient();
  const mediaStatus = useMediaStatus();
  const castState = useCastState();

  if (castState !== CastState.CONNECTED) return null;

  const isPlaying = mediaStatus?.playerState === MediaPlayerState.PLAYING;
  const metadata = (mediaStatus as any)?.mediaInfo?.metadata;
  const title = metadata?.title ?? "Sin reproducción";
  const subtitle = metadata?.subtitle ?? "";

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Ionicons
          name="tv-outline"
          size={22}
          color={theme.colors.primary}
          style={styles.castIcon}
        />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => client?.queuePrev()}
            hitSlop={8}
          >
            <Ionicons
              name="play-back"
              size={22}
              color={theme.colors.secondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => (isPlaying ? client?.pause() : client?.play())}
            style={styles.playPause}
            hitSlop={8}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={26}
              color={theme.colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => client?.queueNext()}
            hitSlop={8}
          >
            <Ionicons
              name="play-forward"
              size={22}
              color={theme.colors.secondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => CastContext.endCurrentSession(true)}
          hitSlop={8}
          style={styles.stopButton}
        >
          <Ionicons
            name="close-circle-outline"
            size={24}
            color={theme.colors.accent}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    ...theme.shadows.default,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  castIcon: {
    marginRight: 10,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 1,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  playPause: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stopButton: {
    marginLeft: 14,
  },
});
