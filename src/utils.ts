import hermes from "hermes-channel";
import { useRef } from "react";

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

function usePropRef<T>(prop: T) {
  const ref = useRef<T>(prop);
  if (ref.current !== prop) {
    ref.current = prop;
  }

  return ref;
}

export { removeDuplicates, sendWithHermes, usePropRef, __DEV__ };
