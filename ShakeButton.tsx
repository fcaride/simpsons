import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity } from "react-native";
import {
  useRemoteMediaClient,
  useCastState,
  CastState,
} from "./services/useCast";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { useEpisodes } from "./hooks/useEpisodes";

export const ShakeButton = (): React.JSX.Element | null => {
  const animation = useRef(new Animated.Value(0)).current;

  const client = useRemoteMediaClient();
  const castState = useCastState();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { episodes } = useEpisodes();

  const handleRandomPress = () => {
    const flattenList = episodes.map((section) => section.data).flat();

    if (flattenList.length === 0) return;

    if (castState === CastState.CONNECTED) {
      const items = flattenList.map((episode) => {
        const { url, episodeName, season } = episode;
        return {
          mediaInfo: {
            contentUrl: url,
            metadata: {
              title: episodeName,
              subtitle: season,
            } as any,
          },
          preloadTime: 30,
        };
      });
      // Shuffle items using Fisher-Yates algorithm
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }

      client?.loadMedia({
        queueData: {
          items,
        },
      });
    } else {
      // Local play: pick one random episode
      const randomIndex = Math.floor(Math.random() * flattenList.length);
      const randomEpisode = flattenList[randomIndex];
      navigation.navigate("VideoPlayer", {
        url: randomEpisode.url,
        episodeName: randomEpisode.episodeName,
        season: randomEpisode.season,
      });
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
        source={require("./assets/lacaja.png")}
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
    backgroundColor: "#07537f",
    alignItems: "center",
    justifyContent: "center",
  },
});
