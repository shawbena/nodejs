# http.ClientRequest

该对象在内部被创建，并从 `http.request()` 返回。他表示着一个正在处理的请求，其请求头已进入队列。请求头仍可使用 setHeader(name, value), getHeader(name) 和 removeHeader(name) API 进行修改。实际的请求头会与第一个数据块或关闭连接时一起被发送。

要获取响应，需要添加一个 `response` 监听器到请求对象上。当响应头被接收时，请求对象会触发 response. response 事件被执行时带有一个参数，该参数是一个 `http.IncommingMessage` 实例。

在 response 事件期间，可以添加监听器到响应对象；比如监听 data 事件。
如果没有添加 response 句柄，则响应会被完全丢弃。当然，如果添加了 response 事件句柄，则必须消耗响应对角的数据（当有 readable 事件时调用 response.read(), 或添加一个 data 句柄，或调用 .resume() 方法）。end 事件不会被触发，直到数据被消耗完。同样，在数据读完之前，他会消耗内存，可能会造成 process out of memmory 错误。
*Node.js 不会检查 Content-Length 和已发送的主体的长度是否相等。*

`abort` 事件
当请求已被客户端中止时触发。仅在首次调用 abort() 时触发。

`aborted` 事件
当请求已被服务器中止且网络 socket 已关闭时触发
`connect`
    response <http.IncommingMessage>
    socket <net.Socket>
    head <Buffer>
每当服务器响应一个带有 CONNECT 方法的请求时触发。如果该事件未被监听，则接收到 CONNECT 方法的客户端会关闭他们的连接。
一对客户端和服务端会展示如何监听 connect 事件

`continue`
`respose`
`socket`
`update`