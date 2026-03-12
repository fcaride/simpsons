import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity } from "react-native";
import {
  useRemoteMediaClient,
  useCastState,
  CastState,
} from "../services/useCast";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, SeasonData } from "../types";
import { theme } from "../theme";

interface ShakeButtonProps {
  episodes: SeasonData[];
}

export const ShakeButton = ({
  episodes,
}: ShakeButtonProps): React.JSX.Element | null => {
  const animation = useRef(new Animated.Value(0)).current;
  const isProcessing = useRef(false);

  const client = useRemoteMediaClient();
  const castState = useCastState();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleRandomPress = async () => {
    if (isProcessing.current) return;

    const flattenList = episodes.map((section) => section.data).flat();

    if (flattenList.length === 0) return;

    isProcessing.current = true;

    const randomIndex = Math.floor(Math.random() * flattenList.length);
    const randomEpisode = flattenList[randomIndex];

    try {
      if (castState === CastState.CONNECTED && client) {
        await client.loadMedia({
          mediaInfo: {
            contentUrl: randomEpisode.url,
            contentType: "video/mp4",
            metadata: {
              type: "movie",
              title: randomEpisode.episodeName,
              subtitle: randomEpisode.season,
              images: [],
            },
          },
          autoplay: true,
        });
      } else {
        navigation.navigate("VideoPlayer", {
          url: randomEpisode.url,
          episodeName: randomEpisode.episodeName,
          season: randomEpisode.season,
        });
      }
    } catch (error) {
      console.warn("ShakeButton loadMedia failed, falling back to local:", error);
      navigation.navigate("VideoPlayer", {
        url: randomEpisode.url,
        episodeName: randomEpisode.episodeName,
        season: randomEpisode.season,
      });
    } finally {
      setTimeout(() => {
        isProcessing.current = false;
      }, 500);
    }
  };

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: -1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),

        Animated.timing(animation, {
          toValue: 1,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: -1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startAnimation();
  }, []);

  return (
    <TouchableOpacity
      onPress={handleRandomPress}
      style={styles.floatingButton}
      activeOpacity={0.8}
    >
      <Animated.Image
        style={{
          width: 100,
          height: 100,
          transform: [
            {
              rotate: animation.interpolate({
                inputRange: [-1, 1],
                outputRange: ["-10deg", "10deg"],
              }),
            },
          ],
        }}
        source={require("../../assets/lacaja.png")}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 95,
    height: 95,
    borderRadius: 45,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
});
