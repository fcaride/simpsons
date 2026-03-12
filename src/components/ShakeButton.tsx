import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity } from "react-native";
import {
  useRemoteMediaClient,
  useCastState,
  CastState,
} from "../services/useCast";
import { Platform } from "react-native";
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

    const shuffled = [...flattenList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, 20);

    try {
      if (castState === CastState.CONNECTED && client) {
        await client.loadMedia({
          mediaInfo: {
            contentUrl: selected[0].url,
            metadata: {
              title: selected[0].episodeName,
              subtitle: selected[0].season,
            } as any,
          },
          autoplay: true,
        });

        if (selected.length > 1) {
          const queueItems = selected.slice(1).map((episode) => ({
            mediaInfo: {
              contentUrl: episode.url,
              metadata: {
                title: episode.episodeName,
                subtitle: episode.season,
              } as any,
            },
          }));
          await (client as any).queueInsertItems(queueItems);
        }
      } else if (Platform.OS === "web") {
        const mod = await import("../services/useCast");
        const casted =
          "castQueue" in mod &&
          (await (mod as any).castQueue(
            selected.map((ep) => ({
              url: ep.url,
              title: ep.episodeName,
              subtitle: ep.season,
            }))
          ));
        if (!casted) {
          navigation.navigate("VideoPlayer", {
            url: selected[0].url,
            episodeName: selected[0].episodeName,
            season: selected[0].season,
          });
        }
      } else {
        navigation.navigate("VideoPlayer", {
          url: selected[0].url,
          episodeName: selected[0].episodeName,
          season: selected[0].season,
        });
      }
    } catch (error) {
      console.warn("ShakeButton cast failed:", error);
      navigation.navigate("VideoPlayer", {
        url: selected[0].url,
        episodeName: selected[0].episodeName,
        season: selected[0].season,
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
