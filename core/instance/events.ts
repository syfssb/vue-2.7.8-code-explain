
/**
./dist/src/core/instance/events.ts文件主要定义了Vue实例的事件相关方法。具体来说，它包括：

1. $on(eventName: string | Array<string>, callback: Function): Component
注册事件，当 eventName 对应的事件被触发时，执行 callback 函数。eventName 可以是字符串或数组，callback 是一个函数。

2. $once(eventName: string, callback: Function): Component
注册一次性事件，当 eventName 对应的事件被触发时，执行 callback 函数。该事件只会被触发一次。

3. $off(eventName?: string | Array<string>, callback?: Function): Component
移除事件监听器，如果没有提供参数，则移除所有事件监听器。如果只提供了 eventName，则移除该事件的所有监听器。如果同时提供了 eventName 和 callback，则只移除该事件下对应的 callback 监听器。

4. $emit(eventName: string, ...args: any[]): Component
触发事件，执行 eventName 对应事件的所有监听器，并且传递 ...args 参数作为参数。

5. $listeners: Object
父组件传递给当前组件的所有事件监听器。

在整个Vue源码中，这个文件的作用非常重要。因为Vue是一个事件驱动的框架，所以事件系统是核心之一。而这个文件定义的事件方法负责Vue实例的事件注册、监听、触发和移除等基本功能，是支持Vue事件机制的基石之一。其他文件如果需要用到事件功能，也需要引入和使用这里定义的方法。
 */
 



/**
这段代码主要是在Vue2中定义事件相关的逻辑，该文件包含以下几个部分：

1. 引入类型 Component，它是从 'types/component' 模块中导入的，用于描述 Vue 组件的类型；
2. 导入一些工具函数，比如 tip、toArray、isArray、hyphenate、formatComponentName 和 invokeWithErrorHandling 等，这些工具函数都是从 '../util/index' 中导入的；
3. 导入 updateListeners 函数，该函数是从 '../vdom/helpers/index' 模块中导入的，用于更新组件的监听器；

总体来说，该文件主要是引入了一些必要的模块和工具函数，为 Vue 事件系统的实现奠定基础。通过阅读这段代码，我们可以看到 Vue 在设计事件系统时注重了对组件生命周期的考虑，并提供了相应的 API 来满足开发者的需求。
 */
 
import type { Component } from 'types/component'
import {
  tip,
  toArray,
  isArray,
  hyphenate,
  formatComponentName,
  invokeWithErrorHandling
} from '../util/index'
import { updateListeners } from '../vdom/helpers/index'



/**
这段代码是Vue的事件系统初始化函数，主要作用是给 Vue 实例添加事件相关属性和方法。

具体解释如下：

1. `vm._events = Object.create(null)`：创建一个空对象作为 Vue 实例的 _events 属性，用于存储事件监听器。

2. `vm._hasHookEvent = false`：_hasHookEvent 属性用于记录 Vue 生命周期钩子函数是否被监听，初始值为 false。

3. `const listeners = vm.$options._parentListeners`：从 Vue 实例的 $options 中获取父组件传递下来的事件监听器。

4. `if (listeners) { updateComponentListeners(vm, listeners) }`：如果存在父组件传递下来的事件监听器，则通过 updateComponentListeners 函数将这些事件监听器绑定到当前 Vue 实例上。

总之，该函数的主要作用就是初始化 Vue 实例的事件系统，并在实例化过程中处理可能存在的父组件传递下来的事件监听器。
 */
 
export function initEvents(vm: Component) {
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // init parent attached events
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}



/**
在Vue源码中，./dist/src/core/instance/events.ts是处理事件系统的代码文件。在该文件中，你提到的`let target: any`是一个变量声明语句。

该变量是用来存储当前触发事件的目标对象的引用。在 Vue 的事件系统中，事件可以在多个组件之间传递。当一个事件被触发时，它会从当前组件的父组件一直冒泡到根组件，在这个过程中，每个组件都可以通过$emit方法把事件向上传递到它的父组件。

在事件冒泡过程中，`target`变量用来存储当前正在处理事件的组件实例。具体来说，当一个组件触发事件时，它会将自己的实例作为`target`的值，然后得到自己的父组件，并将`target`的值设置为父组件的实例，依次类推，直到达到根组件。

总结起来，`target`变量在Vue事件系统中扮演着重要的角色，它用于保存当前事件的目标对象，为事件的传递和处理提供了有力的支持。
 */
 
let target: any



