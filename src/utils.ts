import hermes from "hermes-channel";
import { useCallback, useRef } from "react";

const __DEV__ = process.env.NODE_ENV !== "production";

function removeDuplicates(arr: string[]) {
  const s = new Set(arr);
  const it = s.values();
  return Array.from(it);
}

function sendWithHermes(
  event: string,
  message: any,
  shareConnectionBetweenTab: boolean,
) {
  hermes.send(event, message, shareConnectionBetweenTab ? "all" : "current");
}

function useEvent<T extends undefined | ((...args: any[]) => any)>(prop: T): T {
  const ref = useRef<T>(prop);
  if (ref.current !== prop) {
    ref.current = prop;
  }

  const callback = useCallback((...args: any[]) => {
    return ref.current!(...args);
  }, []) as T;

  return prop ? callback : prop;
}

export { removeDuplicates, sendWithHermes, useEvent, __DEV__ };
