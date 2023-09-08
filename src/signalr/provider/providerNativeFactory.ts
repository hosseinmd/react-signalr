import { useEffect, useRef, useState } from "react";
import { useEvent } from "../../utils";
import { Context, Hub } from "../types";
import { createConnection, isConnectionConnecting } from "../utils";
import { ProviderProps } from "./types";

function providerNativeFactory<T extends Hub>(Context: Context<T>) {
  const Provider = ({
    url,
    connectEnabled = true,
    automaticReconnect = true,
    children,
    dependencies = [],
    accessTokenFactory,
    onError,
    onOpen,
    onClosed,
    onReconnect,
    onBeforeClose,
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

      const connection = createConnection(
        url,
        {
          accessTokenFactory: () => accessTokenFactoryRef?.() || "",
          ...rest,
        },
        automaticReconnect,
      );
      connection.onreconnecting((error) => onErrorRef?.(error));
      connection.onreconnected(() => onReconnect?.(connection));

      Context.connection = connection;
      //@ts-ignore
      Context.reOn();

      connection.onclose((error) => {
        onClosed?.(error);
      });

      async function checkForStart() {
        if (!isConnectionConnecting(connection)) {
          try {
            await connection.start();
            onOpen?.(connection);
          } catch (err) {
            console.log(err);
            onErrorRef?.(err as Error);
          }
        }
      }

      checkForStart();

      const checkInterval = setInterval(checkForStart, 6000);

      clear.current = async () => {
        clearInterval(checkInterval);
        await onBeforeClose?.(connection);
        connection.stop();
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

export { providerNativeFactory };
