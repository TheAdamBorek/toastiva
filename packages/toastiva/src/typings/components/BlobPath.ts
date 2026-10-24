import type { ValueOf } from "../../global-ts/value-of";
import type { IToastAnimatedStylesResult } from "../styles/AnimatedStyles";

interface IBlobPathProps {
  animatedProps: ValueOf<IToastAnimatedStylesResult, "animatedPathProps">;
  fill: string;
  filter?: string;
  stroke?: string;
  strokeLinejoin?: "miter" | "bevel" | "round";
  strokeOpacity?: number;
  strokeWidth?: number;
  transform?: string;
}

export type { IBlobPathProps };
