import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import hermes from "hermes-channel";
import { useEffect, useRef } from "react";
import { isConnectionConnecting, __DEV__ } from "../utils";
import { ProviderProps } from "./types";

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
    }, [connectEnabled, ...dependencies]);

    return children;
  };

  return Provider;
}

export { providerFactory };
