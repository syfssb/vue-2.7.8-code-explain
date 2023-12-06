
/**
`./dist/src/core/instance/render.ts` 文件是 Vue.js 核心库中的一个模块，它主要负责定义Vue实例中的渲染函数，即将数据渲染成真实的DOM节点。

在 `render.ts` 中，主要包含了以下几个部分：

1. **定义 createRenderContext 方法**：该方法用于创建渲染上下文对象，其中包含了一些渲染相关的配置信息和钩子函数。
2. **定义 renderMixin 方法**：该方法主要用于给 Vue 实例增加 $nextTick、_render 方法以及 $mount 方法等属性和方法，通过这些方法我们可以完成 Vue 实例的挂载和渲染流程。
3. **定义 _createElement 方法**：该方法用于创建 VNode 节点，并对其进行属性和事件绑定等操作，最终返回这个 VNode 对象。
4. **定义 renderStatic 方法**：该方法用于处理静态节点，将其转化为常量并缓存起来，避免重复渲染浪费性能。
5. **定义 installRenderHelpers 方法**：该方法主要用于把一些渲染相关的公共方法混入到 Vue.prototype 中，方便调用。

`./dist/src/core/instance/render.ts` 文件作为 Vue.js 核心库中的一个模块，在整个 Vue.js 源码中扮演着至关重要的角色。它定义了 Vue 实例的渲染函数，是整个 Vue.js 应用的渲染引擎核心所在。同时，在 Vue.js 源码中，`./dist/src/core/instance/render.ts` 也会和其他模块进行交互，比如和 `./dist/shared/util.ts` 模块一起使用，实现了 Vue 实例的 $nextTick 方法；和 `./dist/src/core/instance/lifecycle.ts` 模块一起使用，实现了 Vue 生命周期钩子函数等。
 */
 



/**
首先需要说明的是，Vue的源码非常庞大，而 `render.ts` 是 Vue 的核心之一，它主要实现了 Vue 实例的渲染功能。

在 `render.ts` 中，这里使用了 ES6 的模块化语法，通过 `import` 关键字引入了 Vue 的一些工具函数和工具类。具体解释如下：

1. `warn` 函数：Vue 内部用来输出警告信息的函数
2. `nextTick` 函数：Vue 提供的异步操作工具，可以让我们在下次 DOM 更新循环结束后执行指定操作（通常用于更新 UI 后执行某些逻辑）
3. `emptyObject` 对象：一个空对象，用于充当空数据的占位符
4. `handleError` 函数：用来处理错误的函数
5. `defineReactive` 函数：Vue 数据双向绑定的核心函数，通过该函数可以将一个普通 JavaScript 对象转换成响应式对象
6. `isArray` 函数：判断是否为数组的工具函数

这些工具函数和工具类在 Vue 源码中经常被引用，它们在实现 Vue 内部逻辑时起到了关键作用，熟悉这些函数和类会有助于我们更好地理解 Vue 的内部实现原理。
 */
 
import {
  warn,
  nextTick,
  emptyObject,
  handleError,
  defineReactive,
  isArray
} from '../util/index'



/**
这段代码主要是导入了一些Vue渲染相关的库和工具函数，以便在渲染组件时使用。

- `createElement`：从`../vdom/create-element`中导入，用于创建虚拟节点（也就是VNode）的函数。
- `installRenderHelpers`：从`./render-helpers/index`中导入，包含了一系列辅助函数，比如`renderList`、`toString`等。
- `resolveSlots`：从`./render-helpers/resolve-slots`中导入，用于解析插槽内容的函数。
- `normalizeScopedSlots`：从`../vdom/helpers/normalize-scoped-slots`中导入，用于规范化具有作用域的插槽（scoped slots）的函数。
- `VNode`和`createEmptyVNode`：从`../vdom/vnode`中导入，分别表示VNode类和创建空白VNode的函数。

这些函数和类是Vue在渲染模板时所需要的基础设施。其中，`createElement`函数是最核心的部分，它可以根据传入的参数构建出一个VNode对象，这个VNode对象描述了DOM节点的信息，包括节点类型、属性、子节点等。其他的函数则是为了更方便地处理VNode而存在的辅助函数，例如`resolveSlots`用于处理插槽内容，`normalizeScopedSlots`用于处理带有作用域的插槽内容。最后，`VNode`和`createEmptyVNode`则是Vue内部用于描述组件树的节点类和创建空白节点的函数。
 */
 
import { createElement } from '../vdom/create-element'
import { installRenderHelpers } from './render-helpers/index'
import { resolveSlots } from './render-helpers/resolve-slots'
import { normalizeScopedSlots } from '../vdom/helpers/normalize-scoped-slots'
import VNode, { createEmptyVNode } from '../vdom/vnode'



