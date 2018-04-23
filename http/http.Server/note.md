# http.Server

该类继承自 `net.Server`，且具有以下的额外事件：

## `checkContinue` 事件

    request <http.IncommingMessage>
    
    response <http.ServerResponse>

每次收到 HTTP `Expect: 100-continue` 请求都会触发该事件。如果没有侦听该事件，则服务器将自动返回一个 `100 Continue` 响应。

处理该事件涉及调用 `response.writeContinue` 如果客户端应该继续发送请求体，如果客户端不应该继续发送请求体则生成一个合适的 HTTP 响应（如 400 Bad Request）。

注意，当这个事件触发并被处理了，`request` 事件将不会被触发。

## `checkExpectation` 事件

    request <http.ClientRequest>

    response <http.ServerResponse>

每次收到有 HTTP Except 头的请求，如果值不是 `100-continue`，则触发该事件。如果该事件没有被侦听，服务器将自动返回一个 `417 Exceptation Failed` 响应。


## `clientError` 事件

    exception <Error>

    socket <net.Socket>

如果一个客户端触发了一个 error 事件，将被传递到这里。该事件的侦听者会负责关闭/销毁底层的 socket. 例如，可能希望更温和地用一个 HTTP '400 Bad Request' 响应优雅地关闭 socket, 而不是突然地切断连接。

默认的行为是请求异常是立即销毁 socket, 而不是突然地切断连接。对这些错误形成的请求的默认行为是立即销毁 socket. 

socket 是错误源自的 `net.Socket` 对象。

```js
const http = require('http');

const server = http.createServer((req, res) => {
    res.end();
});

server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000);
```

当 'clientError' 事件发生是，不会有 request 或 response 对象，所以发送的任何 HTTP 响应，包括响应头和内容，必须被直接写入到 socket 对象。 必须小心确保响应是一个被正确格式化的 HTTP 响应消息。

## `close` 事件

服务器关闭时触发。

## `connect` 事件

request <http.IncommingMessage> HTTP 请求的参数，与 request 事件的相同。
socket <net.Socket> 服务器与客户端之间的网络 socket
head <Buffer> 隧道流的第一个数据包（可能为空）

每当一个客户端请求一个 HTTP CONNECT 方法时触发。如果该事件未被监听，则发送 CONNECT 方法的客户端关闭其连接。//？

该事件被触发后，请求的 socket 不会有 一个 data 事件侦听者，也就是说需要绑定他以用来处理 socket 上被发送到服务器的数据。//？

## `connection` 事件

    socket &lt;net.Socket&gt;

当一个新的 TCP 流建立时触发。socket 是 `net.Socket` 类型的一个对象。通常用户无需要访问此事件。

这个 socket 也可以通过 request.connection 访问。

## `request` 事件

    request <http.IncommingMessage>
    response <http.ServerResponse>

每次接收到一个请求时触发。注意，每个连接可能有多个请求（在 keep-alive 连接的情况下）。

## `upgrade` 事件

    request <http.IncommingMessage> HTTP 请求的参数，与 `request` 事件的相同。
    socket <net.Socket> 服务器与客户端之间的网络 socket
    head <Buffer> 升级流的每一个数据包（可能为空）

每当一个客户端请求一个 HTTP 升级时触发。如果该事件未被侦听，则发送升级的客户端会关闭其连接。

该事件被触发后，请求的 socket 不会有 一个 data 事件侦听者，也就是说需要绑定他以用来处理 socket 上被发送到服务器的数据。

## `server.close([callback])`

阻止服务器接收新的连接，并保持存在的连接。见 `net.Server.close()`

## `server.listen(handle[,callback])`

## `server.listen(path[,callback])`

## `server.listen([port][,hostname][,backlog][,callback])`

## `server.listening`

    &lt;Boolean&gt;

一个表明服务器是否正在监听连接的布尔值。

`server.maxHeadersCount`

    &lt;Number&gt;

限制最大的请求头数量，默认为 1000。如果为 0，则不做任何限制。

## `server.setTimeout(msecs,callback)`

    msecs &lt;Number&gt;
    callback &lt;Function&gt;

为 socket 设置超时值。如果一个超时发生，则 Server 对象上会触发
一个 timeout 事件，并传入 socket 作为一个参数。

如果 Server 对象上有 timeout 事件监听器，则他会被调用，并带上超时 socket 作为一个参数。

默认情况下，服务器的超时时间是 2分钟，且超时后的 scoket 会被自动销毁。但是，如果你为服务器的 timeout 事件分配了一个回调函数，
则你需要负责处理 scoket 的超时。

例子：

```js 1.js
```
返回 `server`.

## `server.timeout`

    &lt;Number&gt; 默认 ＝ 120000（2钟）

一个 socket 被认定为已超时的空闲毫秒数。

注意，socket 的超时逻辑是在连接上设定的，所以更改这个值只影响服务器上新的连接，而不会影响任何已存在的连接。

设为 0 可禁各种到来的连接的自动超时行为。