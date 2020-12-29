import { HubConnectionState } from "@microsoft/signalr";
import hermes from "hermes-channel";
import { useSignalREffect } from "./hooks";
import { providerFactory } from "./provider";
import { Context, Hub } from "./types";

const SIGNAL_R_INVOKE = "SIGNAL_R_INVOKE";

function createSignalRContext<T extends Hub>(events: T["callbacksName"][]) {
  function initialExpectedSignalRMessages() {
    return events.reduce((pre, cur) => {
      return {
        ...pre,
        [cur]: null,
      };
    }, {}) as any;
  }

  const eventsExpectedLast: {
    [name in T["callbacksName"]]: number | null;
  } = initialExpectedSignalRMessages();

  function addToExpectedSignalRMessages(
    event: T["callbacksName"] | T["callbacksName"][],
  ) {
    if (Array.isArray(event)) {
      event.forEach((e) => {
        eventsExpectedLast[e] = Date.now();
      });

      return;
    }

    eventsExpectedLast[event] = Date.now();
  }

  function removeFromExpectedSignalRMessages(event: T["callbacksName"]) {
    eventsExpectedLast[event] = null;
  }

  function checkExpectedSignalRMessages() {
    Object.keys(eventsExpectedLast).forEach((event) => {
      const last = eventsExpectedLast[event as T["callbacksName"]];
      if (last && last < Date.now() - 3000) {
        hermes.send(event, "expected", true);
        eventsExpectedLast[event as T["callbacksName"]] = null;
      }
    });
  }

  const context: Context<T> = {
    connection: null,
    eventsExpectedLast,
    useSignalREffect,
    selfCallIfNotReceived: addToExpectedSignalRMessages,
    invoke: (methodName: string, ...args: any[]) => {
      hermes.send(SIGNAL_R_INVOKE, { methodName, args }, true);
    },
    Provider: null as any, // just for ts ignore
  };

  hermes.on(SIGNAL_R_INVOKE, (data) => {
    if (context.connection?.state === HubConnectionState.Connected) {
      context.connection.send(data.methodName, ...data.args);
    }
  });

  context.Provider = providerFactory(
    context,
    events,
    removeFromExpectedSignalRMessages,
    checkExpectedSignalRMessages,
  );

  return context;
}

export { createSignalRContext };
