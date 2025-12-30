// Web implementation - provides Google Cast Web SDK implementation

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

import React, { useEffect, useState, useCallback } from "react";
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

// Initialize Cast SDK
const initializeCastApi = () => {
  if (typeof window !== "undefined") {
    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) {
        // Initialize with default receiver or your custom receiver ID
        // CC1AD845 is the Default Media Receiver
        // We use a try-catch block because accessing window.cast might still be fragile
        try {
          const context = window.cast.framework.CastContext.getInstance();
          context.setOptions({
            receiverApplicationId:
              window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          });
        } catch (e) {
          console.error("Error initializing Cast SDK:", e);
        }
      }
    };

    // Load the Cast SDK if not already loaded
    if (!document.getElementById("google-cast-script")) {
      const script = document.createElement("script");
      script.id = "google-cast-script";
      script.src =
        "https://www.gstatic.com/cv/js/sender/v1/cast_framework.js?loadCastFramework=1";
      document.body.appendChild(script);
    }
  }
};

// Call initialization immediately
initializeCastApi();

// Web CastButton component
export const CastButton = (props: any) => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Ensure script is loaded
    if (!document.getElementById("google-cast-script")) {
      const script = document.createElement("script");
      script.id = "google-cast-script";
      script.src =
        "https://www.gstatic.com/cv/js/sender/v1/cast_framework.js?loadCastFramework=1";
      document.body.appendChild(script);

      // Initialize callback
      window.__onGCastApiAvailable = (isAvailable) => {
        if (isAvailable) {
          try {
            const context = window.cast.framework.CastContext.getInstance();
            context.setOptions({
              receiverApplicationId:
                window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
              autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
            });
          } catch (e) {
            console.error("Error initializing Cast SDK:", e);
          }
        }
      };
    }

    // Check availability periodically
    const check = setInterval(() => {
      if (window.cast && window.cast.framework) {
        setIsAvailable(true);
        clearInterval(check);
      }
    }, 500);
    return () => clearInterval(check);
  }, []);

  if (!isAvailable) return null;

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
      ></google-cast-launcher>
    </View>
  );
};

// Hook to track Cast State
export const useCastState = (): CastState => {
  const [castState, setCastState] = useState<CastState>(
    CastState.NO_DEVICES_AVAILABLE
  );

  useEffect(() => {
    if (!window.cast || !window.cast.framework) return;

    const context = window.cast.framework.CastContext.getInstance();

    // Initial state
    updateCastState(context.getCastState());

    const eventHandler = (event: any) => {
      updateCastState(event.castState);
    };

    context.addEventListener(
      window.cast.framework.CastContextEventType.CAST_STATE_CHANGED,
      eventHandler
    );

    return () => {
      context.removeEventListener(
        window.cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        eventHandler
      );
    };
  }, []);

  const updateCastState = (webCastState: string) => {
    switch (webCastState) {
      case "NO_DEVICES_AVAILABLE":
        setCastState(CastState.NO_DEVICES_AVAILABLE);
        break;
      case "NOT_CONNECTED":
        setCastState(CastState.NOT_CONNECTED);
        break;
      case "CONNECTING":
        setCastState(CastState.CONNECTING);
        break;
      case "CONNECTED":
        setCastState(CastState.CONNECTED);
        break;
      default:
        setCastState(CastState.NO_DEVICES_AVAILABLE);
    }
  };

  return castState;
};

// Hook to control media
export const useRemoteMediaClient = () => {
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    if (!window.cast || !window.cast.framework) return;

    const context = window.cast.framework.CastContext.getInstance();

    // Initial fetch
    const session = context.getCurrentSession();
    if (session) setClient(session.getMediaSession());

    const eventHandler = () => {
      const session = context.getCurrentSession();
      if (session) {
        setClient(session.getMediaSession() || {}); // return object to allow methods even if media session is null initially? No, better return null.
        // Actually, we need a stable object that proxies calls to current session
      } else {
        setClient(null);
      }
    };

    context.addEventListener(
      window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
      eventHandler
    );

    return () => {
      context.removeEventListener(
        window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        eventHandler
      );
    };
  }, []);

  // Return a stable API object that wraps the current session
  // This mimics the library's hook behavior better

  const loadMedia = useCallback((mediaInfo: any) => {
    const context = window.cast.framework.CastContext.getInstance();
    const session = context.getCurrentSession();
    if (!session) return Promise.reject("No session");

    // Construct media info
    // Support both react-native-google-cast structure and direct structure
    const url =
      mediaInfo.mediaInfo?.contentUrl ||
      mediaInfo.sourceUrl ||
      mediaInfo.contentUrl;
    const contentType =
      mediaInfo.mediaInfo?.contentType || mediaInfo.contentType || "video/mp4";

    const mediaInfoWeb = new window.chrome.cast.media.MediaInfo(
      url,
      contentType
    );

    // Add metadata
    const metadata = new window.chrome.cast.media.GenericMediaMetadata();
    const metaSource =
      mediaInfo.mediaInfo?.metadata || mediaInfo.metadata || {};
    metadata.title = metaSource.title;
    metadata.subtitle = metaSource.subtitle;

    const images = metaSource.images;
    if (images && images.length > 0) {
      metadata.images = [new window.chrome.cast.Image(images[0].url)];
    }
    mediaInfoWeb.metadata = metadata;

    const request = new window.chrome.cast.media.LoadRequest(mediaInfoWeb);
    request.autoplay = mediaInfo.autoplay !== false;
    request.currentTime = mediaInfo.currentTime || 0;

    return session.loadMedia(request);
  }, []);

  const play = useCallback(() => {
    const context = window.cast.framework.CastContext.getInstance();
    const session = context.getCurrentSession();
    if (session) {
      const media = session.getMediaSession();
      if (media) media.play();
    }
  }, []);

  const pause = useCallback(() => {
    const context = window.cast.framework.CastContext.getInstance();
    const session = context.getCurrentSession();
    if (session) {
      const media = session.getMediaSession();
      if (media) media.pause();
    }
  }, []);

  return {
    loadMedia,
    play,
    pause,
    seek: (position: number) => {
      const context = window.cast.framework.CastContext.getInstance();
      const session = context.getCurrentSession();
      if (session) {
        const media = session.getMediaSession();
        // Create seek request
        const request = new window.chrome.cast.media.SeekRequest();
        request.currentTime = position;
        if (media) media.seek(request);
      }
    },
    stop: () => {
      const context = window.cast.framework.CastContext.getInstance();
      const session = context.getCurrentSession();
      if (session) {
        session.endSession(true);
      }
    },
  };
};

export const useMediaStatus = () => {
  // Basic implementation for now
  return null;
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    overflow: "hidden",
  },
});
