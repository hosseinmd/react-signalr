import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  IHttpConnectionOptions,
  LogLevel,
} from "@microsoft/signalr";
import hermes from "hermes-channel";
import { DependencyList, useEffect } from "react";

// @ts-ignore
const __DEV__ = process.env.NODE_ENV !== "production";

const IS_SIGNAL_R_CONNECTED = "IS_SIGNAL_R_CONNECTED";

export interface ProviderProps extends IHttpConnectionOptions {
  url: string;
  /** Default is true */
  connectEnabled?: boolean;
  children: JSX.Element;
  dependencies?: DependencyList;
}

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

function providerFactory<T extends string>(
  Context: any,
  events: readonly T[],
  removeFromExpectedSignalRMessages: (event: T) => void,
  checkExpectedSignalRMessages: () => void,
) {
  const Provider = ({
    url,
    connectEnabled = true,
    children,
    dependencies = [],
    ...rest
  }: ProviderProps) => {
    useEffect(() => {
      if (!connectEnabled) {
        return;
      }

      let connectionBuilder = new HubConnectionBuilder()
        .withUrl(url, rest)
        .withAutomaticReconnect();

      if (__DEV__) {
        connectionBuilder = connectionBuilder.configureLogging(
          LogLevel.Information,
        );
      }

      const connection = connectionBuilder.build();

      Context.connection = connection;
      let lastConnectionSentState: number | null = null;
      let connectionId: string | null = null;

      /** If another tab connected to signalR we will receive this event */
      hermes.on(IS_SIGNAL_R_CONNECTED, (_connectionId) => {
        // connected tab will send empty _connectionId before close
        if (!_connectionId) {
          lastConnectionSentState = null;
          connectionId = null;
          checkForStart();

          return;
        }

        console.log("_connectionId");
        connectionId = _connectionId;
        lastConnectionSentState = Date.now();
        if (!isConnectionConnecting(connection)) {
          sentInterval && clearInterval(sentInterval);
          connection.stop();
        }
      });

      const expectedCallbacks = events.map((event) => () => {
        removeFromExpectedSignalRMessages(event as any);
      });

      events.forEach((event, index) => {
        hermes.on(
          event,
          //@ts-ignore
          expectedCallbacks[index],
        );
      });

      let sentInterval: any;

      async function checkForStart() {
        checkExpectedSignalRMessages();

        if (
          (!lastConnectionSentState ||
            lastConnectionSentState < Date.now() - 5000) &&
          !isConnectionConnecting(connection)
        ) {
          try {
            hermes.send(IS_SIGNAL_R_CONNECTED, connection.connectionId);
            await connection.start();

            function syncWithTabs() {
              if (connectionId) {
                clearInterval(sentInterval);
                connection.stop();
                return;
              }
              hermes.send(IS_SIGNAL_R_CONNECTED, connection.connectionId);
            }

            syncWithTabs();

            sentInterval = setInterval(syncWithTabs, 4000);
          } catch (err) {
            console.log(err);
            clearInterval(sentInterval);
            if (connectionId) {
              return;
            }
          }
        }
      }

      checkForStart();

      const checkInterval = setInterval(checkForStart, 6000);

      events.forEach((event) => {
        connection.on(event, (message: any) => {
          hermes.send(event, message, true);
        });
      });

      /** Before of this tab close this event will sent an empty connectionId to other tabs */
      function onBeforeunload() {
        if (isConnectionConnecting(connection)) {
          hermes.send(IS_SIGNAL_R_CONNECTED, "");

          clearInterval(sentInterval);
          connection.stop();
          return;
        }
      }

      /** AddEventListener is not exist in react-native */
      window?.addEventListener?.("beforeunload", onBeforeunload);

      return () => {
        clearInterval(checkInterval);
        sentInterval && clearInterval(sentInterval);
        connection.stop();
        hermes.off(IS_SIGNAL_R_CONNECTED);

        events.forEach((event, index) => {
          hermes.off(
            event,
            //@ts-ignore
            expectedCallbacks[index],
          );
        });

        /** RemoveEventListener is not exist in react-native */
        window?.removeEventListener?.("beforeunload", onBeforeunload);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectEnabled, ...dependencies]);

    return children;
  };

  return Provider;
}

function isConnectionConnecting(connection: HubConnection) {
  return (
    connection.state === HubConnectionState.Connected ||
    connection.state === HubConnectionState.Reconnecting ||
    connection.state === HubConnectionState.Connecting
  );
}

export { createSignalRContext };
