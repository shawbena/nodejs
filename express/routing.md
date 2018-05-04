# Routing

路由 (routing) 指一个应用的终点 (endpoints URIs) 怎样响应客户端请求。关于路由的介绍，见 [Basic routing](http://expressjs.com/en/starter/basic-routing.html).

你可以使用 Express `app` 对象上对应的 HTTP 方法；如 `app.get()` 处理 GET 请求 `app.post` 处理 POST 请求。完整的方法列表见 [`app.METHOD`](http://expressjs.com/en/4x/api.html#app.METHOD). 你也可以使用 [`app.all()`]() 处理所有的 HTTP 方法及 [`app.use()`]() 指定”中间件“ (middleware) 作为回调函数 (详见 [Using middleware]()).

这些路由方法指定一个回调函数 (callback function, 有时也叫 "handler functions"), 当应用程序接收到指定路由 (endpoint) 及 HTTP 方法的请求时会调用这个回调。换句话讲，应用程序 “侦听” 匹配指定路由及方法的请求，当侦测到匹配
项时，调用指定的回调函数。

实际上，路由方法可以有不止一个回调函数参数。如果有多个回调函数，给回调提供一个 `next` 参数是重要的，然后在回调的函数体内调用 `next()` 将控制权交给下一个回调。

下面的代码是一个非常基本的路由的示例。

```js
var express = require('express');
var app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
    res.send('hello world!');
});

// app.listen(3000)
```

## Route methods

一个路由方法源自一个 HTTP 方法，并且是附加在 `express` 类的实例上的。

下面代码是定义了应用根路由径的 GET 及 POST 方法的路由：

```js
var express = require('express');
var app = express();

// Get method route
app.get('/', (req, res) => {
    res.send('GET request to homepage');
});

// POST method route
app.post('/', (req, res) => {
    res.send('POST request to the homepage');
});
```

Express 支持对应所有 HTTP 请求方法的路由方法; `get`, `post` 等等。或见完整的列表 [`app.METHOD`](http://expressjs.com/en/4x/api.html#app.METHOD).

一个特殊的路由方法叫 `app.all()` 用于在一个路径为___所有___ 的 HTTP 请求方法加载中间件函数。如以下的中间件函数无论请求是 GET, POST, PUT, DELETE 或其他 [http 模块]() 支持的方法，都会对 "/secret" 路由的请求调用该中间件函数。 

```js
var express = require('express');
var app = express();

app.all('/secret', function (req, res, next){
    console.log('Accessing the secret section ...');
    next(); // pass control to the next handler
});
app.get('/', (req, res) => {
    res.send('get request from "/"');
});

app.get('/secret', (req, res) => {
    res.send('welcom to secret homepage.');
});

app.post('/secret', (req, res) => {
    res.send('secret message.');
});

app.listen(3000);
```

## Route paths

路由路径，与请求方法共同定义了请求的端点 (endpoints). 路由路径可以是字符串，字符串模式，或正则表达式。

字符 ?, +, * 及 () 是正则表达式部分的子集。连词符 (-) 及点 (.) 被基于字符串的路径按字面量解释。

如果你需要在路径字符串中使用 ($ 美元) 字符，将其包括在  ([ 和 ]) 中转义。如，"/data/$book" 请求的路径字符串将会是 "/data/([\$])book"

> Express 使用 [path-to-regexp]() 匹配路由路径；定义路由径是所有可能性见 path-to-regexp 文档。[Express Route Tester]() 是测试基本 Express 路由的便利工具，不过他不支持模式匹配 (pattern matching)

> 模询字符串不属于路由路径。

基于字符串的路由路径的一些示例：

```js
// 匹配根路径的请求 /
app.get('/', function (req, res) {
  res.send('root')
});
```

```js
// 匹配 /about 路径的请求
app.get('/about', function (req, res) {
  res.send('about')
})
```

```js
// 匹配 /random.text 路径的请求
app.get('/random.text', function (req, res) {
  res.send('random.text')
})
```

下面是一些基于字符串模式的路由路径的示例：

```js
// 匹配 acd 和 abcd
app.get('/ab?cd', function (req, res) {
  res.send('ab?cd')
})
```

...




## Route parameters

路由参数是命名的 URL 片段，用于捕获 URL 中指定位置的值。捕获的值填充在 `req.params` 对象中，路径中指定的路由参数作为相应键。

```
Route path: /users/:userId/books/:bookId
Request URL: http://localhost:3000/users/34/books/8989
req.params: { "userId": "34", "bookId": "8989" }
```

要定义有路由参数的路由，像上面中那样在路径中指定路由参数就行：

```js
app.get('/users/:userId/book/:bookId', (req, res) => {
    res.send(req.params);
})
```

> 路由参数的名称必须由 "word characters" ([A-Za-z-0-9]) 组成。

由于短划线和点是以字面量解释的，他们用于路由参数很有用。

```
Route path: /flights/:from-:to
Request URL: http://localhost:3000/flights/LAX-SFO
req.params: { "from": "LAX", "to": "SFO" }
```

```
Route path: /plantae/:genus.:species
Request URL: http://localhost:3000/plantae/Prunus.persica
req.params: { "genus": "Prunus", "species": "persica" }
```

要更精细的控制路由参数匹配的精确的字符串，可以在括号中追加正则表达式：

```
Route path: /user/:userId(\d+)
Request URL: http://localhost:3000/user42
req.params: { "userId": "42" }
```

> 因为正则表达式通常是字符串字面量的一部分，请转义 \, 如 \\d+.

> 在 Express 4.x 中, 正则表达式中的 * 字符不能以这种方式解释。可以使用 {0, } 而非 *. Express 5 中将会修复这个问题。

## Route handlers

你可以提供多个回调函数，像[中间件](http://expressjs.com/en/guide/using-middleware.html)那样处理一个请求。唯一的区别的这些回调可以调用 `next('route')` 传递给剩余的回调。你可以使用这个机制对路由引入预制条件，如果当前路由没有必要继续处理的话那么就将控制权传递给后续的路由。

路由处理程序可以是函数的形式，函数数组，或者两者的结合，如示例中那样。

单个回调函数可以处理一个路由：

```
app.get('/example/a', (req, res) => {
    res.send('Hello from A!');
});
```

多个回调函数处理一个路由 (确保指定了 `next` 对象):

```js
app.get('/example/b', (req, res, next) => {
 console.log('the response will be sent by the next funciton...');
}, (req, res) => {
    res.send("Hello from B!");
});
```

一个回调函数数组可以处理一个路由：

```js
var cb0 = function(req, res, next){
    console.log('CB0');
    next();
}

var cb1 = function(req, res, next){
    console.log('CB1');
    next();
}

var cb2 = function(req, res){
    res.send('/example/c', [cb0, cb1, cb2]);
}
```

独立函数与函数数组遥结合可以处理一个路由：

```js
var cb0 = function(req, res, next){
    console.log('CB0');
    next();
}

var cb1 = function(req, res, next){
    console.log('CB1');
    next();
}

app.get('/example/d', [cb0, cb1], (req, res, next) => {
    console.log('the response will be send by the next function...');
    next();
}, (req, res) => {
    res.send('Hello from D!'); 
});
```

## Response methods

”响应对象“ (res) 上的方法可用于向客户端发送一个响应，终结请求-响应循环。如果路由处理函数中，这些方法一个也没有调用，那么客户端请求将会被挂起。

|---- Method ----|----- Description ------|
|----------------|------------------------|
|- res.download() -|- 提示下载一个文件 -|
|- res.end() -|- 结束响应进程 -|
|- res.json() -|- 发送一个 JOSN 响应 -|
|- res.jsonp() -|- 发送一个 JSONP 支持的 JSON 响应 -|
|- res.redirect() -|- 重定向一个请求 -|
|- res.render() -|- 渲染一个视图模板 -|
|- res.send( ) -|- 发送一个各种类型的响应 -|
|- res.sendFile() -|- 将一个文件作为一个八进制流发送 -|
|- res.sendStatus() -|- 设置响应状态码并发送其字符串表示形式为响应体 -|

## app.route()

你可以为一个路由路径创建链式的路由处理程序，使用 `app.route()`. 因为路径指定一个单一位置，创建模块化的路由是有帮助的，因为这减少冗余及排版。更多关于路由的信息，见: [Router() documentation](http://expressjs.com/en/4x/api.html#router).

```js
app.route('/book')
    .get((req, res) => {
        res.send('Get a random book');
    })
    .post((req, res) => {
        res.send('Add a book');
    })
    .put((req, res) => {
        res.send('Update the book');
    });
```

## express.Router

使用 `express.Router` 类创建模块化，可挂载的路由处理程序。 一个 `Router` 实例是完整的中间件及路由系统；因此，经常称他为 "mini-app".

以下示例创建一个路由模块，加载了一个中间件函数，定义了一些路由，并在主 app 的一个路径上挂载这个路由模块。

```js
var express = require('express');
var birds = express.Router();

// middleware that is specific to this router
birds.use((req, res, next) => {
   console.log('Time: ', Date.now()); 
   next();
});

// define the home page route
birds.get('/', (req, res) => {
    res.send('Birds home page');
});

// define the about route
birds.get('/about', (req, res) => {
    res.send('About birds');
});

module.exports = birds;
```

在 app 中挂载路由模块：

```js
var birds = require('./birds');

// ...
app.use('/birds', birds);
```

app 现在能处理 /birds 及 /birds/about 的请求，及调用特定路由的 `timeLog` 中间件函数。