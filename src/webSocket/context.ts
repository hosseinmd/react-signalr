import hermes from "hermes-channel";
import { sendWithHermes } from "../utils";
import { createUseSignalREffect } from "./hooks";
import { providerFactory } from "./provider";
import { Context } from "./types";
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
      if (!context.shareConnectionBetweenTab) {
        context.connection?.send(JSON.stringify(data));
        return;
      }

      sendWithHermes(SIGNAL_R_INVOKE, data, context.shareConnectionBetweenTab);
    },
    Provider: null as any, // just for ts ignore
  };

  context.Provider = context.shareConnectionBetweenTab
    ? providerFactory(context)
    : providerNativeFactory(context);

  async function invoke(data: any) {
    context.connection?.send(JSON.stringify(data.data));
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
