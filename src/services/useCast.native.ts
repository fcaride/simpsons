// Native implementation - re-exports from react-native-google-cast
export {
  CastButton,
  CastContext,
  CastState,
  useCastState,
  useRemoteMediaClient,
  useMediaStatus,
  MediaPlayerState,
} from "react-native-google-cast";

export function prepareForCast(_url: string) {
  // no-op on native — Google Cast handles media routing internally
}

export async function castQueue(
  _items: { url: string; title?: string; subtitle?: string }[]
): Promise<boolean> {
  return false;
}
