import { Platform } from "react-native";
import type {
  IToastivaAndroidShadow,
  TToastivaAndroidShadow,
} from "../typings";

const DEFAULT_ANDROID_SHADOW: Required<IToastivaAndroidShadow> = {
  color: "#152b3b",
  layers: 20,
  offsetX: 0,
  offsetY: 12,
  opacity: 0.36,
  radius: 28,
  whileAnimating: false,
};

const MAX_ANDROID_SHADOW_LAYERS = 64;

function resolveAndroidShadow(
  shadow: TToastivaAndroidShadow | undefined,
): Required<IToastivaAndroidShadow> | undefined {
  if (Platform.OS !== "android" || shadow === false) return undefined;
  const options = typeof shadow === "object" ? shadow : {};

  return {
    color: options.color ?? DEFAULT_ANDROID_SHADOW.color,
    layers: options.layers ?? DEFAULT_ANDROID_SHADOW.layers,
    offsetX: options.offsetX ?? DEFAULT_ANDROID_SHADOW.offsetX,
    offsetY: options.offsetY ?? DEFAULT_ANDROID_SHADOW.offsetY,
    opacity: options.opacity ?? DEFAULT_ANDROID_SHADOW.opacity,
    radius: options.radius ?? DEFAULT_ANDROID_SHADOW.radius,
    whileAnimating:
      options.whileAnimating ?? DEFAULT_ANDROID_SHADOW.whileAnimating,
  };
}

/**
 * Fakes a blurred shadow with rings stroked along the toast outline, so it
 * follows the morph without a `filter`, which stops redrawing animated
 * content on Android. The surface covers the inner half of each ring.
 *
 * Every ring raises the stacked opacity by the same step, the smallest step
 * there is for a given ring count, and the ring radii follow a gaussian
 * falloff: dense near the edge, sparse in the tail. Rings move by at most
 * their own reach, so the offset never opens a gap under the surface edge.
 */
function getAndroidShadowLayers(shadow: Required<IToastivaAndroidShadow>) {
  const count = getLayerCount(shadow.layers);
  const opacity = Math.min(1, Math.max(0, shadow.opacity));
  const sigma = Math.max(shadow.radius, 0) / 2;
  const offset = Math.hypot(shadow.offsetX, shadow.offsetY);
  const offsetScale = 1 / Math.max(shadow.radius, offset, 1);

  return Array.from({ length: count }, (_, index) => {
    const reach = sigma * Math.sqrt(-Math.log((index + 0.5) / count));
    const below = (opacity * index) / count;
    const above = (opacity * (index + 1)) / count;
    return {
      opacity: (above - below) / (1 - below),
      strokeWidth: reach * 2,
      x: shadow.offsetX * reach * offsetScale,
      y: shadow.offsetY * reach * offsetScale,
    };
  });
}

/**
 * Opacity of the shadow at the top and bottom edges of the surface, relative
 * to the stronger one. A drop shadow offset downwards is lighter at the top,
 * as the top edge sits further out in the blurred falloff.
 */
function getAndroidShadowEdgeOpacity(shadow: Required<IToastivaAndroidShadow>) {
  const sigma = Math.max(shadow.radius / 2, 1);
  const top = normalCdf(-shadow.offsetY / sigma);
  const bottom = normalCdf(shadow.offsetY / sigma);
  const strongest = Math.max(top, bottom);

  return { bottom: bottom / strongest, top: top / strongest };
}

function getAndroidShadowInset(shadow: Required<IToastivaAndroidShadow>) {
  return (
    Math.ceil(
      shadow.radius +
        Math.max(Math.abs(shadow.offsetX), Math.abs(shadow.offsetY)),
    ) + 1
  );
}

function getLayerCount(layers: number) {
  return Math.min(
    MAX_ANDROID_SHADOW_LAYERS,
    Math.max(1, Math.round(layers) || 1),
  );
}

// Abramowitz and Stegun 7.1.26, accurate to about 1e-7.
function normalCdf(z: number) {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const poly =
    t *
    (0.254829592 +
      t *
        (-0.284496736 +
          t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-x * x);
  return z < 0 ? (1 - erf) / 2 : (1 + erf) / 2;
}

export {
  getAndroidShadowEdgeOpacity,
  getAndroidShadowInset,
  getAndroidShadowLayers,
  resolveAndroidShadow,
};
