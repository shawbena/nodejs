# 全局变量

全局变量在所有模块中都是可用的。

#  __dirname

    <String>

当前模块的目录名。等同于 __filename 的 path.dirname()

__dirname 是每个模块内部的。

# __filename

当前模块的文件名，是当前模块文件解析后的绝对路径。

__filename 是每个模块内部的。

# global

    <Object> 全局的命名空间对象。

在浏览器中，顶层的作用域就是全局作用域。这意味着在浏览器中，如果在全局作用域内使用 var something 会定义一个全局变量。在 Node.js 中则不同。顶层作用域不是全局作用域；在 Node.js 中 var something 会是模块内部的。

# console

    <Object>

# exports

`module.exports` 的一个简短的引用，`exports` 是每个模块内部的。

# module

    <Object>

当前模块的引用。 `module.exports` 定义一个模块导出什么，且通过 `require()` 引入。

module 是每个模块内部的。

# require

用于引入模块。require 是每个模块内部的。

`require.cache`

    <Object>

当模块被引入时，他们会缓存到这个对象。通过从该对象删除键值，下次调用  require 时会重新加载模块。不适用于`原生插件`。

`require.resolve()`

使用内部的 require() 机制来查找模块的位置，但不会加载模块，只返回解析后的文件名。

# Buffer 类

    <Function>
    
用于处理二进制数据。

# process 

    <Object>

进程对象。参见 `process` 章节。

# clearImmediate(immediateObject)

# clearInterval(intervalObject)

# clearTimeout(timeoutObject)

# setImmediate(calback[, ...args])

# setInterval(callback, delay[, ...args])

# setTimeout(callback, delay[, ...args])
