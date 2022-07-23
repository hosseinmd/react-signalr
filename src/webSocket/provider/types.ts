import { DependencyList, ReactNode } from "react";

export interface ProviderProps {
  /** Default is true */
  connectEnabled?: boolean;
  dependencies?: DependencyList;
  onError?: (error?: Event | Error) => Promise<void>;
  onClose?: (error?: CloseEvent) => void;
  url: string;
  children: ReactNode | ReactNode[];
  onOpen?: (connection: WebSocket) => void;
  logger?: {
    log: Console["log"];
    error: Console["error"];
  } | null;
}