/**
这段代码的作用是，向当前 Vue 实例的事件中心添加一个事件监听器。该函数接收两个参数，第一个参数 `event` 表示要监听的事件名称，第二个参数 `fn` 则是事件发生时所执行的回调函数。

在该函数中，调用了 `$on` 方法，这个方法是在 Vue 实例原型上定义的，用于向事件中心添加一个事件监听器。`$on` 方法的定义可以在同一目录下的 `events.js` 文件中找到，代码如下：

```javascript
Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
  const vm: Component = this
  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      vm.$on(event[i], fn)
    }
  } else {
    (vm._events[event] || (vm._events[event] = [])).push(fn)
    // optimize hook:event cost by using a boolean flag marked at registration
    // instead of a hash lookup
    if (hookRE.test(event)) {
      vm._hasHookEvent = true
    }
  }
  return vm
}
```

通过以上代码，我们可以看到，`$on` 方法会首先获取当前 Vue 实例，然后判断传入的 `event` 参数是否为数组类型，如果是，则遍历数组，针对每一个事件名称都调用 `$on` 方法递归地添加事件监听器；否则，就将该事件名称和对应的回调函数存入 `_events` 属性中，并且在需要优化的情况下，将 `_hasHookEvent` 标志设为 `true`。

所以，回到刚才的代码，`add` 函数本质上是调用了 `$on` 方法，并将参数传递给它。其中 `target` 是一个全局变量，代表当前正在处理的 Vue 实例。因此这段代码的作用就是向当前 Vue 实例添加一个事件监听器。
 */
 
function add(event, fn) {
  target.$on(event, fn)
}



/**
这段代码定义了一个`remove`函数，它接收两个参数`event`和`fn`。

在函数内部，它调用了`target.$off(event, fn)`方法。这个方法实际上是Vue中实现事件监听和移除的核心方法之一，负责移除当前Vue实例上指定事件名和回调函数的监听器。其中`target`是在外部作用域传入的一个Vue实例对象。

因此，这个`remove`函数的作用就是移除指定事件名和回调函数的监听器。在Vue中，我们可以通过调用`$on`方法来添加事件监听器，在不需要时则可以调用`$off`方法将其移除。
 */
 
function remove(event, fn) {
  target.$off(event, fn)
}



/**
这段代码的作用是创建一个只触发一次的事件处理函数。

具体来说，这个函数会接收两个参数：一个是事件名称 `event`，一个是实际的事件处理函数 `fn`。它首先将当前的 `target` 缓存到 `_target` 变量中，然后返回一个新的函数 `onceHandler`。这个函数在执行时会调用传入的事件处理函数 `fn`，并将它的返回值 `res` 存储起来。

如果 `fn` 返回值不为 `null`，则说明事件处理函数已经被成功执行过了，所以 `onceHandler` 就会调用 `$off(event, onceHandler)` 方法，将自己从事件监听器列表中移除。

这个函数主要用于实现某些只需触发一次的事件，比如 `click.once`、`keydown.once` 等等。通过使用这个函数，我们可以方便地创建这样的事件监听器，并且保证它们只会被触发一次。
 */
 
function createOnceHandler(event, fn) {
  const _target = target
  return function onceHandler() {
    const res = fn.apply(null, arguments)
    if (res !== null) {
      _target.$off(event, onceHandler)
    }
  }
}



/**
这段代码是Vue中用于更新组件监听器（事件）的函数。

- `vm` 参数表示组件实例对象。
- `listeners` 参数是一个对象，包含要添加或更新的监听器回调函数。
- `oldListeners` 参数是一个可选的对象，包含要删除的监听器回调函数。

函数内部首先将 `target` 变量设置为当前组件实例对象。`updateListeners` 函数会根据传入的参数进行相应的操作：

- `listeners` 中包含的新监听器会被添加或更新到组件实例中。
- `oldListeners` 中包含的旧监听器会被从组件实例中移除。
- `createOnceHandler` 函数用于创建只执行一次的监听器回调函数。

这样就完成了对组件监听器（事件）的更新操作。最后将 `target` 变量设为 undefined，即重置为初始值。
 */
 
export function updateComponentListeners(
  vm: Component,
  listeners: Object,
  oldListeners?: Object | null
) {
  target = vm
  updateListeners(
    listeners,
    oldListeners || {},
    add,
    remove,
    createOnceHandler,
    vm
  )
  target = undefined
}



/**
这段代码定义了 Vue 实例的 `$on` 方法，用于监听一个自定义事件。具体实现如下：

1. 首先判断传入的事件名是否为数组，如果是，则遍历数组递归调用 `$on` 方法；
2. 如果不是数组，则将该事件名对应的回调函数添加到 `_events` 对象中，并在需要时设置 `_hasHookEvent` 标志；
3. 最后返回当前 Vue 实例。

其中 `_events` 对象用于存储事件及其回调函数列表，而 `_hasHookEvent` 标志则用于优化钩子事件的性能开销。

总之，这段代码是 Vue 构建事件系统的核心代码之一，它提供了 Vue 实例上最基础的自定义事件注册和监听功能。
 */
 
