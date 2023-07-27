import { Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import { useRef, useState } from "react";
import { Dimensions, ImageBackground, StyleSheet } from "react-native";

export function VideoPlayer({ route }) {
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [isPreloading, setIsPreloading] = useState();
  const [isError, setIsError] = useState(false);
  const [indexPlaying, setIndexPlaying] = useState(0);
  const { urls } = route.params;
  function setOrientation() {
    if (Dimensions.get("window").height > Dimensions.get("window").width) {
      //Device is in portrait mode, rotate to landscape mode.
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      //Device is in landscape mode, rotate to portrait mode.
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  }

  const statusChanged = async (status) => {
    setStatus(status);
    if (urls.length <= 1) {
      return;
    }
    if (status.didJustFinish) {
      await video.current.loadAsync({
        uri: urls[indexPlaying + 1],
      });
      video.current.playAsync();
      setIndexPlaying((prev) => prev + 1);
    }
  };

  return (
    <ImageBackground
      source={require("./assets/nubecitas.jpeg")}
      resizeMode="cover"
      style={styles.container}
    >
      <Video
        ref={video}
        style={{
          width: Dimensions.get("window").width,
          height: "100%",
          flex: 1,
          justifyContent: "center",
        }}
        videoStyle={{ position: "relative" }}
        source={{
          uri: urls[indexPlaying],
        }}
        onFullscreenUpdate={setOrientation}
        useNativeControls
        resizeMode="contain"
        shouldPlay
        onPlaybackStatusUpdate={statusChanged}
        onLoadStart={() => setIsPreloading(true)}
        onReadyForDisplay={() => setIsPreloading(false)}
        onError={() => {
          setIsPreloading(false);
          setIsError(true);
        }}
      />
      {isError && (
        <Button
          title="Retry"
          onPress={async () => {
            video?.current.loadAsync({ uri: url });
          }}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
  },
});
