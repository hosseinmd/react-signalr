import { HubConnectionState } from "@microsoft/signalr";
import hermes from "hermes-channel";
import { removeDuplicates } from "../utils";
import { createUseSignalREffect } from "./hooks";
import { providerFactory } from "./provider";
import { Context, Hub } from "./types";
import { v4 as uuid } from "uuid";

const SIGNAL_R_INVOKE = "SIGNAL_R_INVOKE";
function createSignalRContext<T extends Hub>({
  shareConnectionBetweenTab = false,
}: {
  shareConnectionBetweenTab: boolean | null;
}) {
  const events: T["callbacksName"][] = [];
  const context: Context<T> = {
    connection: null,
    useSignalREffect: null as any, // Assigned after context
    shareConnectionBetweenTab,
    invoke: (methodName: string, ...args: any[]) => {
      const SIGNAL_R_RESPONSE = uuid();
      hermes.send(
        SIGNAL_R_INVOKE,
        { methodName, args, callbackResponse: SIGNAL_R_RESPONSE },
        shareConnectionBetweenTab ? "all" : "current",
      );
      return new Promise((resolve) => {
        hermes.on(SIGNAL_R_RESPONSE, (data) => {
          resolve(data);
        });
      });
    },
    Provider: null as any, // just for ts ignore
    on: (event: string) => {
      if (!events.includes(event)) {
        context.connection?.on(event, (...message: any) => {
          hermes.send(
            event,
            message,
            shareConnectionBetweenTab ? "all" : "current",
          );
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
      const uniqueEvents = removeDuplicates(events);

      uniqueEvents.forEach((event) => {
        context.connection?.on(event, (...message: any) => {
          hermes.send(
            event,
            message,
            shareConnectionBetweenTab ? "all" : "current",
          );
        });
      });
    },
  };

  context.Provider = providerFactory(context);

  async function invoke(data: {
    methodName: string;
    args: any[];
    callbackResponse: string;
  }) {
    const response = await context.connection?.invoke(
      data.methodName,
      ...data.args,
    );
    hermes.send(
      data.callbackResponse,
      response,
      shareConnectionBetweenTab ? "all" : "current",
    );
  }

  context.useSignalREffect = createUseSignalREffect(context);

  hermes.on(SIGNAL_R_INVOKE, (data) => {
    if (context.connection?.state === HubConnectionState.Connected) {
      invoke(data);
    }
  });

  return context;
}

export { createSignalRContext };
