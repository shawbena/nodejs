# http
使用 HTTP 服务器和客户端必须 require('http');

## http.Agent
用于池化在 HTTP 客户端请求中使用的 socket

## http.ClientRequest
表示正在处理的请求，其请求头已进入队列。

## http.Server
该类继承自 `net.Server`

## http.ServerResponse
该对象是由一个 HTTP 服务器内部创建的。他作为第二个参数被传入 request 事件 //?

## http.IncommingMessage
IncommingMessage 对象由 http.Server 或 http.ClientRequest 创建，并作为第一个参数分别递给 request 和 response 事件，也可以用来访问响应状态，消息关，以及数据。

## http.MTHODS
<Array>
解析器支持的 HTTP 方法列表。

## http.STATUS_CODES
<Object>
所有标准 HTTP 响应状态码的集合，以及各自的简短描述。例如，http.STATUS_CODES[404] === 'NOT FOUND'

## http.createServer([requestListener])

    返回 `http.Server`

返回一个新的 `http.Server` 实例

`requestListener`是一个会被自动添加到 `request` 事件中的函数。

## http.get()

    options <Object>
    callback <Function>
    返回 <http.ClientRequest>

由于大多请求都是没有请求体的 GET 请求，Node.js 提供了这个简便的方法。这个方法和 `http.request()` 的唯一不同是这个方法设置方法为 GET 并自动调用 `req.end()`. 数据必须在回调中消耗，原因在 `http.ClientRequest` 中有陈述。

callback 只有一个参数，是 `http.IncommingMessage` 的实例。

获取 JSON 的例子：

```js
http.get('http://node.js.org/dist/index.json', (res) => {
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];

    let error;
    if(statusCode !== 200){
        error = new Error(`Request Failed.\n+Status Codee: ${statusCode}`);
    }else if(!/^application\/json/.test(contentType)){
        error = new Error(`Invalid content-type.\nExoected application/json but received ${contentType}`);
    }

    if(error){
        console.log(error.message);
        //consume response data to free up memory
        res.resume();
        return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => rawData += chunk);
    res.on('end', () => {
        try{
            let parsedData = JSON.parse(rawData);
            console.log(parsedData);
        }catch(e){
            console.log(e.message);
        }
    }).on('error', (e) => {
        console.log(`Got error: ${e.message}`);
    });
});
```

## http.globalAgent

<http.Agent>

Agent 的全局实例，做为所有 HTTP 客户端请求的默认 Agent

## http.request(options[,callback])

- `options` <Object>
    `protocol` <String> 使用的协议。默认 `http:`.
    `host` <String> 发起请求的域名或服务器 IP 地址。默认 `localhost`
    `hostname` <String> `host` 的别名。要支持 `url.parse()`, 选择 `hostname` 而不是 `host`.
    `family` <Number> IP 地址 family，用于解析 `host` 和 `hostname`. 有效的值是 `4` 到 `6`. 未指定时，既会使用 IP v4 也会使用 v6。
    `port` <Number> 远程服务器的端口。默认 80.
    `localAddress` <String> 绑定的用于网络连接的本地地址。
    `socketPath` <String> Unix Domain Socket (use one of host:port or socketPath)
    `method` <String> 指定 HTTP 请求的字符串。默认 `GET`.
    `path` <String> 请求地址。默认 `/`. 如果有查询字符串的话应该加上。如: `/index.html?page=12`. 如果请求路径有非法字符时会抛出异常。当前只有空格会被拒绝，但未来可能会改变。
    headers <Object> 一个包含请求头的对象。
    auth <String> 基本的认证。包括 `use:password` to compute an Authorization header.
    `agent` <http.Agent> | <Boolean> 控制 `Agent` 行为。可能的值：
        `undefined`(默认)：对于这个主机和端口使用 `http.globalAgent`.
        `Agent` 对象：explicitly use the passed in `Agent`
        `false`: causes a new Agent with default values to be used
    `createConnection` <Function> 一个函数用于生成一个当 `agent` 选项没有使用时的 socket/stream。只要覆盖默认默认 `createConnection` 函数就可避免创建一个自定义的 `Agent` 类。详见 `agent.createConnection()`.
    `timeout` <Integer>: 一个数字用于指出 socket 超时的毫秒数。会在 socket 连接前设置超时。
- `callback` <Function>
返回： <http.ClientRequest>

Node.js maintains serveral connections per server to make HTTP request. This function allows one to transparently issue requests.

例子：

```js
let postData = querystring.stringify({
    'msg': 'Hello World!'
});

let options = {
    hostname: 'www.google.com',
    port: 80,
    path: '/upload',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-wwww-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
};
let req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
   console.log(`problem with request: ${e.message}`); 
});
```
注意在这个例子中调用了 `req.end()`. 对于 `http.request()` 必须总要调用 `req.end()` 来表示你已经完成了请求，即使没有什么数据可写进请求体。

如果在请求期间遇到了错误（DNS 解析，TCP 层的错误，或 HTTP 转换错误）将触发返回的请求对象上的 一个 `error` 事件。对于所有的 `error` 事件如果没有注册侦听者将会抛出错误。

注意以下一些特殊的头：

- 发送一个 `Connection: keep-alive` 将告诉 Node.js 与服务器的连接应该持续至下次请求。

- 发送一个 `Content-Length` 头将禁用默认的 chunked 编码。

- 发送一个 `Expect` 头将立即改善请求头。通常，当发送 `Expect: 100-continue`, 你应该既设置一个超时同时又侦听 `continue` 事件。见 RFC2616 章节 8.2.3。

- 发送一个认证头将会覆盖 `auth` 选项以计算基本的认证。