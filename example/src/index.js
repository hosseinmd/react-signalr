import React from "react";
import ReactDom from "react-dom";
import Todo from "./app";

const App = () => {
  return <Todo />;
};

ReactDom.render(<App />, document.getElementById("root"));
