import type { IToastShadowProps } from "../typings";
import React, { memo } from "react";
import { getAndroidShadowLayers } from "../utils/toast-shadow";
import { BlobPath } from "./BlobPath";

const ToastShadow: React.MemoExoticComponent<React.FC<IToastShadowProps>> =
  memo(
    ({
      ...props
    }: IToastShadowProps): (React.ReactNode & React.ReactElement) | null => {
      const layers = getAndroidShadowLayers(props.shadow);

      return (
        <>
          {layers.map((layer, index) => (
            <BlobPath
              key={index}
              animatedProps={props.animatedProps}
              fill="none"
              stroke={props.shadow.color}
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
