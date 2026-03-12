// Fallback implementations used when platform-specific files
// (useCast.native.ts / useCast.web.tsx) are not resolved.

export enum CastState {
  NO_DEVICES_AVAILABLE = "NoDevicesAvailable",
  NOT_CONNECTED = "NotConnected",
  CONNECTING = "Connecting",
  CONNECTED = "Connected",
}

export enum MediaPlayerState {
  IDLE = "idle",
  PLAYING = "playing",
  PAUSED = "paused",
  BUFFERING = "buffering",
  LOADING = "loading",
  UNKNOWN = "unknown",
}

export const CastButton = (_props: { style?: { width?: number; height?: number; tintColor?: string } }) => null;

export const CastContext = {
  endCurrentSession: (_stopCasting: boolean) => {},
};

export const useCastState = (): CastState => {
  return CastState.NO_DEVICES_AVAILABLE;
};

export interface MediaInfo {
  contentUrl: string;
  contentType?: string;
  metadata?: Record<string, any>;
}

export interface RemoteMediaClient {
  loadMedia(request: {
    mediaInfo?: MediaInfo;
    queueData?: { items: any[] };
    autoplay?: boolean;
  }): void;
  play(): void;
  pause(): void;
  queueNext(): void;
  queuePrev(): void;
}

export const useRemoteMediaClient = (): RemoteMediaClient | null => {
  return null;
};

export interface MediaStatus {
  playerState: MediaPlayerState;
  mediaInfo?: {
    metadata?: Record<string, any>;
  };
}

export const useMediaStatus = (): MediaStatus | null => {
  return null;
};

export function prepareForCast(_url: string) {
  // no-op in fallback
}

export async function castQueue(
  _items: { url: string; title?: string; subtitle?: string }[]
): Promise<boolean> {
  return false;
}
