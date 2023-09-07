import React, { useState } from "react";
import { createWebSocketContext } from "../../websocket";

const SocketContext = createWebSocketContext({
  key: "1",
});

const WebSocket = () => {
  return (
    <SocketContext.Provider
      // connectEnabled={!!token}
      // accessTokenFactory={() => token}
      // dependencies={[token]} //remove previous connection and create a new connection if changed
      url={"ws://127.0.0.1:8081"}
    >
      <Todo />
    </SocketContext.Provider>
  );
};

function Todo() {
  const [message, setMessage] = useState("");

  SocketContext.useWebSocketEffect((message) => {
    setMessage(JSON.stringify(message));
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "scroll",
        height: "100%",
      }}
    >
      <h3>React-signalr Websocket</h3>
      <button
        onClick={() => {
          SocketContext.invoke({
            firstName: "h",
            lastName: "m",
            JobType: 1,
            birthDate: new Date().toISOString(),
          });
        }}
      >
        Send Socket
      </button>
      <p>{message}</p>
    </div>
  );
}

export { WebSocket };