/**
1. `isUpdatingChildComponent`函数：这是一个来自于`./lifecycle`模块的函数，用于判断当前组件是否正在更新子组件。在Vue中，当父组件更新时，它会递归地更新所有的子组件。该函数帮助Vue判断当前是否在更新子组件，以便做出不同的操作。

2. `Component`类型：这是一个类型别名，定义了Vue组件的类型。在Vue中，每个组件都是一个对象，它具有一些生命周期钩子和选项属性，如数据、计算属性、方法等。

3. `setCurrentInstance`函数：这是一个来自于`v3/currentInstance`模块的函数，用于设置当前实例（即当前组件）。

4. `syncSetupSlots`函数：这是一个来自于`v3/apiSetup`模块的函数，用于同步设置插槽。

在该文件中，我们可以看到这些函数和类型被导入，然后被用于实现Vue组件渲染的一些逻辑。特别地，`setCurrentInstance`函数在整个Vue源码中被广泛使用，它用于在组件之间传递当前组件实例信息，从而支持一些高级功能（如provide/inject）。
 */
 
import { isUpdatingChildComponent } from './lifecycle'
import type { Component } from 'types/component'
import { setCurrentInstance } from 'v3/currentInstance'
import { syncSetupSlots } from 'v3/apiSetup'



/**
这段代码是 Vue 实例渲染相关的初始化函数 `initRender`。它主要做了以下几件事情：

1. 置空 `_vnode` 和 `_staticTrees`，这两个属性都与虚拟 DOM 相关，其中 `_vnode` 表示当前 Vue 实例所渲染的根节点的虚拟节点，`_staticTrees` 表示使用 `v-once` 缓存的静态子树。

2. 获取 `vm.$options` 对象，该对象包含了实例构造函数中的选项参数，如 `data`、`methods`、`computed` 等等。

3. 获取 `_parentVnode`，即父虚拟节点，用于获取插槽信息和作为渲染上下文。

4. 根据父虚拟节点获取渲染上下文，即 `renderContext`，用于解析插槽内容。

5. 解析 `vm.$slots`，即获取插槽内容并保存到 `$slots` 属性中。

6. 解析 `vm.$scopedSlots`，即获取自定义作用域插槽，并保存到 `$scopedSlots` 属性中。

7. 绑定虚拟 DOM 渲染函数 `createElement`，并将其赋值给 `_c` 和 `$createElement` 两个属性，以供组件在渲染时调用。

总体来说，`initRender` 函数的作用是为 Vue 实例提供渲染相关的基础数据，为后续的渲染工作打下基础。
 */
 
export function initRender(vm: Component) {
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null // v-once cached trees
  const options = vm.$options
  const parentVnode = (vm.$vnode = options._parentVnode!) // the placeholder node in parent tree
  const renderContext = parentVnode && (parentVnode.context as Component)
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = parentVnode
    ? normalizeScopedSlots(
        vm.$parent!,
        parentVnode.data!.scopedSlots,
        vm.$slots
      )
    : emptyObject
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  // @ts-expect-error
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  // @ts-expect-error
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)



/**
这段代码的作用是在Vue实例渲染时，将父组件传递给子组件的属性和事件监听器暴露出来，以便于高阶组件(HOC)的创建。

`$attrs` 和 `$listeners` 是Vue实例中两个重要的对象。`$attrs` 对象包含了父组件传递给子组件的所有非prop属性，而 `$listeners` 对象包含了父组件传递给子组件的所有事件监听器。

由于HOC需要使用这些属性和事件监听器，因此它们需要是响应式的。这样只要父组件传递的属性或事件发生变化，子组件就能够立即更新。

在这段代码中，`parentVnode` 是指父组件所对应的虚拟节点。如果当前组件有父组件，则获取其数据对象(`parentData`)，包含当前组件从父组件继承下来的属性和事件监听器，并将其赋值给子组件。如果当前组件没有父组件，则`parentData`为null。
 */
 
  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  const parentData = parentVnode && parentVnode.data



