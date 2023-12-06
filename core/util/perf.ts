
/**
`./dist/src/core/util/perf.ts` 文件的作用是为 Vue.js 提供性能指标，可以通过调用 `Vue.perf.start()` 和 `Vue.perf.end()` 函数来记录代码执行时间，并且可以提供一些工具来帮助我们分析这些数据，从而定位潜在的性能问题。

具体来说，该文件定义了一个名为 `perf` 的对象，它包含了一系列与性能相关的方法和属性。其中，`start()` 和 `end()` 方法主要用于记录代码执行时间，`mark()` 方法则用于添加一个可选的标记，方便后续的性能分析。此外，还有一些其他的方法和属性，例如 `reset()` 用于重置所有性能指标，`measure()` 用于测量两个标记之间的耗时，以及 `enableTracking()` 和 `disableTracking()` 用于启用或禁用性能跟踪。

在整个 Vue.js 源码中，`./dist/src/core/util/perf.ts` 文件被广泛使用，特别是在一些需要性能优化的场景中，例如渲染、响应式等核心功能中都有使用。同时，在开发过程中，也可以通过 `Vue.config.performance = true` 来启用性能追踪，从而更加方便地对代码进行分析和优化。
 */
 



/**
在Vue源码中，./dist/src/core/util/perf.ts是一个性能监测的模块。其中，import { inBrowser } from './env'语句的作用是将当前环境是否是浏览器的结果导入到perf.ts模块中。

具体来说，./dist/src/core/util/env.ts是一个工具方法模块，里面定义了一些跟环境相关的工具方法和变量。其中inBrowser变量是一个布尔值，表示当前运行的环境是否是浏览器，在通过import { inBrowser } from './env'导入时，它会返回一个true或false的布尔值。

在./dist/src/core/util/perf.ts中，根据inBrowser变量的值，可以决定是否启用性能监测功能，以避免在非浏览器环境下出现错误。因此，这个import语句的作用是为了保证在浏览器环境下才使用性能监测功能。
 */
 
import { inBrowser } from './env'



/**
在Vue的源码中，./dist/src/core/util/perf.ts文件是用来处理性能测试的。它主要使用了浏览器自带的performance API，提供了一些简单易用的方法让我们可以更好地测试应用的性能。

其中`mark`和`measure`是performance API提供的两个方法，用于测量代码执行时间。在Vue中，这两个方法被封装成了全局可访问的变量，在需要对某个操作进行性能测试时，我们可以通过调用`mark`方法在特定位置打上标记，再通过调用`measure`方法来计算两个标记之间的耗时。

具体来说，`mark`方法的作用是在代码中的某个位置打上一个时间戳，在代码执行过程中可以多次调用该方法打上多个不同的时间戳。而`measure`方法的作用是计算位于两个标记之间的时间差，并返回这个时间差值。

示例代码：

```typescript
// 打上第一个时间戳
mark('start')

// 需要被测试的代码
for (let i = 0; i < 100000; i++) {
  // do something
}

// 打上第二个时间戳
mark('end')

// 计算耗时并输出结果
console.log(measure('test', 'start', 'end'))
```

这段代码会在开始处打上一个名为`start`的时间戳，在循环结束处打上一个名为`end`的时间戳，然后通过`measure`方法计算它们之间的耗时，并以`test`为名称输出结果。
 */
 
export let mark
export let measure



/**
这段代码主要用于性能监控，在开发环境下（__DEV__为true），通过判断是否存在window.performance对象以及其相关方法，决定是否定义mark和measure两个函数。

其中，mark函数是用于在时间轴上标记一个时间点，而measure函数则是用于测量两个时间点之间的时间差，并记录该时间差的名称。在这里，当测量完成后，还会通过perf.clearMarks清除标记，以便后续重新使用该标记。

需要注意的是，由于tslint规则的限制，这里使用了@ts-ignore注释来忽略typescript的警告信息。
 */
 
if (__DEV__) {
  const perf = inBrowser && window.performance
  /* istanbul ignore if */
  if (
    perf &&
    // @ts-ignore
    perf.mark &&
    // @ts-ignore
    perf.measure &&
    // @ts-ignore
    perf.clearMarks &&
    // @ts-ignore
    perf.clearMeasures
  ) {
    mark = tag => perf.mark(tag)
    measure = (name, startTag, endTag) => {
      perf.measure(name, startTag, endTag)
      perf.clearMarks(startTag)
      perf.clearMarks(endTag)
      // perf.clearMeasures(name)
    }
  }
}


