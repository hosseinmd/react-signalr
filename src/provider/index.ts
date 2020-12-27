import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import hermes from "hermes-channel";
import { useEffect, useRef } from "react";
import jsCookie from "js-cookie";
import { isConnectionConnecting, __DEV__ } from "../utils";
import { ProviderProps } from "./types";

const IS_SIGNAL_R_CONNECTED = "IS_SIGNAL_R_CONNECTED";
const KEY_LAST_CONNECTION_TIME = "KEY_LAST_CONNECTION_TIME";

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
    accessTokenFactory,
    onError,
    ...rest
  }: ProviderProps) => {
    const onErrorRef = useRef(onError);
    const accessTokenFactoryRef = useRef(accessTokenFactory);

    useEffect(() => {
      if (!connectEnabled) {
        return;
      }

      let connectionBuilder = new HubConnectionBuilder()
        .withUrl(url, {
          accessTokenFactory: () => accessTokenFactoryRef.current?.() || "",
          ...rest,
        })
        .withAutomaticReconnect();

      if (__DEV__) {
        connectionBuilder = connectionBuilder.configureLogging(
          LogLevel.Information,
        );
      }

      const connection = connectionBuilder.build();
      connection.onreconnecting((error) => onErrorRef.current?.(error));

      Context.connection = connection;
      let lastConnectionSentState: number | null =
        Number(jsCookie.get(KEY_LAST_CONNECTION_TIME)) || null;
      let anotherTabConnectionId: string | null = null;

      /** If another tab connected to signalR we will receive this event */
      hermes.on(IS_SIGNAL_R_CONNECTED, (_anotherTabConnectionId) => {
        // connected tab will send empty _anotherTabConnectionId before close
        if (!_anotherTabConnectionId) {
          lastConnectionSentState = null;
          anotherTabConnectionId = null;
          checkForStart();

          return;
        }
        if (__DEV__) {
          console.log("_anotherTabConnectionId");
        }
        anotherTabConnectionId = _anotherTabConnectionId;
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
            shoutConnected(connection.connectionId);

            await connection.start();

            function syncWithTabs() {
              if (anotherTabConnectionId) {
                clearInterval(sentInterval);
                connection.stop();

                return;
              }

              shoutConnected(connection.connectionId);
            }

            sentInterval = setInterval(syncWithTabs, 4000);

            syncWithTabs();
          } catch (err) {
            console.log(err);
            clearInterval(sentInterval);
            onErrorRef.current?.(err);
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

      /**
       * Before of this tab close this event will sent an empty
       * anotherTabConnectionId to other tabs
       */
      function onBeforeunload() {
        if (isConnectionConnecting(connection)) {
          shoutConnected(null);

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
    }, [connectEnabled, url, ...dependencies]);

    return children;
  };

  return Provider;
}

function shoutConnected(anotherTabConnectionId: string | null) {
  if (!anotherTabConnectionId) {
    hermes.send(IS_SIGNAL_R_CONNECTED, "");
    jsCookie.set(KEY_LAST_CONNECTION_TIME, "");

    return;
  }

  hermes.send(IS_SIGNAL_R_CONNECTED, anotherTabConnectionId);
  const expires = new Date();
  expires.setSeconds(expires.getSeconds() + 10);
  jsCookie.set(KEY_LAST_CONNECTION_TIME, Date.now().toString(), {
    expires,
    path: "/",
  });
}

export { providerFactory };
export type { ProviderProps };
