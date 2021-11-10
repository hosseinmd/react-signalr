import { IHttpConnectionOptions } from "@microsoft/signalr";
import { DependencyList } from "react";

export interface ProviderProps extends IHttpConnectionOptions {
  /** Default is true */
  connectEnabled?: boolean;
  dependencies?: DependencyList;
  onError?: (error?: Error) => Promise<void>;
  url: string;
  children: JSX.Element;
  shareConnectionBetweenTab?: boolean;
}
