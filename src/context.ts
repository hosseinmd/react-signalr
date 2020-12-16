import { HubConnection } from "@microsoft/signalr";
import hermes from "hermes-channel";
import { providerFactory, ProviderProps } from "./provider";

export interface Context<T extends string> {
  Provider: (Props: ProviderProps) => JSX.Element;
  connection: HubConnection | null;
  eventsExpectedLast: {
    [name in T]: number | null;
  };
  selfCallIfNotReceived: (event: T | T[]) => void;
}

function createSignalRContext<T extends string>(events: readonly T[]) {
  function initialExpectedSignalRMessages() {
    return events.reduce((pre, cur) => {
      return {
        ...pre,
        [cur]: null,
      };
    }, {}) as any;
  }

  const eventsExpectedLast: {
    [name in T]: number | null;
  } = initialExpectedSignalRMessages();

  function addToExpectedSignalRMessages(event: T | T[]) {
    if (Array.isArray(event)) {
      event.forEach((e) => {
        eventsExpectedLast[e] = Date.now();
      });

      return;
    }

    eventsExpectedLast[event] = Date.now();
  }

  function removeFromExpectedSignalRMessages(event: T) {
    eventsExpectedLast[event] = null;
  }
  // function removeAllExpectedSignalRMessages() {
  //   Context.events = initialExpectedSignalRMessages();
  // }

  function checkExpectedSignalRMessages() {
    Object.keys(eventsExpectedLast).forEach((event) => {
      const last = eventsExpectedLast[event as T];
      if (last && last < Date.now() - 3000) {
        hermes.send(event, "expected", true);
        eventsExpectedLast[event as T] = null;
      }
    });
  }

  const context: Context<T> = {
    connection: null,
    eventsExpectedLast,
    selfCallIfNotReceived: addToExpectedSignalRMessages,
    Provider: null as any, // just for ts ignore
  };
  context.Provider = providerFactory(
    context,
    events,
    removeFromExpectedSignalRMessages,
    checkExpectedSignalRMessages,
  );

  return context;
}

export { createSignalRContext };
