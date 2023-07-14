import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity } from "react-native";

export const ShakeButton = ({ onPress }) => {
  const animation = useRef(new Animated.Value(0)).current;

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
    <TouchableOpacity onPress={onPress} style={styles.floatingButton}>
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
