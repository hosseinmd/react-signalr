import React, { useState } from "react";
import { createSocketContext } from "../../lib";
import { Chat, ChatCallbacksNames, ChatOperationsNames } from "./services/hub";

const SocketContext = createSocketContext<Chat>();
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
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");

  SocketContext.useSocketEffect(
    ChatCallbacksNames.startwork,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    (message) => {
      setMessage(JSON.stringify(message));
    },
    [],
  );
  SocketContext.useSocketEffect(
    ChatCallbacksNames.hello,
    (message) => {
      setDate(JSON.stringify(message));
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
          SocketContext.invoke(ChatOperationsNames.StartWorkAsync, {
            firstName: "mohammad",
            lastName: "heydari",
            //@ts-ignore
            JobType: 1,
            birthDate: new Date().toISOString(),
          });
        }}
      >
        Send Socket
      </button>
      <p>{message}</p>
      <p>{date}</p>
    </div>
  );
}

export { Socket };
