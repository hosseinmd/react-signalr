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

function createConnection(url: string, transportType: IHttpConnectionOptions, automaticReconnect: boolean = true) {
  let connectionBuilder = new HubConnectionBuilder()
    .withUrl(url, transportType)

    if (automaticReconnect) {
      connectionBuilder = connectionBuilder.withAutomaticReconnect();
    }

  if (transportType.logger) {
    connectionBuilder = connectionBuilder.configureLogging(
      transportType.logger,
    );
  }

  const connection = connectionBuilder.build();

  return connection;
}

export { isConnectionConnecting, createConnection };
