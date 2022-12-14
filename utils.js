import { episodes } from "./episodesHD";
import { seasonsServers } from "./serverList";

// export const formatName = (name, serverUrl) => {
//   const baseUrl =
//     serverUrl ??
//     "https://bafybeiermzzq7elgjtynvtv5t2ynkz3xvubi726hngo6bi3dgbpph5ueku.ipfs.dweb.link/Los%20Simpsons";
//   const scapeArray = (array) =>
//     array.map((item) => encodeURIComponent(item)).join("/");
//   const splittedName = name.split("/");
//   const url = `${baseUrl}/${scapeArray(splittedName)}`;
//   const nameWithSeason = splittedName[1];
//   const splittedNameWithSeason = nameWithSeason.split(" - ");
//   return {
//     url,
//     episodeName: splittedNameWithSeason[1].replace(".mp4", ""),
//     nameWithSeason,
//     season: splittedNameWithSeason[0],
//   };
// };

const formatName = (name) => {
  const regex = / (.*?)\./;
  const formattedName = regex.exec(name);
  return formattedName[0].replace("- ", "").replace(".", "");
};

export const getSectionsEpisodes = () => {
  const useWeb3 = true;

  if (useWeb3) {
    return seasonsServers.map((url, index) => ({
      season: `Temporada ${index + 1}`,
      data: episodes[index].map((episode, episodeNumber) => ({
        episodeName: `${episodeNumber + 1} - ${formatName(episode)}`,
        url: `${url}/${encodeURIComponent(episode)}`,
        season: `Temporada ${index + 1}`,
      })),
    }));
  } else {
    return episodes.map((season, index) => ({
      season: `Temporada ${index + 1}`,
      data: season.map((episode, episodeNumber) => ({
        episodeName: `${episodeNumber + 1} - ${formatName(episode)}`,
        url: `http://simpsonslatino.hopto.org/Simpsons/${encodeURIComponent(
          episode
        )}`,
        season: `Temporada ${index + 1}`,
      })),
    }));
  }
};
