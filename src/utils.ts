import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  IHttpConnectionOptions,
  LogLevel,
} from "@microsoft/signalr";
import { useRef } from "react";

const __DEV__ = process.env.NODE_ENV !== "production";

function isConnectionConnecting(connection: HubConnection) {
  return (
    connection.state === HubConnectionState.Connected ||
    connection.state === HubConnectionState.Reconnecting ||
    connection.state === HubConnectionState.Connecting
  );
}

function usePropRef(prop: any) {
  const ref = useRef(prop);
  if (ref.current !== prop) {
    ref.current = prop;
  }

  return ref;
}

function createConnection(url: string, transportType: IHttpConnectionOptions) {
  let connectionBuilder = new HubConnectionBuilder()
    .withUrl(url, transportType)
    .withAutomaticReconnect();

  if (__DEV__) {
    connectionBuilder = connectionBuilder.configureLogging(
      LogLevel.Information,
    );
  }

  const connection = connectionBuilder.build();

  return connection;
}

export { isConnectionConnecting, usePropRef, createConnection, __DEV__ };
