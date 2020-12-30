import { HubConnection } from "@microsoft/signalr";
import { DependencyList } from "react";
import { ProviderProps } from "./provider";

export interface Context<T extends Hub> {
  Provider: (Props: ProviderProps) => JSX.Element;
  connection: HubConnection | null;
  eventsExpectedLast: {
    [name in T["callbacksName"]]: number | null;
  };
  selfCallIfNotReceived: (
    event: T["callbacksName"] | T["callbacksName"][],
  ) => void;
  invoke: <E extends T["methodsName"], C extends Parameters<T["methods"][E]>>(
    methodName: E,
    ...args: C
  ) => void;
  useSignalREffect: <E extends T["callbacksName"], C extends T["callbacks"][E]>(
    events: E,
    callback: C,
    deps: DependencyList,
  ) => void;
}

export interface Hub<T extends string = string, M extends string = string> {
  callbacksName: T;
  methodsName: M;
  callbacks: {
    [name in T]: <F extends (...args: any) => any>(
      ...args: Parameters<F>
    ) => void;
  };
  methods: {
    [name in M]: <F extends (...args: any) => any>(
      ...args: Parameters<F>
    ) => void;
  };
}