# Extended Mind UIs

All of the different UIs depend on the [engine](../engine) for all of the business logic.

## [cli](cli)

Linux/OSX command line client binary and library. Uses [async-tungstenite](https://github.com/sdroege/async-tungstenite)
File-system for local persistence.

## Android

Native Android UI. Uses [OkHttp](https://square.github.io/okhttp/) WebSocket client to connect to the
[hub](../hub), and SQLite for local persistence.

## Web

Web UI. Uses browser WebSocket support to connect to the [hub](../hub), and IndexedDB for local persistence.
