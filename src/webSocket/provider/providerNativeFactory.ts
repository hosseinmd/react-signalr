import { useEffect, useRef, useState } from "react";
import { useEvent } from "../../utils";
import { Context } from "../types";
import { createConnection, isConnectionConnecting } from "../utils";
import { ProviderProps } from "./types";

function providerNativeFactory(context: Context) {
  const Provider = ({
    url,
    connectEnabled = true,
    children,
    dependencies = [],
    onError,
    onOpen,
    onClose,
    logger = console,
    headers,
  }: ProviderProps) => {
    const onErrorRef = useEvent(onError);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const clear = useRef(() => {});

    function refreshConnection() {
      if (!connectEnabled) {
        return;
      }

      async function checkForStart() {
        if (!isConnectionConnecting(context.connection)) {
          try {
            createConnection(context, {
              onClose,
              onOpen,
              logger,
              url,
              onErrorRef,
              headers,
            });
          } catch (err) {
            console.log(err);
            onErrorRef?.(err as any);
          }
        }
      }

      checkForStart();

      const checkInterval = setInterval(checkForStart, 6000);

      clear.current = () => {
        clearInterval(checkInterval);
        context.connection?.close();
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
