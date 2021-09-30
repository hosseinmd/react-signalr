import React, { useState } from "react";
import { SignalR } from "./signalR";
import { Socket } from "./socket";

const App = () => {
  const [isSignalR, setIsSignalR] = useState<boolean>();
  return (
    <div>
      <button onClick={() => setIsSignalR(true)}>SignalR</button>
      <button onClick={() => setIsSignalR(false)}>Socket</button>
      {isSignalR ? <SignalR /> : <Socket />}
    </div>
  );
};

export default App;
