
/**
`./dist/src/v3/apiSetup.ts` 文件是 Vue3 的用户 API 入口文件，它提供了一系列的函数，可以通过它们来创建 Vue 实例、全局组件、指令、混入等等。这些函数都是调用内部封装好的函数，并且会暴露出一些全局 API 和方法。

在整个 Vue3 源码中，`apiSetup.ts` 文件起到了连接桥梁的作用。它连接着内部核心函数和外部用户可见的 API，负责将用户传进来的参数进行处理，并最终调用内部的函数来完成相应的任务。

此外，`apiSetup.ts` 还与其他一些文件有很密切的关系，比如 `component.ts` 用于处理组件相关逻辑，`directive.ts` 用于处理指令相关逻辑等等，这些文件都是由 `apiSetup.ts` 来调用。

总之，`apiSetup.ts` 文件在 Vue3 中扮演着非常重要的角色，它是 Vue3 的用户 API 入口，也是 Vue3 内部各个模块之间的纽带。
 */
 



/**
这段代码主要是导入了一些Vue框架中的模块和函数，下面对每一个导入的模块进行解释：

1. `Component`：类型为 ComponentOptions 的接口，定义了组件选项的各个属性和方法。
2. `PropOptions`：类型为 PropOptions<any, any> 的接口，表示 Vue 组件中 props 属性的选项。
3. `popTarget` 和 `pushTarget`：分别用于弹出并推入观察者对象，在响应式系统中扮演重要角色，用于在订阅器 Dep 中添加或删除 Watcher 对象，并将其推到调用栈上，实现响应式数据的监测与更新。
4. `def`：一个函数，用于定义一个对象的某个属性，具体实现为 Object.defineProperty。这个函数常用于给对象设置响应式属性、拦截属性访问等操作。
5. `invokeWithErrorHandling`：一个函数，用于处理错误信息并输出日志。
6. `isReserved`：一个函数，用于判断一个字符串是否为 JavaScript 中的保留字。
7. `warn`：一个函数，用于输出警告信息。
8. `VNode`：虚拟节点的构造函数，用于描述真实 DOM 结构。
9. `bind`：一个函数，用于绑定作用域并返回一个新的函数。
10. `emptyObject`：一个空对象，用于减少内存占用。
11. `isArray`、`isFunction`、`isObject`：都是用于判断一个变量的类型是否为数组、函数和对象的工具函数。
12. `currentInstance` 和 `setCurrentInstance`：用于在组件实例化时保存当前组件实例对象，并在后续逻辑中使用。常用于组件相关逻辑的设计。
13. `shallowReactive`：深度响应式转浅响应式，即将一个对象的属性设置为响应式属性，但不包括其子属性，且只有在属性值被读取时才会进行响应式处理。
14. `proxyWithRefUnwrap`：一个辅助函数，用于创建 ref 类型的代理对象，使得该代理对象能够直接访问其 value 属性的值。
 */
 
import { Component } from 'types/component'
import { PropOptions } from 'types/options'
import { popTarget, pushTarget } from '../core/observer/dep'
import { def, invokeWithErrorHandling, isReserved, warn } from '../core/util'
import VNode from '../core/vdom/vnode'
import {
  bind,
  emptyObject,
  isArray,
  isFunction,
  isObject
} from '../shared/util'
import { currentInstance, setCurrentInstance } from './currentInstance'
import { shallowReactive } from './reactivity/reactive'
import { proxyWithRefUnwrap } from './reactivity/ref'



/**
这段代码定义了一个名为`SetupContext`的接口，用于在Vue 3的组件选项中传递给`setup()`函数。具体来说，它包含了以下属性：

- `attrs`: 当前组件被绑定的父组件传递下来的特性(attribute)对象。
- `listeners`: 当前组件被绑定的父组件传递下来的事件监听器对象。
- `slots`: 当前组件插槽(slot)内容的访问方法。
- `emit`: 发送事件到父组件。
- `expose`: 将当前组件实例的一些属性或方法暴露给父组件。

这些属性和方法都是在Vue 3的重新设计后新增的，它们使得组件开发更加简单和灵活。通过`SetupContext`对象，我们可以轻松地访问父组件传递下来的数据和事件，并且也可以方便地将自己的属性或方法暴露出去，供父组件使用。
 */
 
/**
 * @internal
 */
export interface SetupContext {
  attrs: Record<string, any>
  listeners: Record<string, Function | Function[]>
  slots: Record<string, () => VNode[]>
  emit: (event: string, ...args: any[]) => any
  expose: (exposed: Record<string, any>) => void
}



