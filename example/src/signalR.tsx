import React, { useState } from "react";
import { createSignalRContext } from "../../lib";
import { Chat, ChatCallbacksNames, ChatOperationsNames } from "./services/hub";

const SignalRContext = createSignalRContext<Chat>({
  shareConnectionBetweenTab: true,
});

const SignalR = () => {
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
  SignalRContext.useSignalREffect(
    ChatCallbacksNames.startwork,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    (message) => {
      setMessage(JSON.stringify(message));
      console.log(message, "ok");
    },
    [],
  );

  async function invoke() {
    const response = await SignalRContext.invoke(
      ChatOperationsNames.StartWorkAsync,
      {
        firstName: "h",
        lastName: "m",
        //@ts-ignore
        JobType: 1,
        birthDate: new Date().toISOString(),
      },
    );
    console.log({ response }, "ok");
  }

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
      <button onClick={() => invoke()}>Invoke signalR</button>
      <p>{message}</p>
    </div>
  );
}
export { SignalR };
