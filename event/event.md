# 事件

大多数 Node.js 核心 API 是构建在异步事件驱动架构上的，一些对象（叫 "emitters"） 周期地触发命名事件使得函数对象（侦听者）被调用。

如一个 `net.Server` 对象每次有一个点连接上都会触发一个事件；当打开一个文件时会触发 `fs.ReadStream` 事件；每当数据可读, 一个 `stream` 触发一个事件。

触发事件的对象都是 `EventEmitter` 类的实例。这些对象暴露一个 `eventEmitter.on()` 函数，使得可以为对象触发的命名事件添加一个或多个函数。通常事件名以驼峰原字符串则命名，但只要是有效的 JavaScript 属性键都可以。

当 `EventEmitter` 对象触发一个事件，附加到指定事件的所有函数都会被`同步`调用。侦听者返回的任何值都会被忽略并被丢弃。

以下示例展示一个有一个侦听者的简单的 `EventEmitter` 实例。`eventEmitter.on()` 方法用于注册侦听者，`eventEmitter.emit()` 方法用于触发事件。

```js 1.js
const EventEmitter = require('event');

class MyEmitter extends EventEmitter{}

const MyEmitter = new MyEmitter();

MyEmitter.on('event', () => {
    console.log('an event occurred!');
});

MyEmitter.emit('event');
```

# 给侦听者传递参数和 `this`

`eventEmitter.emit()` 方法允许传递给侦听函数任意个参数。要记住重要的一点当一个普通的侦听函数被 `EventEmitter` 调用了，标准的 `this` 关键字被设为侦听函数所在的 `EventEmitter` 的引用。

```js 2.js
const myEmitter = new MyEmitter();
myEmitter.on('event', function(a, b){
    console.log(a, b, this);
    // Prints:
    //   a b MyEmitter {
    //     domain: null,
    //     _events: { event: [Function] },
    //     _eventsCount: 1,
    //     _maxListeners: undefined }
});
myEmitter.emit('event', 'a', 'b');
```
ES6 箭头函数也可作为侦听函数，然则这样做 `this` 关键字将不再指向 `EventEmitter` 实例。

```js
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
    console.log(a, b, this);
    //Prints: a b {}
});
myEmitter.emit('event', 'a', 'b');
```

# 异步 vs 同步

`EventListener` 按注册顺序同步调用侦听者。保证有顺序时重要的，这样可以避免 race conditions 或逻辑错误。

合适时，可用 `setImmediate()` 或 `process.nextTick()` 方法将侦听函数切换至异步操作模式。

```js
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
    setImmediate(() => {
        console.log('this happens asynchronously');
    });
});

myEmitter.emit('event', 'a', 'b');
```

# 只处理事件一次

当你用 `eventEmitter.on()` 方法注册一个侦听函数，每次这个命名事件触发时都会调用侦听函数。

```js
const myEmitter = new MyEmitter();
var m = 0;
MyEmitter.on('event', () => {
    console.log(++m);
});

myEmitter.emit('event');
//Prints: 1
myEmitter.emit('event');
//Prints: 2
```

使用 `eventEmitter.once()` 方法，可以注册对特定事件最多只调用一次的侦听者。一旦事件触发，侦听者被取消触发然后被调用。

```js
const myEmitter = new MyEmitter();

var m = 0;
myEmitter.once('event', () => {
    console.log(++m);
});

myEmitter.emit('event');
//Prints: 1
myEmitter.emit('event');
//Ignored
```

# 错误事件

当 `EventEmitter` 实例中发生一个错误时，会触发 `error` 事件。这在 Node.js 中会得到特殊对待。

如果一个 `EventEmitter` 的 `error` 事件边一个侦听者也没有，那么触发一个 `error` 事件，错误被抛出，打印一个栈追踪，Node.js 进程退出。

```js 3.js
const myEmitter = new MyEmitter();
myEmiter.emit('error', new Error('whoops!'));
//Throws and crashes Node.js
```
要阻止 Node.js 进程的崩溃，可以为 `process` 对象的 `uncaughtException` 事件注册一个侦听者或都使用 `domain` 模块（然而 `domain` 模块已经被废弃了）。

```js 3.md
const myEmitter = new MyEmitter();
process.on('uncaughtException', (err) => {
    console.log('whoops! there was an error');
});

myEmitter.emit('error', new Error('whoops!'));
//Prints: whoops! there was an error
```
总是为 `error` 添加侦听者是最佳实践。

```js 4.js
const myEmitter = new MyEmitter();
myEmitter.on('error', (err) => {
    console.log('whoops! there was an error');
});
myEmiter.emit('error', new Error('whoops!'));
//Prints: whoops! there was an error
```

