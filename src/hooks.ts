import hermes from "hermes-channel";
import { DependencyList, useEffect } from "react";

const useSignalREffect = <T extends string, C extends (...args: any) => void>(
  events: T,
  callback: C,
  deps: DependencyList,
) => {
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
