import React, { useReducer } from "react";
import { createSignalRContext } from "../../signalr";
import {
  Chat,
  ChatCallbacksNames,
  ChatOperationsNames,
  JobType,
} from "./services/hub";

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
      onOpen={() => console.log("open")}
      onBeforeClose={() =>
        new Promise((resolve) => {
          console.log("before close");
          setTimeout(() => {
            resolve();
          }, 1000);
        })
      }
      onClosed={() => console.log("close", SignalRContext.connection?.state)}
    >
      <Todo />
    </SignalRContext.Provider>
  );
};

function Todo() {
  const [list, setList] = useReducer((state: string[] = [], action: string) => {
    return [action, ...state].slice(0, 200);
  }, []);
  SignalRContext.useSignalREffect(
    ChatCallbacksNames.startwork,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    (message) => {
      setList("⬇ :" + JSON.stringify(message));
    },
    [],
  );

  SignalRContext.useSignalREffect(
    ChatCallbacksNames.hello,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    (message) => {
      setList("⬇ :" + JSON.stringify(message));
    },
    [],
  );

  async function invoke() {
    const message = {
      firstName: "h",
      lastName: "m",
      jobType: JobType.Programer,
      birthDate: new Date().toISOString(),
    } as const;
    setList("⬆ :" + JSON.stringify(message));

    const response = await SignalRContext.invoke(
      ChatOperationsNames.StartWorkAsync,
      message,
    );
    setList("⬇ :" + JSON.stringify(response));
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
      {list.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
}
export { SignalR };