# EventEmitter 类

`EventEmitter` 类由 `events` 模块定义并暴露。

```js
const EventEmitter = require('events');
```

当添加了新的侦听者时所有的 EventEmitter 都会触发 `newListener`, 当移除侦听者时 `removeListener` 事件会被触发。（All EventEmitters emit the event `newListener` when new listeners are added and `removeListener` when existing listeners are removed.）

## newListener 事件

    eventName <String> | <Symbol> 被侦听的事件名
    listener <Function> 事件处理函数

在一个侦听者被添加到其内部侦听者数据之前`EventEmitter` 实例将触发自己的 `newListener` 事件。

注册 `newListener` 事件的侦听者将被传递事件名和一个指向被添加的侦听者的引用。

事实是在添加侦听者之前事件被触发了，这有些微秒但有重要的副作用：在 `newListener` 的回调中注册的额外的同名事件的侦听者将按添加的顺序插在侦听函数前。

```js 5.js
const myEmitter = new MyEmitter();
// Only do this once so we don't loop forever
myEmitter.once('newListener', (event, listener) => {
  if (event === 'event') {
    // Insert a new listener in front
    myEmitter.on('event', () => {
      console.log('B');
    });
  }
});
myEmitter.on('event', () => {
  console.log('A');
});
myEmitter.emit('event');
// Prints:
//   B
//   A

```

## removeListener

    eventName <String> | <Symbol> 事件名
    listener <Function> 事件处理函数

`removeListener` 事件在侦听者移除后触发。

## EventEmitter.defaultMaxListeners

对任何单个事件，默认最多可注册 `10` 个侦听函数。对每个 `EventEmitter` 实例而言可用 `emitter.setMaxListeners(n)` 方法更改限制。要更改所有 `EventEmitter` 实例的默认值，可使用 `EventEmitter.defaulMaxListeners` 属性。

当设置 `EventEmitter.defaultMaxListeners` 时要注意，因为变化会影响所有的 `EventEmitter` 实例，包括变化前创建的实例。然而调用 `emitter.setMaxListeners(n)` 然而比 `EventEmitter.defaultMaxListeners` 有优先级。

可设置多少侦听函数并没有什么硬性规定。`EventEmitter` 实例允许添加很多侦听者但会输到 stderr 一个追踪信息，即已侦测到一个 "possible EventEmitter memory leak". 对于任何单个 `EventEmitter`, 可使用 `emitter.getMaxListeners()` 和 `emitter.setMaxListeners()` 方法暂时避免这些警告。

```js
emitter.setMaxListeners(emitter.getMaxListeners() + 1);
emitter.once('event', () => {
    //do stuff
    emitter.setMaxListeners(Math.max(emitter.getMaxListeners() - 1, 0)); //很不错的算法
});
```

对于这样的警告可用 `--trace-warnings` 命令行标志展示栈追踪。

发出的警告可用 `process.on('warning')` 视察并将会有额外的 `emitter`, `type` 和 `count` 属性指向事件发出的实例，事件名和附加的侦听者。

## emitter.addListener(eventName, listener)

`emitter.on(eventName, listener)` 的别名。 

## emitter.emit(eventName[,...args]);

同步地调用名为 `eventName` 的事件注册的每个侦听者，按注册的顺序调用。传递提供的参数。

返回 `true` 如果事件有侦听者，否则 `false`.

## emitter.eventNames()

返回一个数组，列出 emitter 已注册侦听者的事件。数组中的值将会是 string 或 Symbol.

```js
const EventEmitter = require('events');
const myEE = new EventEmitter();
myEE.on('foo', () => {});
myEE.on('bar', () => {});

const sym = Symbol('symbol');
myEE.on(sym, () => {});

console.log(myEE.eventNames());
// Prints: [ 'foo', 'bar', Symbol(symbol) ]
```

## emitter.getMaxListeners()

返回当前 `EventEmitter` 的最大侦听者数量，由 `emitter.setMaxListeners(n)` 或 默认的 `EventEmitter.defaultMaxListeners`.

## emitter.listenerCount(eventName)

`eventName` <String> | <Symbol> 侦听的事件名

返回事件 `eventName` 的侦听者数量。

## emitter.listeners(eventName)

返回事件 `eventName` 的侦听者数组拷贝。

```js
server.on('connection', (stream) => {
    console.log('someone connected!');
});
console.log(util.inspect(server.listeners('connection')));
//Prints: [ [Function] ]
```

## emitter.on(eventName, listener)

`eventName` <String> | <Symbol> 事件名 //？
`listener` <String> 回调函数

