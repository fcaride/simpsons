import { Theme } from "./types";

export const theme: Theme = {
  colors: {
    primary: "#FFD90F", // Simpsons Yellow
    secondary: "#1D70B8", // Marge's Hair Blue / Pants Blue
    background: "#F5F5F5",
    text: "#333333",
    cardBackground: "#FFFFFF",
    accent: "#F44336", // Red for strong actions
    white: "#FFFFFF",
    black: "#000000",
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  typography: {
    header: {
      fontSize: 22,
      fontWeight: "bold" as const,
      color: "#333333",
    },
    title: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: "#333333",
    },
    subtitle: {
      fontSize: 14,
      color: "#666666",
    },
  },
  shadows: {
    default: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
};
