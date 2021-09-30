import hermes from "hermes-channel";
import { DependencyList, useEffect } from "react";
import { Context, Hub } from "./types";

function createUseSignalREffect<T extends Hub>(context: Context<T>) {
  const useSignalREffect = <T extends string, C extends (...args: any) => void>(
    events: T,
    callback: C,
    deps: DependencyList,
  ) => {
    useEffect(() => {
      let _events: string[];
      function _callback(args: any[]) {
        callback(...args);
      }

      // backward compatible array should remove
      if (!Array.isArray(events)) {
        _events = [events];
      } else {
        _events = events;
      }

      _events.forEach((event) => {
        context.on?.(event);
        hermes.on(event, _callback);
      });

      return () => {
        _events.forEach((event) => {
          context.off?.(event);
          hermes.off(event, _callback);
        });
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
  };

  return useSignalREffect;
}
export { createUseSignalREffect };
