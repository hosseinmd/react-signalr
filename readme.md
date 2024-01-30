# React-Signalr

[![NPM](https://nodei.co/npm/react-signalr.png)](https://nodei.co/npm/react-signalr/)

[![install size](https://packagephobia.now.sh/badge?p=react-signalr)](https://packagephobia.now.sh/result?p=react-signalr) [![dependencies](https://david-dm.org/hosseinmd/react-signalr.svg)](https://david-dm.org/hosseinmd/react-signalr.svg)

## React-Signalr Is a tools for using signalR, Socket.io or WebSocket in react/react-native apps

- Supported microsoft/signalR version 5 and later
- Supported Socket.io
- Supported WebSocket

Features

- Hooks for connect event to a component
- Manage connections in multiple tabs (SignalR can only have about 6 tabs open). React-signalr will create a connection open and send event to other tabs by [hermes-channel](https://github.com/hosseinmd/hermes)
- Handle reconnect

## TOC

- [Install](#install)
- [Get started SignalR](#signalr)
- [Get started SocketIO](#socketio)
- [Get started WebSocket](#websocket)

## install

`$ yarn add react-signalr @microsoft/signalr socket.io-client`

## Get started

## signalr

First of all you need to create a signalR context. every thing is depend on your context, you could create multiple context.

```js
import { createSignalRContext } from "react-signalr/signalr";

const SignalRContext = createSignalRContext();

const App = () => {
  const { token } = YourAccessToken;

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

#### useSignalREffect

Use this for connect to an event

```js
const Comp = () => {
  const [messages, setMessage] = useState([]);

  SignalRContext.useSignalREffect(
    "event name", // Your Event Key
    (message) => {
      setMessage([...messages, message]);
    },
  );

  return <Components />;
};
```

## socketio

create a socketIO context,

```js
import { createSocketIoContext } from "react-signalr/socketio";

const SocketIOContext = createSocketIoContext();

const App = () => {
  const { token } = YourAccessToken;

  return (
    <SocketIOContext.Provider
      connectEnabled={!!token}
      accessTokenFactory={() => token}
      dependencies={[token]} //remove previous connection and create a new connection if changed
      url={"https://example/hub"}
    >
      <Routes />
    </SocketIOContext.Provider>
  );
};
```

#### useSignalREffect

Use this to connect to an event

```js
const Comp = () => {
  const [messages, setMessage] = useState([]);

  SocketIOContext.useSocketEffect(
    "event name", // Your Event Key
    (message) => {
      setMessage([...messages, message]);
    },
  );

  return <Components />;
};
```

## websocket

create a websocket context,

```js
import { createWebSocketContext } from "react-signalr/websocket";

const WebsocketContext = createWebSocketContext();

const App = () => {
  const { token } = YourAccessToken;

  return (
    <WebsocketContext.Provider
      connectEnabled={!!token}
      dependencies={[token]} //remove previous connection and create a new connection if changed
      url={"https://example/hub"}
    >
      <Routes />
    </WebsocketContext.Provider>
  );
};
```

#### useWebSocketEffect

Use this for connect to an event in you component

```js
const Comp = () => {
  const [messages, setMessage] = useState([]);

  WebsocketContext.useWebSocketEffect(
    (message) => {
      setMessage([...messages, message]);
    },
  );

  return <Components />;
};
```

### supports

| react-signalr  | @microsoft/signalr |
| -------------- | ------------------ |
| 0.2.0 - 0.2.18 | 7.x                |
| 0.2.19         | 7.x - 8.x          |

### React-Native

Full supported
