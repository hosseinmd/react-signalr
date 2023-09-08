import hermes from "hermes-channel";
import { useEffect, useRef, useState } from "react";
import jsCookie from "js-cookie";
import { createConnection, isConnectionConnecting } from "../utils";
import { ProviderProps } from "./types";
import { Context } from "../types";
import { useEvent, __DEV__ } from "../../utils";

const IS_SIGNAL_R_CONNECTED = "IS_SIGNAL_R_CONNECTED";
const KEY_LAST_CONNECTION_TIME = "KEY_LAST_CONNECTION_TIME";

function providerFactory(context: Context) {
  const Provider = ({
    url,
    connectEnabled = true,
    children,
    dependencies = [],
    onError,
    onOpen,
    onClose,
    logger = __DEV__ ? console : null,
  }: ProviderProps) => {
    const onErrorRef = useEvent(onError);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const clear = useRef(() => {});

    function refreshConnection() {
      if (!connectEnabled) {
        return;
      }

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

        logger?.log("_anotherTabConnectionId");

        anotherTabConnectionId = _anotherTabConnectionId;
        lastConnectionSentState = Date.now();
        if (!isConnectionConnecting(context.connection)) {
          sentInterval && clearInterval(sentInterval);
          context.connection?.close();
        }
      });

      let sentInterval: any;

      async function checkForStart() {
        function syncWithTabs() {
          if (anotherTabConnectionId) {
            clearInterval(sentInterval);
            context.connection?.close();

            return;
          }

          shoutConnected(String(context.key));
        }
        logger?.log({
          lastConnectionSentState,
          isConnectionConnecting: isConnectionConnecting(context.connection),
        });

        if (
          (!lastConnectionSentState ||
            lastConnectionSentState < Date.now() - 5000) &&
          !isConnectionConnecting(context.connection)
        ) {
          try {
            createConnection(context, {
              onClose,
              onOpen,
              logger,
              url,
              onErrorRef,
            });

            shoutConnected(String(context.key));

            sentInterval = setInterval(syncWithTabs, 4000);

            syncWithTabs();
          } catch (err) {
            logger?.error((err as Error).message);
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
        if (isConnectionConnecting(context.connection)) {
          shoutConnected(null);
          clearInterval(sentInterval);
          context.connection?.close();
        }
      }

      /** AddEventListener is not exist in react-native */
      window?.addEventListener?.("beforeunload", onBeforeunload);

      clear.current = () => {
        clearInterval(checkInterval);
        sentInterval && clearInterval(sentInterval);
        context.connection?.close();
        hermes.off(IS_SIGNAL_R_CONNECTED);
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
