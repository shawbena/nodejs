# 调试一个 js 文件：

`$ node debug myscript.js`

脚本中用 debugger 标记断点。

//1.js
```js
let i = 0;
for(i; i < 5; i++){
    watch(i);
    debugger;
    console.log(i);
}
```

# 常用调试命令参考手册

`cont`, c - 继续执行
`next`, n - 下一步
`step`, s - 跳进函数
`out`, o - 跳出函数
`pause`, - 暂停运行代码

`setBreakPoint()`, sb() - 在当前行设置断点
`setBreakPoint(line)`, sb(line) - 在指定行设置断点

`list(5)` - 列出脚本源代码的5行上下文
`repl` - 打开调试器的 repl, 用于在所调试的脚本的上下文中执行

`run` 运行脚本
`restart` 重新启动脚本
`kill` 终止脚本

`scripts` 列出所有已加载的脚本