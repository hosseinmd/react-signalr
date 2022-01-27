import hermes from "hermes-channel";
import { sendWithHermes } from "../utils";
import { createUseSignalREffect } from "./hooks";
import { providerFactory } from "./provider";
import { Context } from "./types";
import { v4 as uuid } from "uuid";
import { providerNativeFactory } from "./provider/providerNativeFactory";

function createWebSocketContext(options: {
  key: string;
  shareConnectionBetweenTab?: boolean;
}) {
  const SIGNAL_R_INVOKE = options.key + "SOCKET_INVOKE";

  const context: Context = {
    key: options.key,
    connection: null,
    useWebSocketEffect: null as any, // Assigned after context
    shareConnectionBetweenTab: options?.shareConnectionBetweenTab || false,
    invoke: (data: any) => {
      const SIGNAL_R_RESPONSE = uuid();

      return new Promise((resolve) => {
        hermes.on(SIGNAL_R_RESPONSE, (data) => {
          resolve(data);
        });
        sendWithHermes(
          SIGNAL_R_INVOKE,
          { data, callbackResponse: SIGNAL_R_RESPONSE },
          context.shareConnectionBetweenTab,
        );
      });
    },
    Provider: null as any, // just for ts ignore
  };

  context.Provider = context.shareConnectionBetweenTab
    ? providerFactory(context)
    : providerNativeFactory(context);

  async function invoke(data: { data: any; callbackResponse: string }) {
    const response = await context.connection?.send(JSON.stringify(data.data));
    sendWithHermes(
      data.callbackResponse,
      response,
      context.shareConnectionBetweenTab,
    );
  }

  context.useWebSocketEffect = createUseSignalREffect(context);

  hermes.on(SIGNAL_R_INVOKE, (data) => {
    if (context.connection?.readyState === WebSocket.OPEN) {
      invoke(data);
    }
  });

  return context;
}

export { createWebSocketContext };
