
/**
`next-tick.ts` 文件的作用是为了在下一个 tick（事件循环）时执行回调函数。这个文件定义了一个函数 `nextTick`，它会根据浏览器不同情况（比如是否支持 Promise、MutationObserver 等）选择最优的方式来实现异步回调。

在整个 Vue 的 src 中，许多地方都使用了 `nextTick` 函数，例如在组件渲染时会通过 `nextTick` 来更新 DOM，还有在响应式数据变化时也会使用。

`next-tick.ts` 文件在整个 Vue 的源码中算是非常基础的部分，因为几乎所有异步相关的逻辑都要依赖它。其他文件中如果需要实现异步回调的话，通常会直接使用 `nextTick` 函数来处理。
 */
 



/**
在 Vue 的源码中，`next-tick.ts` 文件中包含了一些用于异步更新 DOM 的方法。其中，`MutationObserver` 是 Web API 中的一个对象，它可以观察指定节点的变化并在发生变化时执行特定的操作。

在 Vue 中，`nextTick` 方法会利用 `MutationObserver` 来异步更新 DOM，以提高性能和用户体验。具体来说，当需要更新 DOM 时，Vue 会将更新函数添加到一个队列中，并调用 `MutationObserver` 监听 DOM 变化事件。当 DOM 发生变化时，`MutationObserver` 会立即触发回调函数，此时 Vue 就会从队列中取出更新函数并执行，完成异步更新。

总之，`MutationObserver` 是 Vue 中使用的一种优化策略，它可以帮助我们在 DOM 变化时及时地执行更新函数，从而提高应用的性能和响应速度。
 */
 
/* globals MutationObserver */



/**
在Vue的源码中，`next-tick.ts`是一个工具函数模块，用于在下一次Tick时执行回调函数。

这个模块中导入了其他模块的函数，包括：
- `noop`：一个空函数，通常作为默认值或占位符使用。
- `handleError`：错误处理函数，用于在控制台输出错误信息。
- `isIE`、`isIOS`、`isNative`：判断当前环境是否为IE浏览器、iOS设备或原生JavaScript环境的函数。

这些函数是为`nextTick`函数提供支持的，`nextTick`函数将回调函数推入异步队列中，在下一次Tick时执行这些回调函数。如果在推入回调函数时发生错误，就会调用`handleError`函数进行处理，而环境判断函数则是为了兼容不同的浏览器和设备，保证`nextTick`函数在各种环境下都能正常工作。
 */
 
import { noop } from 'shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'



/**
在 Vue 中，nextTick 函数主要用于在 DOM 更新完毕后执行回调函数。而 next-tick.ts 文件中导出的 isUsingMicroTask 属性则用于判断当前浏览器环境是否支持 microtask，其值默认为 false。

什么是 microtask 呢？它是 JavaScript 引擎提供的一种任务调度机制，可以让回调函数在当前 执行栈为空时立即被调度执行。这与常规的 task 调度机制（如 setTimeout）不同，常规的 task 调度机制因为需要等待至少一个 event loop 才能执行，所以会有一定的延迟。

在使用 nextTick 函数时，如果浏览器环境支持 microtask，Vue 会优先选择使用 microtask 来调度回调函数的执行，否则才会使用常规的 task 调度机制。isUsingMicroTask 变量的作用就是用于记录当前浏览器环境是否支持 microtask，以便于 Vue 在运行过程中做出更优秀的性能和用户体验表现。
 */
 
export let isUsingMicroTask = false



/**
在Vue中，nextTick方法可以让我们在下次DOM更新完毕后执行一些操作。在实现过程中，会先将需要执行的回调函数存储到callbacks数组中，然后通过微任务或宏任务的方式等待当前任务队列执行完成后再进行回调。

而在next-tick.ts文件中，定义了一个常量callbacks，它是一个空数组，用来存储需要执行的回调函数。另外还定义了一个变量pending，用于记录是否有一个异步任务正在执行中。如果没有异步任务在执行，则会调用flushCallbacks方法，执行callbacks中的所有回调函数。

这个设计的目的是为了避免重复触发异步任务，如果有多个地方调用了nextTick方法，并传入了需要执行的回调函数，如果每次都立即触发异步任务，会增加不必要的开销和执行时间，因此在第一次调用nextTick方法时就将回调函数存储到callbacks数组中，等待当前任务队列执行完成后，再一次性地执行所有回调函数。
 */
 
const callbacks: Array<Function> = []
let pending = false



