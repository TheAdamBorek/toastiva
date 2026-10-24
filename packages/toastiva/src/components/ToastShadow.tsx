import type { IToastShadowProps } from "../typings";
import React, { memo, useId } from "react";
import { Defs, LinearGradient, Stop } from "react-native-svg";
import {
  getAndroidShadowEdgeOpacity,
  getAndroidShadowLayers,
} from "../utils/toast-shadow";
import { BlobPath } from "./BlobPath";

const ToastShadow: React.MemoExoticComponent<React.FC<IToastShadowProps>> =
  memo(
    ({
      ...props
    }: IToastShadowProps): (React.ReactNode & React.ReactElement) | null => {
      const gradientId = `toastiva-shadow-${useId().replace(/[^\w-]/g, "")}`;
      const layers = getAndroidShadowLayers(props.shadow);
      const edgeOpacity = getAndroidShadowEdgeOpacity(props.shadow);

      return (
        <>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor={props.shadow.color}
                stopOpacity={edgeOpacity.top}
              />
              <Stop
                offset="1"
                stopColor={props.shadow.color}
                stopOpacity={edgeOpacity.bottom}
              />
            </LinearGradient>
          </Defs>
          {layers.map((layer, index) => (
            <BlobPath
              key={index}
              animatedProps={props.animatedProps}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeLinejoin="round"
              strokeOpacity={layer.opacity}
              strokeWidth={layer.strokeWidth}
              transform={`translate(${layer.x} ${layer.y})`}
            />
          ))}
        </>
      );
    },
  );

export { ToastShadow };