export function eventsMixin(Vue: typeof Component) {
  const hookRE = /^hook:/
  Vue.prototype.$on = function (
    event: string | Array<string>,
    fn: Function
  ): Component {
    const vm: Component = this
    if (isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn)
      }
    } else {
      ;(vm._events[event] || (vm._events[event] = [])).push(fn)
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true
      }
    }
    return vm
  }



/**
这段代码的作用是在Vue实例上添加一个仅执行一次的事件监听器，也就是说，在事件触发后，这个监听器将被移除。

具体来说，这个代码中定义了一个名为`$once`的方法，它接收两个参数：`event`表示事件名称，`fn`表示事件处理函数。在调用此方法时，会先拿到当前Vue实例（即`this`），然后创建一个新的只执行一次的事件处理函数`on`，并在其中调用原始的事件处理函数`fn`，同时通过`vm.$off(event, on)`将该事件处理函数从Vue实例中删除。最后，将新的事件处理函数`on`添加到Vue实例的事件监听器列表中，以便在`event`事件触发时调用。

注意到这里在新的事件处理函数`on`上定义了一个属性`fn`，其值为原始事件处理函数`fn`。这是为了在调用`vm.$off(event, on)`时能够正确地找到要删除的事件处理函数。
 */
 
  Vue.prototype.$once = function (event: string, fn: Function): Component {
    const vm: Component = this
    function on() {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn
    vm.$on(event, on)
    return vm
  }



/**
这段代码是 Vue 实例的 $off 方法的实现，主要用于解绑事件监听器。

该函数接受两个参数：

- event: 要解绑的事件名称，可以是字符串或字符串数组，如果不传入任何参数，则会移除所有事件监听器。
- fn: 要解绑的事件处理器函数。

该函数首先获取执行 $off 方法的 Vue 实例 vm，然后根据传入的参数去决定要解绑哪些事件监听器。

如果没有传入任何参数，则会将所有事件监听器都移除。具体做法是将 vm._events 对象重置为空对象，即 vm._events = Object.create(null)。

如果传入的是一个事件名称数组，则会遍历数组，逐一调用 $off 方法解绑每个事件。

如果传入的是单个事件名称，那么就需要判断是否存在该事件的监听器。如果不存在，则直接返回原始的 Vue 实例。

如果存在该事件的监听器，则需要进一步判断是否传入了要解绑的事件处理器函数。如果没有传入，则将该事件的监听器数组清空；否则，遍历该事件的监听器数组，找到要解绑的事件处理器函数并将其从数组中删除。

最后，该方法返回 Vue 实例本身以支持链式调用。

总之，$off 方法的实现非常简洁明了，基于 Vue 内部维护的事件系统，通过对事件监听器的添加、删除等操作，实现了事件的注册和解绑。
 */
 
  Vue.prototype.$off = function (
    event?: string | Array<string>,
    fn?: Function
  ): Component {
    const vm: Component = this
    // all
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // array of events
    if (isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$off(event[i], fn)
      }
      return vm
    }
    // specific event
    const cbs = vm._events[event!]
    if (!cbs) {
      return vm
    }
    if (!fn) {
      vm._events[event!] = null
      return vm
    }
    // specific handler
    let cb
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
    return vm
  }



/**
这段代码定义了 Vue.prototype.$emit 方法，该方法用于触发当前实例上的事件。具体来说，它会从当前实例的 _events 属性中获取与传入事件名相对应的所有回调函数，并将这些回调函数依次执行。

首先，我们可以看到该方法接受一个字符串类型的参数 event，表示需要触发的事件名。然后获取当前实例对象 vm，之后进行一些判断和处理。

在开发环境下（__DEV__），如果传入的事件名 event 不是小写形式，而在 vm._events 对象中有对应的小写事件名的回调函数，则会发出警告提示，提示用户应该使用小写事件名。因为 HTML 属性不区分大小写，所以在使用 DOM 模板时无法监听驼峰式的事件名，需要使用连字符连接单词。

接下来，根据传入的事件名 event，从 vm._events 对象中获取对应的回调函数数组 cbs。如果存在回调函数，就依次执行这些回调函数。在执行回调函数之前，会通过 toArray 方法将参数转换成数组，并设置 info 变量用于错误处理。

最后，该方法返回当前实例对象 vm，以便链式调用。
 */
 
  Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this
    if (__DEV__) {
      const lowerCaseEvent = event.toLowerCase()
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
            `${formatComponentName(
              vm
            )} but the handler is registered for "${event}". ` +
            `Note that HTML attributes are case-insensitive and you cannot use ` +
            `v-on to listen to camelCase events when using in-DOM templates. ` +
            `You should probably use "${hyphenate(
              event
            )}" instead of "${event}".`
        )
      }
    }
    let cbs = vm._events[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      const args = toArray(arguments, 1)
      const info = `event handler for "${event}"`
      for (let i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info)
      }
    }
    return vm
  }
}


