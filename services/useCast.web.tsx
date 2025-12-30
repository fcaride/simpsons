// Web implementation - provides stub implementations for web platform

// CastState enum
export enum CastState {
  NO_DEVICES_AVAILABLE = "NoDevicesAvailable",
  NOT_CONNECTED = "NotConnected",
  CONNECTING = "Connecting",
  CONNECTED = "Connected",
}

// MediaPlayerState enum
export enum MediaPlayerState {
  IDLE = "idle",
  PLAYING = "playing",
  PAUSED = "paused",
  BUFFERING = "buffering",
  LOADING = "loading",
  UNKNOWN = "unknown",
}

// Stub CastButton component
export const CastButton = () => null;

// Stub useCastState hook
export const useCastState = (): CastState => {
  return CastState.NO_DEVICES_AVAILABLE;
};

// Stub useRemoteMediaClient hook
export const useRemoteMediaClient = () => {
  return null;
};

// Stub useMediaStatus hook
export const useMediaStatus = () => {
  return null;
};
