import hermes from "hermes-channel";
import { useEffect } from "react";
import { Context, Hub } from "./types";
import { useEvent } from "../utils";

function createUseSocketEffect<T extends Hub>(context: Context<T>) {
  const useSocketEffect = <
    E extends keyof T["callbacks"],
    C extends (...args: any) => void,
  >(
    event: E,
    callback: C,
  ) => {
    const callbackRef = useEvent(callback);
    useEffect(() => {
      function _callback(args: any[]) {
        callbackRef(...(Array.isArray(args) ? args : [args]));
      }

      context.on?.(event as string);
      hermes.on(event as string, _callback);

      return () => {
        context.off?.(event as string);
        hermes.off(event as string, _callback);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  };

  return useSocketEffect;
}
export { createUseSocketEffect };
