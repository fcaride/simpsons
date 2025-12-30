// Web implementation - provides Google Cast Web SDK implementation
// Based on Google's official CastVideos sample app

declare global {
  interface Window {
    __onGCastApiAvailable: (isAvailable: boolean) => void;
    chrome: any;
    cast: any;
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "google-cast-launcher": any;
    }
  }
}

import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet } from "react-native";

// CastState enum matching react-native-google-cast
export enum CastState {
  NO_DEVICES_AVAILABLE = "NoDevicesAvailable",
  NOT_CONNECTED = "NotConnected",
  CONNECTING = "Connecting",
  CONNECTED = "Connected",
}

// MediaPlayerState enum matching react-native-google-cast
export enum MediaPlayerState {
  IDLE = "idle",
  PLAYING = "playing",
  PAUSED = "paused",
  BUFFERING = "buffering",
  LOADING = "loading",
  UNKNOWN = "unknown",
}

// Track SDK initialization state globally
let castContextInitialized = false;
let remotePlayer: any = null;
let remotePlayerController: any = null;

// Initialize Cast SDK - called when SDK becomes available
const initializeCastPlayer = () => {
  if (castContextInitialized) return;
  if (!window.cast || !window.cast.framework) return;
  if (!window.chrome || !window.chrome.cast) return;

  try {
    const options: any = {};
    // Use default media receiver or set your own receiver application ID
    options.receiverApplicationId =
      window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
    options.autoJoinPolicy = window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;

    window.cast.framework.CastContext.getInstance().setOptions(options);

    // Create RemotePlayer and RemotePlayerController
    remotePlayer = new window.cast.framework.RemotePlayer();
    remotePlayerController = new window.cast.framework.RemotePlayerController(
      remotePlayer
    );

    castContextInitialized = true;
    console.log("Cast SDK initialized successfully");
  } catch (e) {
    console.error("Error initializing Cast SDK:", e);
  }
};

// Load Cast SDK script and set up callback
const loadCastSDK = () => {
  if (typeof window === "undefined") return;

  // Set up the callback that Google Cast SDK will call when available
  window.__onGCastApiAvailable = (isAvailable: boolean) => {
    if (isAvailable) {
      initializeCastPlayer();
    }
  };

  // Load the Cast SDK script if not already loaded
  if (!document.getElementById("cast-sdk-script")) {
    const script = document.createElement("script");
    script.id = "cast-sdk-script";
    script.src =
      "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
    script.async = true;
    document.head.appendChild(script);
  }
};

// Initialize SDK on module load
loadCastSDK();

// Web CastButton component - renders the native google-cast-launcher element
export const CastButton = (props: any) => {
  const [isReady, setIsReady] = useState(castContextInitialized);

  useEffect(() => {
    // Poll for SDK availability
    const checkSDK = setInterval(() => {
      if (castContextInitialized) {
        setIsReady(true);
        clearInterval(checkSDK);
      } else {
        // Try to initialize if SDK is available but not yet initialized
        initializeCastPlayer();
      }
    }, 500);

    // Initial check
    if (castContextInitialized) {
      setIsReady(true);
    }

    return () => clearInterval(checkSDK);
  }, []);

  if (!isReady) return null;

  return (
    <View style={[styles.container, props.style]}>
      <google-cast-launcher
        style={
          {
            width: "100%",
            height: "100%",
            display: "block",
            "--connected-color": props.tintColor || "#FFFFFF",
            "--disconnected-color": props.tintColor || "#FFFFFF",
          } as any
        }
      />
    </View>
  );
};

