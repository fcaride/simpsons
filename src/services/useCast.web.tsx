import React, { useState, useEffect, useMemo } from "react";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

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

interface MediaInfo {
  contentUrl: string;
  contentType?: string;
  metadata?: Record<string, any>;
}

interface LoadMediaRequest {
  mediaInfo?: MediaInfo;
  autoplay?: boolean;
}

type Subscriber = () => void;

const DEFAULT_MEDIA_RECEIVER = "CC1AD845";

function loadCastSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).cast?.framework) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      'script[src*="cast_sender"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }

    (window as any).__onGCastApiAvailable = (isAvailable: boolean) => {
      if (isAvailable) resolve();
      else reject(new Error("Cast SDK not available"));
    };

    const script = document.createElement("script");
    script.src =
      "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Cast SDK"));
    document.head.appendChild(script);
  });
}

class WebCastManager {
  private _castState: CastState = CastState.NO_DEVICES_AVAILABLE;
  private _playerState: MediaPlayerState = MediaPlayerState.IDLE;
  private _mediaMetadata: Record<string, any> | null = null;
  private _subscribers = new Set<Subscriber>();
  private _sdkReady = false;

  supported: boolean;

  constructor() {
    if (typeof window === "undefined") {
      this.supported = false;
      return;
    }

    this.supported = true;
    this.initSDK();
  }

  private async initSDK() {
    try {
      await loadCastSDK();
      this._sdkReady = true;

      const cast = (window as any).cast;
      const chrome = (window as any).chrome;

      cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: DEFAULT_MEDIA_RECEIVER,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });

      const ctx = cast.framework.CastContext.getInstance();