/**
这段代码主要是在Vue实例创建的时候定义响应式属性$attrs和$listeners，用于处理父组件传递给子组件的非props和非native事件监听器。

首先判断当前是不是开发环境（__DEV__），如果是开发环境，则调用defineReactive方法将vm.$attrs和vm.$listeners定义为响应式属性，并且在属性值变化时会触发一个回调函数，该回调函数会检测是否正在更新子组件，如果不是则会输出一个警告信息。

如果不是开发环境，则同样调用defineReactive方法定义vm.$attrs和vm.$listeners为响应式属性，但是不会添加回调函数。参数parentData是父组件传递给子组件的数据，emptyObject是一个空对象。options._parentListeners是Vue实例选项中的_parentListeners属性值，也就是父组件传递给子组件的事件监听器对象，如果没有则使用空对象。

这里的defineReactive方法是Vue内部的方法，用来将一个对象的属性定义为响应式属性，当该属性变化时会自动触发更新。参数vm是Vue实例，key是属性名，value是属性值，setter是在属性变化时触发的回调函数，deep表示是否进行深度观察。
 */
 
  /* istanbul ignore else */
  if (__DEV__) {
    defineReactive(
      vm,
      '$attrs',
      (parentData && parentData.attrs) || emptyObject,
      () => {
        !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
      },
      true
    )
    defineReactive(
      vm,
      '$listeners',
      options._parentListeners || emptyObject,
      () => {
        !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
      },
      true
    )
  } else {
    defineReactive(
      vm,
      '$attrs',
      (parentData && parentData.attrs) || emptyObject,
      null,
      true
    )
    defineReactive(
      vm,
      '$listeners',
      options._parentListeners || emptyObject,
      null,
      true
    )
  }
}



/**
在Vue的渲染过程中，我们需要知道当前正在被渲染的组件实例。在 ./dist/src/core/instance/render.ts 中，Vue 定义了一个全局变量 currentRenderingInstance 来存储当前正在被渲染的组件实例。它的类型是 Component 或 null。

这个变量主要用来支持 Vue 2.x 版本的模板渲染机制。当渲染模板时，Vue 会将模板中的指令和表达式转换成一个个函数，在执行这些函数之前，会先设置 currentRenderingInstance 变量为当前正被渲染的组件实例，以便这些函数能够访问到组件实例的数据和方法。

举个例子，假设有如下模板：

```html
<template>
  <div>{{ message }}</div>
</template>
```

当渲染这个模板时，Vue 会将它转换成如下代码：

```js
with(this) {
  return _c('div', [_v(_s(message))])
}
```

其中的 with(this) 就是为了确保在执行 _c 和 _v 函数时能够访问到组件实例的数据和方法。而这个 this 实际上就是 currentRenderingInstance 变量所指向的组件实例。
 */
 
export let currentRenderingInstance: Component | null = null



/**
该段代码的作用是为了测试代码而添加的，它导出了一个函数 `setCurrentRenderingInstance`，该函数接受一个参数 `vm`，即组件实例对象。这个函数会将传入的组件实例对象作为当前正在渲染的组件实例对象，赋值给 `currentRenderingInstance` 变量。

在 Vue.js 中，每当某个组件实例对象需要进行渲染时，Vue.js 就会创建一个新的 VNode 节点，并对其进行更新，最终将这些 VNode 节点转换成真正的 DOM 元素显示在页面上。在这个过程中，Vue.js 需要知道当前正在渲染的组件实例对象是哪个，以便于在处理组件的生命周期钩子函数、计算属性等时能够正确地获取到当前组件实例对象的上下文信息。

因此，在测试 Vue.js 的渲染效果时，我们可以使用 `setCurrentRenderingInstance` 函数指定当前正在渲染的组件实例对象，以便于在测试代码中能够正确地模拟组件的生命周期钩子函数、计算属性等逻辑。
 */
 
// for testing only
export function setCurrentRenderingInstance(vm: Component) {
  currentRenderingInstance = vm
}



/**
在Vue源码中，renderMixin函数是Vue构造函数的一个成员方法。它主要做了两个事情：

1. 安装运行时辅助函数

这一步是通过调用installRenderHelpers函数实现的。这些运行时辅助函数是为了方便在渲染过程中使用的，例如：_c、_v、_s等。这些函数是在Vue.prototype上定义的，因此我们需要将这些函数添加到Vue.prototype中。

2. 添加render函数

这一步是给Vue.prototype添加一个render函数。render函数是用来生成虚拟DOM的核心函数，它返回一个VNode节点树，描述了页面中对应组件的结构。

总之，renderMixin函数的作用就是将Vue.prototype上定义的一些运行时辅助函数和render函数进行整合，以便后续在Vue实例化时能够使用它们。
 */
 
export function renderMixin(Vue: typeof Component) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype)



