# http.IncommingMessage

IncommingMessage 对象由 `http.Server` 或 `http.ClientRequest`创建，并作为第一个参数分别递给 `request` 和 `response` 事件。可以用他来访问响应状态、消息头、以及数据。

他实现了 `Readable Stream` 接口，还有以下额外的事件、方法、及属性。

# aborted 事件

当请求已被客户端中止且网络 socket 已关闭时触发。

# close 事件

表示底层连接被关闭。就像 `end`, 该事件每次响应只发生一次。

# message.url

    <String>

仅适用于 `http.Server`获得的请求。

请求的URL 字符串。仅包含 HTTP 请求实际存在的 URL.
如果请求是：

```js
GET /status?name=ryan HTTP/1.1\r\n
Accept: text/plain\r\n
\r\n
```
则 request.url 会是:

```js
'/status?name=ryan'
```
如果你想转换 URL 可心这样做 `require('url').parse(request.url)`:

```js
$ node
> require('url').parse('/status?name=ryan')
{
  href: '/status?name=ryan',
  search: '?name=ryan',
  query: 'name=ryan',
  pathname: '/status'
}
```
如果你想从查询字符串中提取参数，可以用 `require('querystring').parse` 函数，或者给 `require('url').parse` 的第二个参数传递 `true`:

```js
$ node
> require('url').parse('/status?name=ryan', true)
{
  href: '/status?name=ryan',
  search: '?name=ryan',
  query: {name: 'ryan'},
  pathname: '/status'
}
//or
> require('querystring').parse('/status?name=ryan&age=20')
{ '/status?name': 'ryan', age: '20' }

```

# message.method

    <String>

只对从 http.Server 获得的请求有效。

请求方法是一个只读的字符串，例如: 'GET', 'DELETE'

# message.headers

    <Object>

请求/响应头的对象。

头名称和值的键值对，头名称为小写。例如：

```js 
//输出类似以下的东西
// { 'user-agent': 'curl/7.22.0',
//  host: '127.0.0.1:8080',
//  accept: '*/*'
// }
console.log(request.headers);
```
原始报头中的重复数据会按以下方式根据报头名称进行处理:

- 重复的 age, authorization, content-length, content-type, etag, expires, from, host, if-modified-since, if-unmodified-since, last-modified, location, max-forwards, proxy-authorization, referer, retry-after, 或 user-agent 会被丢弃。

- set-cookie 始终是一个数组。重复的会被添加到数组。
- 对于所有的其他报头，其值使用 ',' 连接。

# message.rawHeaders

    <Array>

接收到的原始请求头/响应头列表。

注意，这不是一个元组列表。所以偶数的偏移是键的值，奇数的偏移是关联的值。

头不是小写的，重复项不合并。

```js
console.log(resquest.rawHeaders);

//[
//    'user-agent'
//    'this is invalid because there can be only one',
//    'User-Agent',
//    'curl/7.22.0',
//    'Host',
//    '127.0.0.1:8080',
//    'ACCEPT',
//    '*/*']
//]
```

# message.rawTrailers

    <Array>

接收到的原始的请求/响应报尾的键和值。只在 'end' 事件时填入。

# message.trailers

    <Object>

请求/响应报尾对象。只有在 'end' 事件时填入。

# message.httpVersion

    <String>

在服务器请求中，HTTP 版本由客户端发送。客户端响应中 HTTP 版本是指连接的服务器的版本。可能`1.1` 或 `1.0`.

`message.httpVersionMajor` 是第一个整数。`message.httpVersionMinor` 是第二个整数。

# message.statusCode

<Number>

仅适用于从 `http.ClientRequest` 获得的响应。

3 位数字的 HTTP 响应状态码，如 404

# message.statusMessage

<String>

只对从 `http.ClientRequest` 获得的响应有效。

HTTP 响应状态消息（reason phrase）。如 `OK` 或 `Internal Server Error`.

# message.socket

    <net.Socket>

与连接有关的 net.Socket 对象。

如果有 HTTPS 支持，可用 `request.socket.getPeerCertificate()` 获得客户端认证的细节。

# message.setTimeout(msecs, callback)

    msecs <Number>
    callback <Function>

调用 `message.connection.setTimeout(msecs, callback)` //message 哪里有 connection 属性？

返回 `message`.

# message.destory([error])

    error <Error>

调用接收 `IncommingMessage` 的 socket 的 `destroy()`. 如果提供了 `error`, 则触发 `error` 事件，且把 `error` 作为一个参数传入事件的任何监听器。