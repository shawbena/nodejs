# Modules

v8.9.2 Documentation

Node.js 有一个简单的模块加载系统。在 Node.js 中，文件和模块是一一对应的 (每个文件被当作一个独立的模块)。

。。。待续

## Accessing the main module

## Accessing the main module

## 文件模块
如果按确切的文件名没有找到模块，则 Node.js 会尝试带上 .js、.json 或 .node 拓展名再加载。

.js 文件会被解析为 JavaScript 文本文件，.json 文件会被解析为 JSON 文本文件。 .node 文件会被解析为通过 dlopen 加载的编译后的插件模块。

以 '/' 为前缀的模块是文件的绝对路径。 例如，require('/home/marco/foo.js') 会加载 /home/marco/foo.js 文件。

以 './' 为前缀的模块是相对于调用 require() 的文件的。 也就是说，circle.js 必须和 foo.js 在同一目录下以便于 require('./circle') 找到它。

当没有以 '/'、'./' 或 '../' 开头来表示文件时，这个模块必须是一个核心模块或加载自 node_modules 目录。

如果给定的路径不存在，则 require() 会抛出一个 code 属性为 'MODULE_NOT_FOUND' 的 Error。


## Addenda: Package Manager Tips

Node.js `require()` 函数的名意设计的非常广泛足够支持若干合理的文件夹结构。包管理器如 `dpkg`, `rpm`, `npm` 可能如期地从 Node.js 模块构建原生包而不用修改什么。

下面我们们给出一个建议的可起作用的目录结构：

假设我们想在 `/usr/lib/node/<some-package>/<some-version>` 存放特定版本包的内容。

包可以相互依赖。为了安装包 `foo`, 可能需要安装特定版本的包 `bar`. 包 `bar` 本身可能有依赖，某中情形中，这些依赖甚至冲突或形成循环依赖。

