import type { ValueOf } from "../../global-ts/value-of";
import type { IToastAnimatedStylesResult } from "../styles/AnimatedStyles";
import type { IToastivaAndroidShadow } from "../toast";

interface IToastShadowProps {
  animatedProps: ValueOf<IToastAnimatedStylesResult, "animatedPathProps">;
  shadow: Required<IToastivaAndroidShadow>;
}

export type { IToastShadowProps };
