# http.ClientRequest

Added in: v0.1.17

该对象由`http.request()` 在内部创建并返回。他表示着一个正在处理的请求，其请求头已进入队列。头仍可使用 `setHeader(name, value)`, `getHeader(name)` 和 `removeHeader(name)` API 进行修改。实际的头会与第一个数据块或调用 `request.end()` 时一起被发送。

要获取响应，需要在请求对象上添加一个 `response` 监听器。当收到响应头时，`response` 事件将会被触发. `response` 事件被执行时带有一个参数，该参数是一个 `http.IncommingMessage` 实例。// http 请求，先收到请求头，后收到请求体？

在 `response` 事件期间，可以添加监听器到响应对象；尤其是侦听 `data` 事件。

如果没有添加 `response` 事件处理函数，那么整个响应都将被丢掉。而如果添加了 `response` 事件处理函数，则必须消耗响应对角的数据，当用 `readable` 事件时调用 `response.read()`或添加 `data` 处理函数，或调用 `.resume()` 方法。在数据消耗完之前 `end` 事件不会被触发。同样，在数据消耗完之前，会消耗内存，可能会造成 `process out of memmory` 错误。

*Node.js 不会检查 Content-Length 和已发送的主体的长度是否相等。*

请求实现了 [Writabl Stream](https://nodejs.org/dist/latest-v8.x/docs/api/stream.html#stream_class_stream_writable) 接口。是一个有以下事件的 [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html#events_class_eventemitter)

## Event

Added in: v1.4.1

`abort` 事件
当请求已被客户端中止时触发。仅在首次调用 `abort()` 时触发。

`aborted` 事件
当请求已被服务器中止且网络 socket 已关闭时触发

`connect`

- response `<http.IncommingMessage>`
- socket `<net.Socket>`
- head `<Buffer>`

每当服务器响应一个带有 `CONNECT` 方法的请求时触发。如果该事件未被监听，则接收到 `CONNECT` 方法的客户端会关闭他们的连接。

一对客户端和服务端会展示如何监听 connect 事件:

```js
```

`continue`
`respose`
`socket`
`update`

# point

http.request() 第二个参数应该是用于 `ClientRequest` `response` 事件的处理函数。

响应数据的处理与流有关。