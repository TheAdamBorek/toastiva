import React, { memo } from "react";
import { Platform, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Svg from "react-native-svg";
import { styles } from "../styles/toast.styles";
import type { IToastSurfaceProps } from "../typings";
import { ToastivaHorizontalAlign } from "../typings";
import { getAndroidShadowInset } from "../utils/toast-shadow";
import { BlobPath } from "./BlobPath";
import { ToastBody } from "./ToastBody";
import { ToastHeader } from "./ToastHeader";
import { ToastProgress } from "./ToastProgress";
import { ToastShadow } from "./ToastShadow";

const ToastSurface: React.MemoExoticComponent<React.FC<IToastSurfaceProps>> =
  memo(
    ({
      ...props
    }: IToastSurfaceProps): (React.ReactNode & React.ReactElement) | null => {
      const hasBodyContent = Boolean(
        props.toast.description || props.toast.action || props.toast.content,
      );
      const shadowInset = props.androidShadow
        ? getAndroidShadowInset(props.androidShadow)
        : 0;
      const shadowWidth = props.bodyWidth + shadowInset * 2;
      const shadowHeight = props.renderHeight + shadowInset * 2;

      return (
        <View
          style={[
            styles.surfaceCanvas,
            { width: props.bodyWidth, height: props.renderHeight },
          ]}
        >
          {props.androidShadow ? (
            <View
              pointerEvents="none"
              style={[
                styles.svgBg,
                {
                  top: -shadowInset,
                  left: -shadowInset,
                  width: shadowWidth,
                  height: shadowHeight,
                },
              ]}
            >
              <Svg
                width={shadowWidth}
                height={shadowHeight}
                viewBox={`${-shadowInset} ${-shadowInset} ${shadowWidth} ${shadowHeight}`}
                fill="none"
              >
                <ToastShadow
                  animatedProps={props.animatedPathProps}
                  shadow={props.androidShadow}
                />
              </Svg>
            </View>
          ) : null}
          <Svg
            width={props.bodyWidth}
            height={props.renderHeight}
            viewBox={`0 0 ${props.bodyWidth} ${props.renderHeight}`}
            fill="none"
            style={[
              styles.svgBg,
              Platform.OS === "web" ? svgShapeShadowStyle : null,
            ]}
          >
            <BlobPath
              animatedProps={props.animatedPathProps}
              fill={props.surfaceFill}
              stroke={props.stroke}
              strokeWidth={0.6}
            />
          </Svg>

          <Animated.View
            style={[
              styles.content,
              { width: props.bodyWidth },
              props.styleOverrides?.content,
              props.contentStyle,
            ]}
            pointerEvents="box-none"
          >
            {props.noHeader ? null : (
              <Animated.View
                entering={hasBodyContent ? undefined : FadeIn.duration(500)}
                exiting={hasBodyContent ? undefined : FadeOut.duration(500)}
              >
                <ToastHeader
                  align={props.headerAlign}
                  color={props.color}
                  headerContent={props.toast.headerContent}
                  Icon={props.Icon}
                  icon={props.toast.icon}
                  iosBlurTint={props.iosBlurTint}
                  maxWidthStyle={props.headerMaxWidthStyle}
                  morphSpringConfig={props.morphSpringConfig}
                  disableIOSBlur={props.disableIOSBlur}
                  showIcon={props.toast.showIcon}
                  showIconBadge={props.toast.showIconBadge}
                  styleOverrides={props.styleOverrides}
                  title={props.toast.title}
                  type={props.toast.type}
                />
              </Animated.View>
            )}

            <ToastBody
              actionStyle={props.actionStyle}
              bodyLayout={props.bodyLayout}
              bodyStyle={props.bodyStyle}
              canInteract={props.canInteract}
              color={props.color}
              descriptionStyle={props.descriptionStyle}
              meta={props.meta}
              onAction={props.onAction}
              progressStyle={props.progressStyle}
              showBody={props.showBody}
              showProgress={props.showProgress}
              styleOverrides={props.styleOverrides}
              toast={props.toast}
            />
          </Animated.View>

          {!hasBodyContent && !props.toast.isLoading && props.showProgress ? (
            <View
              pointerEvents="none"
              style={[
                styles.pillProgressFrame,
                { alignItems: getPillAlign(props.headerAlign) },
              ]}
            >
              <Animated.View
                style={[styles.pillProgressClip, props.headerMaxWidthStyle]}
              >
                <ToastProgress
                  backgroundColor={`${props.color}40`}
                  fillStyle={props.styleOverrides?.progressFill}
                  trackStyle={props.styleOverrides?.progressTrack}
                  style={props.progressStyle}
                />
              </Animated.View>
            </View>
          ) : null}
        </View>
      );
    },
  );

function getPillAlign(align: IToastSurfaceProps["headerAlign"]) {
  if (align === ToastivaHorizontalAlign.Center) return "center" as const;
  if (align === ToastivaHorizontalAlign.Right) return "flex-end" as const;
  return "flex-start" as const;
}

const svgShapeShadowStyle = {
  filter: "drop-shadow(0px 12px 24px rgba(0,0,0,0.22))" as const,
};

export { ToastSurface };
