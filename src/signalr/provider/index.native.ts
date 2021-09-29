import { useEffect, useRef, useState } from "react";
import { Context, Hub } from "../types";
import { createConnection, isConnectionConnecting, usePropRef } from "../utils";
import { ProviderProps } from "./types";

function providerFactory<T extends Hub>(
  Context: Context<T>,
  events: T["callbacksName"][],
  removeFromExpectedSignalRMessages: (event: T["callbacksName"]) => void,
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

      Context.connection = connection;

      async function checkForStart() {
        checkExpectedSignalRMessages();

        if (!isConnectionConnecting(connection)) {
          try {
            await connection.start();
          } catch (err) {
            console.log(err);
            onErrorRef.current?.(err);
          }
        }
      }

      checkForStart();

      const checkInterval = setInterval(checkForStart, 6000);

      clear.current = () => {
        clearInterval(checkInterval);
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

export { providerFactory };
