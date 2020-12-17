import {
  HubConnectionBuilder,
  IHttpConnectionOptions,
  LogLevel,
} from "@microsoft/signalr";
import hermes from "hermes-channel";
import { DependencyList, useEffect } from "react";
import { isConnectionConnecting, __DEV__ } from "./utils";

export interface ProviderProps extends IHttpConnectionOptions {
  url: string;
  /** Default is true */
  connectEnabled?: boolean;
  children: JSX.Element;
  dependencies?: DependencyList;
}

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
    ...rest
  }: ProviderProps) => {
    useEffect(() => {
      if (!connectEnabled) {
        return;
      }

      let connectionBuilder = new HubConnectionBuilder()
        .withUrl(url, rest)
        .withAutomaticReconnect();

      if (__DEV__) {
        connectionBuilder = connectionBuilder.configureLogging(
          LogLevel.Information,
        );
      }

      const connection = connectionBuilder.build();

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
