// Episode data structure from episodesHD.js
export interface PremiumizeEpisode {
  url: string;
  name: string;
}

// Processed episode structure used in the app
export interface Episode {
  episodeName: string;
  url: string;
  season: string;
}

// Section data for SectionList
export interface SeasonData {
  season: string;
  data: Episode[];
}

// Navigation params for React Navigation
export type RootStackParamList = {
  Home: undefined;
  VideoPlayer: {
    url: string;
    episodeName: string;
    season: string;
  };
};

// Theme configuration
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    cardBackground: string;
    accent: string;
    white: string;
    black: string;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
  typography: {
    header: {
      fontSize: number;
      fontWeight: "bold";
      color: string;
    };
    title: {
      fontSize: number;
      fontWeight: "600";
      color: string;
    };
    subtitle: {
      fontSize: number;
      color: string;
    };
  };
  shadows: {
    default: {
      shadowColor: string;
      shadowOffset: {
        width: number;
        height: number;
      };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}
