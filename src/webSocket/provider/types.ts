import { DependencyList } from "react";

export interface ProviderProps {
  /** Default is true */
  connectEnabled?: boolean;
  dependencies?: DependencyList;
  onError?: (error?: Event | Error) => Promise<void>;
  url: string;
  children: JSX.Element;
  onOpen?: (connection: WebSocket) => void;
  logger?: {
    log: Console["log"];
    error: Console["error"];
  } | null;
}
