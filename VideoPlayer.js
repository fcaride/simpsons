import { useVideoPlayer, VideoView } from "expo-video";
import * as ScreenOrientation from "expo-screen-orientation";
import { useRef, useState, useEffect } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View, Button, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { theme } from "./theme";

export function VideoPlayer({ route }) {
  const { url, episodeName, season } = route.params;
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const player = useVideoPlayer(url, (player) => {
    player.play();
  });

  const videoViewRef = useRef(null);

  useEffect(() => {
    const setupOrientation = async () => {
      try {
        await ScreenOrientation.unlockAsync();
      } catch (error) {
        console.warn("Failed to unlock orientation:", error);
      }
    };

    const handleOrientationChange = (event) => {
      const { orientationInfo } = event;
      const { orientation } = orientationInfo;
      if (!videoViewRef.current) {
        return;
      }
      if (
        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      ) {
          videoViewRef.current.enterFullscreen();
      } else if (
        orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
        orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
      ) {
          videoViewRef.current.exitFullscreen();
      }
    };

    setupOrientation();
    const subscription = ScreenOrientation.addOrientationChangeListener(handleOrientationChange);

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch((err) =>
        console.warn("Failed to lock orientation:", err)
      );
    };
  }, []);

  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      // Hide spinner when video is loaded and ready to play
      if (status.isLoaded) {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{episodeName}</Text>
          <Text style={styles.subtitle}>{season}</Text>
        </View>
      </View>

      <View style={styles.videoContainer}>
        <VideoView
          ref={videoViewRef}
          player={player}
          style={styles.video}
          allowsFullscreen
          allowsPictureInPicture
          contentFit="contain"

        />
        {isLoading && (
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary} 
            style={styles.loader} 
          />
        )}
      </View>

      {isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading video</Text>
          <Button
            title="Retry"
            color={theme.colors.secondary}
            onPress={() => {
              player.replace(url);
              player.play();
              setIsError(false);
            }}
          />
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    position: "absolute",
    top: 40, // Adjust for status bar if SafeAreaView doesn't handle absolute
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#ccc",
    fontSize: 14,
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: 300, // Or aspect ratio
  },
  loader: {
    position: 'absolute',
    zIndex: 5,
  },
  errorContainer: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    alignItems: "center",
  },
  errorText: {
    color: "white",
    marginBottom: 10,
  },
  shakeButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 20,
  },
});
