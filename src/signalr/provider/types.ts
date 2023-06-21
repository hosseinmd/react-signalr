import { HubConnection, IHttpConnectionOptions } from "@microsoft/signalr";
import { DependencyList, ReactNode } from "react";

export interface ProviderProps extends IHttpConnectionOptions {
  /** Default is true */
  connectEnabled?: boolean;
  dependencies?: DependencyList;
  onError?: (error?: Error) => Promise<void>;
  url: string;
  children: ReactNode | ReactNode[];
  onBeforeClose?: (connection: HubConnection) => Promise<void> | void;
  onClosed?: (error?: Error) => void;
  onOpen?: (connection: HubConnection) => void;
  onReconnect?: (connection: HubConnection) => void;
  automaticReconnect?: boolean;
}
