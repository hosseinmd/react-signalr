# react-signalr Is a tools for using signalr socket in react/react-native apps

[![NPM](https://nodei.co/npm/react-signalr.png)](https://nodei.co/npm/react-signalr/)

[![install size](https://packagephobia.now.sh/badge?p=react-signalr)](https://packagephobia.now.sh/result?p=react-signalr) [![dependencies](https://david-dm.org/poolkhord/react-signalr.svg)](https://david-dm.org/poolkhord/react-signalr.svg)

## react-signalr

features

- Connect event to a component
- Manage connections in multiple tabs

## TOC

- [install](#install)
- [getStart](#getStart)
- [useSignalREffect](#useSignalREffect)

### install

`$ yarn add react-signalr`

### getStart

create a signalr context,

```js
import { createSignalRContext } from "react-signalr";

const SignalRContext = createSignalRContext<"message"|"status">(
  ["message","status"],
);


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
    ["message"],
    (message) => {
      setMessage([...messages, message]);
    },
    [messages],
  );

  return null;
};
```
