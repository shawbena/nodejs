# JavaScript typed arrays

JavaScript 类型化的数组 (typed array) 是类似数组的对象。并提供访问原始二进制数据的机制。正如你可能知道的 [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) 对象可动态增长或收缩且可以存放任何 JavaScript 值。JavaScript 引擎执行优化，所以这些数组很快。然而随着 web 应用越来越强大，添加如音频和视频处理这样的特色，使用 WebSockets 访问原始数据等等。用 JavaScript 代码快速且容易处理以类型化的数组处理原始数组会有帮助的时候。

然而，不要将类型化的数组与正常数组混淆，对类型化的数组调用 [Array.isArray()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray) 返回 `false`. 而且并不是所有正常数组支持的方法类型数组都支持 (e.g. push and pop).

## Buffers and views: typed array architecture