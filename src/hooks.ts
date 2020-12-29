import hermes from "hermes-channel";
import { DependencyList, useEffect } from "react";

export type UseSignalREffect<
  T extends string = string,
  C extends (...args: any) => void = (...args: any) => void
> = (events: T, callback: C, deps: DependencyList) => void;

const useSignalREffect: UseSignalREffect = (events, callback, deps) => {
  useEffect(() => {
    let _events: string[];

    // backward compatible array should remove
    if (!Array.isArray(events)) {
      _events = [events];
    } else {
      _events = events;
    }

    _events.forEach((event) => {
      hermes.on(event, callback);
    });

    return () => {
      _events.forEach((event) => {
        hermes.off(event, callback);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export { useSignalREffect };
