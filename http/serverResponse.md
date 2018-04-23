# http.ServerResponse 类

这个对象由 HTTP server 内部创建，不是由用户。他传递给了 `request` 事件的第二个参数。

响应实现了，但没有继承 `Writable Stream` 接口。这是个 `EventEmitter` 有以下属性：

# close 事件

在 `response.end()` 调用前潜在的连接终止了或 able to flush.

# finish 事件

当响应已经被送出时触发。更确切地说，这个事件是在响应头的最后片段和响应体已经转手给操作系统用于网络传输时触发。这并不意味着客户端已经收到了任何东西。

这个事件之后，响应对象上不再会有任何事件触发。

# response.finish

    <Boolean>

布尔值，用于指出响应是否已完成。开始是 `false`. 执行 `response.end()` 后，值为 `true`.

# response.sendDate

    <Boolean>

当为真，如果没有出现在在头中，Date 头将自动生成并在响应中发送。默认为真。

只有测试时才应禁用。HTTP 响应中需要 Date 头。

# response.statusCode
 
    <Number>

当使用 implicit 头（没有明确地调用 `response.writeHead()`），这个属性控制将被发送给客户端（当头刷新时）的状态码。

例子：

```js
response.statusCode
```

在响应头发送给客户端后，这个属性指示发送出的状态码。

# response.statusMessage

    <String>

当使用 implicit 头（没有明确地调用 `response.writeHead()`），这个属性控制将头刷新时要发送给客户端的状态消息。如果是 `undefined`, 将会为状态码使用标准的状态消息。

例子：

```js
response.statusMessage = 'Not found';
```

在响应头发送给客户端后，这个属性指示发送出的状态消息。

# response.headersSent

    <Boolean>

布尔值（只读）。`true` 如果头已发送出，否则 `false`.

# response.getHeader(name)

    name <String>
    返回 <String>

读取一个已经排队但还未发送给客户端的头。name 区分大小写。

例如：

```js
var contentType = response.getHeader('content-type');
```

# response.setHeader(name,value)

    name <String>
    value <String>

Sets a single header value for implicit headers. If this header already exists in the to-be-sent headers, its value will be replaced. 如果你想用同样的名子发送多个头使用字符串数组。

例子:

```js
response.setHeader('Content-Type', 'text/html');
response.setHeader('Set-Cookie', ['type=ninja', 'language=javascript']);
```

设置一个包含无效字符的头字段名或值将导致抛出 `TypeError`。

当头已经用 `response.setHeader()` 设置过了，他们将会与传递给 `response.writeHead()` 的头合并，传递给 `response.writeHead()` 的头有优先级。

```js
//return content-type = text/plain
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('ok');
});
```

# response.writeHead(statusCode[,statusMessage][,headers])

    statusCode <Number>
    statusMessage <String>
    headers <Object>

发送给请求头一个响应头。状态吗是一个3位的 HTTP 状态码，如 `404`. 最后一个参数 `headers` 是响应头。

例如：

```js
var body = 'hello world';
response.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text-plain'
});
```

一个消息必须且只能调用一次这个方法且必须在 `response.end()` 调用前调用。

如果在调用这个方法前你调用了 `response.write()` 或 `response.end()`, 将会计算 implicit/mutable 头并为你调用这个方法。

当头已经用 `response.setHeader()` 设置过了，他们将会与传递给 `response.writeHead()` 的头合并，传递给 `response.writeHead()` 的头有优先级。

Note that Content-Length is given in bytes not characters. The above example works because the string 'hello world' contains only single byte characters. If the body contains higher coded characters then Buffer.byteLength() should be used to determine the number of bytes in a given encoding. And Node.js does not check whether Content-Length and the length of the body which has been transmitted are equal or not.

设置一个包含无效字符的头字段名或值将导致抛出 `TypeError`。

# response.addTrailers(headers)

这个给响应添加 HTTP trailing 头（一个头但是在消息头的尾部）。

只有 chuncked encoding 用于响应都会触发 Trailers. 如果不是（如：如果请求是 HTTP/1.0）, 将被静默地丢掉。

注 HTTP 需要发送 `Trailer` 头，如果你意在触发 trailers 和头字段和值。如：

```js
response.writeHead(200, {
    'Content-Type': 'text/plain', 
    'Trailer': 'Content-MD5'
});
response.write(fileData);
response.addTrailers({
    'Content-MD5': '7895bf4b8828b55ceaf47747b4bca667'
});
```
设置一个包含无效字符的头字段名或值将导致抛出 `TypeError`。

# response.removeHeader(name)

    name <String>

Removes a header that's queued for implicit sending.

```js
response.removeHeader('Content-Encoding');
```

# response.setTimeout(msecs,callback)

    msecs <Number>
    callback <Function>

将 socket 的超时设置为 `msecs`. 如果提供了 callback, 将会添加为响应对象 `timeout` 事件的侦听者

如果请求，响应或者服务器没有 `timeout` 侦听者，那么 socket 超时后便会被销毁。如果给 request, response 或 server 的 `timeout` 事件添加了处理程序，那么处理程序负责处理超时的 socket.

返回 `response`.

# response.write(chunk[,encoding][,callback])

    chunk <String> | <Buffer>
    encoding <String>
    callback <Function>
    返回：<Boolean>

如果调用了这个方法并且还未调用 `response.writeHeade()`, 将会切换至 implicit 头模式并刷新 implicit 头。//implicit headers ??

这个方法发送一块响应体。这个方法可能被调用多次以提供后续的响应体。

`chunk` 可以是 string 或 buffer. 如果 `chunk` 是一个字符串，第二个参数指定怎样将其编码为字节流。默认 `encoding` 是 `utf8`. `callback` 会在这块数据刷新时调用。

Note: This is the raw HTTP body and has nothing to do with higher-level multi-part body encodings that may be used.

第一次调用 `response.write()`, 将会给客户端发送头信息和第一块响应体。第二次调用 `response.write()`, Node.js 假设你打算流数据，并分开发送。即，响应缓冲至第一块响应体。

返回 `true` 如果整个数据都被成功刷新至 kernel buffer. 返回 `false`, 如果所有或部分数据在用户内存中排队。当 buffer 再次释放时将会触发 `drain` 事件。

# response.writeContinue()

给客户端发送 HTTP/1.1 100 Continue 消息，指出响应体应该会被发送。见 `Server` 的 `checkContinue` 事件。

# response.end([data][,encoding][,callback])

这个方法向服务器发信号，所有的响应头和体已经发送出了。服务器就该认为这个消息已经完成了。这个方法，`response.end()` 每个响应都应该`调用`.

如果指定了 `data`, 赞同于调用 `response.write(data, encoding)` 后跟 `response.end(callback)`

如果指定了 `callback`，当响应流完成时会被调用。
