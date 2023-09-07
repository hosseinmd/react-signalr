import React, { useReducer } from "react";
import { createSocketIoContext } from "../../socketio";
import {
  Chat,
  ChatCallbacksNames,
  ChatOperationsNames,
  JobType,
} from "./services/hub";

const SocketContext = createSocketIoContext<Chat>({
  shareConnectionBetweenTab: true,
});

const Socket = () => {
  return (
    <SocketContext.Provider
      // connectEnabled={!!token}
      // accessTokenFactory={() => token}
      // dependencies={[token]} //remove previous connection and create a new connection if changed
      url={"http://127.0.0.1:4001"}
    >
      <Todo />
    </SocketContext.Provider>
  );
};

function Todo() {
  const [list, setList] = useReducer((state: string[] = [], action: string) => {
    return [action, ...state].slice(0, 200);
  }, []);

  SocketContext.useSocketEffect(
    ChatCallbacksNames.startwork,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    (message) => {
      setList("⬇ :" + JSON.stringify(message));
    },
    [],
  );
  SocketContext.useSocketEffect(
    ChatCallbacksNames.hello,
    (message) => {
      setList("⬇ :" + JSON.stringify(message));
    },
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
      <h3>React socket.io</h3>
      <button
        onClick={() => {
          const message = {
            firstName: "mohammad",
            lastName: "heydari",
            jobType: JobType.Programer,
            birthDate: new Date().toISOString(),
          } as const;
          setList("⬆ :" + JSON.stringify(message));
          SocketContext.invoke(ChatOperationsNames.StartWorkAsync, message);
        }}
      >
        Send Socket
      </button>
      {list.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
}

export { Socket };