/**
这段代码的作用是在Vue组件实例（vm）上初始化setup函数并为其创建一个上下文（ctx）。

首先，通过`vm.$options`获取该组件实例的配置选项对象。其中，`setup`是一个可选的函数，它可以在组件实例被创建之前执行。

如果存在`setup`函数，则调用`createSetupContext`函数，传入`vm`作为参数，以创建一个新的上下文对象。这个上下文对象会作为`_setupContext`属性被赋值到组件实例上，供`setup`函数使用。

最后，将这个上下文对象保存到`vm._setupContext`上，并返回。这样一来，在组件实例被创建后，就可以通过`this._setupContext`访问这个上下文对象，从而访问在`setup`函数中声明的变量和函数。
 */
 
export function initSetup(vm: Component) {
  const options = vm.$options
  const setup = options.setup
  if (setup) {
    const ctx = (vm._setupContext = createSetupContext(vm))



/**
好的，我来为你解释一下。

`setCurrentInstance(vm)`是将当前实例设置为`vm`。这个函数主要用于在组件渲染期间跟踪内部状态，并在需要时访问当前实例。例如，当使用`this`来访问Vue组件实例上的属性或方法时，Vue会使用`getCurrentInstance()`来获取当前实例。

`pushTarget()`是将当前渲染目标（也就是正在渲染的组件）添加到堆栈中。当Vue开始渲染一个组件时，它会在堆栈顶部推入该组件的实例，并在完成渲染后从堆栈中弹出该实例。

`setupResult`是调用`setup`函数并返回结果。在Vue 3中，`setup`函数用于代替Vue 2中的`beforeCreate`和`created`生命周期钩子。它负责初始化组件的响应式数据和生命周期钩子函数。`setupResult`是返回给`createComponentInstance`函数的值。

`invokeWithErrorHandling`是一个带有错误处理功能的通用工具。在Vue内部，许多函数都使用它来包装它们的执行过程以进行错误处理。如果有错误发生，将会触发Vue的错误处理机制。

`popTarget()`是从堆栈中弹出当前渲染目标（也就是组件实例）。当Vue完成渲染一个组件时，它会从堆栈中弹出该组件的实例。

`setCurrentInstance()`是将当前渲染目标设置为`null`。这个函数在渲染完成后调用，以确保不会意外地访问或修改已完成渲染的组件实例。

以上就是对`./dist/src/v3/apiSetup.ts`中这段代码的解释，希望能帮助你理解Vue源码的工作原理。
 */
 
    setCurrentInstance(vm)
    pushTarget()
    const setupResult = invokeWithErrorHandling(
      setup,
      null,
      [vm._props || shallowReactive({}), ctx],
      vm,
      `setup`
    )
    popTarget()
    setCurrentInstance()



/**
这段代码是Vue3中的API `setup()` 的实现部分。`setup()` 函数用于在组件实例创建之前执行一些初始化逻辑，返回值会被注入到组件实例中供其使用。

这段代码首先对 `setup()` 函数的返回值进行类型判断，如果是函数，则将其作为渲染函数，并赋值给 `options.render`；如果是对象，则将其设置为组件实例的 `_setupState` 属性，并使用 `proxyWithRefUnwrap()` 对每个属性进行代理，同时也会对以 `_` 或 `$` 开头的属性名发出警告。此外，`__sfc` 是表示 `<script setup>` 标签编译后的变量，如果存在该属性，则将其编译后的对象代理到组件实例的 `_setupProxy` 属性中。如果返回值既不是函数也不是对象，则会发出警告。

这段代码体现了Vue3在 `setup()` 中做的工作，它将 `setup()` 返回值的处理和组件实例的创建过程分离开来，使得组件的创建更加灵活和可扩展。
 */
 
    if (isFunction(setupResult)) {
      // render function
      // @ts-ignore
      options.render = setupResult
    } else if (isObject(setupResult)) {
      // bindings
      if (__DEV__ && setupResult instanceof VNode) {
        warn(
          `setup() should not return VNodes directly - ` +
            `return a render function instead.`
        )
      }
      vm._setupState = setupResult
      // __sfc indicates compiled bindings from <script setup>
      if (!setupResult.__sfc) {
        for (const key in setupResult) {
          if (!isReserved(key)) {
            proxyWithRefUnwrap(vm, setupResult, key)
          } else if (__DEV__) {
            warn(`Avoid using variables that start with _ or $ in setup().`)
          }
        }
      } else {
        // exposed for compiled render fn
        const proxy = (vm._setupProxy = {})
        for (const key in setupResult) {
          if (key !== '__sfc') {
            proxyWithRefUnwrap(proxy, setupResult, key)
          }
        }
      }
    } else if (__DEV__ && setupResult !== undefined) {
      warn(
        `setup() should return an object. Received: ${
          setupResult === null ? 'null' : typeof setupResult
        }`
      )
    }
  }
}



