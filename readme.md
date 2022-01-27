# react-signalr Is a tools for using signalr socket in react/react-native apps

[![NPM](https://nodei.co/npm/react-signalr.png)](https://nodei.co/npm/react-signalr/)

[![install size](https://packagephobia.now.sh/badge?p=react-signalr)](https://packagephobia.now.sh/result?p=react-signalr) [![dependencies](https://david-dm.org/hosseinmd/react-signalr.svg)](https://david-dm.org/hosseinmd/react-signalr.svg)

## react-signalr

Supported microsoft/signalR version 5 and later
Supported Socket.io
Supported WebSocket

Features

- Hooks for connect event to a component
- Manage connections in multiple tabs (SignalR can only have about 6 tabs open). React-signalr will create a connection open and send event to other tabs by [hermes-channel](https://github.com/hosseinmd/hermes)
- Handle reconnect

## TOC

- [install](#install)
- [getStart](#getStart)
- [useSignalREffect](#useSignalREffect)

### install

`$ yarn add react-signalr`

### getStart

```js
import {
  createSignalRContext, // SignalR
  createWebSocketContext, // WebSocket
  createSocketIoContext, // Socket.io
} from "react-signalr";
```

create a signalr context,

```js
import { createSignalRContext } from "react-signalr";

const SignalRContext = createSignalRContext();
// or createSocketContext for socket.io

const App = () => {
  const { token } = StoreAuthentication.useState();

  return (
    <SignalRContext.Provider
      connectEnabled={!!token}
      accessTokenFactory={() => token}
      dependencies={[token]} //remove previous connection and create a new connection if changed
      url={"https://example/hub"}
    >
      <Routes />
    </SignalRContext.Provider>
  );
};
```

### useSignalREffect

Use this to connect to an event

```js
const Comp = () => {
  const [messages, setMessage] = useState([]);

  useSignalREffect(
    "message",
    (message) => {
      setMessage([...messages, message]);
    },
    [messages],
  );

  return null;
};
```

### React-Native

Full supported
