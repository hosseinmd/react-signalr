import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  IHttpConnectionOptions,
  LogLevel,
} from "@microsoft/signalr";
import hermes from "hermes-channel";
import { DependencyList, useEffect } from "react";

const IS_SIGNAL_R_CONNECTED = "IS_SIGNAL_R_CONNECTED";

export interface ProviderProps extends IHttpConnectionOptions {
  url: string;
  /** Default is true */
  connectEnabled?: boolean;
  children: JSX.Element;
  dependencies?: DependencyList;
}

function createSignalRContext<T extends string>(events: T[]) {
  function initialExpectedSignalRMessages() {
    return events.reduce((pre, cur) => {
      return {
        ...pre,
        [cur]: {},
      };
    }, {}) as any;
  }

  const Context: {
    connection?: HubConnection;
    events: {
      [name in T]: {
        last?: number | null;
      };
    };
  } = {
    events: initialExpectedSignalRMessages(),
  };

  function addToExpectedSignalRMessages(event: T | T[]) {
    if (Array.isArray(event)) {
      event.forEach((e) => {
        Context.events[e].last = Date.now();
      });

      return;
    }

    Context.events[event].last = Date.now();
  }

  function removeFromExpectedSignalRMessages(event: T) {
    console.log(event, Context.events[event]);
    Context.events[event].last = null;
  }
  // function removeAllExpectedSignalRMessages() {
  //   Context.events = initialExpectedSignalRMessages();
  // }

  function checkExpectedSignalRMessages() {
    Object.keys(Context.events).forEach((event) => {
      const { last } = Context.events[event as T];
      if (last && last < Date.now() - 3000) {
        hermes.send(event, "expected", true);
        Context.events[event as T].last = null;
      }
    });
  }

  return {
    Context,
    selfCallIfNotReceived: addToExpectedSignalRMessages,

    Provider: ({
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

        const connection = new HubConnectionBuilder()
          .withUrl(url, {
            ...rest,
          })
          .withAutomaticReconnect()
          .configureLogging(LogLevel.Information)
          .build();

        Context.connection = connection;
        let lastConnectionSentState: number;
        let connectionId: string | null = null;

        /** If another tab connected to signalR we will receive this event */
        hermes.on(IS_SIGNAL_R_CONNECTED, (_connectionId) => {
          console.log("_connectionId");
          connectionId = _connectionId;
          lastConnectionSentState = Date.now();
          if (
            connection.state === HubConnectionState.Disconnected ||
            connection.state === HubConnectionState.Disconnecting
          ) {
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

        async function start() {
          try {
            if (connectionId) {
              return;
            }

            hermes.send(IS_SIGNAL_R_CONNECTED, connection.connectionId);
            await connection.start();
            sentInterval = setInterval(() => {
              if (connectionId) {
                clearInterval(sentInterval);
                connection.stop();
                return;
              }
              hermes.send(IS_SIGNAL_R_CONNECTED, connection.connectionId);
            }, 4000);
          } catch (err) {
            console.log(err);
            clearInterval(sentInterval);
            if (connectionId) {
              return;
            }
          }
        }

        const checkInterval = setInterval(() => {
          checkExpectedSignalRMessages();

          if (
            (!lastConnectionSentState ||
              lastConnectionSentState < Date.now() - 5000) &&
            (connection.state === HubConnectionState.Disconnected ||
              connection.state === HubConnectionState.Disconnecting)
          ) {
            connectionId = null;
            start();
          }
        }, 6000);

        events.forEach((event) => {
          connection.on(event, (message: any) => {
            hermes.send(event, message, true);
          });
        });

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
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [connectEnabled, ...dependencies]);

      return children;
    },
  };
}

function useSignalREffect<T extends string>(
  events: T | T[],
  callback: () => void,
  deps: any[] = [],
) {
  useEffect(() => {
    let _events: T[];

    if (!Array.isArray(events)) {
      _events = [events];
    } else {
      _events = events;
    }

    _events.forEach((event) => {
      hermes.on(event, callback);
    });

    return () => {
      _events.forEach((event) => {
        hermes.off(event, callback);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export { createSignalRContext, useSignalREffect };
