import { useMemo } from "react";
import {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { IUseToastAnimatedStylesParams } from "../typings";
import { getToastPath } from "./use-animated-path-props";

/**
 * Shadow path and opacity for a shadow that shows only while the shape is at
 * rest: the morph progress has settled on 0 or 1 and every size is within
 * half a dp of the target it is animating to. The path is built from the
 * targets and only replaced when it differs, so settling on the same shape
 * doesn't redraw the shadow.
 */
const useAnimatedShadowProps = <T extends IUseToastAnimatedStylesParams>(
  params: T,
) => {
  const { values, morphAlign, bodyWidth, noHeader = false } = params;
  const shadowAtRest = params.shadowAtRest ?? false;
  // Without the shadow the reaction watches no shared values, so it never runs.
  const watched = useMemo(
    () =>
      shadowAtRest
        ? {
            bodyRadius: values.bodyRadius,
            bodyW: values.bodyWidth,
            cornerSmoothing: values.cornerSmoothing,
            expandedHeight: values.expandedHeight,
            morphProgress: values.morphProgress,
            pillWidth: values.pillWidth,
            removeProgress: values.removeProgress,
            shapeTarget: values.shapeTarget,
          }
        : null,
    [shadowAtRest, values],
  );
  const restPath = useSharedValue("");
  const shadowOpacity = useSharedValue(0);

  useAnimatedReaction(
    () => {
      if (!watched) return null;
      const {
        bodyRadius,
        bodyW,
        cornerSmoothing,
        expandedHeight,
        morphProgress,
        pillWidth,
        removeProgress,
        shapeTarget,
      } = watched;
      const progress = morphProgress.value;
      const target = shapeTarget.value;
      const isAtRest =
        (progress === 0 || progress === 1) &&
        removeProgress.value === 0 &&
        Math.abs(bodyW.value - target.bodyWidth) < REST_TOLERANCE &&
        Math.abs(pillWidth.value - target.pillWidth) < REST_TOLERANCE &&
        Math.abs(expandedHeight.value - target.expandedHeight) <
          REST_TOLERANCE &&
        Math.abs(bodyRadius.value - target.bodyRadius) < REST_TOLERANCE;
      if (!isAtRest) return null;

      return getToastPath(
        { ...target, progress, smoothing: cornerSmoothing.value },
        bodyWidth,
        morphAlign,
        noHeader,
      );
    },
    (path, previous) => {
      if (path === previous) return;
      if (path === null) {
        cancelAnimation(shadowOpacity);
        shadowOpacity.value = 0;
        return;
      }
      if (path !== restPath.value) restPath.value = path;
      if (shadowOpacity.value < 1) {
        shadowOpacity.value = withTiming(1, {
          duration: SHADOW_FADE_IN_DURATION,
          easing: Easing.out(Easing.quad),
        });
      }
    },
    [bodyWidth, morphAlign, noHeader, watched],
  );

  const shadowPathProps = useAnimatedProps(() => {
    return { d: restPath.value };
  });
  const shadowStyle = useAnimatedStyle(() => {
    return { opacity: shadowOpacity.value };
  });

  return { shadowPathProps, shadowStyle };
};

const REST_TOLERANCE = 0.5;
const SHADOW_FADE_IN_DURATION = 150;

export { useAnimatedShadowProps };