/**
这段代码定义了一个函数 `createSetupContext`，它的作用是生成一个 setup 上下文对象。在 Vue3 中，setup 函数是组件内最先执行的函数，并且它是 Vue3 新增的 API 之一，主要用来实现组件逻辑，以及向模板暴露变量等功能。

这个 setup 上下文对象包含了如下属性：

- `attrs`: 获取组件上绑定的所有非 prop 属性，返回一个代理对象。
- `listeners`: 获取组件上绑定的所有事件监听器，返回一个代理对象。
- `slots`: 获取组件子节点中的 slot 内容，返回一个代理对象。
- `emit`: 触发自定义事件。
- `expose`: 向 template 暴露变量。

其中，`attrs` 和 `listeners` 都是通过 `syncSetupProxy` 方法将 `$attrs` 和 `$listeners` 绑定到代理对象上，并且在第一次访问时进行初始化。

`slots` 是通过 `initSlotsProxy` 方法将 `vm.$slots` 绑定到代理对象上，并且在第一次访问时进行初始化。

`emit` 是通过 `bind` 方法将 `vm.$emit` 绑定到当前组件实例上，并返回一个新函数，该函数可以直接调用 `vm.$emit` 来触发自定义事件。

`expose` 则是用于向父组件暴露变量的方法，它接收一个对象作为参数，将对象的属性添加到当前组件实例中。如果该方法被多次调用，则会在开发环境下抛出警告。
 */
 
function createSetupContext(vm: Component): SetupContext {
  let exposeCalled = false
  return {
    get attrs() {
      if (!vm._attrsProxy) {
        const proxy = (vm._attrsProxy = {})
        def(proxy, '_v_attr_proxy', true)
        syncSetupProxy(proxy, vm.$attrs, emptyObject, vm, '$attrs')
      }
      return vm._attrsProxy
    },
    get listeners() {
      if (!vm._listenersProxy) {
        const proxy = (vm._listenersProxy = {})
        syncSetupProxy(proxy, vm.$listeners, emptyObject, vm, '$listeners')
      }
      return vm._listenersProxy
    },
    get slots() {
      return initSlotsProxy(vm)
    },
    emit: bind(vm.$emit, vm) as any,
    expose(exposed?: Record<string, any>) {
      if (__DEV__) {
        if (exposeCalled) {
          warn(`expose() should be called only once per setup().`, vm)
        }
        exposeCalled = true
      }
      if (exposed) {
        Object.keys(exposed).forEach(key =>
          proxyWithRefUnwrap(vm, exposed, key)
        )
      }
    }
  }
}



/**
这段代码是 Vue3 中的一个工具函数，用于同步两个对象的属性。具体来说，它接受 5 个参数：

- to：目标对象
- from：源对象
- prev：之前的源对象
- instance：组件实例
- type：setup 阶段的类型

函数会遍历源对象 from 的所有属性，在目标对象 to 中找到对应属性。如果在目标对象中不存在这个属性，则调用 defineProxyAttr 函数为目标对象定义这个属性，并将其代理到 instance 上，以便后续响应式处理。如果在目标对象中存在这个属性，但源对象中的值与之前的值不同，则说明属性发生了变化，将 changed 标记为 true。

然后函数再次遍历目标对象 to 中的属性，在源对象 from 中找到对应属性，如果不存在，则说明这个属性已经被删除，将其从目标对象中删除，并将 changed 标记为 true。

最后，函数返回一个布尔值 changed，指示两个对象是否有属性发生变化。
 */
 
export function syncSetupProxy(
  to: any,
  from: any,
  prev: any,
  instance: Component,
  type: string
) {
  let changed = false
  for (const key in from) {
    if (!(key in to)) {
      changed = true
      defineProxyAttr(to, key, instance, type)
    } else if (from[key] !== prev[key]) {
      changed = true
    }
  }
  for (const key in to) {
    if (!(key in from)) {
      changed = true
      delete to[key]
    }
  }
  return changed
}



