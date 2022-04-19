import { useEffect, useRef, useState } from "react";
import { usePropRef } from "../../utils";
import { Context, Hub } from "../types";
import { createConnection, isConnectionConnecting } from "../utils";
import { ProviderProps } from "./types";

function providerNativeFactory<T extends Hub>(Context: Context<T>) {
  const Provider = ({
    url,
    connectEnabled = true,
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
    const onErrorRef = usePropRef(onError);
    const accessTokenFactoryRef = usePropRef(accessTokenFactory);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const clear = useRef(() => {});

    function refreshConnection() {
      if (!connectEnabled) {
        return;
      }

      const connection = createConnection(url, {
        accessTokenFactory: () => accessTokenFactoryRef.current?.() || "",
        ...rest,
      });
      connection.onreconnecting((error) => onErrorRef.current?.(error));
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
            onErrorRef.current?.(err as Error);
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

    return children;
  };
  return Provider;
}

export { providerNativeFactory };