/**
Vue.prototype.$nextTick 是 Vue 实例对象的一个方法，用于在下次 DOM 更新循环结束之后执行回调函数。该方法接受一个函数参数 fn ，它会在 Vue 实例的上下文中被调用。

nextTick 函数实际上是从 Vue 的全局 API 中导入的一个方法，并且它被传递了两个参数：fn 表示回调函数，this 表示 Vue 实例对象本身。当 nextTick 函数被调用时，这个函数就会将 fn 回调函数和当前的 Vue 实例对象作为参数传递给 Vue 内部的队列机制，等待下一次 DOM 更新循环结束后执行。 

因此，Vue.prototype.$nextTick 方法可以让我们在 DOM 更新完毕之后执行某些操作，比如更新数据之后立即获取修改后的 DOM 元素的几何信息。
 */
 
  Vue.prototype.$nextTick = function (fn: (...args: any[]) => any) {
    return nextTick(fn, this)
  }



/**
`Vue.prototype._render` 是 Vue 实例上的一个方法，其作用是将组件渲染成虚拟 DOM 树，并返回一个 VNode 对象。这个方法是在初始化 Vue 实例时定义的。

在这个方法内部，首先获取了当前 Vue 实例（即调用 _render 方法的实例）并保存到 vm 变量中。接下来，从该实例的 $options 中解构出 render 和 _parentVnode 两个属性。

其中，render 是用于渲染组件的函数，它可以是 template 或者 JSX 语法转换后生成的 VNode 结构。而 _parentVnode 则是当前组件的父级 vnode，它在组件渲染时被用来设置占位符元素的上下文信息和插槽内容等。

最终，Vue 会调用 vm.\$createElement 方法来创建 VNode 对象，然后再通过递归调用子组件的 _render 方法将整个组件树渲染为虚拟 DOM 树，最终将其返回。
 */
 
  Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options



/**
这段代码的作用是在组件渲染过程中，更新父级作用域插槽和子组件插槽的值。

首先，判断当前组件实例是否已经挂载（即调用过 `$mount()` 方法），并且该组件有父级 VNode（即当前组件是子组件）。如果满足条件，则执行以下操作：

1. 通过 normalizeScopedSlots 方法，将父级作用域插槽、子组件插槽以及当前实例的作用域插槽合并成一个新的作用域插槽对象，并赋值给 vm.$scopedSlots。

2. 如果当前组件存在 `vm._slotsProxy` 对象，则调用 syncSetupSlots 方法，将 vm.$scopedSlots 中的插槽函数重新绑定到 `_slotsProxy` 对象上。这个 `_slotsProxy` 对象是一个响应式代理对象，用于访问子组件插槽内容时进行数据劫持。

总的来说，这段代码的作用是在组件渲染时，更新父子组件之间的作用域插槽内容。
 */
 
    if (_parentVnode && vm._isMounted) {
      vm.$scopedSlots = normalizeScopedSlots(
        vm.$parent!,
        _parentVnode.data!.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      )
      if (vm._slotsProxy) {
        syncSetupSlots(vm._slotsProxy, vm.$scopedSlots)
      }
    }



/**
这段代码是Vue的渲染函数，它的作用是将虚拟DOM渲染成真实DOM或字符串，并返回一个VNode节点（虚拟DOM节点）。

首先，代码设置了当前组件实例的$parent属性为传入的_parentVnode，这个属性用于在渲染函数中访问父组件的数据。接着，代码尝试执行渲染函数，如果渲染函数出错，则会调用handleError函数进行错误处理，如果定义了renderError选项，则会执行该选项，否则返回之前的虚拟DOM节点vm._vnode。代码最后对渲染结果进行处理，如果只有一个子节点，则返回该子节点，否则返回一个空的VNode节点。

在try代码块中，setCurrentInstance(vm)将当前正在渲染的组件设置为vm，currentRenderingInstance也被设置为vm，从而确保在组件嵌套时能够正确地跟踪当前渲染实例。然后，代码调用渲染函数render.call()，其中vm._renderProxy是渲染代理对象，vm.$createElement是创建虚拟DOM节点的函数。最后，通过返回的VNode节点来构建DOM树。

总之，这段代码负责将虚拟DOM节点渲染成真实的DOM节点，并且在渲染过程中跟踪当前的渲染实例。
 */
 
    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode!
    // render self
    let vnode
    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      setCurrentInstance(vm)
      currentRenderingInstance = vm
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e: any) {
      handleError(e, vm, `render`)
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if (__DEV__ && vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(
            vm._renderProxy,
            vm.$createElement,
            e
          )
        } catch (e: any) {
          handleError(e, vm, `renderError`)
          vnode = vm._vnode
        }
      } else {
        vnode = vm._vnode
      }
    } finally {
      currentRenderingInstance = null
      setCurrentInstance()
    }
    // if the returned array contains only a single node, allow it
    if (isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0]
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (__DEV__ && isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
            'should return a single root node.',
          vm
        )
      }
      vnode = createEmptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
  }
}


