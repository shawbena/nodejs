# net 网络

net 模块给你提供了一个异步的网络封闭，他包含创建服务器和客户端（称为流）的功能。你可以这样使用这个模块 `require('net')`

# net.Server 类

本类用于创建 TCP 或本地服务器。  //？？

net.Server 是一个有着以下事件的 `EventEmittter`

## close 事件

当服务器关闭时被触发。注意：如果还有连接存在的话，直到所有的连接都关闭时，这个事件才被触发。

## connection 事件

    <net.Socket> 连接对象

当一个新连接建立时被触发。socket 是 `net.Socket` 的一个实例。

## error 事件

    <Error>

当错误发生时触发。和 `net.Socket` 不一样的是 `close` 事件不会直接在这个事件后触发，手动调用 `server.close()`.

## listening 事件

当调用 `server.listen` 后，服务器如果已经被绑定了就触发该事件。    //何为绑定

## server.address()

返回绑定的地址， address family name, 服务器端口。返回一个带有 `port`, `family` 和 `address` 属性的对象：{ port: 12346, family: 'IPv4', address: '127.0.0.1' }

不要在 `listening` 事件发生之前调用 `server.address()`。


```js 
//1.js
var server = net.createServer((socket) => {
    socket.end('goodby]n');
}).on('error', (err) => {
    throw err;
});

server.listen(() => {
    console.log('onened server on', server.address());
});
```

## server.close([callback])

使服务器停止接受新的连接，并保持现有的连接。这是个异步的函数。当所有的连接结束时服务器最终关闭并发出 `close` 事件。可选的 `callback` 会被发生的 `close` 事件调用，和 close 事件不一样的是，如果服务器关闭时服务器不是打开的 callback 会收到一个 Error 类型的参数。

## server.getConnections(callback)

异步获取服务器上的并行连接数量。当 socket 送往分支时工作。Callback 带两个参数 `err` 和 `count`.

## server.listen(handle[,backlog][,callback])

    handle <Object>
    backlog <Number>
    callback <Function>

handle 可以是服务器或 socket.

服务器接受来自指定 handle 的连接，但这假设文件描述符或 hanlde 已经绑定一个端口或者 domain socket.

侦听文件描述符不支持 Windows.

`backlog` 参数作用类似于 `server.listen([port][,hostname][,backlog][,callback])` 中的 `backlog`.

这个函数是异步的。如果服务器已经被绑定了，`listening` 事件将会被触发。最后一个参数 `callback` 将会添加为 `listening` 事件的侦听者。

## server.listen(options[,callback])

    options <Object> - required, 支持以下属性：
        port <Number> - 可选
        host <String> - 可选
        backlog <Number> - 可选
        path <String> - 可选
        exclusive <Boolean> - 可选    //独享的
    callback <Function> - 可选 

`options` 的 `port`, `host` 和 `backlog` 属性，还有可选的 callback 函数，和 `server.listen([port][,hostname][,backlog][,callback])` 的作用类似。`path` 可用于指定一个 UNIX socket.

如果 `exclusive` 为 false (默认)，那么 cluster worker will use the same underlying handle, allowing connection handling duties to be shared. 当 `exclusive` 为 true, handle 不能共享，尝试共享的行为会导致错误。侦听 exclisive 端口的例子如下：

```js
server.listen({
    host: 'localhost',
    port: 80,
    exclusive: true
});
```

## server.listen(path[,backlog][,callback])

启动一个 socket 服务器侦听来自给定 `path` 的连接。

这个函数是异步的。如果服务器已经被绑定了，`listening` 事件将会被触发。最后一个参数 `callback` 将会添加为 `listening` 事件的侦听者。

在 UNIX 上，local domain 通常被视为 UNIX domain. path 是文件系统 path name. ...

## server.listen([port][,hostname][,backlog][,callback])

开始接收来自指定 `port` 和 `hostname` 的连接。如果忽略了 `hostname`, 当 IPv6 可用时，服务器会接收任何来自 IPv6 地址 (::) 的连接, 或者 IPv4 地址(0.0.0.0) 的连接。忽略 `port` 参数，或都使用值为 0 的 `port`，操作系统会赋一个随机的 `port`, `listeneing` 事件触发之后可调用 `server.address().port` 来获取这个端口号。

Backlog 是挂起连接队列的最大长度。实际长度由操作系统通过 sysctl 设定如 Linux 上的 `tcp_max_syn_backlog` 和 `somaxconn`。这个参数的默认值是 511 (不是 512)。

