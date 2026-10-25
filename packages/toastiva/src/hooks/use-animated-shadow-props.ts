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
 * rest. The path updates once the morph settles, never during it, so the
 * shadow doesn't redraw every frame. Animations snap to their target when
 * they finish, so the shape is at rest once every input equals its target.
 */
const useAnimatedShadowProps = <T extends IUseToastAnimatedStylesParams>(
  params: T,
) => {
  const {
    values,
    morphAlign,
    bodyWidth,
    bodyRadius,
    expandedHeight,
    noHeader = false,
    pillWidth,
    shadowAtRest = false,
  } = params;
  const restPath = useSharedValue("");
  const shadowOpacity = useSharedValue(0);

  useAnimatedReaction(
    () => {
      if (!shadowAtRest) return null;
      const progress = values.morphProgress.value;
      const isAtRest =
        (progress === 0 || progress === 1) &&
        values.removeProgress.value === 0 &&
        values.bodyWidth.value === bodyWidth &&
        values.pillWidth.value === pillWidth &&
        values.expandedHeight.value === expandedHeight &&
        values.bodyRadius.value === bodyRadius;
      return isAtRest
        ? getToastPath(values, bodyWidth, morphAlign, noHeader)
        : null;
    },
    (path, previous) => {
      if (path === previous) return;
      if (path === null) {
        cancelAnimation(shadowOpacity);
        shadowOpacity.value = 0;
        return;
      }
      restPath.value = path;
      shadowOpacity.value = withTiming(1, {
        duration: SHADOW_FADE_IN_DURATION,
        easing: Easing.out(Easing.quad),
      });
    },
    [
      bodyRadius,
      bodyWidth,
      expandedHeight,
      morphAlign,
      noHeader,
      pillWidth,
      shadowAtRest,
    ],
  );

  const shadowPathProps = useAnimatedProps(() => {
    return { d: restPath.value };
  });
  const shadowStyle = useAnimatedStyle(() => {
    return { opacity: shadowOpacity.value };
  });

  return { shadowPathProps, shadowStyle };
};

const SHADOW_FADE_IN_DURATION = 150;

export { useAnimatedShadowProps };
