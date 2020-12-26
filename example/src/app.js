import React from "react";

import { createSignalRContext, useSignalREffect } from "../../lib";

const SignalRContext = createSignalRContext(["start-work", "stop-work"]);

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
  useSignalREffect(
    ["startwork"],
    (message) => {
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
      <h3>useFetching</h3>
      <span>1 second loading start delay</span>
      <div style={{ minHeight: "100px", width: "50px", display: "flex" }} />
    </div>
  );
}

export default App;
