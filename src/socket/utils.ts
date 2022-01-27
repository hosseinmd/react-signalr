import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

function isConnectionConnecting(
  connection: Socket<DefaultEventsMap, DefaultEventsMap>,
) {
  return connection.connected;
}

function createConnection(
  url: string,
  opts: Partial<ManagerOptions & SocketOptions> | undefined,
) {
  const connectionBuilder = io(url, opts);

  const connection = connectionBuilder;
  return connection;
}

export { isConnectionConnecting, createConnection };