      ctx.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        (event: any) => {
          const sessionState = event.sessionState;
          const SessionState = cast.framework.SessionState;

          if (sessionState === SessionState.SESSION_STARTED ||
              sessionState === SessionState.SESSION_RESUMED) {
            this.setCastState(CastState.CONNECTED);
            this.listenToPlayerState();
          } else if (sessionState === SessionState.SESSION_ENDING ||
                     sessionState === SessionState.SESSION_ENDED) {
            this.setCastState(CastState.NOT_CONNECTED);
            this._playerState = MediaPlayerState.IDLE;
            this._mediaMetadata = null;
            this.notify();
          }
        }
      );

      ctx.addEventListener(
        cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        (event: any) => {
          const CastStateEnum = cast.framework.CastState;
          switch (event.castState) {
            case CastStateEnum.NO_DEVICES_AVAILABLE:
              this.setCastState(CastState.NO_DEVICES_AVAILABLE);
              break;
            case CastStateEnum.NOT_CONNECTED:
              if (this._castState !== CastState.CONNECTED) {
                this.setCastState(CastState.NOT_CONNECTED);
              }
              break;
            case CastStateEnum.CONNECTING:
              this.setCastState(CastState.CONNECTING);
              break;
            case CastStateEnum.CONNECTED:
              this.setCastState(CastState.CONNECTED);
              break;
          }
        }
      );
    } catch (e) {
      console.warn("[Cast] SDK failed to load:", e);
      this.supported = false as any;
    }
  }

  private listenToPlayerState() {
    const session = this.getSession();
    if (!session) return;

    const player = new ((window as any).cast.framework.RemotePlayerController)(
      new (window as any).cast.framework.RemotePlayer()
    );

    player.addEventListener(
      (window as any).cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,
      (event: any) => {
        const state = event.value;
        const PlayerState = (window as any).chrome.cast.media.PlayerState;
        switch (state) {
          case PlayerState.PLAYING:
            this.setPlayerState(MediaPlayerState.PLAYING);
            break;
          case PlayerState.PAUSED:
            this.setPlayerState(MediaPlayerState.PAUSED);
            break;
          case PlayerState.BUFFERING:
            this.setPlayerState(MediaPlayerState.BUFFERING);
            break;
          case PlayerState.IDLE:
            this.setPlayerState(MediaPlayerState.IDLE);
            break;
        }
      }
    );
  }

  private getSession() {
    const cast = (window as any).cast;
    if (!cast?.framework) return null;
    return cast.framework.CastContext.getInstance().getCurrentSession();
  }

  private getMediaSession() {
    const session = this.getSession();
    if (!session) return null;
    return session.getMediaSession();
  }

  async requestSession(): Promise<boolean> {
    if (!this._sdkReady) return false;

    try {
      const cast = (window as any).cast;
      await cast.framework.CastContext.getInstance().requestSession();
      return true;
    } catch (e: any) {
      if (e?.code === "cancel") return false;
      console.warn("[Cast] requestSession failed:", e);
      return false;
    }
  }

  private buildMediaInfo(info: MediaInfo) {
    const chrome = (window as any).chrome;
    const mi = new chrome.cast.media.MediaInfo(
      info.contentUrl,
      info.contentType || "video/mp4"
    );
    mi.contentUrl = info.contentUrl;
    mi.streamType = chrome.cast.media.StreamType.BUFFERED;
    if (info.metadata) {
      const castMeta = new chrome.cast.media.GenericMediaMetadata();
      castMeta.title = info.metadata.title || "";
      castMeta.subtitle = info.metadata.subtitle || "";
      if (info.metadata.images?.length) {
        castMeta.images = info.metadata.images.map(
          (img: any) => new chrome.cast.Image(img.url || img)
        );
      }
      mi.metadata = castMeta;
    }
    return mi;
  }

  private buildQueueItem(item: LoadMediaRequest) {
    const chrome = (window as any).chrome;
    const qi = new chrome.cast.media.QueueItem(
      this.buildMediaInfo(item.mediaInfo!)
    );
    qi.autoplay = true;
    qi.preloadTime = 20;
    return qi;
  }

  async castQueue(items: LoadMediaRequest[]): Promise<boolean> {
    if (!items.length) return false;

    let session = this.getSession();
    if (!session) {
      const connected = await this.requestSession();
      if (!connected) return false;
      session = this.getSession();
      if (!session) return false;
    }

    this._mediaMetadata = items[0].mediaInfo?.metadata ?? null;

    if (items.length === 1) {
      this.loadMedia(items[0]);
      return true;
    }

    const chrome = (window as any).chrome;
    const queueItems = items.map((item) => this.buildQueueItem(item));
    const rawSession = session.getSessionObj();

    const request = new chrome.cast.media.QueueLoadRequest(queueItems);
    request.startIndex = 0;
    request.repeatMode = chrome.cast.media.RepeatMode.OFF;

    return new Promise<boolean>((resolve) => {
      rawSession.queueLoad(
        request,
        () => {
          this.setPlayerState(MediaPlayerState.PLAYING);
          resolve(true);
        },
        (err: any) => {
          console.warn("[Cast] queueLoad failed:", err);
          this.loadMedia(items[0]);
          resolve(true);
        }
      );
    });
  }

  loadMedia(request: LoadMediaRequest) {
    if (!request.mediaInfo?.contentUrl) return;

    const session = this.getSession();
    if (!session) return;

    const chrome = (window as any).chrome;
    const loadRequest = new chrome.cast.media.LoadRequest(
      this.buildMediaInfo(request.mediaInfo)
    );
    loadRequest.autoplay = request.autoplay !== false;
    this._mediaMetadata = request.mediaInfo.metadata ?? null;

    session.loadMedia(loadRequest).then(
      () => this.setPlayerState(MediaPlayerState.PLAYING),
      (err: any) => console.warn("[Cast] loadMedia failed:", err)
    );
  }

  play() {
    const media = this.getMediaSession();
    if (media) media.play(null, () => {}, () => {});
  }

  pause() {
    const media = this.getMediaSession();
    if (media) media.pause(null, () => {}, () => {});
  }

  queueInsertItems(items: LoadMediaRequest[]) {
    const media = this.getMediaSession();
    if (!media) return;
    media.queueInsertItems(
      items.map((item) => this.buildQueueItem(item)),
      null, () => {}, () => {}
    );
  }

  queueNext() {
    const media = this.getMediaSession();
    if (media) media.queueNext(null, () => {}, () => {});
  }

  queuePrev() {
    const media = this.getMediaSession();
    if (media) media.queuePrev(null, () => {}, () => {});
  }

  endSession() {
    const cast = (window as any).cast;
    if (!cast?.framework) return;
    cast.framework.CastContext.getInstance().endCurrentSession(true);
    this._playerState = MediaPlayerState.IDLE;
    this._mediaMetadata = null;
    this.setCastState(CastState.NOT_CONNECTED);
  }

  get castState() {
    return this._castState;
  }
  get playerState() {
    return this._playerState;
  }
  get mediaMetadata() {
    return this._mediaMetadata;
  }

  subscribe(callback: Subscriber): () => void {
    this._subscribers.add(callback);
    return () => {
      this._subscribers.delete(callback);
    };
  }

  private setCastState(state: CastState) {
    if (this._castState !== state) {
      this._castState = state;
      this.notify();
    }
  }

  private setPlayerState(state: MediaPlayerState) {
    if (this._playerState !== state) {
      this._playerState = state;
      this.notify();
    }
  }

  private notify() {
    this._subscribers.forEach((cb) => cb());
  }
}