这个函数是异步的。如果服务器已经被绑定了，`listening` 事件将会被触发。最后一个参数 `callback` 将会添加为 `listening` 事件的侦听者。

一些用户可能会遇见 `EADDRINUSE` 错误。这意味着另一个服务器已经运行在请求端口上了。解决的方法是等一会再试一次：

```js
server.on('error', (e) => {
    if(e.code == `EADDRINUSE`){
        console.log('Address in use, retrying...');
        setTimeout(() => {
            server.close();
            server.listen(PORT, HOST);
        }, 1000);
    }
});
```

注：

Noode.js 中所有的 socket 都被设为 `SO_REUSEADDR`

可多次调用 server.listen() 方法，每次调用都会使用提供的参数重新打开服务器。

## server.listening                                                  

一个布尔值，指示是否服务器在侦听连接。

## server.maxConnections

设定这个属性，当服务器的连接超过此值时，新的连接将被拒绝。

## server.ref()

## server.unref()

# net.Socket 类

这个对象是一个 TCP 或本地 socket 的抽象。`net.Socket` 实例实现了一个 duplex Stream 接口。 用户可创建他们作为一个客户端使用或者由 Node.js 创建并通过服务器的 `connection` 传送给用户。

## new net.Socket([options])

构建一个新的 socket 对象。

options 是一个对象，有以下默认值：

```js
{
    fd: null,
    allowHalfOpen: false,
    readable: false,
    writable: false
}
```
你可用 fd 指定一个现有的 `socket` 的文件描述符。将 `readable` 和/或 `writable` 为 `true` 允许 socket 的读和/或写 (注：只有传递了 `fd` 才有用)。关于 `allowHalfOpen`, 参考 `createServer` 和 `end` 事件。

`net.Socket` 实例是 `EventEmittter`，有以下属性：

## close 事件

    han_error <Boolean>, 如果 socket 有传输错误则为 true。

当 socket 完全关闭时触发。参数 `had_error` 是一个布尔值，用于指出 socket 是否由于传输错误而关闭

## connect 事件

当一个 socket 连接成功建立时触发。见 `connect()`。

## data 事件

    <Buffer>

当接受到数据时触发。参数 data 会时一个 `Buffer` 或 `String`. 数据的编码由 `socket.setEncoding()` 设置。（详见 `Readable Stream` 章节）

## drain 事件

当写 buffer 为空时触发。可用于 throttle uploads.

## end 事件

当另一端的 socket 发送一个 FIN 包裹时触发。    //FIN packet ??

默认（`allowHalfOpen = false`）情况下 socket 将会销毁其文件描述符一旦他已写出了他的挂起的写队列。然而设置 `allowing == true` socket 将不自动 `end()` 自己那边使得用户可写任意数量的数据，并警告用户要用户自己 `end()` 他们那端。

## error 事件

    <Error>

错误发生时触发。`error` 事件将会在该事件后直接触发。

## lookup 事件

解析 hostname 但在连接前触发。不应用于 UNIX socket.
    err <Error> | <Null> 错误对象。见 `dns.lookup()`
    address <String> IP 地址。
    family <String> | <Null> 地址的类型。见 `dns.lookup()`
    host <String> 主机名。

## timeout 事件

如果 socket 由于不活跃而超时时触发。仅用于通知 socket 处理懒散状态。用户必须手动关闭连接。

见 `socket.setTimeout()`

## socket.address()

返回绑定的地址，返回对象有三个属性，如 { port: 12345, family: 'IPv4', address: '127.0.0.1' }

## socket.bufferSize

`net.Socket` 有使 `socket.write()` 一直工作的能力。这有助于用户快速开始和运行。电脑不能总是保持一大堆要写进 socket 的数据——这会使用网络连接变得很慢。Node.js 内部将要写进一个 socket 的数据排队起来当可能时把数据通过电缆发送出去

内部缓存的结果是内存占用量的增加。这个属性表示当前缓存的要写入的字符量。（字符的数量大约等于要写入量的字节数，但是缓存可能包含字符串，字符串是懒编码的，所以精确的字面数是未知的。）

遇到大的或增长的 `bufferSize` 的用户应该尝试 "throttle" 程序中的数据流，使用 `pause()` 或 `resume()`.

## socket.bytesRead

接收到的字节数量。

## socket.bytesWritten

发送出的字面数量。

## socket.connect(options[,connectListener])

Opens the connection for a given socket.

