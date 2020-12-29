import React, { useState } from "react";

import { createSignalRContext, useSignalREffect } from "../../lib";
import {
  ChatHubServiceCallbacksNames,
  ChatHubServiceCallbacks,
  ChatHubServiceOperationsNames,
  StartWorkVm,
} from "./services/hub";

const SignalRContext = createSignalRContext<ChatHubServiceCallbacksNames>(
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

  const callback: ChatHubServiceCallbacks[ChatHubServiceCallbacksNames.startwork] = (
    message,
  ) => {
    setMessage(JSON.stringify(message));
    console.log(message, "ok");
  };

  useSignalREffect([ChatHubServiceCallbacksNames.startwork], callback, []);

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
