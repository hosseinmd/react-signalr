import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  IHttpConnectionOptions,
} from "@microsoft/signalr";

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

  if (transportType.logger) {
    connectionBuilder = connectionBuilder.configureLogging(
      transportType.logger,
    );
  }

  const connection = connectionBuilder.build();

  return connection;
}

export { isConnectionConnecting, createConnection };
