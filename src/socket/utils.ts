import { useRef } from "react";
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";

const __DEV__ = process.env.NODE_ENV !== "production";

function isConnectionConnecting(
  connection: Socket<DefaultEventsMap, DefaultEventsMap>,
) {
  return connection.connected;
}

function usePropRef(prop: any) {
  const ref = useRef(prop);
  if (ref.current !== prop) {
    ref.current = prop;
  }

  return ref;
}

function createConnection(
  url: string,
  transportType: Partial<ManagerOptions & SocketOptions> | undefined,
) {
  const connectionBuilder = io(url, transportType);

  const connection = connectionBuilder;
  return connection;
}

export { isConnectionConnecting, usePropRef, createConnection, __DEV__ };
