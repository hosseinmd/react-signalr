import hermes from "hermes-channel";
import { useEffect } from "react";
import { useEvent } from "../utils";
import { Context } from "./types";
import { getMessageEvent } from "./utils";

function createUseSignalREffect(context: Context) {
  const useSignalREffect = (callback: (data: any) => void) => {
    const callbackRef = useEvent(callback);

    useEffect(() => {
      function _callback(data: any) {
        callbackRef(data);
      }

      hermes.on(getMessageEvent(context), _callback);

      return () => {
        hermes.off(getMessageEvent(context), _callback);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  };

  return useSignalREffect;
}
export { createUseSignalREffect };
