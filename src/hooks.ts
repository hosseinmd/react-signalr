import hermes from "hermes-channel";
import { DependencyList, useEffect } from "react";

function useSignalREffect<T extends string>(
  events: T | T[],
  callback: (message: any) => void,
  deps: DependencyList,
) {
  useEffect(() => {
    let _events: T[];

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
}

export { useSignalREffect };
