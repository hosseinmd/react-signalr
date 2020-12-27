import { IHttpConnectionOptions } from "@microsoft/signalr";
import { DependencyList } from "react";

export interface ProviderProps extends IHttpConnectionOptions {
  url: string;
  /** Default is true */
  connectEnabled?: boolean;
  children: JSX.Element;
  dependencies?: DependencyList;
  onError: (error?: Error) => Promise<void>;
}
