import { Platform } from "react-native";
import type {
  IToastivaAndroidShadow,
  TToastivaAndroidShadow,
} from "../typings";

const DEFAULT_ANDROID_SHADOW: Required<IToastivaAndroidShadow> = {
  color: "#000",
  offsetX: 0,
  offsetY: 12,
  opacity: 0.28,
  radius: 28,
};

const ANDROID_SHADOW_LAYERS = 8;

function resolveAndroidShadow(
  shadow: TToastivaAndroidShadow | undefined,
): Required<IToastivaAndroidShadow> | undefined {
  if (Platform.OS !== "android" || shadow === false) return undefined;
  const options = typeof shadow === "object" ? shadow : {};

  return {
    color: options.color ?? DEFAULT_ANDROID_SHADOW.color,
    offsetX: options.offsetX ?? DEFAULT_ANDROID_SHADOW.offsetX,
    offsetY: options.offsetY ?? DEFAULT_ANDROID_SHADOW.offsetY,
    opacity: options.opacity ?? DEFAULT_ANDROID_SHADOW.opacity,
    radius: options.radius ?? DEFAULT_ANDROID_SHADOW.radius,
  };
}

/**
 * Fakes a blurred shadow with rings stroked along the toast outline, so it
 * follows the morph without a `filter`, which stops redrawing animated
 * content on Android. Each ring adds the same opacity, and the radii are
 * spaced so the summed opacity fades out quadratically over `radius`.
 * The surface covers the inner half of each ring. Rings move by at most
 * their own reach, so the offset never opens a gap under the surface edge.
 */
function getAndroidShadowLayers(shadow: Required<IToastivaAndroidShadow>) {
  const layerOpacity =
    1 -
    Math.pow(
      1 - Math.min(1, Math.max(0, shadow.opacity)),
      1 / ANDROID_SHADOW_LAYERS,
    );
  const offset = Math.hypot(shadow.offsetX, shadow.offsetY);
  const offsetScale = 1 / Math.max(shadow.radius, offset, 1);

  return Array.from({ length: ANDROID_SHADOW_LAYERS }, (_, index) => {
    const reach =
      shadow.radius * (1 - Math.sqrt(index / ANDROID_SHADOW_LAYERS));
    return {
      opacity: layerOpacity,
      strokeWidth: reach * 2,
      x: shadow.offsetX * reach * offsetScale,
      y: shadow.offsetY * reach * offsetScale,
    };
  });
}

function getAndroidShadowInset(shadow: Required<IToastivaAndroidShadow>) {
  return (
    Math.ceil(
      shadow.radius +
        Math.max(Math.abs(shadow.offsetX), Math.abs(shadow.offsetY)),
    ) + 1
  );
}

export { getAndroidShadowInset, getAndroidShadowLayers, resolveAndroidShadow };
