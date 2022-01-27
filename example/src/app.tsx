import React, { useState } from "react";
import { SignalR } from "./signalR";
import { Socket } from "./socket";
import { WebSocket } from "./webSocket";

const App = () => {
  const [page, setIsSignalR] = useState<"SignalR" | "Socket" | "WebSocket">(
    "WebSocket",
  );
  return (
    <div>
      <button onClick={() => setIsSignalR("SignalR")}>SignalR</button>
      <button onClick={() => setIsSignalR("Socket")}>Socket</button>
      <button onClick={() => setIsSignalR("WebSocket")}>Web Socket</button>
      {page === "SignalR" ? (
        <SignalR />
      ) : page === "Socket" ? (
        <Socket />
      ) : (
        <WebSocket />
      )}
    </div>
  );
};

export default App;
