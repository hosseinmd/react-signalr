import React, { useState } from "react";

import { createSignalRContext } from "../../lib";
import { Hub } from "../../lib/types";
import {
  ChatHubServiceCallbacksNames,
  ChatHubServiceCallbacks,
  ChatHubServiceOperationsNames,
  StartWorkVm,
} from "./services/hub";
interface A extends Hub {
  callbacksName: ChatHubServiceCallbacksNames;
  methodsName: ChatHubServiceOperationsNames;

  callbacks: ChatHubServiceCallbacks;
}
const SignalRContext = createSignalRContext<A>(
  Object.values(ChatHubServiceCallbacksNames),
);

const App = () => {
  return (
    <SignalRContext.Provider
      // connectEnabled={!!token}
      // accessTokenFactory={() => token}
      // dependencies={[token]} //remove previous connection and create a new connection if changed
      url={"http://localhost:5000/hub"}
    >
      <Todo />
    </SignalRContext.Provider>
  );
};

function Todo() {
  const [message, setMessage] = useState("");

  const callback: A["callbacks"][ChatHubServiceCallbacksNames.startwork] = (
    message,
  ) => {
    setMessage(JSON.stringify(message));
    console.log(message, "ok");
  };

  SignalRContext.useSignalREffect(
    ChatHubServiceCallbacksNames.startwork,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    callback,
    [],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "scroll",
        height: "100%",
      }}
    >
      <h3>React signalR</h3>
      <button
        onClick={() => {
          const data: StartWorkVm = {
            firstName: "h",
            lastName: "m",
            //@ts-ignore
            JobType: 1,
            birthDate: new Date().toISOString(),
          };

          SignalRContext.invoke(
            ChatHubServiceOperationsNames.StartWorkAsync,
            data,
          );
          //  fetch("http://localhost:5000/home/start")
        }}
      >
        Invoke signalR
      </button>
      <p>{message}</p>
    </div>
  );
}

export default App;
