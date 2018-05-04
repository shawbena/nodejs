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

...


## `http.request(options[, callback])`

__History__

v7.5.0 `options`    参数可以是 WHATWG `URL` 对象。

v0.3.6 添加此特性

- `options` `<Object>` | `<String>` | `<URL>`

    - `protocol` `<string>` 要使用的协议。默认 `http:`.

    - `host` `<string>` 向其发起请求的服务器的 IP 地址或域名。默认 `localhost`.

    - `hostname` `<string>` `host` 的别名。要支持 `url.parse()`, 用 `hostname` 比 `host` 好。

    - `family` `<number>` 当解析 `host` 及 `hostname` 是使用的 IP 地址族。有效值为 `4` 或 `6`. 如果没有指定，IP v4 和 v6 都会被使用。

    - `port`

    - `localAddress`

    - `socketPath`

    - `method` `<string>` 指定 HTTP 请求方法的字符串。默认 `'GET'`
    
    - `path` `<string>`

    - `headers`

    - `auth`
    
    - `agent`

    - `createConnection`

    - `timeout`

- `callback` `<Function>`

- 返回 `<http.ClientRequest>`

Node.js 每个服务器维护多个连接来进行 HTTP 请求。这个函数使得可以显式地发起请求。

`options` 可以是一个对外，字符串或者 [URL](https://nodejs.org/dist/latest-v8.x/docs/api/url.html#url_the_whatwg_url_api) 对象。如果 `options` 是一个字符串，将自动用 [url.parse()] 转换。如果是一个 [URL](https://nodejs.org/dist/latest-v8.x/docs/api/url.html#url_the_whatwg_url_api) 对象，将自动转换为通常的 `optons` 对象。

可选的 `callback` 参数将添加为 `response` 事件的一次侦听函数。 <!-- response 事件只会触发一次-->

`http.request()` 返回一个 `http.ClientRequest` 类。这个类的实例是一个可写的流。如果要用 POST 请求上传文件，那么就写到这个流对象中。

示例：

```js
const postData = querystring.stringify({
    msg: 'Hello World!'
});

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/upload',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${JSON.stringify(res.statusCode)}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', chunk => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

res.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

// write data to request body
req.write(postData);
req.end();
```

注意示例中调用了 `req.end()`. 使用 `http.request()` 必须调用 `req.end()` 表示请求完结了 - 即使没有往请求使中写数据。

注意以下几个特殊的头：

- 发送 "Connection: keep-alive" 将会通知 Node.js 