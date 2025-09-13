import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  IHttpConnectionOptions,
  IHubProtocol,
} from "@microsoft/signalr";

function isConnectionConnecting(connection: HubConnection) {
  return (
    connection.state === HubConnectionState.Connected ||
    connection.state === HubConnectionState.Reconnecting ||
    connection.state === HubConnectionState.Connecting
  );
}

function createConnection(
  url: string,
  transportType: IHttpConnectionOptions,
  automaticReconnect: boolean | number[] = true,
  hubProtocol: IHubProtocol | undefined,
) {
  let connectionBuilder = new HubConnectionBuilder().withUrl(
    url,
    transportType,
  );

  if (automaticReconnect) {
    if (Array.isArray(automaticReconnect)) {
      connectionBuilder =
        connectionBuilder.withAutomaticReconnect(automaticReconnect);
    } else {
      connectionBuilder = connectionBuilder.withAutomaticReconnect();
    }
  }

  if (hubProtocol) {
    connectionBuilder = connectionBuilder.withHubProtocol(hubProtocol);
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
