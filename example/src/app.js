import React, { useState } from "react";

import { createSignalRContext, useSignalREffect } from "../../lib";

const SignalRContext = createSignalRContext(["startwork", "stopwork"]);

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

  useSignalREffect(
    ["startwork"],
    (message) => {
      setMessage(JSON.stringify(message));
      console.log(message, "ok");
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
      <h3>React signalR</h3>
      <button onClick={() => fetch("http://localhost:5000/home/start")}>
        Invoke signalR
      </button>
      <p>{message}</p>
    </div>
  );
}

export default App;
