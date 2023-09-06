import hermes from "hermes-channel";
import { removeDuplicates, sendWithHermes } from "../utils";
import { createUseSocketEffect } from "./hooks";
import { providerFactory } from "./provider";
import { Context, Hub } from "./types";
import { providerNativeFactory } from "./provider/providerNativeFactory";

const SOCEKT_IO_SEND = "SOCEKT_IO_SEND";

function createSocketIoContext<T extends Hub>(options?: {
  shareConnectionBetweenTab?: boolean;
}) {
  const events: (keyof T["callbacks"])[] = [];
  const context: Context<T> = {
    connection: null,
    useSocketEffect: null as any, // Assigned after context
    shareConnectionBetweenTab: options?.shareConnectionBetweenTab || false,
    invoke: (methodName: string, ...args: any[]) => {
      if (!context.shareConnectionBetweenTab) {
        context.connection?.emit(methodName, ...args);
        return;
      }
      sendWithHermes(
        SOCEKT_IO_SEND,
        { methodName, args },
        context.shareConnectionBetweenTab,
      );
    },
    Provider: null as any, // just for ts ignore
    on: (event: string) => {
      if (!events.includes(event)) {
        context.connection?.on(event, (message: any) => {
          sendWithHermes(event, message, context.shareConnectionBetweenTab);
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
    //@ts-ignore
    reOn: () => {
      const uniqueEvents = removeDuplicates(events as string[]);

      uniqueEvents.forEach((event) => {
        context.connection?.on(event, (message: any) => {
          sendWithHermes(event, message, context.shareConnectionBetweenTab);
        });
      });
    },
  };

  context.Provider = context.shareConnectionBetweenTab
    ? providerFactory(context)
    : providerNativeFactory(context);
  context;

  context.useSocketEffect = createUseSocketEffect(context);

  hermes.on(SOCEKT_IO_SEND, (data) => {
    if (context.connection?.connected) {
      context.connection.emit(data.methodName, ...data.args);
    }
  });

  return context;
}

export { createSocketIoContext };
