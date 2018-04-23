# 命令行选项

Node.js 有很多 CLI 选项。这些选项暴露内置的调试，执行脚本的多种方式，和其他有用的运行时选项。

运行 `man node` 在终端中用 man page 查看此文档。

## 摘要

node [options] [v8 optoins] [script.js | -e "script" | -] [--] [arguments]

node debug [scripts.js | -e "script" | <host>:<port>]...

node --v8-options

不带参数执行启动 [REPL](/api/repl).

关于 `node debug`, 见 [debugger](/api/debug) 文档。

## 选项

`-v, --version`

Added in: v0.1.3

打印 node 的版本

`-h, --help`

Added in: v0.1.3

打印 node 命令行选项。这个选项的输出没有此文档详细。

`-e, --eval "script"`

Added in: v0.5.2

将后面的参数作为 JavaScript 执行。`script` 中也可使用 REPL 中预定义的模块。

-p, --print "script"

与 `-e` 相同，但打印结果。

`-c, --check`

Added in: v5.0.0, v4.2.0

检查脚本但不执行。

`-r, --require module`

Added in: v1.6.0

启动时预加载指定模块

遵循 `require()` 的模块解析原则。`module` 可以是文件路径或文件或 node 模块名。

`--inspect[=[host:]port]`

Added in: v6.3.0

Activate inspector on host:port. Default is 127.0.0.1:9229.

V8 inspector integration allows tools such as Chrome DevTools and IDEs to debug and profile Node.js instances. The tools attach to Node.js instances via a tcp port and communicate using the [Chrome Debugging Protocol](https://chromedevtools.github.io/debugger-protocol-viewer).

`--inspect-bark[=[host:]port]`

Added in: v7.6.0

Activate inspector on host:port and break at start of user script. Default host:port is 127.0.0.1:9229

`--inspect-port=[host:]port`

Added in: v7.6.0

Set the host:port to be used when the inspector is activated. Userful when activating the inspector by sending the `SIGUSR1` signal.

Default host is 127.0.0.1.

`--no-deprecation`

Added in: v0.8.0

静默废弃警告。

`--trace-deprecation`

Added in: v0.8.0

Print stack traces for deprecations

`--throw-deprecation`

Added in: v0.11.14

Throw errors for deprecations.

`--pending-deprecation`

Added in: v8.0.0

Emit pending deprecation warnings.

_Note:_ Pending deprecations are generally identical to runtime deprecation with the notable exception that they are turned _off_ and will not be emitted unless either the `--pending-deprecation` command line flag, or the `NODE_PENDING_DEPRECATION=1` environment is set. Pending deprecations are used to provided a kind of selective "early warning" mechanism that developers may leverage (利用) to detect deprecated API usage.

`--no-warnings`

Added in: v6.0.0

静默所有进程警告 (包括废弃的警告)。

`--expose-http2`

Added in: v8.4.0

启用试验性的 `http2` 模块。

`--abort-on-uncaught-exception`

Added in: v0.10

Aborting instead of exiting causes a core file to be generated for post-mortem analysis using a debugger (such as `lldb`, `gdb`, and `mdb`).

`--trace-warning`

Added in: v6.0.0

Print stack traces for process warnings (including deprecations).

`--redirect-warnings=file`

Added in: v8.0.0

将进程警告写入给定文件而非打印至 stderr. 如果文件不存在将创建文件，如果文件存在，则追加到文件中。如果尝试将警告写进错误发生错误，则警告将写至 stderr.

`--trace-sync-io`

Added in: v2.1.0

Print a stack trace whenever synchronous I/O is detected after the first turn of the event loop.

`--force-async-hooks-checks`

Added in: v8.8.0

Enabled runtime checks for `async_hooks`. These can also be enabled dynamically by enabling one of the `async_hooks` hooks.

`--trace-events-enabled`

Added in: v7.7.0

Enables the collection of trace event tracing information.

`--trace-event-categories`

Added in: v7.7.0

A comma separated list of categories that should be traced when trace event tracing is enabled using `--trace-events-enabled`

`--zero-fill-buffers`

Added in: v6.0.0

Automatically zero-fills all newly allocated [Buffer](/api/buffer#buffer) and [SlowBuffer](/api/buffer#slow-buffer) instances.

`--preserve-symlinks`

Added in: v6.3.0

指令模块加载器解析和缓存模块时保留符号链接。

默认，当 Node.js 从一个路径加载一个链接到磁盘上不同位置的模块时。。。。。。。待续

--track-heap-objects

--prof-process

--v8-options

-tls-cipher-list=list

--enable-fips

--force-fips

--openssl-config=file

--icu-data-dir=file

# 环境变量

NODE_DEBUG=module[,...]

NODE_PATH=path[:...]

NODE_DISABLE_COLORS=1

当设为 `1` 时 REPL 中将不使用颜色。

NODE_ICU_DATA=file

NODE_REPL_HISTORY=file

NODE_TTY_UNSAFE_ASYNC=1

NODE_EXTRA_CA_CERTS=file


##

/api/debug