由于 Node.js 查找加载的任何模块的的 `realpath` (即，解析符号链接)，然后在 `node_modules` 查找依赖，[此处](#loading-from-node_modules-folders) 描述，这种情形解析以下构架是非常简单的：

- `/usr/lib/node/foo/1.2.3/` - `foo` 包，version 1.2.3

- `/usr/lib/node/bar/4.3.2/` - `foo` 依赖的 `bar` 包。

- `/usr/lib/node/foo/1.2.3/node_modules/bar` - 至 `/usr/lib/node/bar/4.3.2/`

- `/usr/lib/node/bar/4.3.2/node_modules/*` - 至`bar` 的依赖的包的链接。

因此，即使遇到循环依赖，或依赖冲突，每个模块都将找到其可以用的依赖版本。

当 `foo` 包中的代码 `require('bar')`, 他将得到链接符号链接至 `/usr/lib/node/foo/1.2.3/node_modules/bar` 的版本。然后，当包 `bar` 调用 `require('quux')`, 他将得到符号链接至 `/usr/lib/node/bar/4.3.2/node_modules/quux` 的版本。

此外，为使模块查找过程更优化，我们将模块放在 `/usr/lib/node_modules/<name>/<version>` 中而非 `/usr/lib/node`. 然后 Node.js 将不用在 `/usr/node_modules` 或 `/node_modules` 中查找缺失的依赖了。

为了使模块对 Node.js REPL 可用，添加 `/usr/lib/node_modules` 文件夹为 `$NODE_PATH` 环境变量可能有用。因为使用 `node_modules` 文件夹查找模块是相对的，基于真实的路径调用 `require()`, 包本身可以在任何地方。//? 也许 $NODE_PATH 也可设置为其他路径，或多个路径。

## All Together

若想在 `require()` 调用时得到精确的文件名，使用 `require.resolve()` 函数。

将上面的综合在一起，这里是 `require.resolve()` 所做事情的高级算法的伪代码：

```
require(X) from module at path Y

1. if X is a core module,
   a. return the core module
   b. STOP
2. If X begin with '/'
   a. set Y to be the filesystem root
3. If X begins with './' or '/' or '../'
   a. LOAD_AS_FILE(Y + X)
   b. LOAD_AS_DIRECTORY(Y + X)
4. LOAD_NODE_MODULES(X, dirname(Y))
5. THROW "not found"

LOAD_AS_FILE(X)
1. If X is a file, load X as JavaScript text. STOP
2. If X.js is a file, load X.js as JavaScript text. STOP
3. If X.json is a file, parse X.json to a JavaScript Object. STOP
4. If X.node is a file, load X.node as binary addon. STOP

LOAD_INDEX(X)
1. If X/index.js is a file, load X/index.js a JavaScript text. STOP
2. If X/index.json is a file, load X/index.json to a JavaScript object. STOP
3. If X/index.node is a file, load X/index.node as binary addon. STOP

LOAD_AS_DIRECTORY(X)
1. If X/package.json is a file,
   a. Parse X/package.json, and look for "main" field.
   b. let M = X + (json main field)
   c. LOAD_AS_FILE(M)
   d. LOAD_INDEX(M)
2. LOAD_INDEX(X)

LOAD_NODE_MODULES(X, START
1. let DIRS=NODE_MODULES_PATHS(START)
2. for each DIR in DIRS
   a. LOAD_AS_FILE(DIR/X
   b. LOAD_AS_DIRECTORY(DIR/X)

NODE_MODULES_PATHS(START)
1. let PARTS =path split(START)
2. let I = count of PARTS - 1
3. let DIRS = []
4. while I >= 0,
   a. if PARTS[i] = "node_modules" CONTINUE
   b. DIR = path join (PARTS[0 .. I] + "node_modules")
   c. DIRS = DIRS + DIR
   d. let I = I -1
5. return DIRS
```

`绝对路径的依赖`：

如：

__require('/bar')__

```js
// /home/shaw/test/foo.js
var bar = require('/bar');
bar(); // ok
/*
 $ bar from /bar
*/

// /bar/index.js // ok
module.exports = () => {
    console.log('bar from ' + __dirname);
}

// /bar.js // ok
module.exports = () => {
    console.log('bar from ' + __dirname);
}
```


```js
// /home/shaw/test/foo.js
var bar = require('/bar');
bar(); // ok


// Can not find module '/bar'
// /home/shaw/test/bar.js
// /node_modules/bar.js
```

```js
// /home/shaw/test/foo.js
var bar = require('/home/shaw/bar');

// Can not find module '/home/shaw/bar'

// /bar.js
// /node_modules/bar.js
// /home/shaw/bar/index.js
```

由此可见，对于绝对路径的依赖，node 只会从请求绝对路径下面调用 LOAD_AS_FILE() 或 LOAD_AS_DIRECTORY() 中去找， ，而不理睬祖先路径及请求依赖的文件的路径。所以上面伪代码对于绝对路径的依赖不太正确。webpack 对于绝对路径的依赖也不再作解析。

## Caching

模块在第一次加载后被缓存。这意味着每次调用 `require('foo')` 只要解析到同文件将会得到同一对象。

多次调用 `require('foo')` 不会使模块代码被执行多次。这是重要的一个特色。有了他可以返回部分完成的对象，因此允许加载传递性的依赖，即使他们会造成循 (环依赖)。

如果想让一个模块代码执行多次，导出一个函数，然后调用那个函数。 // 如果我不想导出函数怎样清除掉缓存的模块

## Module Caching Caveats

模块缓存基于其解析的文件名。基于调用模块的位置模块可能解析至不同的文件名，不能保证 `require('foo')` 将总返回同一对象，也可能解析至不同的文件。

此外，在不区分大小写 (case-insensitive) 的文件系统或操作系统上，不同的解析文件可以指向同一文件，但缓存仍会将他们当作不同的模块并将多次加载。如 `require('./foo')` 和 `require('./FOO')` 将返回两个对象，不论 `./foo` 和 `./FOO` 是不是同一文件。

## Core Modules

Node.js 有一些编译为二进制的模块，这些模块在文档中的其他地方有很多描述。

核心模块定义在 Node.js 的源代码中并放在 `lib/`文件夹中。// 哪里？

如果核以模块的标识符传递给了 `require()` 核以模块总是优先被加载。

如 `require('http')`, 即使有一个此名称的文件也将返回内置的 HTTP 模块。

## Cycles

## File Modules

## Folders as Modules

## Loading from `node_modules` Folders

如果传递给 `require()` 的模块标识符不是一个 [core](#core-modules) 模块, 也不以 `'/'`, `'../'` 或 `'./'` 开头，那么 Node.js 从当前模块的父目录开始，添加 `/node_modules` 并尝试从此位置加载模块。Node 不会对已经以 `node_modules` 结尾的路径追回 `node_modules`.

如果没有找到，那么 Node 将到父目录中查找，等等，直至到文件系统的根目录。

如果一个文件 `/home/ry/projects/foo.js` 调用 `require('bar.js')`, 那么 Node.js 将会按顺序查找以下位置：

- `/home/ry/projects/node_modules/bar.js`

- `/home/ry/node_modules/bar.js`

- `/home/node_modules/bar.js`

- `/node_modules/bar.js`

这使程序可本地化其依赖，这样他们便不会发生冲突。

也可以请求和模块一同分发的特定文件或子模块，只需在路模块名后缀路径即可。例如 `require('example-module/path/to/file')` 将会相对 `example-module` 定位解析 `path/to/file`. 后缀路径遵守同样的模块解析句意。

## Loading from the global folders

## The module wrapper

在一个模块的代码执行前，Node.js 将用一个函数将他包裹起来，如下：

```js
(function(exports, require, module, __filename, __dirname){
    // Module code actually lives in here
});
```

这样，Node.js 可以：

- 保持顶层变量 (defined with `var`, `const` or `let`) 作用于域于模块而非全局对象。

- 有助于提供看起来全局但特定模块的变量，如：

 * `module` 和 `exports` 对象，实现者可用来从模块中导出变量。
 * 便利的 `__filename` 和 `__dirname` 变量，包含模块的绝圣文件名和目录路径。

## The module scope

## The `module` Object