对于 TCP socket, `options` 参数是一个对象，指定以下选项：

    port: 客户端应该连接的端口（必需）
    host: 默认是 'localhost'
    localAddress: 绑定的用于网络连接的本地接口
    localPort: 绑定的用于网络连接的本地端口
    family: IP stack 的版本。默认是 4
    hints: `dns.lookup() hints` 默认为 0
    lookup: 自定义查找函数。默认为 `dns.lookup`

对于 local domain socket, `options` 参数是一个对象，指定以下选项：

    path: 客户端应该连接的 path (必须的)

正常情况下不需要这个方法，因为 `net.createConnection` 打开了 socket. 只有当你要实现一个自定义的 socket 时可以使用这个方法。

这是个异步函数。当 `connect` 事件触发时 socket 建立了。如果连接出现问题，将不会触发 `connect` 事件，`error` 事件将会触发。

`connectListener` 将会添加为 `connect` 事件的一个侦听者。

## socket.connect(path[,connectListener])

参见 `socket.connect(options[,connectListener])`

## socket.connect(port[,host][,connectListener])

参见 `socket.connect(options[,connectListener])`

## socket.connecting

如果为 `true` - `socket.connect(options[,connectListener])` 被调用了但还未结束。

在触发 `connect` 事件并且或调用 `socket.connect(options[,connectionListener])` 的回调之前将被设为 `false`.

## socket.destory([exception])

确保这个 socket 上不会再有 I/O 活动。只在错误时需要。

如果 指定了 `exception`，将会触发 `error` 事件，这个事件的任何侦听者都将收到一个 `exception` 参数。

## socket.destroyed

一个布尔值，指示连接有没有被销毁。一旦连接被销毁了便不能再用来传输数据。

## socket.end([data][,encoding])

如半关闭 socket，发送一个 FIN 包。可能服务器将仍发送一些数据。

如果指定了 `data`, 等同于调用 `socket.write(data, encoding)`, 然后调用 `socket.end()`.

## socket.localAddress

表示远程客户端连接的本地 IP 地址的字符串。例如，如果你侦听 `0.0.0.0` 并且客户端边上了 `192.168.1.1`, 这个值将会是 `192.168.1` //??

## socket.localPort

表示本地端口的数字。例如 `80`, `21`.

## socket.pause()

暂时读取数据。即 `data` 事件将不会触发。减慢一个上传有用。

## socket.ref()

## socket.remoteAddress

表示远程 IP 地址的字符串。如 `74.125.127.100` 或 `2001:4860:a005::68`. 如果 socket 被销毁了值可能是 `undefined` (如，如果客户端断开连接)。

## socket.remoteFamily

远程 IP family. `IPv4` 或 `IPv6`.

## socket.remotePort

表示远程端口的数字。如 `80` 或 `21`.

## socket.resume()

在调用 `pause()` 之后恢复读取。

## socket.setEncoding([encoding])

Set the encoding for the socket as a `Readable Stream`. 详见 `stream.setEncoding()`.

## socket.setKeepAlive([enable][,initialDelay])

启用/禁用 keep-alive 功能，在一个懒惰的 socket 上第一次 keepalive 侦测之前可选的设置初始延迟。`enable` 默认为 `false`.

设置 `initialDelay` (in millisecond) 设置最后一个收到的数据包和和第一次 keepalive 侦测间的延迟。设置 initialDelay 为 0 将不会改变默认设置或者之前的设置。默认为 0。

返回 `socket`.

## socket.setNoDelay([noDelay])

禁用 Nagel 算法。默认 TCP 连接使用 Nagle 算法，在发送数据之前缓存数据。设置 `noDelay` 为 `true` 会在每次调用 `socket.write()` 时立即发送数据。`noDelay` 默认为 `true`

## socket.setTimeout(timeout[,callback])

设置 socket 在 `timeout` 毫秒不活跃后超时。默认 `net.Socket` 没有超时。

When an idle timeout is triggered the socket will receive a `timeout` event but the connection will not severed. 用户必须手动 `end()` 或 `destroyed` socket.

if `timeout` is 0, then the existin idle timeout is disabled.

可选的 `callback` 参数将会添加为 `timeout` 事件的一个一次侦听者。

返回 `socket`.

## socket.unref()

## socket.write(data[,encoding][,callback])

Send data on the socket. The second parameter specifies the encoding in the case of a string -- 默认 UTF8 编码。

当数据写完时会执行可选的 `callback` - 可能不会立即执行。

# net.connect(options[,connectListener])

一个工厂函数，返回一个新的 `net.Socket` 并使用提供的 `options` 自动连接。

选项既传递给了 `net.Socket` 构造函数也传递给了 `socket.connet` 方法。

