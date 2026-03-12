import { PREMIUMIZE_API_KEY, SIMPSONS_FOLDER_NAME } from "../config";
import {
  PremiumizeItem,
  PremiumizeFolderResponse,
  SeasonData,
  Episode,
} from "../types";

const BASE_URL = "https://www.premiumize.me/api";

/**
 * Premiumize API Service
 * Handles fetching folder contents and streaming links from Premiumize cloud storage.
 */
class PremiumizeService {
  private apiKey: string;

  constructor(apiKey: string = PREMIUMIZE_API_KEY) {
    this.apiKey = apiKey;
  }

  /**
   * Make an authenticated API request to Premiumize
   */
  private async request<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append("apikey", this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `Premiumize API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(
        `Premiumize API error: ${data.message || "Unknown error"}`
      );
    }

    return data;
  }

  private cache: Map<string, { timestamp: number; data: PremiumizeFolderResponse }> = new Map();
  private pendingRequests: Map<string, Promise<PremiumizeFolderResponse>> = new Map();
  private CACHE_DURATION = 1000 * 60 * 5;

  async listFolder(folderId?: string): Promise<PremiumizeFolderResponse> {
    const cacheKey = folderId || "root";

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // Check if request is already in flight (deduping)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(
        cacheKey
      ) as Promise<PremiumizeFolderResponse>;
    }

    const params: Record<string, string> = {};
    if (folderId) {
      params.id = folderId;
    }

    // Create new request promise
    const requestPromise = this.request<PremiumizeFolderResponse>(
      "/folder/list",
      params
    )
      .then((data) => {
        // Cache successful response
        this.cache.set(cacheKey, { timestamp: Date.now(), data });
        return data;
      })
      .finally(() => {
        // Remove from pending requests when done
        this.pendingRequests.delete(cacheKey);
      });

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Find the Simpsons folder in the root directory
   */
  async findSimpsonsFolder(): Promise<PremiumizeItem | null> {
    const rootContents = await this.listFolder();
    return (
      rootContents.content.find(
        (item) =>
          item.type === "folder" &&
          item.name.toLowerCase() === SIMPSONS_FOLDER_NAME.toLowerCase()
      ) || null
    );
  }

  /**
   * Get all season folders from the Simpsons folder
   * Returns folders sorted by name (01, 02, 03, etc.)
   */
  async getSeasonFolders(): Promise<PremiumizeItem[]> {
    const simpsonsFolder = await this.findSimpsonsFolder();

    if (!simpsonsFolder) {
      throw new Error(
        `Folder "${SIMPSONS_FOLDER_NAME}" not found in Premiumize cloud`
      );
    }

    const contents = await this.listFolder(simpsonsFolder.id);

    // Filter for folders and sort by name
    return contents.content
      .filter((item) => item.type === "folder")
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      );
  }

  /**
   * Get all episodes from a season folder
   * Returns files with stream_link, sorted by name
   */
  async getEpisodesForSeason(
    seasonFolderId: string
  ): Promise<PremiumizeItem[]> {
    const contents = await this.listFolder(seasonFolderId);

    // Filter for video files and sort by name
    return contents.content
      .filter(
        (item) =>
          item.type === "file" && item.name.toLowerCase().endsWith(".mp4")
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      );
  }

  /**
   * Parse episode name from filename
   * E.g., "01x01 - Especial de Navidad_hevc.mp4" -> "Especial de Navidad"
   */
  private parseEpisodeName(filename: string): string {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

    // Try to extract the episode title after the episode number
    // Pattern: "01x01 - Episode Title" or "01x01 Episode Title"
    const match = nameWithoutExt.match(/^\d+x\d+\s*[-–]?\s*(.+?)(?:_hevc)?$/i);

    if (match) {
      return match[1].trim();
    }

    // Fallback: return the filename without extension and _hevc suffix
    return nameWithoutExt.replace(/_hevc$/i, "").trim();
  }

  /**
   * Fetch all episodes from all seasons
   * Returns data formatted for the app's SectionList
   */
  async getAllEpisodes(): Promise<SeasonData[]> {
    const seasonFolders = await this.getSeasonFolders();

    const results = await Promise.all(
      seasonFolders.map(async (seasonFolder) => {
        const seasonNumber = parseInt(seasonFolder.name, 10);
        const seasonName = `Temporada ${seasonNumber}`;
        const episodes = await this.getEpisodesForSeason(seasonFolder.id);

        const episodeData: Episode[] = episodes.map((episode) => ({
          episodeName: this.parseEpisodeName(episode.name),
          url: episode.stream_link || episode.link || "",
          season: seasonName,
        }));

        return { season: seasonName, data: episodeData };
      })
    );

    return results.filter((section) => section.data.length > 0);
  }
}

// Export a singleton instance with the configured API key
export const premiumizeService = new PremiumizeService();

// Also export the class for testing or custom instances
export { PremiumizeService };
