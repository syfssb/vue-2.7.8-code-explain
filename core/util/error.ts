
/**
`./dist/src/core/util/error.ts` 文件主要定义了 Vue.js 在运行时遇到错误时所使用的一些错误处理工具函数。该文件的主要作用是提供了一些有用的错误信息提示方法，以方便在调试过程中定位问题。

该文件主要包含以下内容：

1. `assert(condition: boolean, message: string): void` 方法：用于判断某个条件是否成立，如果不成立则抛出一个错误并打印相应的错误信息。

2. `logError(err: Error, vm?: Component, info?: string): void` 方法：用于记录并打印错误信息，其中 `vm` 参数表示当前组件实例，`info` 参数表示错误信息的附加说明。

3. `globalHandleError(err: Error, vm?: Component, info?: string): void` 方法：用于全局处理错误，并将错误信息记录到控制台。

4. `handleError(err: Error, vm?: Component, info?: string): void` 方法：用于处理错误，并将错误信息记录到控制台。

除此之外，`./dist/src/core/util/error.ts` 文件还被其他相关的文件所引用，比如 `./dist/src/core/instance/init.ts` 和 `./dist/src/core/instance/index.ts` 等文件都使用了该文件中定义的一些方法。这些文件共同组成了 Vue.js 中的核心代码，它们通过相互调用和配合而实现 Vue.js 的完整功能。
 */
 



/**
在Vue的核心代码中，./dist/src/core/util/error.ts是一个错误处理的工具函数集合。这个文件导入了一些其他的工具函数，并且定义了一些用于处理错误的方法。

让我们逐行解释：

```javascript
import config from '../config'
```

这行代码导入了Vue的全局配置对象，在这里可以获取Vue实例的默认属性和方法等。

```javascript
import { warn } from './debug'
```

这行代码导入了Vue的调试工具函数之一-警告(warn)函数。这个函数在应用程序开发期间可能会用到，它用于提醒开发者一些错误或不规范的代码写法。

```javascript
import { inBrowser } from './env'
```

这个文件还导入了Vue内部另一个工具函数inBrowser，以判断当前是否在浏览器环境中执行Vue代码。

```javascript
import { isPromise } from 'shared/util'
```

这个文件还导入了Vue共享的工具函数isPromise，它用于检查传递的参数是否为一个Promise对象。

```javascript
import { pushTarget, popTarget } from '../observer/dep'
```

最后，这个文件还导入了Vue内部定义观察者模式相关的方法pushTarget和popTarget。这些方法用于在实现响应式数据的过程中追踪依赖关系。在响应式数据的更新中，通过这些方法将Watcher(观察者)对象压入和弹出栈中，以实现观察者和依赖项之间的映射关系。
 */
 
import config from '../config'
import { warn } from './debug'
import { inBrowser } from './env'
import { isPromise } from 'shared/util'
import { pushTarget, popTarget } from '../observer/dep'



/**
这段代码的作用是处理Vue应用程序中的错误。当应用程序出现错误时，它会接收到一个Error对象、Vue实例vm以及关于错误的信息。函数首先调用pushTarget()函数，该函数是为了在处理错误处理程序时停止依赖追踪，以避免可能的无限渲染。然后，如果传入了vm实例，则会遍历它的所有父级组件，寻找是否有定义了errorCaptured生命周期钩子。如果找到了这个钩子，则会逐个调用它，并传入err, vm和info参数。如果其中任何一个钩子返回false，则表示该钩子已经处理了错误，并且不需要继续传递给更高层次的父级组件。如果没有错误钩子捕获错误，则会调用globalHandleError()函数来处理错误，并传入err, vm和info参数。最后，无论如何，都会调用popTarget()函数来恢复依赖追踪。
 */
 
export function handleError(err: Error, vm: any, info: string) {
  // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
  // See: https://github.com/vuejs/vuex/issues/1505
  pushTarget()
  try {
    if (vm) {
      let cur = vm
      while ((cur = cur.$parent)) {
        const hooks = cur.$options.errorCaptured
        if (hooks) {
          for (let i = 0; i < hooks.length; i++) {
            try {
              const capture = hooks[i].call(cur, err, vm, info) === false
              if (capture) return
            } catch (e: any) {
              globalHandleError(e, cur, 'errorCaptured hook')
            }
          }
        }
      }
    }
    globalHandleError(err, vm, info)
  } finally {
    popTarget()
  }
}



