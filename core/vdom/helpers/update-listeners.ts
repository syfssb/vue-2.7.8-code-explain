
/**
update-listeners.ts文件是Vue2中Virtual DOM层的一个工具函数，它主要用于更新元素节点的监听器。

在Virtual DOM层，每当我们更新DOM节点时，都需要对该节点的各种事件进行重新绑定，这个过程就是update-listeners.ts负责处理的。这个函数会根据旧的监听器和新的监听器，比较它们之间的差异，然后按需添加、删除或更新事件监听器。

update-listeners.ts通常是引入到patch.ts这个文件中使用的，在patch.ts中，我们可以看到它被用于更新各种类型的DOM节点（如元素节点、文本节点等）的事件监听器。同时，在一些与事件相关的模块中，也有可能会单独使用update-listeners.ts来更新监听器。

总之，update-listeners.ts函数是Vue2 Virtual DOM层中非常重要的一个工具函数，用于管理DOM节点的事件监听器。
 */
 



/**
./dist/src/core/vdom/helpers/update-listeners.ts是Vue的虚拟DOM更新监听器的辅助方法之一。代码中引入了core/util/index和shared/util模块，这些模块提供了一些公共工具函数和常用类型的定义。

具体而言，其中的warn函数用于在开发环境中输出警告信息，invokeWithErrorHandling函数用于调用带有错误处理的函数。cached函数是一个闭包函数，用于缓存结果并避免重复计算。isUndef、isTrue和isArray函数则是判断值的类型或属性的常用函数。

同时，该文件还通过import { Component } from 'types/component'导入了Component类型的定义，这个类型用于描述Vue组件实例的结构。
 */
 
import { warn, invokeWithErrorHandling } from 'core/util/index'
import { cached, isUndef, isTrue, isArray } from 'shared/util'
import type { Component } from 'types/component'



/**
这段代码定义了一个名为`normalizeEvent`的函数，它接受一个字符串类型的参数 `name`，并返回一个对象。这个对象具有以下属性：

- `name`: 字符串类型，表示事件名称。
- `once`: 布尔类型，表示是否只监听一次触发事件。
- `capture`: 布尔类型，表示是否使用捕获模式监听事件。
- `passive`: 布尔类型，表示是否为被动事件。

该函数是利用了闭包与高阶函数进行缓存，通过cached函数在内部对传入的name字符做了处理。如果name字符串以"&"开头，那么代表其为被动事件，将会全部默认会阻止浏览器默认行为。如果name字符串以"~"开头，那么代表其为只监听一次的事件。如果name字符串以"!"开头，那么代表其为捕获模式监听事件。

为了提高性能，该函数使用了缓存技术，即第一次调用该函数时，会把结果缓存下来，以后再次调用相同的参数，就会直接从缓存中读取结果，避免重复计算。
 */
 
const normalizeEvent = cached(
  (
    name: string
  ): {
    name: string
    once: boolean
    capture: boolean
    passive: boolean
    handler?: Function
    params?: Array<any>
  } => {
    const passive = name.charAt(0) === '&'
    name = passive ? name.slice(1) : name
    const once = name.charAt(0) === '~' // Prefixed last, checked first
    name = once ? name.slice(1) : name
    const capture = name.charAt(0) === '!'
    name = capture ? name.slice(1) : name
    return {
      name,
      once,
      capture,
      passive
    }
  }
)



/**
这段代码是Vue内部用于创建函数调用器的辅助函数。在Vue中，一个事件可以有多个处理函数，这些处理函数被存储在一个数组中，当事件触发时，所有处理函数都被依次调用。

createFnInvoker函数接收两个参数：fns和vm。fns可以是一个单独的函数或者是一个函数数组，表示需要执行的事件处理函数。vm是可选的，表示Vue实例对象。

invoker函数是createFnInvoker返回的函数，它是用来执行fns中的处理函数的。invoker函数先获取到保存在invoker上的fns，然后根据fns是否为数组进行不同的处理：

1. 如果fns是一个数组，则将其复制一份，并依次遍历这些处理函数并调用，使用invokeWithErrorHandling函数来执行事件处理函数，并提供错误处理。
2. 如果fns只是一个单独的函数，则直接使用invokeWithErrorHandling函数来执行该函数，并提供错误处理。执行完后，将该函数的返回值返回。

最后，createFnInvoker函数给invoker函数添加了一个fns属性，并将传入的fns赋值给该属性。这个fns属性用于存储处理函数，在下次事件触发时会被使用。通过这种方式，我们可以确保每个事件处理函数都能够得到执行。
 */
 
export function createFnInvoker(
  fns: Function | Array<Function>,
  vm?: Component
): Function {
  function invoker() {
    const fns = invoker.fns
    if (isArray(fns)) {
      const cloned = fns.slice()
      for (let i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(
          cloned[i],
          null,
          arguments as any,
          vm,
          `v-on handler`
        )
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(
        fns,
        null,
        arguments as any,
        vm,
        `v-on handler`
      )
    }
  }
  invoker.fns = fns
  return invoker
}



/**
这是Vue中用于更新事件监听器的函数，其参数为 on，oldOn，add，remove，createOnceHandler 和 vm。

- on和oldOn分别表示新旧两个VNode节点上的事件监听器对象。
- add和remove是平台相关的方法，用于添加和移除事件监听器。
- createOnceHandler是一个辅助函数，用于创建一次性事件处理程序。
- vm是当前组件的实例对象。

在这个函数中，首先通过遍历on对象中的所有属性名称，获取到对应的cur和old，分别表示新旧两个VNode节点上该事件名称对应的回调函数。之后，通过normalizeEvent函数对事件名进行标准化，得到一个包含事件名称、是否捕获等信息的对象event。接着根据cur是否存在来判断是否存在无效的回调函数，并给出相应的警告信息。然后如果old不存在，就需要先创建一个函数调用器，再根据event.once的值决定是否要创建一次性事件处理程序，并调用add方法将事件监听器添加到DOM元素上。如果old存在，且新旧两个回调函数不同，就将old.fns指向cur，并覆盖on[name]的值。最后，还需通过遍历oldOn对象的属性名称，移除那些在新的VNode节点上不存在的事件监听器。
 */
 
export function updateListeners(
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  createOnceHandler: Function,
  vm: Component
) {
  let name, cur, old, event
  for (name in on) {
    cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    if (isUndef(cur)) {
      __DEV__ &&
        warn(
          `Invalid handler for event "${event.name}": got ` + String(cur),
          vm
        )
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm)
      }
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture)
      }
      add(event.name, cur, event.capture, event.passive, event.params)
    } else if (cur !== old) {
      old.fns = cur
      on[name] = old
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name)
      remove(event.name, oldOn[name], event.capture)
    }
  }
}


