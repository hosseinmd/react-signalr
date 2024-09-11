import { sendWithHermes } from "../utils";
import { ProviderProps } from "./provider/types";
import { Context } from "./types";

function isConnectionConnecting(connection: WebSocket | null) {
  return (
    connection &&
    (connection.readyState === WebSocket.CONNECTING ||
      connection.readyState === WebSocket.OPEN)
  );
}

function createConnection(
  context: Context,
  {
    url,
    onOpen,
    onClose,
    onErrorRef,
    logger,
    headers,
  }: Pick<
    ProviderProps,
    "url" | "onOpen" | "logger" | "onClose" | "headers"
  > & {
    onErrorRef: any;
  },
) {
  let connection: WebSocket;
  if (headers) {
    //@ts-ignore
    connection = new WebSocket(url, null, {
      headers,
    });
  } else {
    connection = new WebSocket(url);
  }

  connection.onopen = () => {
    onOpen?.(connection);
    logger?.log("webSocket connected");
  };

  connection.onmessage = (event) => {
    const data = event.data ? JSON.parse(event.data.toString()) : {};

    sendWithHermes(
      getMessageEvent(context),
      data,
      context.shareConnectionBetweenTab,
    );
  };

  connection.onclose = (event) => {
    onClose?.(event);
    logger?.log("webSocket closed", event);
  };

  connection.onerror = (error) => onErrorRef.current?.(error);

  context.connection = connection;

  return connection;
}

function getMessageEvent(context: Context) {
  return context.key + "WEB_SOCKET_EVENT";
}

export { isConnectionConnecting, createConnection, getMessageEvent };
