import hermes from "hermes-channel";
import { useEffect } from "react";
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

    useEffect(() => {
      if (!connectEnabled) {
        return;
      }

      const connection = createConnection(url, {
        accessTokenFactory: () => accessTokenFactoryRef.current?.() || "",
        ...rest,
      });
      connection.onreconnecting((error) => onErrorRef.current?.(error));

      Context.connection = connection;

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

      events.forEach((event) => {
        connection.on(event, (message: any) => {
          hermes.send(event, message, true);
        });
      });

      return () => {
        clearInterval(checkInterval);
        connection.stop();

        events.forEach((event, index) => {
          hermes.off(
            event,
            //@ts-ignore
            expectedCallbacks[index],
          );
        });
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectEnabled, url, ...dependencies]);

    return children;
  };

  return Provider;
}

export { providerFactory };
