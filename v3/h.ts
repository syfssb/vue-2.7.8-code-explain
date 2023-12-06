
/**
`./dist/src/v3/h.ts` 文件是 Vue.js 3.0 版本中的 `h` 函数所在文件。在 Vue.js 中，`h` 函数被用来创建虚拟 DOM 节点（VNode）。通过使用 `h` 函数，我们可以在 JavaScript 中编写组件的模板，并最终将其编译为真正的 DOM 树。

`h` 函数实现了一个 DSL（Domain Specific Language）：它允许我们以简洁且易于阅读的方式描述组件的结构，而无需深入了解 HTML 的细节。这个函数接收三个参数：

- 标签名或组件选项
- 可选的 props 对象
- 子节点数组

Vue.js 中的大部分核心功能都依赖于 `h` 函数，例如模板编译、渲染函数、vdom 等等。因此，`h.ts` 文件是整个 Vue.js 中非常重要的一个文件。

需要注意的是，`h.ts` 文件实际上位于 `packages/runtime-core/src/` 目录下，而不是 `dist/src/v3/`。`dist` 目录下的代码是经过打包和压缩后的版本，用于发布给用户使用。
 */
 



/**
首先，需要说明一下，这段代码是Vue3的源码，和Vue2.7.8有所不同。

那么，关于这段代码的解释：

1. `import { createElement } from '../core/vdom/create-element'`

这行代码导入了Vue3中创建虚拟DOM节点的方法`createElement`。实际上，在Vue3中，`vdom`模块已经被整合到`core`模块中了。

2. `import { currentInstance } from './currentInstance'`

这行代码导入了当前组件实例的变量`currentInstance`。在Vue3中，每个组件都可以通过调用`getCurrentInstance()`方法获取到自身实例对象，而`currentInstance`则是一个全局唯一的变量，保存了当前组件的实例对象。

3. `import { warn } from 'core/util'`

这行代码导入了Vue3中的警告函数`warn`，该函数在开发过程中被广泛使用，用于提示开发者一些常见的问题或错误。

综上所述，这段代码主要是为了导入Vue3中一些常见的工具函数和变量，方便其他模块和组件调用和使用。
 */
 
import { createElement } from '../core/vdom/create-element'
import { currentInstance } from './currentInstance'
import { warn } from 'core/util'



/**
这段代码定义了一个名为 `h` 的函数，它是用来创建虚拟 DOM 节点的。其中的 `createElement` 函数是 Vue 内部使用的创建真正的 DOM 节点的函数，而 `h` 函数则是对其进行了一层封装，使得用户可以更加方便地创建虚拟节点。

这个函数有三个参数：

1. type：表示节点的类型，可以是字符串（如 'div'、'span'）或组件对象。
2. props：表示节点的属性，通过对象传递进来。
3. children：表示节点的子节点，可以是一个数组或者单个节点。如果没有子节点，可以传递 undefined 或 null。

此外，这里还有一个判断当前是否有活动实例的语句，如果没有则会发出警告。这是因为 Vue.js 是基于组件的，只有在组件的生命周期钩子函数或 render 函数中才能访问到组件实例（即 this）。如果在其他地方调用 h 函数，则说明这个函数不在组件中被调用，可能会导致问题，所以需要发出警告提醒用户。
 */
 
/**
 * @internal this function needs manual public type declaration because it relies
 * on previously manually authored types from Vue 2
 */
export function h(type: any, props?: any, children?: any) {
  if (!currentInstance) {
    __DEV__ &&
      warn(
        `globally imported h() can only be invoked when there is an active ` +
          `component instance, e.g. synchronously in a component's render or setup function.`
      )
  }
  return createElement(currentInstance!, type, props, children, 2, true)
}


