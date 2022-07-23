import { ReactNode } from "react";
import { ProviderProps } from "./provider";

export interface Context {
  /** Should not be a dynamic */
  key: string;
  Provider: (Props: ProviderProps) => ReactNode | ReactNode[];
  connection: WebSocket | null;
  shareConnectionBetweenTab: boolean;
  invoke: (data: any) => void;
  useWebSocketEffect: (callback: (data?: any) => void) => void;
}
