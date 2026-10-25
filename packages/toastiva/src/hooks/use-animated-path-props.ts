import { useAnimatedProps } from "react-native-reanimated";
import { MORPH_OVERSHOOT, PH } from "../constants";
import { morphPanelPath, morphShapePath } from "../morph";
import {
  IToastSharedValue,
  IUseToastAnimatedStylesParams,
  TToastivaHorizontalAlign,
} from "../typings";

function getToastPath(
  values: IToastSharedValue,
  bodyWidth: number,
  morphAlign: TToastivaHorizontalAlign,
  noHeader: boolean,
) {
  "worklet";
  const progress = values.morphProgress.value;

  const max = 1 + MORPH_OVERSHOOT;
  const t = progress < 0 ? 0 : progress > max ? max : progress;

  const bodyW = values.bodyWidth.value;
  const expandedHeight = values.expandedHeight.value;
  const bodyRadius = values.bodyRadius.value;
  const smoothing = values.cornerSmoothing.value;

  if (noHeader) {
    return morphPanelPath(
      bodyWidth,
      bodyW,
      PH + (expandedHeight - PH) * t,
      t,
      morphAlign,
      bodyRadius,
      smoothing,
    );
  }

  return morphShapePath(
    bodyWidth,
    values.pillWidth.value,
    bodyW,
    (expandedHeight - PH) * t,
    expandedHeight - PH,
    morphAlign,
    bodyRadius,
    smoothing,
  );
}

const useAnimatedPathProps = <T extends IUseToastAnimatedStylesParams>(
  params: T,
) => {
  const { values, morphAlign, bodyWidth, noHeader = false } = params;

  return useAnimatedProps(() => {
    return { d: getToastPath(values, bodyWidth, morphAlign, noHeader) };
  }, [bodyWidth, morphAlign, noHeader]);
};

export { getToastPath, useAnimatedPathProps };
