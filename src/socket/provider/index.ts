import hermes from "hermes-channel";
import { useEffect, useRef, useState } from "react";
import jsCookie from "js-cookie";
import {
  createConnection,
  isConnectionConnecting,
  usePropRef,
  __DEV__,
} from "../utils";
import { ProviderProps } from "./types";
import { Context, Hub } from "../types";

const IS_SOCKET_CONNECTED = "IS_SOCKET_CONNECTED";
const KEY_LAST_CONNECTION_TIME = "KEY_LAST_CONNECTION_TIME";

function providerFactory<T extends Hub>(Context: Context<T>) {
  const Provider = ({
    url,
    connectEnabled = true,
    children,
    dependencies = [],
    accessTokenFactory,
    onError,
    ...rest
  }: ProviderProps) => {
    const onErrorRef = usePropRef(onError);
    const accessTokenFactoryRef = usePropRef(accessTokenFactory);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const clear = useRef(() => {});

    function refreshConnection() {
      if (!connectEnabled) {
        return;
      }

      const connection = createConnection(url, {
        autoConnect: true,
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: () => accessTokenFactoryRef.current?.() || "",
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
      hermes.on(IS_SOCKET_CONNECTED, (_anotherTabConnectionId: any) => {
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
          connection.close();
        }
      });

      let sentInterval: any;

      async function checkForStart() {
        if (
          (!lastConnectionSentState ||
            lastConnectionSentState < Date.now() - 5000) &&
          !isConnectionConnecting(connection)
        ) {
          try {
            shoutConnected(connection.id);

            await connection.open();

            function syncWithTabs() {
              if (anotherTabConnectionId) {
                clearInterval(sentInterval);
                connection.close();

                return;
              }

              shoutConnected(connection.id);
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

    return children;
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