/**
在Vue.js中，defineProxyAttr函数是用来定义一个代理属性的方法。在这个方法中，我们使用Object.defineProperty方法来定义一个新的属性。

这个方法接受四个参数：proxy，key，instance和type。其中，proxy是代理对象，key是要代理的属性名，instance是组件实例，而type则表示要代理的属性类型（比如data、props等）。

在方法内部，我们调用了Object.defineProperty方法，然后传入了三个参数：第一个参数是代理对象，第二个参数是要代理的属性名，第三个参数是一个描述符对象，它包含了enumerable、configurable和get三个属性。

其中，enumerable和configurable属性表示这个属性是否可枚举和可配置，这里都被设为true。而get方法则是当我们通过代理对象访问这个属性时，会执行的方法。在这个方法中，我们返回了instance[type][key]，也就是组件实例中对应属性的值。

因此，通过defineProxyAttr方法，我们可以方便地创建一个代理对象，并将其与组件实例中的某个属性关联起来，这样在访问代理对象的属性时，就可以直接获取组件实例中对应属性的值了。
 */
 
function defineProxyAttr(
  proxy: any,
  key: string,
  instance: Component,
  type: string
) {
  Object.defineProperty(proxy, key, {
    enumerable: true,
    configurable: true,
    get() {
      return instance[type][key]
    }
  })
}



/**
在Vue的组件中，`$slots` 是一个对象，其中包含了子组件传递下来的插槽内容。而 `$scopedSlots` 则是作用域插槽，它可以让父组件向子组件注入其“模板”并在子组件中渲染出来。

在初始化时，`initSlotsProxy()` 函数会创建一个 `_slotsProxy` 对象，并将其赋值给当前组件实例 `vm` 。 `syncSetupSlots()` 函数则会将 `vm.$scopedSlots` 中的内容同步到 `_slotsProxy` 中。

最终，这个 `_slotsProxy` 对象被返回并存储在 `vm._slotsProxy` 中。这样，在访问 `$slots` 和 `$scopedSlots` 时，Vue 实际上是通过访问 `_slotsProxy` 来获取组件实例中的插槽内容。利用代理的方式，我们可以避免直接修改 `$slots` 和 `$scopedSlots` 引发的一系列问题，从而保证组件的可靠性和稳定性。
 */
 
function initSlotsProxy(vm: Component) {
  if (!vm._slotsProxy) {
    syncSetupSlots((vm._slotsProxy = {}), vm.$scopedSlots)
  }
  return vm._slotsProxy
}



/**
这是Vue3中的一个api函数，用于同步两个组件实例的插槽(slot)。其作用是将from组件实例的所有插槽都复制到to组件实例上，并删除from中没有但to中有的插槽。

具体来说，函数接收两个参数：to和from，分别表示需要同步插槽的目标组件实例和源组件实例。接下来，函数使用for-in循环遍历源组件实例中的所有属性，将它们复制到目标组件实例中。这样就将from组件实例的所有插槽都同步到了to组件实例中。

接着，函数再次使用for-in循环遍历目标组件实例中的属性，如果该属性不在源组件实例中，则将该属性从目标组件实例中删除。这样就删除了from组件实例中没有但to组件实例中却存在的插槽。

总之，syncSetupSlots函数的作用是保证两个组件实例的插槽是一致的。在Vue3中，组件实例的插槽是通过setup函数返回的render函数中传递的，因此需要确保两个组件实例的插槽是一致的，才能正确地渲染组件。
 */
 
export function syncSetupSlots(to: any, from: any) {
  for (const key in from) {
    to[key] = from[key]
  }
  for (const key in to) {
    if (!(key in from)) {
      delete to[key]
    }
  }
}



/**
这个代码块是一个 Vue 3 的内部 API，用于获取组件中的插槽(slot)信息。在 Vue 3 中，通过 `createApp` 函数创建的实例中，有一个叫做 `setupContext` 的对象，其中包含了当前组件实例的一些信息，比如 props、attrs、emit等等。

由于 `SetupContext` 中的 `slots` 类型依赖于旧版本的 VNode 类型定义，而在新版本中 VNode 类型已经被重新设计，所以这里使用了一个手动类型定义(`manual type def`)来获取 SetupContext 中的 slots 属性。具体来说，就是返回从 `getContext()` 函数中获取到的 `slots` 属性。 

需要注意的是，这段代码仅供内部开发人员使用，可能会在未来的版本中进行调整或删减。对于普通用户来说，应该遵循 Vue 官方文档中提供的公共 API 进行操作。
 */
 
/**
 * @internal use manual type def because public setup context type relies on
 * legacy VNode types
 */
export function useSlots(): SetupContext['slots'] {
  return getContext().slots
}



