import hermes from "hermes-channel";
import { useEffect, useRef, useState } from "react";
import jsCookie from "js-cookie";
import { createConnection, isConnectionConnecting } from "../utils";
import { ProviderProps } from "./types";
import { Context, Hub } from "../types";
import { useEvent, __DEV__ } from "../../utils";

const IS_SOCKET_CONNECTED = "IS_SOCKET_CONNECTED";
const KEY_LAST_CONNECTION_TIME = "KEY_LAST_CONNECTION_TIME";

function providerFactory<T extends Hub>(Context: Context<T>) {
  const Provider = ({
    url,
    connectEnabled = true,
    automaticReconnect = true,
    children,
    dependencies = [],
    accessTokenFactory,
    onError,
    ...rest
  }: ProviderProps) => {
    const onErrorRef = useEvent(onError);
    const accessTokenFactoryRef = useEvent(accessTokenFactory);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const clear = useRef(() => {});

    function refreshConnection() {
      if (!connectEnabled) {
        return;
      }

      const connection = createConnection(url, {
        autoConnect: true,
        reconnection: automaticReconnect,
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: () => accessTokenFactoryRef?.() || "",
            },
          },
        },
        ...rest,
      });

      Context.connection = connection;

      //@ts-ignore
      Context.reOn();

      let lastConnectionSentState: number | null =
        Number(jsCookie.get(KEY_LAST_CONNECTION_TIME)) || null;
      let anotherTabConnectionId: string | null = null;

      /** If another tab connected to signalR we will receive this event */
      hermes.on(IS_SOCKET_CONNECTED, (_anotherTabConnectionId) => {
        // connected tab will send empty _anotherTabConnectionId before close
        if (!_anotherTabConnectionId) {
          lastConnectionSentState = null;
          anotherTabConnectionId = null;
          checkForStart();

          return;
        }
        if (__DEV__) {
          console.log("Another tab connected");
        }
        anotherTabConnectionId = _anotherTabConnectionId;
        lastConnectionSentState = Date.now();
        if (!isConnectionConnecting(connection)) {
          sentInterval && clearInterval(sentInterval);
          connection.close();
        }
      });

      let sentInterval: any;

      async function checkForStart() {
        function syncWithTabs() {
          if (anotherTabConnectionId) {
            clearInterval(sentInterval);
            connection.close();

            return;
          }

          shoutConnected(connection.id || null);
        }
        if (
          (!lastConnectionSentState ||
            lastConnectionSentState < Date.now() - 5000) &&
          !isConnectionConnecting(connection)
        ) {
          try {
            shoutConnected(connection.id || null);
            connection.open();

            sentInterval = setInterval(syncWithTabs, 4000);

            syncWithTabs();
          } catch (err) {
            console.log(err);
            sentInterval && clearInterval(sentInterval);
            onErrorRef?.(err as Error);
          }
        }
      }

      checkForStart();

      const checkInterval = setInterval(checkForStart, 6000);

      /**
       * Before of this tab close this event will sent an empty
       * anotherTabConnectionId to other tabs
       */
      function onBeforeunload() {
        if (isConnectionConnecting(connection)) {
          shoutConnected(null);
          clearInterval(sentInterval);
          connection.disconnect();
          return;
        }
      }

      /** AddEventListener is not exist in react-native */
      window?.addEventListener?.("beforeunload", onBeforeunload);

      clear.current = () => {
        clearInterval(checkInterval);
        sentInterval && clearInterval(sentInterval);
        connection.disconnect();
        hermes.off(IS_SOCKET_CONNECTED);
        /** RemoveEventListener is not exist in react-native */
        window?.removeEventListener?.("beforeunload", onBeforeunload);
      };
    }

    useState(() => {
      refreshConnection();
    });

    const isMounted = useRef<boolean>(false);

    useEffect(() => {
      if (isMounted.current) {
        refreshConnection();
      }

      isMounted.current = true;
      return () => {
        clear.current();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectEnabled, url, ...dependencies]);

    return children as JSX.Element;
  };

  return Provider;
}

function shoutConnected(anotherTabConnectionId: string | null) {
  if (!anotherTabConnectionId) {
    hermes.send(IS_SOCKET_CONNECTED, "");
    jsCookie.set(KEY_LAST_CONNECTION_TIME, "");

    return;
  }

  hermes.send(IS_SOCKET_CONNECTED, anotherTabConnectionId);
  const expires = new Date();
  expires.setSeconds(expires.getSeconds() + 10);
  jsCookie.set(KEY_LAST_CONNECTION_TIME, Date.now().toString(), {
    expires,
    path: "/",
  });
}

export { providerFactory };
export type { ProviderProps };
