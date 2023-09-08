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
    ...rest
  }: ProviderProps) => {
    const onErrorRef = useEvent(onError);
    const accessTokenFactoryRef = useEvent(accessTokenFactory);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const clear = useRef(() => {});

    async function refreshConnection() {
      if (!connectEnabled) {
        return;
      }

      const connection = createConnection(url, {
        extraHeaders: {
          Authorization: (await accessTokenFactoryRef?.()) || "",
        },
        reconnection: automaticReconnect,
        ...rest,
      });

      Context.connection = connection;

      //@ts-ignore
      Context.reOn();

      async function checkForStart() {
        if (!isConnectionConnecting(connection)) {
          try {
            await connection.open();
          } catch (err) {
            console.log(err);
            onErrorRef?.(err as Error);
          }
        }
      }

      checkForStart();

      const checkInterval = setInterval(checkForStart, 6000);

      clear.current = () => {
        clearInterval(checkInterval);
        connection.disconnect();
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
