import { HubConnection, HubConnectionState } from "@microsoft/signalr";

const __DEV__ = process.env.NODE_ENV !== "production";

function isConnectionConnecting(connection: HubConnection) {
  return (
    connection.state === HubConnectionState.Connected ||
    connection.state === HubConnectionState.Reconnecting ||
    connection.state === HubConnectionState.Connecting
  );
}

export { isConnectionConnecting, __DEV__ };