/**
这段代码定义了一个函数`invokeWithErrorHandling`，用于执行函数并捕获其可能抛出的错误。该函数接受五个参数：

- `handler`：要执行的函数。
- `context`：执行上下文，即函数执行时的`this`值。
- `args`：传递给函数的参数。
- `vm`：Vue实例对象。
- `info`：额外的错误信息。

函数主要做两件事情：

1. 尝试执行`handler`函数，并将返回值赋值给`res`变量。
2. 如果函数执行过程中抛出了错误，则调用`handleError`函数处理错误。`handleError`函数是Vue内部定义的错误处理函数，它会将错误打印到控制台并抛出错误以终止程序运行。

此外，函数还包含以下步骤：

- 如果函数返回值不为null、不是Vue实例且是Promise对象，那么会为该Promise对象添加一个catch回调函数用于处理Promise异步操作的错误。
- 避免在嵌套调用中多次触发catch回调函数的问题。
 */
 
export function invokeWithErrorHandling(
  handler: Function,
  context: any,
  args: null | any[],
  vm: any,
  info: string
) {
  let res
  try {
    res = args ? handler.apply(context, args) : handler.call(context)
    if (res && !res._isVue && isPromise(res) && !(res as any)._handled) {
      res.catch(e => handleError(e, vm, info + ` (Promise/async)`))
      // issue #9511
      // avoid catch triggering multiple times when nested calls
      ;(res as any)._handled = true
    }
  } catch (e: any) {
    handleError(e, vm, info)
  }
  return res
}



/**
这段代码定义了一个全局的错误处理函数 `globalHandleError`，主要是用于处理在 Vue 应用程序中抛出的未被捕获的异常。这个函数接收三个参数：

- `err`：表示抛出的异常对象。
- `vm`：表示当前实例（组件）。
- `info`：表示一个字符串，包含有关组件的渲染和更新过程的信息。

首先，它判断是否配置了全局的错误处理器 `config.errorHandler`，如果有，则调用该处理器并传入 `err`、`vm` 和 `info` 三个参数，如果没有则会直接执行 `logError(err, vm, info)` 函数，将错误打印到控制台中。

另外，为了防止在错误处理器中再次抛出错误导致死循环，代码中使用了 try...catch 来捕获错误处理器中的异常，并且判断如果捕获的异常不等于原始异常 `err`，就会再次调用 `logError` 函数将异常信息打印到控制台中。
 */
 
function globalHandleError(err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e: any) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
        logError(e, null, 'config.errorHandler')
      }
    }
  }
  logError(err, vm, info)
}



/**
这段代码定义了一个名为 `logError` 的函数，用于在开发模式下记录错误信息并在非浏览器环境中抛出错误。

具体解释如下：

1. `logError` 函数接收三个参数：`err` 表示错误对象，`vm` 表示 Vue 实例，`info` 表示错误的更详细描述。

2. 如果当前是开发模式（通过全局变量 `__DEV__` 判断），则使用 `warn` 函数输出错误信息到控制台。`warn` 函数是一个日志输出函数，用于输出警告信息。第一个参数表示需要输出的信息字符串，第二个参数表示关联的 Vue 组件实例。

3. 接着判断当前是否为浏览器环境，并且是否存在 `console` 对象。如果条件成立，则使用 `console.error` 输出错误信息到控制台。

4. 如果当前不是浏览器环境或不存在 `console` 对象，则直接抛出错误对象 `err`。这将引发异常并停止代码执行。

总之，`logError` 函数的作用是在开发模式下输出错误信息，同时在非浏览器环境下抛出错误。这有助于调试和修复代码错误。
 */
 
function logError(err, vm, info) {
  if (__DEV__) {
    warn(`Error in ${info}: "${err.toString()}"`, vm)
  }
  /* istanbul ignore else */
  if (inBrowser && typeof console !== 'undefined') {
    console.error(err)
  } else {
    throw err
  }
}


