# File System

文件 I/O 是 POSIX 功能的简单包装。要使用这个模块用 `require('fs')`. 所有的方法都有异步或同步的形式。

异步形式的最后一个参数总是一个完成回调。传递给完成回调的参数取决于方法，但第一个参数总是为异常保留。如果操作成功完成，那第一个参数为 `null` 或 `undefined`.

当使用同步的形式任何异常都会立即抛出。你可以使用 try/catch 处理异常或让异常向上冒泡。

异步版的一个例子：

```js 1.js
const fs = require('fs');

fs.unlink('/tmp/hello', (err) => {
    if(err) throw err;
    console.log('successfullly deleted /tmp/hello');
});
```

同步版：

```js
const fs = require('fs');

fs.unlinkSync('/tmp/hello');
console.log('successfully deleted /tmp/hello');
```

异步方法不能保证顺序。所以以下是错误的：

```js
fs.rename('/tmp/hello', '/tmp/world', (error) => {
    if(err) throw err;
    console.log('rename complete');
});
fs.stat('/tmp/world', (err, stats) => {
    if(err) throw err;
    console.log(`stats: ${JSON.stringify(stats)}`);
});
```

在忙碌的进程中，强烈推荐编程人员使用异步版本的这些调用。同步版本的将在其完成前一直阻塞整个进程——中断所有连接。

可以使用文件名的相对路径。然而，记住路径是相对于 `process.cwd()`

大多函数让你忽略回调参数。如果你这样做，会使用默认的回调重新抛出错误。设置 `NODE_DEBUG` 环境变量以获得原始调用站点的足迹：

```js
$ cat script.js
function bad(){
    require('fs').readFile('/');
}
bad();

$ env NODE_DEBUG=fs node script.js
fs.js:88
        throw backtrace;
        ^
Error: EISDR: illegal operation on a directory, read
        <stacl trace.>

```

## Buffer API

`fs` 函数支持接收和传递的路径为既可以是字符串也可以是 Buffer. 后者可能处理 UTF-8 的文件名。大多时候，路径用 Buffer 没有必要，因为 string API 会自动转换至或来自 UTF-8.

注意在一些系统上（如 NTFS 和 HFS+）文件名将总是被编码为 UTF-8. 在这样的系统上，传递传递非 UTF-8 的编码给 `fs` 函数将不会如期工作。

## fs.FSWatcher 类

fs.watch() 返回的对象就是这种类型。

提供给 `fs.watch()` 的 `listener` 回调接收返回的 FSWatcher 的 `change` 事件。

这个对象本身发出以下事件：

### change 事件

eventType &lt;String&gt; fs change 的类型

filename &lt;String&gt; | &lt;Buffer&gt; 改变的文件名（如果相关/可用）。当监测的目录或文件变化时发出。详见 `fs.watch()`

是否提供 `filename` 参数取决于操作系统支持。如果有 `filename`, 如果调用 `fs.watch()` 的 `encoding` 选项为 `buffer` 将会是一个 `Buffer` , 否则 `filename` 将会是一个字符串。

```js
fs.watch('./tmp', {encoding: 'buffer'}, (eventType, filename) => {
    if(filename)
        console.log(filename);
});
```

### error 事件

`error` &lt;Error&gt;

发生错误时触发。

### watcher.close()

停止侦测指定 `fs.FSWatcher` 的变化。

## fs.ReadStream 类

`ReadStream` 是一个 `Readable Steam`.

### open 事件

`fd` &lt;Integer&gt; ReadStream 使用的整数文件描述符。

当 ReadStream 的文件打开时触发。

### close 事件

当使用 `fs.close()` 方法已经关闭 `ReadStream` 的底层文件描述符时触发。

### readStream.bytesRead

目前为止读取的字节数。

### readStream.path

流读取文件的路径是在 `fs.createReadStream()` 的第一个参数中指定的。如果 `path` 是字符串，那 `readStream.path` 将会时字符串。如果 `path` 是 `Buffer`, 那么 `readStream.path` 将会是一个 `Buffer`.

## fs.Stats 类

`fs.stat()`, `fs.lstat()` 和 `fs.fstat()` 和异步部分返回的对象是这个类型。

- stats.isFile()
- stats.isDirectory()
- stats.isBlockDevice()
- stats.isCharacterDevice()
- stats.isSymbolicLink() (仅和 `fs.lstat()` 有效)
- stats.isFIFO()
- stats.isSocket()

对于常规文件 `util.inspect(stats)` 将会返回类似下面的字符串：

```js
{
    dev: 2114,
    ino: 48064969,
    mode: 33188,
    nlink: 1,
    uid: 85,
    gid: 100,
    rdev: 0,
    size: 527,
    blksize: 4096,
    blocks: 8,
    atime: Mon, 10 Oct 2011 23:24:11 GMT
    mtime: Mon, 10 Oct 2011 23:24:11 GMT,
    ctime: Mon, 10 Oct 2011 23:24:11 GMT,
    birthtime: Mon, 10 Oct 2011 23:24:11 GMT 
}
```

