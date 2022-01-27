import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  IHttpConnectionOptions,
  LogLevel,
} from "@microsoft/signalr";
import { __DEV__ } from "../utils";

function isConnectionConnecting(connection: HubConnection) {
  return (
    connection.state === HubConnectionState.Connected ||
    connection.state === HubConnectionState.Reconnecting ||
    connection.state === HubConnectionState.Connecting
  );
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

export { isConnectionConnecting, createConnection };
