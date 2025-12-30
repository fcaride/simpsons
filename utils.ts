import { premiumizeData } from "./episodesHD";
import { SeasonData } from "./types";

const formatName = (name: string): string => {
  const regex = / (.*?)\./;
  const formattedName = regex.exec(name);
  return formattedName
    ? formattedName[0].replace("- ", "").replace(".", "").trim()
    : name;
};

export const getSectionsEpisodes = (): SeasonData[] => {
  return Object.values(premiumizeData)
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
