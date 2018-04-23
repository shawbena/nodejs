# HTTP Agent

HTTP Agent 用于池化在 HTTP 客户端请求中使用的 socket.

## HTTP.Agent

//socket, nodejs 池，keep-alive
如果没有挂起的 HTTP 请求正在等待 socket 变成空闲的，则 socket 会被关闭。

如果选择使用 HTTP 的 KeepAlive, 可以创建一个将标志设置为 true 的 Agent 对象，那么该 Agent 会保留没有用过的 socket 在池中用于后续的使用。他们会被显示地标记，以便不用保持 nodejs 进程运行。当然，当他们不再使用时，应该显示地  `destory()` KeepAlive 代理，以便 Socket 会被关闭。

//如果打算使一个 HTTP 请求保持长时间打开且不想让它留在池中，则可以如下操作：

```js
var http = require('http');
 http.get(options, (res) => {
     //
 }).on('socket', (socket) => {
     socket.emit('agentRemove');
 });
`` `
或者，可以先择使用 agent:false 完全地退出池：

```js
http.get({
    hostname: 'localhost',
    port: 80,
    path: '/',
    agent: false,   //创建一个新的代理，只用于本次请求
}, (res) => {
    // 对响应进行处理
});
```
## new Agent([options])
`options`     <Object>, 用于设置代理的配置选项集合
    `keepAlive`   <Boolean>, 保持池周围的 socket 在未来可被其他请求使用。默认 false
    `keepAliveMsecs`  <Integer>, 当使用 HTTP 的 KeepAlive 时，多久发送 TCP KeepAlive 数据包使得 socket 保持活跃。默认 1000, 仅当 keepAlive 被设为 true 有效
    `maxSockets`      <Number>，每个主机允许的最大 socket 数，默认 Infinity
    `maxFreeSockets`  <Number>, 在空闲状态下允许打开的最大 socket 数，仅当 keepAlive 被设为 true 有效。默认 256
*http.request() 使用默认的 http.globalAgent 会将所有这些值设为各自的默认值。要配置其中任何一个，必须创建自己的 http.Agent 对象。*

```js
const http = require('http');
var keepAliveAgent = new http.Agent({ keepAlive: true});
options.agent = keepAliveAgent;
http.request(options, onResponseCallback);
```
## agent.creatConnection(options[,callback])
`options`     <Objecg> 包含连接详情的选项
`callback`    <Function> 接收创建 socket 的回调函数
返回: <net.Socket>
生成一个用于 HTTP 请求的 socket/stream
该函数类似于 net.createConnection(), 但是，如果期望更大的灵活性，自定义代理可以重写此方法。
`callback` 有 (err, stream) 参数

## agent.destroy()
销毁当前正被代理使用的任何 socket.
通常不需要这么做。但是，如果使用的是启用 KeepAlive 的代理，则当知道他不再被使用时，最好显式地关闭代理。否则，在服务器终止之前，socket 可能会挂起开放相当长的时间。

## agent.freeSockets
<Object>
一个包含当前正在等待被 Agent 使用的 socket 数组对象(当使用 HTTP 的 KeepAlive 时)。不要修改。 //?

## agent.getName(options)
<Object>
返回: <String>
获取请求选项集合的唯一名称，以确定连接是否可以再利用。在 http 代理中，这会返回 host:port:localAddress, 在 https 代理中，名称会包括 CA, 证书， 密码和其他 HTTPS/TLS-specific 选项，以确定 socket 的可利复用性。

## agent.maxFreeSockets
<Number>
默认 256, 对于支持 HTTP KeepAlive 的 Agent, 他设置了在空闲状态下可打开的 socket 的最大数量。

## agent.maxSockets
默认无穷大，决定每个源中代理可打开多少并发的 socket, 来源是一个 `host:port` 或 `host:port:localAddress` 组合。

## agent.requests
<Object>
一个包含还未分配到 socket 请示队列的对象，不要修改。

## agent.sockets
<Object>
一个包含当前被 Agent 使用的 socket 数组的对象，不要修改。

## http.ClientRequest 类

