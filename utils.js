export const formatName = (name) => {
  const scapeArray = (array) =>
    array.map((item) => encodeURIComponent(item)).join("/");
  const splittedName = name.split("/");
  const url = `https://bafybeiermzzq7elgjtynvtv5t2ynkz3xvubi726hngo6bi3dgbpph5ueku.ipfs.dweb.link/Los%20Simpsons/${scapeArray(
    splittedName
  )}`;
  const nameWithSeason = splittedName[1];
  const splittedNameWithSeason = nameWithSeason.split(" - ");
  return {
    url,
    episodeName: splittedNameWithSeason[1].replace(".mp4", ""),
    nameWithSeason,
    season: splittedNameWithSeason[0],
  };
};
