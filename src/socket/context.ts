import hermes from "hermes-channel";
import { createUseSocketEffect } from "./hooks";
import { providerFactory } from "./provider";
import { Context, Hub } from "./types";

const SOCEKT_IO_SEND = "SOCEKT_IO_SEND";

function createSocketContext<T extends Hub>() {
  const events: T["callbacksName"][] = [];
  const context: Context<T> = {
    connection: null,
    useSignalREffect: null as any, // Assigned after context
    send: (methodName: string, ...args: any[]) => {
      hermes.send(SOCEKT_IO_SEND, { methodName, args }, true);
    },
    Provider: null as any, // just for ts ignore
    on: (event: string) => {
      console.log({ events, event, connection: context.connection });

      if (!events.includes(event)) {
        context.connection?.on(event, (...message: any) => {
          hermes.send(event, message, true);
        });
      }

      events.push(event);
    },
    off: (event: string) => {
      if (events.includes(event)) {
        events.splice(events.indexOf(event), 1);
      }

      if (!events.includes(event)) {
        context.connection?.off(event);
      }
    },
  };

  context.Provider = providerFactory(context);

  context.useSignalREffect = createUseSocketEffect(context);

  hermes.on(SOCEKT_IO_SEND, (data) => {
    if (context.connection?.connected) {
      context.connection.send(data.methodName, ...data.args);
    }
  });

  return context;
}

export { createSocketContext };
