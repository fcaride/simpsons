import { Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import { useRef, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";

export function VideoPlayer({ route }) {
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [isPreloading, setIsPreloading] = useState();
  const [isError, setIsError] = useState(false);
  const { url } = route.params;
  function setOrientation() {
    if (Dimensions.get("window").height > Dimensions.get("window").width) {
      //Device is in portrait mode, rotate to landscape mode.
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      //Device is in landscape mode, rotate to portrait mode.
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  }

  return (
    <View style={styles.container}>
      {isPreloading && <ActivityIndicator size="large" />}
      <Video
        ref={video}
        style={{ width: Dimensions.get("window").width, height: 200 }}
        source={{
          uri: url,
        }}
        useNativeControls
        resizeMode="cover"
        shouldPlay
        onFullscreenUpdate={setOrientation}
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
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
