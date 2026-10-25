import { useAnimatedProps } from "react-native-reanimated";
import { MORPH_OVERSHOOT, PH } from "../constants";
import { morphPanelPath, morphShapePath } from "../morph";
import {
  IToastShapeTarget,
  IUseToastAnimatedStylesParams,
  TToastivaHorizontalAlign,
} from "../typings";

interface IToastPathShape extends IToastShapeTarget {
  progress: number;
  smoothing: number;
}

function getToastPath(
  shape: IToastPathShape,
  canvasWidth: number,
  morphAlign: TToastivaHorizontalAlign,
  noHeader: boolean,
) {
  "worklet";
  const max = 1 + MORPH_OVERSHOOT;
  const t =
    shape.progress < 0 ? 0 : shape.progress > max ? max : shape.progress;

  if (noHeader) {
    return morphPanelPath(
      canvasWidth,
      shape.bodyWidth,
      PH + (shape.expandedHeight - PH) * t,
      t,
      morphAlign,
      shape.bodyRadius,
      shape.smoothing,
    );
  }

  return morphShapePath(
    canvasWidth,
    shape.pillWidth,
    shape.bodyWidth,
    (shape.expandedHeight - PH) * t,
    shape.expandedHeight - PH,
    morphAlign,
    shape.bodyRadius,
    shape.smoothing,
  );
}

const useAnimatedPathProps = <T extends IUseToastAnimatedStylesParams>(
  params: T,
) => {
  const { values, morphAlign, bodyWidth, noHeader = false } = params;
  const {
    bodyRadius,
    bodyWidth: bodyW,
    cornerSmoothing,
    expandedHeight,
    morphProgress,
    pillWidth,
  } = values;

  return useAnimatedProps(() => {
    return {
      d: getToastPath(
        {
          bodyRadius: bodyRadius.value,
          bodyWidth: bodyW.value,
          expandedHeight: expandedHeight.value,
          pillWidth: pillWidth.value,
          progress: morphProgress.value,
          smoothing: cornerSmoothing.value,
        },
        bodyWidth,
        morphAlign,
        noHeader,
      ),
    };
  }, [bodyWidth, morphAlign, noHeader]);
};

export { getToastPath, useAnimatedPathProps };