/**
这段代码主要是为了在Vue 3中使用新的vnode类型时，让开发者仍然能够访问到旧的VNode类型。在Vue 3中，由于对VNode类型进行了重构，所以公共设置上下文类型依赖于旧的VNode类型。

因此，在这里使用了一个内部函数useAttrs()来返回在Vue 3中使用的新的上下文类型 'SetupContext' 的属性 'attrs'，但是实际上它返回的是旧的VNode类型的属性 'attrs' 。这样做的目的是为了兼容旧的代码，同时也确保了新代码的正确性。

具体实现方式是通过调用getContext()来获取上下文，并从中获取属性'attrs'，然后返回这个属性。这个函数是被设置上下文中的其他函数调用的，如inject、provide等，以提供与旧代码的兼容性。
 */
 
/**
 * @internal use manual type def because public setup context type relies on
 * legacy VNode types
 */
export function useAttrs(): SetupContext['attrs'] {
  return getContext().attrs
}



/**
这段代码的作用是在Vue 2.x版本中，从当前组件实例的上下文中获取到listeners对象并返回。在Vue 2.x版本中，每个组件都会有一个上下文，该上下文包含了当前组件的props、data、methods等属性和方法。而listeners则是父组件通过v-on指令传递给子组件的事件监听函数。

由于Vue 3.x版本使用了全新的响应式系统和虚拟DOM实现方式，因此其组件上下文对象的类型定义也发生了变化。在Vue 3.x版本中，上下文对象被细分为attrs、slots、emit等属性，并且对应的类型定义也发生了变化。

因此，在Vue 2.x版本中，由于listeners对象所属的上下文类型依赖于旧的VNode类型定义，因此需要手动定义类型来获取到listeners对象。这里使用了TypeScript的类型推断功能，根据SetupContext['listeners']来获取到listeners对象的类型，并将其作为函数的返回值进行返回。
 */
 
/**
 * Vue 2 only
 * @internal use manual type def because public setup context type relies on
 * legacy VNode types
 */
export function useListeners(): SetupContext['listeners'] {
  return getContext().listeners
}



/**
这段代码主要是用来获取当前组件实例的`_setupContext`，如果实例上没有缓存，则会调用`createSetupContext()`方法创建一个新的context对象，并且添加到组件实例上。这个context对象提供了在组件setup()函数中使用的一些方法和属性。

其中，`currentInstance`是一个全局变量，在组件实例化时被设置为当前组件实例，因此在`getContext()`里可以直接使用。

关于__DEV__，它是Vue源码中用来判断是否处于开发环境的变量，在生产环境下会自动被忽略。该语句作用是在开发模式下，如果没有当前组件实例，则会在控制台输出警告信息，提示使用错误。同时，操作符!代表确保非空，即使currentInstance为空时也不会引起错误。
 */
 
function getContext(): SetupContext {
  if (__DEV__ && !currentInstance) {
    warn(`useContext() called without active instance.`)
  }
  const vm = currentInstance!
  return vm._setupContext || (vm._setupContext = createSetupContext(vm))
}



/**
这段代码是 Vue 3.x 版本中的一个运行时辅助函数，用于合并默认声明。该函数被编译后的代码导入使用。

函数接受两个参数：`raw` 和 `defaults`。其中，`raw` 可以是字符串数组或对象类型，表示组件的 props 声明列表；`defaults` 是一个对象，包含组件 props 的默认值。

该函数首先判断 `raw` 参数的类型，如果是字符串数组，则将其转换成对象类型。然后遍历 `defaults` 对象的属性，对于每个属性，如果在 `props` 中存在相应的声明，则将该属性与默认值合并，并更新到 `props` 对象中；否则，如果在 `props` 中不存在相应的声明且不为 `null`，则在开发模式下通过 `warn` 函数输出警告信息；最后，返回合并后的 `props` 对象。

需要说明的是，该函数的主要作用是处理组件 props 的声明和默认值，属于 Vue 3.x 源码中的一部分，我们只有了解整个源码库的结构、原理和设计思想才能更好地理解这段代码的作用。
 */
 
/**
 * Runtime helper for merging default declarations. Imported by compiled code
 * only.
 * @internal
 */
export function mergeDefaults(
  raw: string[] | Record<string, PropOptions>,
  defaults: Record<string, any>
): Record<string, PropOptions> {
  const props = isArray(raw)
    ? raw.reduce(
        (normalized, p) => ((normalized[p] = {}), normalized),
        {} as Record<string, PropOptions>
      )
    : raw
  for (const key in defaults) {
    const opt = props[key]
    if (opt) {
      if (isArray(opt) || isFunction(opt)) {
        props[key] = { type: opt, default: defaults[key] }
      } else {
        opt.default = defaults[key]
      }
    } else if (opt === null) {
      props[key] = { default: defaults[key] }
    } else if (__DEV__) {
      warn(`props default key "${key}" has no corresponding declaration.`)
    }
  }
  return props
}