let _manager: WebCastManager | null = null;

function getManager(): WebCastManager {
  if (!_manager) _manager = new WebCastManager();
  return _manager;
}

let _client: {
  loadMedia: (req: LoadMediaRequest) => void;
  play: () => void;
  pause: () => void;
  queueNext: () => void;
  queuePrev: () => void;
  queueInsertItems: (items: LoadMediaRequest[]) => void;
} | null = null;

function getClient() {
  if (!_client) {
    const m = getManager();
    _client = {
      loadMedia: (req) => m.loadMedia(req),
      play: () => m.play(),
      pause: () => m.pause(),
      queueNext: () => m.queueNext(),
      queuePrev: () => m.queuePrev(),
      queueInsertItems: (items) => m.queueInsertItems(items),
    };
  }
  return _client;
}

// ==================== Components ====================

interface CastButtonProps {
  style?: {
    width?: number;
    height?: number;
    tintColor?: string;
  };
}

export const CastButton = ({
  style,
}: CastButtonProps): React.JSX.Element | null => {
  const castState = useCastState();
  const manager = getManager();

  if (!manager.supported) {
    return null;
  }

  const size = Math.min(style?.width || 24, style?.height || 24);
  const color = style?.tintColor || "#000";
  const iconName =
    castState === CastState.CONNECTED ? "cast-connected" : "cast";

  return (
    <TouchableOpacity
      onPress={() => manager.requestSession()}
      style={{
        width: style?.width || 24,
        height: style?.height || 24,
        justifyContent: "center",
        alignItems: "center",
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <MaterialIcons name={iconName} size={size} color={color} />
    </TouchableOpacity>
  );
};

// ==================== Context ====================

export const CastContext = {
  endCurrentSession: (_stopCasting: boolean) => {
    getManager().endSession();
  },
};

// ==================== Hooks ====================

export const useCastState = (): CastState => {
  const [state, setState] = useState<CastState>(() => getManager().castState);

  useEffect(() => {
    const manager = getManager();
    setState(manager.castState);
    return manager.subscribe(() => setState(manager.castState));
  }, []);

  return state;
};

export const useRemoteMediaClient = () => {
  const castState = useCastState();
  if (castState !== CastState.CONNECTED) return null;
  return getClient();
};

export const useMediaStatus = () => {
  const castState = useCastState();
  const [playerState, setPlayerState] = useState<MediaPlayerState>(
    MediaPlayerState.IDLE
  );
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const manager = getManager();
    const update = () => {
      setPlayerState(manager.playerState);
      setMetadata(manager.mediaMetadata);
    };
    update();
    return manager.subscribe(update);
  }, []);

  return useMemo(() => {
    if (castState !== CastState.CONNECTED) return null;
    return {
      playerState,
      mediaInfo: metadata ? { metadata } : undefined,
    };
  }, [castState, playerState, metadata]);
};

// ==================== Utilities ====================

export function prepareForCast(_url: string) {
  // no-op: Google Cast SDK handles media independently from device connection
}

export async function castQueue(
  items: { url: string; title?: string; subtitle?: string }[]
): Promise<boolean> {
  const requests = items.map((item) => ({
    mediaInfo: {
      contentUrl: item.url,
      metadata: { title: item.title, subtitle: item.subtitle },
    },
  }));
  return getManager().castQueue(requests);
}