将 `listener` 函数添加到事件 `eventName` 的侦听函数数组的结尾。不会检查 `listener` 是否已经被添加过了。传递同一组合 `eventName` 和 `listener` 的多次调用会导致多次添加调用 `listener`.

```js
server.on('connection', (stream) => {
    console.log('someone connected!');
});
```

返回 `EventEmitter` 的引用，所以可以链式调用。

默认事件侦听函数以添加的顺序被调用。`emitter.prependListener()` 方法可以可选的用来将事件侦听者添加到侦听者数组的开头。

```js
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
//Prints:
//b
//a
```

## emitter.once(eventName, listener)

`eventName` <String> | <Symbol> 事件名 //？
`listener` <String> 回调函数

给 `eventName` 事件添加一次侦听函数。下次 `eventName` 触发时，这个侦听者被移除然后被调用。

```js
server.once('connection', (stream) => {
    console.log('Ah, we have our first user!');
})
```
返回 `EventEmitter` 的引用，所以可以链式调用。

默认事件侦听函数以添加的顺序被调用。`emitter.prependListener()` 方法可以可选的用来将事件侦听者添加到侦听者数组的开头。

```js
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
//Prints:
//b
//a
```

## emitter.prependListener(eventName, listener)

`eventName` <String> | <Symbol> 事件名 //？
`listener` <String> 回调函数

将 `listener` 函数添加到事件 `eventName` 的侦听函数数组的结尾。不会检查 `listener` 是否已经被添加过了。传递同一组合 `eventName` 和 `listener` 的多次调用会导致多次添加调用 `listener`.

```js
server.on('connection', (stream) => {
    console.log('someone connected!');
});
```
返回 `EventEmitter` 的引用，所以可以链式调用。

## emitter.prependOnceListener(eventName, listener)

`eventName` <String> | <Symbol> 事件名 //？
`listener` <String> 回调函数

给 `eventName` 事件添加一次侦听函数 `listener`, `listener` 将被添加到侦听者数组的开头。下次 `eventName` 触发时，这个侦听者被移除然后被调用。

```js
server.prependOnceListener('connection', (stream) => {
    console.log('Ah, we have our first user!');
})
```
返回 `EventEmitter` 的引用，所以可以链式调用。

## emitter.removeAllListener([eventName])

移除所有的侦听者，或者指定 `eventName` 的侦听者。

注意移除在代码的其他地方添加的侦听者是个坏的实践，特别是当 `EventEmitter` 实例由其他组件或模块创建（如 socket 或文件流）。

返回 `EventEmitter` 的引用，所以可以链式调用。

## emitter.removeListener(eventName, listener)

从侦听者数组中移除 `eventName` 事件的指定 `listener`.

```js
var callback = (stream) => {
    console.log('someone connected!');
};
server.on('connection', callback)
//...
server.removeListener('connection', callback);
```

`removeListener` 将至多从侦听者数组中移除一个侦听者的一个实例。

如果一个事件为指定的 `eventName` 多次添加到侦听者数组中，那么必须多次调用 `removeListener` 来移除每个实例。

注意一旦事件被触发，添加到事件的侦听者在事件触发时将按顺序调用。这意味着 emitting 后的任何`removeListener()` 或 `removeAllListeners()` 调用，和在最后一个侦听者完成执行前将不会在 `emit()` 进行中移除他们。后续事件将会如期进行。

```js important
const myEmitter = new MyEmitter();

var callbackA = () => {
    console.log('A');
    myEmitter.removeListener('event', callbackB);
};

var callbackB = () => {
    console.log('B');
};

myEmitter.on('event', callbackA);
myEmitter.on('event', callbackB);

//callbackA removes listener callbackB but it will still be called.
//Internal listener array time of emit [callbackA, callbackB]
myEmiter.emit('event');
//Prints:
//A
//B

//callbackB is now removed.
//Internal listener array [callbackA] 
myEmiter.emit('event');
//Prints:
//A
```

因为侦听者是使用内部数组管理的，调用这个方法将改变移除侦听者之后注册了侦听者的索引。这将不会影响侦听者被调用的顺序，但这意味着 `emitter.listeners()` 方法返回的侦听数组的拷贝也需要重新创建。

返回 `EventEmitter` 的引用，所以可以链式调用。

## emitter.setMaxListeners(n)

一个事件如果添加了超过10个侦听者默认会打印警告。这有助于发现内存泄漏。显然并不是所有的事件都应该被限制10个事件。`emitter.setMaxListeners()` 方法允许修改对特定 `EventEmitter` 实例的限制。值可以设为 `Infinity` (或 `0`) 以不限制侦听者数量。

返回 `EventEmitter` 的引用，所以可以链式调用。

