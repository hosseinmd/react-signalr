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
  /** Configures the {@link @microsoft/signalr.HubConnection} to automatically attempt to reconnect if the connection is lost.
   *
   * `number[]` retryDelays An array containing the delays in milliseconds before trying each reconnect attempt.
   * The length of the array represents how many failed reconnect attempts it takes before the client will stop attempting to reconnect.
   */
  automaticReconnect?: boolean | number[];
}
