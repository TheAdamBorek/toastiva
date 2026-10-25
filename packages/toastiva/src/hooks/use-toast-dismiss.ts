import type { IUseToastDismissParams } from "../typings";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelAnimation,
  Easing,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SHOW_BODY_DELAY } from "../constants";
import { getCollapseDuration, getDisplayDuration } from "../utils/toast-timing";

function useToastDismiss(params: IUseToastDismissParams) {
  const {
    expanded,
    animationConfig,
    hasBody,
    showBody,
    isExpandedCandidate,
    isFront,
    isVisible,
    onRemove,
    paused = false,
    shouldAutoExpand,
    springConfig,
    toast,
    values,
  } = params;
  const [isDismissing, setIsDismissing] = useState(false);
  const dismissedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef<number | null>(null);
  const timerStartRef = useRef(0);
  const timerVersionRef = useRef(toast.timerVersion);
  const countdownStartedRef = useRef(false);
  const expandedBodyVisibleRef = useRef(false);
  const collapseDuration = getCollapseDuration(toast);
  const displayDuration = getDisplayDuration(toast);

  useEffect(() => {
    dismissedRef.current = false;
    remainingRef.current = null;
    timerStartRef.current = 0;
    countdownStartedRef.current = false;
    expandedBodyVisibleRef.current = false;
    setIsDismissing(false);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [toast.id]);

  useEffect(() => {
    expandedBodyVisibleRef.current =
      hasBody && showBody && !isDismissing && isExpandedCandidate;
  }, [hasBody, isDismissing, isExpandedCandidate, showBody]);

  const handleDismiss = useCallback(() => {
    if (paused) return;
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    const collapseBeforeExit = hasBody && expandedBodyVisibleRef.current;
    setIsDismissing(collapseBeforeExit);
    if (timerRef.current) clearTimeout(timerRef.current);

    const collapseShapeDuration = collapseBeforeExit
      ? getSmoothDismissCollapseDuration(animationConfig.morph.collapseDuration)
      : 100;

    if (collapseBeforeExit) {
      values.morphProgress.value = withSpring(0, springConfig.morphCollapse);
      values.squishY.value = withSpring(1, springConfig.morphCollapse);
      values.squishX.value = withSpring(1, springConfig.morphCollapse);
    } else {
      const collapseAnim = {
        duration: collapseShapeDuration,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      };
      values.morphProgress.value = withTiming(0, collapseAnim);
      values.squishY.value = withTiming(1, collapseAnim);
      values.squishX.value = withTiming(1, collapseAnim);
    }

    const collapseContentDuration = collapseBeforeExit
      ? getSmoothDismissContentDuration(collapseShapeDuration)
      : 90;
    const contentFade = withTiming(0, {
      duration: collapseContentDuration,
      easing: Easing.out(Easing.quad),
    });
    values.bodyOpacity.value = contentFade;
    values.descriptionProgress.value = contentFade;
    values.actionProgress.value = contentFade;

    const exitDelay = collapseBeforeExit ? DISMISS_COLLAPSE_LEAD : 0;
    values.removeProgress.value = withDelay(
      exitDelay,
      withTiming(1, {
        duration: DISMISS_EXIT_FADE,
        easing: Easing.out(Easing.cubic),
      }),
    );
    toast.onDismiss?.();
    setTimeout(() => onRemove(toast.id), exitDelay + DISMISS_EXIT_FADE + 40);
  }, [
    collapseDuration,
    animationConfig.morph.collapseDuration,
    hasBody,
    onRemove,
    paused,
    springConfig,
    toast,
    values,
  ]);

  // The progress bar runs on this countdown: it starts, pauses and restarts
  // with the timer and empties when the dismiss starts.
  useEffect(() => {
    if (dismissedRef.current) return;
    if (paused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (hasBody && shouldAutoExpand && !showBody) return;

    if (timerVersionRef.current !== toast.timerVersion) {
      timerVersionRef.current = toast.timerVersion;
      remainingRef.current = null;
    }

    // `duration` is the time until the toast is gone, so the countdown leaves
    // room for the exit and, on a fresh toast, for the body reveal before it.
    const collapsesBeforeExit = hasBody && shouldAutoExpand;
    const revealDelay =
      collapsesBeforeExit && !countdownStartedRef.current ? SHOW_BODY_DELAY : 0;
    const exitDuration =
      (collapsesBeforeExit ? DISMISS_COLLAPSE_LEAD : 0) + DISMISS_EXIT_FADE;
    const autoDismissDelay = Math.max(
      0,
      displayDuration - revealDelay - exitDuration,
    );

    if (remainingRef.current === null) values.progress.value = 0;
    const delay = remainingRef.current ?? autoDismissDelay;
    countdownStartedRef.current = true;
    timerStartRef.current = Date.now();
    values.progress.value = withTiming(1, {
      duration: delay,
      easing: Easing.linear,
    });

    timerRef.current = setTimeout(() => {
      remainingRef.current = null;
      toast.onAutoClose?.();
      handleDismiss();
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimation(values.progress);
      const elapsed = Date.now() - timerStartRef.current;
      remainingRef.current = Math.max(0, delay - elapsed);
    };
  }, [
    displayDuration,
    expanded,
    handleDismiss,
    hasBody,
    isFront,
    isVisible,
    paused,
    showBody,
    shouldAutoExpand,
    toast,
    values.progress,
  ]);

  return { handleDismiss, isDismissing };
}

const DISMISS_COLLAPSE_LEAD = 170;
const DISMISS_EXIT_FADE = 300;

function getSmoothDismissCollapseDuration(duration: number) {
  return Math.max(260, duration);
}

function getSmoothDismissContentDuration(duration: number) {
  return Math.max(60, Math.round(duration * 0.08));
}

export { useToastDismiss };