/**
这段代码是用来清空回调函数队列的。在Vue中，当我们执行一些异步操作时，例如使用 `Vue.nextTick()`、处理DOM更新等操作，它们实际上并不会立即执行，而是被放到一个回调函数队列里面。这个队列会在下一个事件循环时执行，通常是在下一个浏览器渲染周期开始之前。

为了确保这些回调函数总是能够被正确地执行，Vue维护了一个名为 `callbacks` 的数组，将要执行的回调函数添加到该数组中。在每个事件循环中，Vue都会检查当前是否有回调函数需要执行，并通过 `nextTick()` 函数进行调用。

但是，在某些情况下，这些回调函数可能无法正确执行，例如在组件销毁后仍然存在未执行的回调函数。因此，Vue提供了 `flushCallbacks()` 函数来强制执行回调函数队列，以确保所有回调函数都能得到执行。

该函数首先将 `pending` 标志设置为 `false`，表示此时没有待处理的回调函数。接着，它使用 `slice(0)` 复制整个回调函数数组，以便在执行回调函数期间可以安全地修改它。然后，它将 `callbacks` 数组清空，遍历复制出来的数组中的所有回调函数，并依次调用它们。

这样，就能确保所有回调函数得到了正确的执行，而不会出现某些回调函数无法正确执行的情况。
 */
 
function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}



/**
这段注释解释了Vue在不同版本中使用的异步处理方式。在Vue 2.5中，使用了宏任务(macro task)和微任务(micro task)的组合来实现异步处理。但是，在状态在重绘前发生变化时(例如 #6813、out-in transitions)，它存在微妙的问题。此外，在事件处理程序中使用(macrotask)任务会导致一些奇怪的行为，这些行为无法避免(例如#7109, #7153, #7546, #7834, #8109)。
因此，Vue现在再次在任何地方都使用微任务(microtask)。这种权衡的一个主要缺点是，在一些场景下，微任务的优先级过高，可能会在看似顺序的事件之间触发(例如#4521, #6690)，甚至在同一事件的冒泡之间(#6566)。
最后，timerFunc是一个全局变量，用于确定在当前环境中使用哪种异步处理方式。在浏览器中，timerFunc被设置为Promise.then()，在Node.js中，timerFunc被设置为process.nextTick()。
 */
 
// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
let timerFunc



/**
这段代码主要是关于Vue的异步更新机制实现的，它决定了在何时执行一些需要异步处理的任务，比如在nextTick中执行的回调函数。

Vue的异步更新机制是基于JavaScript的事件循环机制实现的。事件循环分为宏任务和微任务两种类型，而Vue在异步更新过程中主要使用微任务来处理DOM更新等操作。

在这段代码中，我们可以看到Vue利用了浏览器提供的两种微任务队列：Promise 和 MutationObserver。当 Promise 可用时，Vue 会优先使用 Promise.then 的方式来将 flushCallbacks 函数添加到下一个微任务中执行。而当 Promise 不可用但 MutationObserver 可用时，Vue 将使用 MutationObserver 来模拟一个微任务队列。等等，这里的 Promise 和 MutationObserver 有什么区别呢？

- Promise 通常被用来处理异步操作，它能够把异步任务添加到 JavaScript 引擎自带的微任务队列中，以便尽早地得到执行。
- MutationObserver 是浏览器提供的用于监听 DOM 变化的 API，也可以用来模拟微任务队列。MutationObserver 监听的是 DOM 树的变化，并且在每次 DOM 变化后通过回调函数通知相关的观察者。

需要注意的是，在某些浏览器中，MutationObserver 在移动端 touch 事件处理时会出现严重的 bug，导致队列停止工作。因此，为了兼容性和稳定性，Vue 会选择使用 Promise.then 作为微任务队列的实现方式。

如果同时不支持 Promise 和 MutationObserver 的话，则 Vue 会使用 setImmediate 或者 setTimeout 来模拟微任务队列。这两种方法都是宏任务，因此效率没有使用微任务高，但是作为兜底方案还是可以保证正常运行的。
 */
 
// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]')
) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}



/**
该模块主要实现了 Vue 中异步更新队列的核心逻辑，其中 `nextTick` 函数是在本轮事件循环结束之后执行的回调函数队列。

该函数有三个重载：

- `nextTick(): Promise<void>`：返回一个 Promise 对象，可以使用 async/await 或者 then/catch 进行链式调用。
- `nextTick<T>(this: T, cb: (this: T, ...args: any[]) => any): void`：在上下文为 this 的情况下推入一个回调函数到异步更新队列中。
- `nextTick<T>(cb: (this: T, ...args: any[]) => any, ctx: T): void`：将上下文设置为 ctx 推入一个回调函数到异步更新队列中。

当调用 `nextTick` 时，会将回调函数和上下文（如果有）推入到 callbacks 数组中，并将 pending 标志设置为 true ，表示下一轮事件循环需要执行回调函数。同时会执行 timerFunc 函数，在下一轮事件循环开始时，会遍历 callbacks 数组并依次执行其中的回调函数。

如果传入了一个函数而没有上下文，那么会判断当前环境是否支持 Promise，如果支持则返回一个 Promise 对象，否则返回 undefined。

如果在执行回调函数的过程中抛出异常，会调用 handleError 函数处理错误。

此外，该函数是对浏览器 API 的封装，它能够在不同环境下（如 Node.js）执行回调函数。
 */
 
export function nextTick(): Promise<void>
export function nextTick<T>(this: T, cb: (this: T, ...args: any[]) => any): void
export function nextTick<T>(cb: (this: T, ...args: any[]) => any, ctx: T): void
/**
 * @internal
 */
export function nextTick(cb?: (...args: any[]) => any, ctx?: object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e: any) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}


