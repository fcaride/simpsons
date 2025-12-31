import { premiumizeService } from "./services/premiumize";
import { SeasonData } from "./types";

const formatName = (name: string): string => {
  const regex = / (.*?)\./;
  const formattedName = regex.exec(name);
  return formattedName
    ? formattedName[0].replace("- ", "").replace(".", "").trim()
    : name;
};

/**
 * Fetch all episodes from Premiumize API
 * Returns sections formatted for SectionList
 */
export const getSectionsEpisodes = async (): Promise<SeasonData[]> => {
  return await premiumizeService.getAllEpisodes();
};

/**
 * Legacy function for static data (kept for reference/fallback)
 * @deprecated Use getSectionsEpisodes() instead
 */
export const getSectionsEpisodesStatic = (): SeasonData[] => {
  // This can be removed once Premiumize integration is verified
  const { premiumizeData } = require("./episodesHD");
  return Object.values(
    premiumizeData as Record<string, { url: string; name: string }[]>
  )
    .map((season, index) => ({
      season: `Temporada ${index + 1}`,
      data: season
        .filter((episode) => episode.url !== "")
        .map((episode) => ({
          episodeName: formatName(episode.name),
          url: episode.url,
          season: `Temporada ${index + 1}`,
        })),
    }))
    .filter((season) => season.data.length > 0);
};
