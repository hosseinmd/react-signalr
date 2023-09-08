import hermes from "hermes-channel";
import { useEffect } from "react";
import { Context, Hub } from "./types";
import { useEvent } from "../utils";

function createUseSocketEffect<T extends Hub>(context: Context<T>) {
  const useSocketEffect = <T extends string, C extends (...args: any) => void>(
    event: T,
    callback: C,
  ) => {
    const callbackRef = useEvent(callback);
    useEffect(() => {
      function _callback(args: any[]) {
        callbackRef(...(Array.isArray(args) ? args : [args]));
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

  return useSocketEffect;
}
export { createUseSocketEffect };