`connectListener` 参数将被添加为 `connect` 事件的一次侦听者。

Here is an example of a client of the previously described echo server:

```js 2.js
//报错
const net = require('net');
const client = net.connect({port: 8124}, () => {
    console.log('connected to server!');
    client.write('world!\r\n');
});
client.on('data', (data) => {
    //data: Buffer
    console.log(data.toString());
    client.end();
});
client.on('end', () => {
    console.log('disconnected from server');
});
```
//?
要连接 `/tmp/echo.sock` socket 将第二行改为:

```js
const client = net.connect({path: '/tmp/echo.sock'});
```

# net.connect(path[,connectListener])

一个工厂函数，返回一个新的 unix `net.Socket` 并且自动连接至提供的 `path`.

`connectListener` 参数将被添加为 `connect` 事件的一次侦听者。

# net.connect(port[,host][,connectListener])

一个工厂函数，返回一个新的 `net.Socket` 并连接至提供的 `port` 和 `host`.

如果 `host` 忽略了，则假设为 `localhost`.

`connectListener` 参数将被添加为 `connect` 事件的一次侦听者。

# net.createConnection(options[,connectListener])

一个工厂函数，返回一个新的 `net.Socket` 构造函数并且使用提供的 `options` 自动连接。

选项既传递给了 `net.Socket` 构造函数也传递给了 `socket.connet` 方法。

传递的 `timeout` 选项将会在 socket 创建后连接前调用 `socket.setTimeout()`.

`connectListener` 参数将被添加为 `connect` 事件的一次侦听者。

Here is an example of a client of the previously described echo server:

```js 4.js
const net = require('net');

//报错2
const client = net.createConnection({port: 8124}, () => {
    //connect listener
    console.log('connected to server!');
    client.write('world!\r\n');
});
client.on('data', (data) => {
    console.log(data.toString());
    client.end();
});
client.on('end', () => {
    console.log('disconnect from server');
});
```

//?
要连接 `/tmp/echo.sock` socket 将第二行改为:

```js
const client = net.connect({path: '/tmp/echo.sock'});
```

# net.createConnection(path[,connectListener])

一个工厂函数，返回一个新的 unix `net.Socket` 并且自动连接至提供的 `path`.

`connectListener` 参数将被添加为 `connect` 事件的一次侦听者。

# net.createConnection(port[,host][,connectListener])

一个工厂函数，返回一个新的 `net.Socket` 并连接至提供的 `port` 和 `host`.

如果 `host` 忽略了，则假设为 `localhost`.

`connectListener` 参数将被添加为 `connect` 事件的一次侦听者。

# net.createServer([options][,connectionListener])

创建一个新的服务器。`connectionListener` 参数自动被设置为 `connection` 事件的一个侦听者。

`options` 对象有以下默认值。

```js
{
    allowHalfOpen: false,
    pauseOnConnect: false
}
```

如果 `allowHalfOpen` 为 true, 当另一端的 socket 发送一个 FIN 包时，socket 不会自动发送一个 FIN 包。socket 变为不可读，但仍可写。你应该明确地调用 `end()` 方法，详见 `end` 事件。

如果 `pauseOnConnect` 为 true, 那么与每个 incomming connection 关联的 socket 将会被暂停，and no data will be read from its handle. 这使得连接在进程间传递，而不会有任何数据被原始进程读取。要从暂停的 socket 读取数据，调用 `resume()`。

Here is an example of an echo server which listens for connections on port 8124:

```js
const net = require('net');
const server = net.createServer((c) => {
  // 'connection' listener
  console.log('client connected');
  c.on('end', () => {
    console.log('client disconnected');
  });
  c.write('hello\r\n');
  c.pipe(c);
});
server.on('error', (err) => {
  throw err;
});
server.listen(8124, () => {
  console.log('server bound');
});
```
Test this by using telnet:

```js
telnet localhost 8124
```

To listen on the socket /tmp/echo.sock the third line from the last would just be changed to

```js
server.listen('/tmp/echo.sock', () => {
  console.log('server bound');
});
```

Use nc to connect to a UNIX domain socket server:

```js
nc -U /tmp/echo.sock
```

# net.isIP(input)

测试 input 是否是 IP 地址。对于有效的字符串返回 0，如果是 IP 版本 4 地址返回 4，如果是 IP 版本 6 地址返回 6.

# net.isIPv4(input)

如果是版本 4 IP 地址返回 true, 否则返回 false.

# net.isIPv6(input)

如果是版本 6 IP 地址返回 true, 否则返回 false.