注意 `atime`, `mtime`, `birthtime` 和 `ctime` 是 `Date` 对象的实例。比较这些对象的值应使用恰当的方法。大多数用 `getTime()` 将返回从 1 January 1970 00:00:00 UTC 流失的时间的毫秒数。这个整数将足以用于任何比较。//getTime() 参见 MDN

### Stat Time Values

stat 对象中的时间有以下含义：

- `atime` "Access Time" - 文件数据上次访问的时间。[由 mknod(2)](http://man7.org/linux/man-pages/man2/ /utimes.2.html) 和 [read(2)](http://man7.org/linux/man-pages/man2/utimes.2.html) 系统调用更改。

- `mtime` "Modified Time" - 文件数据上次修改的时间。由 mknod(2), utimes(2), red(2), 和 write(2) 系统调用更改。

- `ctime` "Change Time" - 文件状态上次变更的时间（inode data modification）.由 chmod(2), chown(2), link(2), mknod(2), rename(2), unlink(2), utimes(2), read(2), 和 write(2) 系统调用更改。

- `birthtime` "Birth Time" - 文件创建时间。文件创建时设置。birthtime 不可用的操作系统，这个字段可能存放 `ctime` 或 `1970-01-01T00:00Z`. 这种情况下这个值可能比 `atime` 或 `mtime`。

在 Node v0.12 前，Windows 系统上的 `ctime` 存放 `birthtime` . v0.12 `ctime` 不在是 "creation time", Unix 系统上从来都不是。

## Class:fs.WriteStream

`WriteSteam` 是一个 [Writable Stream](http://localhost/stream.html#stream_class_stream_writable).

### open 事件

fd &lt;Integer&gt; WriteStrem 使用的整数文件描述符。

当 WriteStream 的文件打开时触发。

### close 事件

当 WriteStream 的底层文件描述符已经用 `fs.close()` 方法关闭时触发。

### writeStream.bytesWritten

目前为止已写的字节数。不包括仍在排队写的数据。

### writeStream.path

`fs.createWriteStream()` 中指定的流写向的文件的路径。如果传递的 `path` 是字符串，那 `writeStream.path` 将会是字符串。如果传递的 `path` 是 `Buffer`，那 `writeStream.path` 将会上 `Buffer`.

## fs.access(path[,mode],callback)

`path`      &lt;String&gt; | &lt;Buffer&gt;
`mode`      &lt;Integer&gt;
`callback`  &lt;Function&gt;

测试用户对 `path` 指定的文件或目录的权限。`mode` 参数是一个可选的整数用来指定要执行的访问性检查。以下常量定义了 `mode` 的可能值。 也可以创建一个包含 按位 OR 的两个或多个值。

- `fs.constants.F_OK` - `path` 对调用进程是可见的。用于确定文件是否存在，但没有 `rwx` 权限的信息。如果没有指定 `mode` 这个是默认。

- `fs.constants.R_OK` - `path` 可被调用进程读。

- `fs.constants.W_OK` - `path` 可被调用进程写。

- `fs.constants.X_OK` - `path` 可被调用进程执行。在 Windows 上并没有什么作用（和 fs.constants.F_OK 差不多）。

最后一个参数， `callback` 调用 callback 可能会有一个 error 参数。如果任何访问性检查失败，将会填充 error 参数。以下参数检查文件 `/etc/passwd` 是否可被当前进程读写。

```js
fs.access('/etc/passwd', fs.constants.R_OK | fs.constants.W_OK, (err) => {
    console.log(err ? 'no access!' : 'can read/write');
});
```

不推荐在调用 `fs.open()`, `fs.readFile()` 或 `fs.writeFile()` 前检查文件的可访问性。这样做会引起 race condition, 因为在两次调用期间其他进程可能会更改文件状态。用户代码应该直接打开文件，如果文件不可访问要处理出现的错误。

```js
fs.open('myfile', 'r', (err, fd) => {
    if(err){
        if(err.code === 'ENOENT'){
            console.error('myfile does not exist');
            return;
        }else{
            throw err;
        }
    }
    readMyData(fd);
});
```

通常中在文件不直接使用时检查文件的可访问性，如可访问性是另一个进程传过来的信号。

## fs.accessSync(path[,mode])

`path`  &lt;String&gt; | &lt;Buffer&gt;
`mode`  &lt;Integer&gt;

`fs.access()` 的同步版本。如果访问性检查失败抛出错误，且什么事也不做。

## fs.appendFile(file,data[,options],callback)

`file`      &lt;String&gt; | &lt;Buffer&gt; | &lt;Number&gt; 文件名或文件描述符
`data`      &lt;String&gt; | &lt;Buffer&gt;
`options`   &lt;Object&gt; | &lt;String&gt;
    `encoding`  &lt;String&gt; | &lt;Null&gt; 默认 `'utf8'`
    `mode`      &lt;Integer&gt; 默认 `0o666` //?
    `flag`      &lt;String&gt; 默认 `'a'`
`callback`  &lt;Function&gt;

异步地往文件追加数据，如果文件不存在就创建文件，`data` 可以是字符串或 buffer.

例如：

```js
fs.appendFile('message.txt', 'data to append', (err) => {
    if(err){
        throw err;
    }
    console.log('The data was appended to file!');
});
```

如果 `options` 是字符串，那他指定编码。例如：

```js
fs.appendFile('message.txt', 'data to append', 'utf8', callback);
```

任何指定的文件描述符要已经打开用于追加。

如果文件描述符指定为文件，他不会自动关闭。

## fs.appendFileSync(file,data[,options])

`file`      &lt;String&gt; | &lt;Buffer&gt; | &lt;Number&gt;
`data`      &lt;String&gt; | &lt;Buffer&gt;
`options`   &lt;Object&gt; | &lt;String&gt;
    `encoding`  &lt;String&gt; | &lt;Null&gt;
    `mode`      &lt;Integer&gt; 默认 `0o666`
    `flag`      &lt;String&gt; 默认 `'a'`

同步版本的 `fs.appendFile()`. 返回 `undefined`.

## fs.chmod(path,mode,callback)

`path`      &lt;String&gt; | &lt;Buffer&gt;
`mode`      &lt;Integer&gt;
`callback`  &lt;Function&gt;

异步的 [chmod(2)](http://man7.org/linux/man-pages/man2/chmod.2.html). 返回 `undefined`.

## fs.chmodSync(path,mode)

`path`  &lt;String&gt; | &lt;Buffer&gt;
`mode`  &lt;Integer&gt;

同步的 `chomd(2)`. 返回 `undefined`.

## fs.chown(path,uid,gid,callback)

`path`      &lt;String&gt; | &lt;Buffer&gt;
`uid`       &lt;Integer&gt;
`gid`       &lt;Ingeger&gt;
`callback`  &lt;Function&gt;

异步的 [chown(2)](http://man7.org/linux/man-pages/man2/chown.2.html). 最多会传递给完成回调一个异常参数。

## fs.chownSync(path,uid,gid)

`path`      &lt;String&gt; | &lt;Buffer&gt;
`uid`       &lt;Integer&gt;
`gid`       &lt;Ingeger&gt;
`callback`  &lt;Function&gt;

同步的 `chown(2)`. 返回 `undefined`.

## fs.close(fd,callback)

## fs.closeSync(fd)

## fs.constants

## fs.createReadStream(path[,options])

## fs.createWriteStream(path[,options])

`path`                  &lt;String&gt; | &lt;Buffer&gt;
`options`               &lt;String&gt; | &lt;Object&gt;
    `flag`              &lt;String&gt;
    `defaultEncoding`   &lt;String&gt;
    `fd`                &lt;Integer&gt;
    `mode`              &lt;Integer&gt;
    `autoClose`         &lt;Boolean;&gt;
    `start`             &lt;Integer;&gt;

返回一个新的 `WriteStream` 对象。见 [Writable Stream](http://localhost/stream.html#stream_class_stream_writable)

`options` 是一个对像或字符串，有以下默认值：

```js
{
    flags: 'w',
    defaultEncoding: 'utf-8',
    fd: null,
    mode: 0o66,
    autoClose: true
}
```

`options` 可能也包括一个 `start` 选项使得将数据写至指定位置。修改文件而非替换需要将 `flags` 模式改为 `r+` 而非默认的 `w`. `defaultEncoding` 可以是任何 `Buffer` 接受的类型。

如果 `autoClose` 为 `true` (默认), 对于 `error` 或 `end` 文件描述符将自动被关闭。如果 `autoClose` 是 false, 那文件描述符将不会被关闭，即使出现错误。关闭文件描述符并确保没有文件描述符泄漏是你的责任。

像 `ReadStream`, 如果指定了 `fd`, `WriteStream` 将会忽略 `path` 参数而使用指定的文件描述符。这意味着不会触发 `open` 事件。注意 `fd` 应该是阻塞的，非阻塞的 `fd` 应该传递给 `net.Socket`.

如果 `options` 是字符串，那他指定编码。

## fs.existsSync(path)

## fs.fchmod(fd, mode, callback)

## fs.fchmodSync(fd, mode)

## fs.fchown(fd,uid,gid,callback)

## fs.fchownSync(fd,uid,gid)

## fs.fdatasync(fd,callback)

## fs.fdatasyncSync(fd)

## fs.fstat(fd,callback)

## fs.fstatSync(fd)

## fs.fsync(fd,callback)

## fs.fsyncSync(fd)

## fs.ftruncate(fd,len,callback)

## fs.ftruncateSync(fd,len)

## fs.futimes(fd,atime,mtime,callback)

## fs.fustimesSync(fd,atime,mtime)

## fs.lchmod(path,mode,callback)

## fs.lchmodSync(path,mode)

## fs.lchown(path,uid,gid,callback)

## fs.lchownSync(path,uid,gid)

## fs.link(existingPath,newPath,callback)

## fs.linkSync(existingPath,newPath)

## fs.lstat(path,callback)

## fs.lstatSync(path)

## fs.mkdir(path[,mode],callback)

## fs.mkdirSync(path[,mode])

## fs.mkdtemp(prefix[,options],callback)

## fs.mkdtempSync(prefix[,options])

## fs.open(path,flags[,mode],callback)

    path <String> | <Buffer>
    flags <String> | <Number>
    mode <Integer>
    callback <Function>

异步打开文件。见 open(2) (linux 命令). flag 可以是：
    'r' - 打开文件读。如果文件不存在会发生异常。
    'r+' - 打开文件读和写。如果文件不存在会发生异常。
    'rs+' - 以同步模式打开文件读和写。指令本地文件系统通道本地文件缓存。这个对于打开在 NFS上 因为他允许你路过潜在的老的本地缓存。对 I/O 性能也有非常真实的冲击所以除非需要否则不要用。注意这不会使 fs.open() 变成同步的块调用。如果那是你想要的，那么你应该使用 fs.openSync().
    'w' - 打开文件写。创建文件（如果不存在）或删节文件（如果存在）。
    'wx' - 类似 'w'，但是如果 path 存在失败。
    'w+' - 打开文件读和写。创建文件（如果不存在）或删节文件（如果存在）。
    'wx+' - 类似 'w+', 但是如果文件存在失败。
    'a' - 打开文件追加。创建文件（如果不存在）。
    'ax' - 类似 'a', 但是如果 path 不存在失败。 
    'a+' - 打开文件读和追加。如果文件不存在创建文件。
    'ax+' - 类似 'a+', 但是如果 path 不存在失败。

mode 设置文件 mode (permission 和 sticky bits), 但是仅针对创建的文件。默认 0666，可读和可写。

callback 接收两个参数 (err, fd) 确保 path 是新建的。在 POSIX 系统上，即使 path 是一个指向不存在文件的链接，path 也是被视为存在的。在网络文件系统上专有标志可能或者可能不工作。

专有标志 'x' (open(2) 中的 O_EXCL) 确保 path 是新创建的。在 POSIX 系统上， path 被视为存在即使是指向不存在文件的 symlink. 可执行标志在网络文件系统中可能也可能不起作用。

flags 可以是 open(2) 所述的数字；通常使用 fs.constants 的常量。在 Window 上，flags 被转换为行等同可应用的，如 O_WRONLY 为 FILE_GENERIC_WRITE, 或 O_EXCL|OCREAT 为 CREATE_NEW.

在 Linux 上, positional write 不会工作，当文件以追加模式打开时。内核会忽略位置参数并且问题往文件的末尾追加数据。

注意：fs.open() 的一些标签是特定于平台的。如在 OSX 和 Linux 上用 'a+' 标签打开文件会返回一个错误，而在 Windows 和 FreeBSD 上，会返回一个文件描述符。

```js
// OX and Linux
fs.open('<directory>', 'a+', (err, fd) => {
    // => [Error: EISDIR: illegal operation on a directory, open <directory>]
});

//Windowws and FreeBSD
fs.open('<directory>', 'a+', (err, fd) => {
    // => null, <fd>
});
```

## fs.openSync(path,flags[,mode])

path <String> | <Buffer>
flags <String> | <Number>
mode <Integer>

fs.open() 的同步模式。返回一个表示文件描述符的整数。

## fs.read(fd,buffer,offset,length,position,callback)

fd <Integer>
buffer <String> | <Buffer>
offset <Integer>
length <Integer>
position <Integer>
callback <Function>

从 fd 指定的文件读取数据。

buffer 是数据要被写入的 buffer.

offset 是 buffer 中开始写入的偏移量。

length 是要读取多少 byte 的整数。

position 是一个整数，指定从文件中的哪个位置开始读。如果 position 是 null, 将会从当前文件位置读取数据。

回调接受三个参数，(err, bytesRead, buffer)


## fs.readdir(path[,options],callback)

path <String> | <Buffer>

options <String> | <Object>
    encoding <String> 默认 = 'utf8'
callback <Function>

异步的 readdir(3)(http://man7.org/linux/man-pages/man3/readdir.3.html). 读取目录的内容。回调接收两个参数 (err, files)，files 是目录中文件名的数组，不包括 '.' 和 '..'

可选的 options 参数可以是一个字符串，用来指定编码，或者是一个对象有 encoding 属性，用于指定传递给回调的文件名的编码。如果 encoding 设置为 'buffer'，传递的文件名将会是 Buffer 对象。

## fs.readdirSync(path[,options])

path <String> | <Buffer>
options <String> | <Object>
    encoding <String> 默认 = 'utf-8'

readdir(3) 的同步版本。参考 fs.readdir().

## fs.readFile(file[,options],callback)

file <String> | <Buffer> | <Integer> 文件名或文件描述符
options <Object> | <String>
    encoding <String> | <Null> 默认 = null
    flag <String> 默认 = 'r'
callback <Function>

异步读取一个文件的整个内容。如：

```js
fs.readFile('/ect/passwd', (err, data) => {
    if(err) throw err;
    console.log(data);
});
```

传递给回调两个参数 (err, data), data 是文件的内容。

如果没有指定编码，那么返回原始的 buffer.

如果 option 是字符串，那么指定的是编码。如:

```js
fs.readFile('/etc/passwd', 'utf8', callback)
```

任何文件描述符要支持读取。

注：如果一个文件描述符指定的是 file，那么他将不会自动关闭。

## fs.readFileSync(file[,options])

fs.readFile() 的同步版本。如果指定了 encoding 选项，那么这个函数返回一个字符串。否则返回一个 buffer。参考 fs.readFile().

## fs.readlink(path[,options],callback)

path <String> | <Buffer>
options <String> | <Object>
    encoding <String> 默认 = 'utf-8'
callback <Function>

异步的 readlink(2) (http://man7.org/linux/man-pages/man2/readlink.2.html)。回调接收两个参数 (err, linkString).回调接收两个参数 (err, linkString). 

可选的 options 可以是一个指定编码的字符串，或者一个有 encoding 属性的对象，指定用于传递给回调的 link path 的字符编码。如果 encoding 设为 'buffer', 传递的 link path 将会是一个 Buffer 对象。

## readlinkSync(path[,options])

同步的 readlink(2). 返回符号链接的字符串值。参考 fs.readlink

## readSync(fd,buffer,offset,length,position)

同步版的 fs.read(). 返回 bytesRead 的数量。参考 fs.read().

## fs.realpath(path[,options],callback)

path <String> | <Buffer>
options <String>|<Object>
    encoding <String> 默认 = 'utf8'
callback <Function>

异步的 realpath(3). 回调接收两个参数 (err, resolvedPath). 可能使用 process.cwd 解析相对路径。

只支持能转换为 UTF-8 字符串的路径。

可选的 options 参数可以是一个指定编码的字符串，或者有 encoding 属性的对象，指定传递给回调的 path 的编码。如果 encoding 设置为 buffer, 返回的路径将传递为 Buffer 对象。

## fs.realpathSync(path[,options])

同步的 realpath(3). 返回解析的路径。参见 fs.realpath().

## fs.rename(oldPath,newPath,callback)

oldPath <String> | <Buffer>
newPath <String> | <Buffer>
callback <Function>

异步的 rename(2)(http://man7.org/linux/man-pages/man2/rename.2.html). No arguments other than a possible exception are given to the completion callback.

## fs.renameSync(oldPath,newPath)

同步的 rename(2). 返回 undefined. 参考 fs.rename().

## fs.rmdir(path,callback)

path <String> | <Buffer>
callback <Function>

异步的 rmdir(2)(http://man7.org/linux/man-pages/man2/rmdir.2.html). No arguments other than a possible exception are given to the completion callback.

## fs.rmdirSync(path)

同步的 rmdir(2). 返回 undefied. 见 fs.rmdir().

## fs.stat(path,callback)

path <String> | <Buffer>

callback <Function>

异步的 `stat(2) (http://man7.org/linux/man-pages/man2/stat.2.html)`. 回调接收两个参数 (err, stats) `stats` 是个 `fs.Stats` 对象。

如果出现错误, `err.code` 将会是 `Common System Errors (errors.html#errors_common_system_errors)` 之一。

在调用 `fs.open(), fs.readFile() 或 fs.writeFile()` 前使用 `fs.stat()` 检查一个文件是否存在是不推荐的做法。用户代码应该直接打开/读/写文件并处理文件不可用而导致的错误。

检查文件是否存在而非稍后处理他，建议使用 `fs.access()`.

## fs.statSync(path)

异步的 `stat(2)`. 返回一个 `fs.Stats` 实例。

## fs.symlink(target,path[,type],callback)

target <String> | <Buffer>
path <String> | <Buffer>
type <String>
callback <Function>

异步的 [symlink(2)](http://man7.org/linux/man-pages/man2/symlink.2.html)。传递给完成回调的只可能会有异常参数。`type` 参数可设置为 `dir`, `file` 或 `junction` (默认是 `file`) 且只在 Windows 上有效 (在其他平台上会被忽略)。Windows junction points 需要路径是绝对的。当使用 `junction`, `target` 参数将标准化为绝对路径。

下面是一个例子：

```js
//创建名为 "new-port" 指向 "foo" 的符号链接。
fs.symlink('./foo', './new-port');
```

## fs.symlinkSync(target,path[,type])

## fs.truncate(path,len,callback)

path <String> | <Buffer>
len <Integer> 默认为 0
callback <Function>

异步的 [truncate(2)](http://man7.org/linux/man-pages/man2/truncate.2.html). 传递给回调的可能参数是一个异常。第一个参数也可以是一个文件描述符。这种情形会调用 `fs.ftruncate()`.

## fs.truncateSync(path,len)

## fs.unlink(path,callback)

path <String> | <Buffer>
callback <Function>

异步的 [unlink(2)](http://man7.org/linux/man-pages/man2/unlink.2.html) 传递给回调的可能参数是一个异常.

## fs.unlinkSync(path)

## fs.unwatchFile(filename[,listener])

## fs.utimes(path,atime,mtime,callback)

## fs.utimesSync(path,atime,mtime)

## fs.watch(filename[,options][,listener])

`filename`          &lt;String&gt; | &lt;Buffer&gt;
`options`           &lt;String&gt; | &lt;Object&gt;
    `persistent`        &lt;Boolean&gt; 一旦文件被监测进程是否应该继续运行。 default = `true`
    `recursive`         &lt;Boolean&gt; 是否监测所有的子目录，或者仅当前目录。应于于指定目录，并且仅在支持的平台上。默认 `false`
    `encoding`          &lt;String&gt; 指定要给侦听者传递的文件名的字符编码。默认 `utf8`
`listener`          &lt;Function&gt;

监测 `filename` 的变化，`filename` 是一个文件或目录。返回对象是一个 `fs.FSWatcher`.

第二个参数可选。如果 `options` 是字符串，那么他指定的是 `encoding`. 否则 `options` 应该是个对象。

侦听者回调有两个参数 `(eventType, filename)`. `eventType` 是 `rename` 或 `change`, `filename` 是触发事件的文件名。

注意，一些平台上无论何时目录中的文件名出现或消失会触发 `rename` 事件。

注意侦听者架设附加到了 `fs.FsWatcher` 触发的 `change` 事件，但和 `eventType` 的 `change` 不是一回事。

`警告`

`fs.watch` API 并非 100% 跨平台一致，一些情形下是不可用的。

recursive 选项仅支持 OS X 和 Windows.

`可用`

这些特色取决于底层操作系统提供的文件系统变动的通知。

- 在 Linux 系统上，用 `inotify`

- 在 BSD 系统上，用 `kqueue`

- OS X 上文件用 `kqueue`, 目录用 `FSEvent`

- SunOS 系统上（包括 Solaris 和 SmartOS）用 `event ports`

- Windows 上，这个特色取决于 `ReadDirectoryChangesW`

- Aix 系统上，这个特色取决于 `AHAFS`, 这个特色必需启用。

如果这些底层功能由于某些原因不可用，那么 `fs.watch` 将不能正常工作。如，监测文件或目录不可靠，一些情形下不可能，在网络文件系统（NFS,SMB 等等），或者在虚拟软件如 Vagrant, Docker 等中存放文件系统。

你仍然可以使用使用 stat polling 的 `fs.watchFile`, 但比较慢而且不靠谱。

`Inode`

在 Linux 和 OS X 系统上，`fs.watch()` 将路径解析为 `inode` 并监测 inode. 如果监测的路径被删除或重新创建，他被赋了一个新的 inode. 监测将发出删除的事件但是仍然监测原始的 inode. 不会触发新 inode 的事件。这是所期望的行为。

`Filename` 参数

回调中提供 `filename` 仅支持 Linux 和 Windows. 即使在支持的平台上，也不能保证一直提供 `filename`. 因此不要假设 `回调` 中一直会提供 `filename` 参数，整一些为 null 时的逻辑。

```js 2.js
fs.watch('somedir', (eventType, filename) => {
    console.log(`event type is: ${eventType}`);
    if(filename){
        console.log(`filename provided: ${filename}`);
    }else{
        console.log(`filename not provided`);
    }
})
```

## fs.watchFile(filename[,options],listener)

`filename`          &lt;String&gt; | &lt;Buffer&gt;
`options`           &lt;Object&gt;
    `persistent`    &lt;Boolean&gt;
    `interval`      &lt;Integer&gt;
`listener`          &lt;Function&gt;

监测 `filename` 变化。每次访问文件时都会调用 `listener` 回调。

可以忽略 `options` 参数，如果提供了，就应该是个对象。`options` 对象可能包含一个 `persistent` 的布尔属性用于指出 whether the process should continue to run as long as files are being watched. `options` 对象还可能包含一个 `interval` 属性多少毫秒抽查目标。默认是 `{persistent: true, interval: 5007}`

`listener` 有两个参数，当前 stat 对象和前 stat 对象：

```js
fs.watchFile(`message.text`, (curr, prev) => {
    console.log(`the current mtime is: ${curr.mtime}`);
    console.log(`the previous mtime is: ${prev.mtime}`);
});
```

这些 stat 对象是 `fs.Stat` 实例。

如果你想让文件被修改而非访问时获得通知，你需要比较 `curr.mtime` 和 `prev.mtime`.

注意：当 `fs.watchFile` 操作造成 `ENOENT` 错误时，将会调用侦听者一次，所有的字段都被零化 (or, for dates, the Unix Epoch)。在 Windows 上，`blksize` 和 `blocks` 字段将会是 `undefined` 而非零化。如果稍后文件被创建，将会以最新的 stat 对象再次调用侦听者。这是自 v0.10 以来功能的一个变化。

注意：`fs.watch()` 比 `fs.watchFile()` 和 `fs.unwatchFile()` 更有效。应该尽可能用 `fs.watch` 而非 `fs.watchFile`  和 `fs.unwatchFile`.

## fs.write(fd,buffer,offset,length[,position],callback)

`fd`        &lt;Integer&gt;           //fd??
`buffer`    `&lt;String&gt;` | &lt;Buffer&gt;
`offset`    &lt;Integer&gt;
`length`    &lt;Integer&gt;
`position`  &lt;Integer&gt;
`callback`  &lt;Function&gt;

写 `buffer` 至 `fd` 指定的文件。

`offset` 决定要被写的的 buffer 部分, `length` 指定要写多少字节。

`position` 指从文件开头的偏移量，数据将被写至此处。如果 `typeof position !== 'number'` 那数据将被写至当前位置。见 `[pwrite(2)](http://man7.org/linux/man-pages/man2/pwrite.2.html)`

`callbac` 将被给三个参数 `(err, written, buffer)`，这里 `written` 指定 buffer 中有多少字节被写。

## fs.write(fd,data[,position],encoding]],callback)

`fd` &lt;Integer
`data` &lt;String&gt; | &lt;Buffer&gt;
`position` &lt;String&gt;
`encoding` &lt;String&gt;
`callback` &lt;Function&gt;

写 `data` 至 `fd` 指定的文件。如果 `data` 不是一个 Buffer 实例那值将被强制为一个字符串。

`position` 指从文件开头的偏移量，数据将被写至此处。如果 `typeof position !== 'number'` 那数据将被写至当前位置。见 `[pwrite(2)](http://man7.org/linux/man-pages/man2/pwrite.2.html)`

`encoding` 是期望的字符串编码。

回调将接收参数 `(err, written ,string)`, 这里 `where` 详细指明传递的字符串的多少字节要求被写。注意写的字节和字符串字符不是一回事。见 `Buffer.byteLength`.

不像写 `buffer`, 整个字符串被写。不可能指定子字符串。这是因为结果数据的字节偏移和字符串偏移不是一回事。

注意针对同一文件多将使用 `fs.write` 而不等回调是不安全的，对于此情形，强烈建议使用 `fs.createWriteStream`. //??

在 Linux 上，当文件处于追加模式时位置写不起作用。内核忽略位置参数并总是将数据追加至文件尾。

## fs.writeFile(file,data[,options],callback)

`file`      &lt;String&gt; | &lt;Buffer&gt; | &lt;Integer&gt; 文件名或文件描述符
`data`      &lt;String&gt; | &lt;Buffer&gt;
`options`   &lt;Object&gt; | &lt;String&gt;
    `encoding`  &lt;Object&gt; | &lt;String&gt; 默认 `utf8`
    `mode`      &lt;Integer&gt; | &lt;Null&gt; 默认 `0o666`
    `flag`      &lt;String&gt; 默认 `w`
`callback`      &lt;Function&gt;

异步写数据至一个文件，如果文件存在就替换掉。`data` 可以是字符串或 buffer.

如果 `data` 是 buffer, 将忽略 `encoding` 选项。其默认值是 `utf8`.

例子：

```js
fs.writeFile('message.txt', 'Hello Node.js', (err) => {
    if(err) throw err;
    console.log('It\'s saved!');
});
```

如果 `options` 是字符串，那他指定编码。如：

```js
fs.writeFile('message.txt', 'Hello Node.js', 'utf8', callback);
```

任何指定的文件描述符必须支持写。

注意针对同一文件多将使用 `fs.write` 而不等回调是不安全的，对于此情形，强烈建议使用 `fs.createWriteStream`. //??

注意：如果文件描述符指定为 `file`, 他将不会自自动关闭。

## fs.writeFileSync(file,data[,options])

`file`      &lt;String&gt; | &lt;Buffer&gt; | &lt;Integer&gt; 文件名或文件描述符
`data`      &lt;String&gt; | &lt;Buffer&gt;
`options`   &lt;Object&gt; | &lt;String&gt;
    `encoding`  &lt;String&gt; | &lt;Null&gt; 默认 `utf-8`
    `mode`      &lt;Integer&gt; 默认 `0o66`
    `flag`      &lt;String&gt; 默认 `w`

`fs.writeFile()` 的同步版本。返回 `undefined`.

## fs.writeSync(fd,buffer,offset,length[,position])

`fd`        &lt;Integer&gt;
`buffer`    &lt;String&gt; | &lt;Buffer&gt;
`offset`    &lt;Integer&gt;
`length`    &lt;Integer&gt;
`position`  &lt;Integer&gt;

## fs.writeSync(fd,data[,position[,encoding]])

`fd`        &lt;Integer&gt;
`data`      &lt;String&gt; | &lt;Buffer&gt;
`position`  &lt;Integer&gt;
`encoding`  &lt;String&gt;

`fs.write()` 的同步版。返回写的字节数量。

## FS Constants

以下常量被 `fs.constants` 暴露。注：并非所有系统上每个常量都可用

### File Access Constants

以下常量用于 `fs.access()`.

Constant            Description

`F_OK`              标志表示文件对调用线程可见

`R_OK`              标志表示文件可被调用线和读取

`W_OK`              标志表示文件可被调用线程写

`X_OK`              标志表示文件可被调用线程执行  //怎么执行？

### File Open Constants

以下常量用于 `fs.open()`.

`Constant`          Description

`O_RDONLY`          标志表示打开一个文件用于只读访问

`O_WRONLY`          标志表示打开一个文件用于只写访问

`O_RDWR`            标志表示打开一个文件用于读写访问

`O_CREAT`           标志表示如果文件不存在就创建文件

`O_EXCL`            标志表示如果设置了 O_CREAT 标志且文件存在则打开一个文件应该失败

`O_NOCTTY`          标志表示如果路径标识一个终端设备，打开路径不应该造成终疯变成进程的控制终端 (if the process does not already have one)

`O_TRUNC`           标志表示如果文件存在并且是常规文件，如果文件成功被打开用于写访问，其长度将被删节为0。

`O_APPEND`          标志表示数据将被追加至文件尾

`O_DIRECTORY`       标志表示如果路径不是目录打开失败

`O_NOATIME`         标志表示对文件系统的读访问将不在造成与文件关联的 `atime` 更新。这个标志只在 Linux 系统上可用。

`O_NOFOLLOW`        标志表示如果路径是一个符号链接则打开失败

`O_SYNC`            标志表示文件被打开用于同步 I/O

`O_SYMLINK`         标志表示打开符号链接本身而非他指向的资源

`O_DIRECT`          当设置时会尝试最小化文件 I/O 的缓存影响

`O_NONBLOCK`        标志表示当可能时以非阴塞模式打开文件

### File Type Constant

以下常量用于 `fs.Stat` 对象的 `mode` 属性用于决定一个文件的类型

Constant            Description

`S_IFMT`            用于抽取文件类型码的位屏蔽

`S_IFREG`           用于常规文件的文件类型常量

`S_IFDIR`           用于目录的文件类型常量

`S_IFCHR`           用于面向字符的设备文件的文件类型常量

`S_IFBLK`           用于面向块的设备文件的文件类型常量

`S_IFIFO`           用于一个 FIFO/pipe 的文件类型常量

`S_IFLNK`           用于符号链接的文件类型常量

`S_IFSOCK`          用于 socket 的文件类型常量

### File Mode Constants

以下常量用于 `fs.Stats` 对象的 `mode` 属性用于决定对一个文件的访问权限。

Constant            Description

`S_IRWXU`           文件模式表示由用户读、写和执行

`S_IRUSR`           文件模式表示由用户读

`S_IWUSR`           文件模式表示由用户写

`S_IXUSR`           文件模式表示由用户执行

`S_IRWXG`           文件模式表示由组读、写和执行

`S_IRGRP`           文件模式表示由组读

`S_IWGRP`           文件模式表示由组写

`S_IXGRP`           文件模式表示由组执行

`S_IWRXO`           文件模式表示由其他读、写和执行

`S_IROTH`           文件模式表示由其他读

`S_IWOTH`           文件模式表示由其他写

`S_IXOTH`           文件模式表示收其他执行
