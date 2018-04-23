# HTTP

要使用 HTTP i服务器, 必须 `require('http')`.

Node.js 中的 HTTP 接口设计为支持传统上很难使用的协议的特色。尤其是，大的，可能块编码的数据。这个接口被设计为从未缓存整个请求或响应——用户能流 (stream) 化数据。

这样表示 HTTP 消息头：

```js
{
   'content-length': '123',
   'content-type': 'text/plain',
   'connection': 'keep-alive',
   'host': 'mysite.com',
   'accept': '*/*'
}
```

键是小写的。值不能修改。

为了支持更广的 HTTP 应用程序，Node.js 的 HTTP API 很底层。他只处理流和消息转换。他转换一个消息为头和体但不转换实际的头和体。

重复的头和体是如何处理的详见 [message.headers](https://nodejs.org/dist/latest-v8.x/docs/api/http.html#http_message_headers).

接收到的原始的头保存在 `rawHeaders` 属性中，是一个数组 `[key, vlaue, key2, value2, ...]`. 如之前的消息头对象可能有一个类似下面的 `rawHeaders`:

```js
[
    'ConTent-Length', '123456',
    'content-LENGTH', '123',
    'content-type', 'text/plain',
    'CONNECTION', 'keep-alive',
    'Host', 'mysite.com',
    'accepT', '*/*'
]
```

## Class: `http.Agent`

Added in v0.3.4

`Agent` 负责管理连接持续及 HTTP 客户端重用。

```js
http.get(option, (res) => {
    // Do stuff
}).on('socket', (socket) => {
    socket.emit('agentRemove');
});
```

一个 