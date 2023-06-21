import { DependencyList, ReactNode } from "react";
import { ManagerOptions, SocketOptions } from "socket.io-client";

export interface ProviderProps extends Partial<ManagerOptions & SocketOptions> {
  /** Default is true */
  connectEnabled?: boolean;
  dependencies?: DependencyList;
  onError?: (error?: Error) => Promise<void>;
  url: string;
  children: ReactNode | ReactNode[];
  /**
   * A function that provides an access token required for HTTP Bearer authentication.
   *
   * @returns {string | Promise<string>} A string containing the access
   *     token, or a Promise that resolves to a string containing the access token.
   */
  accessTokenFactory?(): string | Promise<string>;
  automaticReconnect?: boolean;
}
