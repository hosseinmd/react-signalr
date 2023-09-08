import hermes from "hermes-channel";
import { useEffect } from "react";
import { Context, Hub } from "./types";
import { useEvent } from "../utils";

function createUseSignalREffect<T extends Hub>(context: Context<T>) {
  const useSignalREffect = <T extends string, C extends (...args: any) => void>(
    event: T,
    callback: C,
  ) => {
    const callbackRef = useEvent(callback);
    useEffect(() => {
      function _callback(args: any[]) {
        callbackRef(...args);
      }

      context.on?.(event);
      hermes.on(event, _callback);

      return () => {
        context.off?.(event);
        hermes.off(event, _callback);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  };

  return useSignalREffect;
}
export { createUseSignalREffect };
