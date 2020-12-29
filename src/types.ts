import { HubConnection } from "@microsoft/signalr";
import { UseSignalREffect } from "./hooks";
import { ProviderProps } from "./provider";

export type ElementType<
  T extends ReadonlyArray<unknown>
> = T extends ReadonlyArray<infer ElementType> ? ElementType : never;

type A<
  C extends Hub["callbacks"],
  N extends Hub["callbacksName"]
> = UseSignalREffect<N, C[N]>;

export interface Context<T extends Hub> {
  Provider: (Props: ProviderProps) => JSX.Element;
  connection: HubConnection | null;
  eventsExpectedLast: {
    [name in T["callbacksName"]]: number | null;
  };
  selfCallIfNotReceived: (
    event: T["callbacksName"] | T["callbacksName"][],
  ) => void;
  invoke(methodName: string, ...args: any[]): void;
  useSignalREffect: A<T["callbacks"], T["callbacksName"]>;
}

export interface Hub<T extends string = string> {
  callbacksName: T;
  methodsName: string;
  callbacks: {
    [name in T]: <F extends (...args: any) => any>(
      ...args: Parameters<F>
    ) => void;
  };
  methods: <T extends (...args: any) => any>(...args: Parameters<T>) => void;
}
