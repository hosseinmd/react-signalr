import { HubConnectionState } from "@microsoft/signalr";
import hermes from "hermes-channel";
import { createUseSignalREffect } from "./hooks";
import { providerFactory } from "./provider";
import { Context, Hub } from "./types";

const SIGNAL_R_INVOKE = "SIGNAL_R_INVOKE";

function createSignalRContext<T extends Hub>() {
  const events: T["callbacksName"][] = [];
  const context: Context<T> = {
    connection: null,
    useSignalREffect: null as any, // Assigned after context
    invoke: (methodName: string, ...args: any[]) => {
      hermes.send(SIGNAL_R_INVOKE, { methodName, args }, true);
    },
    Provider: null as any, // just for ts ignore
    onEvent: (event: string) => {
      console.log({ events, event, connection: context.connection });

      if (!events.includes(event)) {
        context.connection?.on(event, (...message: any) => {
          hermes.send(event, message, true);
        });
      }

      events.push(event);
    },
    offEvent: (event: string) => {
      if (events.includes(event)) {
        events.splice(events.indexOf(event), 1);
      }

      if (!events.includes(event)) {
        context.connection?.off(event);
      }
    },
  };

  context.Provider = providerFactory(context);

  context.useSignalREffect = createUseSignalREffect(context);

  hermes.on(SIGNAL_R_INVOKE, (data) => {
    if (context.connection?.state === HubConnectionState.Connected) {
      context.connection.send(data.methodName, ...data.args);
    }
  });

  return context;
}

export { createSignalRContext };