// Hook to track Cast connection state
export const useCastState = (): CastState => {
  const [castState, setCastState] = useState<CastState>(
    CastState.NO_DEVICES_AVAILABLE
  );

  useEffect(() => {
    // Poll for SDK and listen for connection changes
    let cleanup: (() => void) | null = null;

    const setupListener = () => {
      if (!castContextInitialized || !remotePlayerController) {
        return false;
      }

      // Get initial state
      const updateState = () => {
        if (remotePlayer && remotePlayer.isConnected) {
          setCastState(CastState.CONNECTED);
        } else {
          // Check if devices are available via CastContext
          try {
            const context = window.cast.framework.CastContext.getInstance();
            const state = context.getCastState();
            if (state === "NO_DEVICES_AVAILABLE") {
              setCastState(CastState.NO_DEVICES_AVAILABLE);
            } else if (state === "CONNECTING") {
              setCastState(CastState.CONNECTING);
            } else {
              setCastState(CastState.NOT_CONNECTED);
            }
          } catch {
            setCastState(CastState.NOT_CONNECTED);
          }
        }
      };

      updateState();

      // Listen for connection changes on RemotePlayerController
      const connectionHandler = () => {
        updateState();
      };

      remotePlayerController.addEventListener(
        window.cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
        connectionHandler
      );

      // Also listen to CastContext state changes
      const context = window.cast.framework.CastContext.getInstance();
      const castStateHandler = (event: any) => {
        updateState();
      };

      context.addEventListener(
        window.cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        castStateHandler
      );

      cleanup = () => {
        remotePlayerController.removeEventListener(
          window.cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
          connectionHandler
        );
        context.removeEventListener(
          window.cast.framework.CastContextEventType.CAST_STATE_CHANGED,
          castStateHandler
        );
      };

      return true;
    };

    // Try immediately
    if (setupListener()) {
      return () => cleanup?.();
    }

    // Poll until SDK is ready
    const interval = setInterval(() => {
      initializeCastPlayer();
      if (setupListener()) {
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      cleanup?.();
    };
  }, []);

  return castState;
};

// Hook to control remote media - returns client object matching react-native-google-cast API
export const useRemoteMediaClient = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const setupListener = () => {
      if (!castContextInitialized || !remotePlayerController) {
        return false;
      }

      // Get initial connection state
      setIsConnected(remotePlayer?.isConnected || false);

      // Listen for connection changes
      const connectionHandler = () => {
        setIsConnected(remotePlayer?.isConnected || false);
      };

      remotePlayerController.addEventListener(
        window.cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
        connectionHandler
      );

      cleanup = () => {
        remotePlayerController.removeEventListener(
          window.cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
          connectionHandler
        );
      };

      return true;
    };

    if (setupListener()) {
      return () => cleanup?.();
    }

    const interval = setInterval(() => {
      initializeCastPlayer();
      if (setupListener()) {
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      cleanup?.();
    };
  }, []);

  // Load media to Cast device - matches react-native-google-cast API
  const loadMedia = useCallback((request: any) => {
    if (!castContextInitialized) {
      return Promise.reject("Cast SDK not initialized");
    }

    const castSession =
      window.cast.framework.CastContext.getInstance().getCurrentSession();
    if (!castSession) {
      return Promise.reject("No active Cast session");
    }

    // Extract URL and content type from request
    // Support both react-native-google-cast structure and direct structure
    const contentUrl =
      request.mediaInfo?.contentUrl || request.contentUrl || request.sourceUrl;
    const contentType =
      request.mediaInfo?.contentType || request.contentType || "video/mp4";

    // Create MediaInfo object
    const mediaInfo = new window.chrome.cast.media.MediaInfo(
      contentUrl,
      contentType
    );

    // Set up metadata
    mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.metadataType =
      window.chrome.cast.media.MetadataType.GENERIC;

    const metaSource = request.mediaInfo?.metadata || request.metadata || {};
    mediaInfo.metadata.title = metaSource.title || "";
    mediaInfo.metadata.subtitle = metaSource.subtitle || "";

    // Add images if available
    if (metaSource.images && metaSource.images.length > 0) {
      mediaInfo.metadata.images = metaSource.images.map(
        (img: any) => new window.chrome.cast.Image(img.url)
      );
    }

    // Create load request
    const loadRequest = new window.chrome.cast.media.LoadRequest(mediaInfo);
    loadRequest.autoplay = request.autoplay !== false;
    loadRequest.currentTime = request.startTime || 0;

    console.log("Loading media to Cast device:", contentUrl);

    // Load media to Cast session
    return castSession.loadMedia(loadRequest);
  }, []);

  // Play current media
  const play = useCallback(() => {
    if (!remotePlayerController || !remotePlayer) return;
    if (remotePlayer.isPaused) {
      remotePlayerController.playOrPause();
    }
  }, []);

  // Pause current media
  const pause = useCallback(() => {
    if (!remotePlayerController || !remotePlayer) return;
    if (!remotePlayer.isPaused) {
      remotePlayerController.playOrPause();
    }
  }, []);

  // Seek to position in seconds
  const seek = useCallback((position: number) => {
    if (!remotePlayerController || !remotePlayer) return;
    remotePlayer.currentTime = position;
    remotePlayerController.seek();
  }, []);

  // Stop casting and end session
  const stop = useCallback(() => {
    if (!remotePlayerController) return;
    remotePlayerController.stop();
  }, []);

  // Return null if not connected (matches react-native-google-cast behavior)
  if (!isConnected) {
    return null;
  }

  return {
    loadMedia,
    play,
    pause,
    seek,
    stop,
  };
};

// Hook for media status - basic implementation
export const useMediaStatus = () => {
  const [mediaStatus, setMediaStatus] = useState<any>(null);

  useEffect(() => {
    if (!castContextInitialized || !remotePlayerController) {
      return;
    }

    const updateStatus = () => {
      if (!remotePlayer) return;

      setMediaStatus({
        playerState: remotePlayer.playerState,
        currentTime: remotePlayer.currentTime,
        duration: remotePlayer.duration,
        volume: remotePlayer.volumeLevel,
        isMuted: remotePlayer.isMuted,
      });
    };

    // Listen for media status changes
    const handler = () => updateStatus();

    remotePlayerController.addEventListener(
      window.cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,
      handler
    );
    remotePlayerController.addEventListener(
      window.cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,
      handler
    );

    return () => {
      remotePlayerController.removeEventListener(
        window.cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,
        handler
      );
      remotePlayerController.removeEventListener(
        window.cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,
        handler
      );
    };
  }, []);

  return mediaStatus;
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    overflow: "hidden",
  },
});
