import { ProviderProps } from "./provider";

export interface Context {
  /** Should not be a dynamic */
  key: string;
  Provider: (Props: ProviderProps) => JSX.Element;
  connection: WebSocket | null;
  shareConnectionBetweenTab: boolean;
  invoke: (data: any) => void;
  useWebSocketEffect: (callback: (data?: any) => void) => void;
}
