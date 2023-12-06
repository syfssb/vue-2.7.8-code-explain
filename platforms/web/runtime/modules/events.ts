
/**
./dist/src/platforms/web/runtime/modules/events.ts文件的作用是为Vue提供DOM事件绑定和解绑的能力。具体来说，它定义了一系列方法，如add, remove和createOnceHandler等来处理事件的绑定和解绑。

在整个vue的src中，events.ts文件是runtime目录下的一个模块，主要负责处理Vue在Web平台上的事件机制。该模块通过调用浏览器API来操作DOM元素，实现了Vue指令v-on和@的事件绑定功能。

events.ts文件与其他模块的关系比较松散，它主要是被Vue运行时（runtime）系统调用，为Vue组件提供事件绑定功能。同时，它也依赖于其他模块，如patch和dom-props等来完成各种操作。
 */
 



/**
这段代码主要导入了一些工具函数和变量，以及定义了一些事件相关的模块。具体解释如下：

1. `import { isDef, isUndef } from 'shared/util'`: 导入判断变量是否定义或未定义的工具函数。

2. `import { updateListeners } from 'core/vdom/helpers/index'`: 导入更新事件监听器的函数。

3. `import { isIE, isFF, supportsPassive, isUsingMicroTask } from 'core/util/index'`: 导入判断浏览器类型和特性的工具函数。

4. `import { RANGE_TOKEN, CHECKBOX_RADIO_TOKEN } from 'web/compiler/directives/model'`: 导入处理表单控件的指令常量，用于识别不同类型的表单元素。

5. `import { currentFlushTimestamp } from 'core/observer/scheduler'`: 导入当前刷新时间戳的函数，用于实现惰性更新。

6. `import { emptyNode } from 'core/vdom/patch'`: 导入空节点，用于在更新阶段处理一些特殊情况。

7. `import type { VNodeWithData } from 'types/vnode'`: 导入带有数据的虚拟节点类型，用于创建事件监听器的参数类型定义。

这些都是事件模块所需要的依赖项。
 */
 
import { isDef, isUndef } from 'shared/util'
import { updateListeners } from 'core/vdom/helpers/index'
import { isIE, isFF, supportsPassive, isUsingMicroTask } from 'core/util/index'
import {
  RANGE_TOKEN,
  CHECKBOX_RADIO_TOKEN
} from 'web/compiler/directives/model'
import { currentFlushTimestamp } from 'core/observer/scheduler'
import { emptyNode } from 'core/vdom/patch'
import type { VNodeWithData } from 'types/vnode'



/**
这段代码主要是用来规范化v-model事件令牌（tokens），这些令牌只能在运行时确定。它的重要性在于将事件放置在数组的第一个位置，因为整个目的是确保v-model回调函数在用户附加的处理程序之前被调用。

如果on对象中存在RANGE_TOKEN属性，则说明该元素绑定了Range类型的v-model指令。但是IE浏览器只支持change事件，因此需要把RANGE_TOKEN和change事件绑定到一起，并且把RANGE_TOKEN删除。

如果on对象中存在CHECKBOX_RADIO_TOKEN属性，则说明该元素绑定了复选框或单选框类型的v-model指令。这里将CHECKBOX_RADIO_TOKEN和change事件绑定到一起，并且把CHECKBOX_RADIO_TOKEN删除。

这个函数的作用是对on对象进行修改，所以需要注意传入的参数on必须是可变的（mutable）。
 */
 
// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
function normalizeEvents(on) {
  /* istanbul ignore if */
  if (isDef(on[RANGE_TOKEN])) {
    // IE input[type=range] only supports `change` event
    const event = isIE ? 'change' : 'input'
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || [])
    delete on[RANGE_TOKEN]
  }
  // This was originally intended to fix #4521 but no longer necessary
  // after 2.5. Keeping it for backwards compat with generated code from < 2.4
  /* istanbul ignore if */
  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || [])
    delete on[CHECKBOX_RADIO_TOKEN]
  }
}



/**
在这个文件中， `let target: any` 是一个局部变量的声明。在 TypeScript 中，当我们没有为变量显式指定其类型时，可以使用 `any` 类型表示变量可以是任何类型。

在这个特定的上下文中，`target` 变量被用作事件处理程序中的当前目标元素。例如，在一个 `click` 事件处理程序中，`target` 将存储当前被点击的元素。

由于事件处理程序可能会绑定到不同的元素上，并且每个元素都有自己的事件触发和处理逻辑，因此需要使用一个变量来跟踪当前的目标元素。在这种情况下，`target` 变量的类型被设置为 `any`，因为它可以是任何类型的 DOM 元素。
 */
 
let target: any



/**
这段代码主要是用来创建一个只执行一次的事件处理函数。

首先，使用了闭包将当前元素存储在变量`_target`中。

然后返回一个函数`onceHandler`，当这个函数第一次被执行时，会调用`handler`函数，并将参数传递给它。如果`handler`函数的返回值不为`null`，则说明该事件处理程序已经完成了它的任务，需要将其从元素上移除。因此，我们调用了`remove`函数，传递了事件名称、`onceHandler`函数、是否捕获以及之前保存的目标元素作为参数。

总之，该函数可以帮助我们一次性地添加一个事件监听器，当事件触发时，只会执行一次处理函数，并自动将监听器从元素上移除。
 */
 
function createOnceHandler(event, handler, capture) {
  const _target = target // save current target element in closure
  return function onceHandler() {
    const res = handler.apply(null, arguments)
    if (res !== null) {
      remove(event, onceHandler, capture, _target)
    }
  }
}



/**
这段注释的意思是：在Firefox版本小于等于53（特别是ESR 52）中，Event.timeStamp的实现不正确，并且不会在事件传播期间触发microtask，因此可以安全地排除该问题。

具体地说，这段代码主要是用来判断当前浏览器是否支持microtask修复。如果浏览器支持microtask并且不是Firefox版本小于等于53，那么就可以使用microtask修复，否则不能。在开发Vue时，使用了microtask机制来处理DOM更新，以避免使用setTimeout / setInterval等方法造成的性能问题。

通过将事件处理程序（如点击、鼠标移动等）添加到DOM元素上，JavaScript代码可以监听和响应这些事件。在事件监听器函数内部，可以访问事件对象的属性，比如event.timeStamp。但是，在Firefox的某些旧版本中，event.timeStamp的值是不准确的，因此需要做一些额外的处理，这也是这段代码的目的之一。
 */
 
// #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
// implementation and does not fire microtasks in between event propagation, so
// safe to exclude.
const useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53)



/**
这段代码主要是为了解决异步边缘情况 #6566。在这种情况下，内部点击事件会触发补丁(patch)，并在补丁期间附加到外部元素的事件处理程序再次触发。这是因为浏览器在事件传播之间触发微任务刻度。 解决方案很简单：我们保存附加处理程序时的时间戳，并且只有当传递给它的事件在附加处理程序之后被触发时，处理程序才会触发。

首先，如果useMicrotaskFix为true，那么我们需要修复这个问题，并定义一个包装器函数来处理事件。我们创建一个变量attachedTimestamp来保存事件处理程序的附加时间戳。接着，我们定义了原始的处理程序函数，然后将其包装在一个新的函数中。这个新的函数检查事件是否应该触发原始事件处理程序，如果是，则调用原始处理程序函数。

最后，我们使用addEventListener添加事件监听器。如果浏览器支持passive选项，则将其作为第三个参数传递，否则将capture作为第三个参数传递。
 */
 
function add(
  name: string,
  handler: Function,
  capture: boolean,
  passive: boolean
) {
  // async edge case #6566: inner click event triggers patch, event handler
  // attached to outer element during patch, and triggered again. This
  // happens because browsers fire microtask ticks between event propagation.
  // the solution is simple: we save the timestamp when a handler is attached,
  // and the handler would only fire if the event passed to it was fired
  // AFTER it was attached.
  if (useMicrotaskFix) {
    const attachedTimestamp = currentFlushTimestamp
    const original = handler
    //@ts-expect-error
    handler = original._wrapper = function (e) {
      if (
        // no bubbling, should always fire.
        // this is just a safety net in case event.timeStamp is unreliable in
        // certain weird environments...
        e.target === e.currentTarget ||
        // event is fired after handler attachment
        e.timeStamp >= attachedTimestamp ||
        // bail for environments that have buggy event.timeStamp implementations
        // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
        // #9681 QtWebEngine event.timeStamp is negative value
        e.timeStamp <= 0 ||
        // #9448 bail if event is fired in another document in a multi-page
        // electron/nw.js app, since event.timeStamp will be using a different
        // starting reference
        e.target.ownerDocument !== document
      ) {
        return original.apply(this, arguments)
      }
    }
  }
  target.addEventListener(
    name,
    handler,
    supportsPassive ? { capture, passive } : capture
  )
}



/**
这段代码是从Vue的事件模块中取出的一个函数，主要用于移除事件监听器。下面是对其中参数及处理过程的解释：

- name：事件名称。
- handler：事件监听器回调函数。
- capture：是否捕获事件。
- _target?: HTMLElement：可选参数，目标元素。

在调用这个函数时，如果有传入目标元素（_target），就使用传入的元素作为目标元素，否则使用默认的目标元素 target。

使用目标元素的 removeEventListener 方法，将之前添加的事件监听器移除。这里需要注意的是，handler._wrapper || handler 这一段代码可能会让初学者不太理解。实际上，这里是先判断该监听器是否被 Vue 包装过了，如果是，则使用包装后的函数进行移除，否则直接使用原始的回调函数进行移除。这样做的好处是，可以快速找到已经包装过的监听器，从而正确地移除它们。
 */
 
function remove(
  name: string,
  handler: Function,
  capture: boolean,
  _target?: HTMLElement
) {
  ;(_target || target).removeEventListener(
    name,
    //@ts-expect-error
    handler._wrapper || handler,
    capture
  )
}



/**
这段代码是用于更新DOM元素的事件监听器的。它接受两个参数：旧的VNode（Virtual DOM节点）和新的VNode，它们都带有数据属性“on”，该属性包含一组事件监听器函数。

首先，我们检查旧VNode和新VNode上是否都没有“on”属性。如果没有，则直接返回。

接下来，我们获取新VNode上的所有事件监听器函数，并将它们存储在“on”中。我们还获取旧VNode上的所有事件监听器函数，并将它们存储在“oldOn”中。

在处理事件监听器之前，我们需要确定要在哪个DOM元素上添加或删除事件监听器。我们使用vnode.elm作为目标元素，如果vnode.elm不存在，则使用oldVnode.elm代替。最后再重置目标元素为undefined。

normalizeEvents(on)用于规范化事件名称，以便在不同浏览器中具有一致的行为，例如把"click"改为"pointerdown"。

updateListeners()用于实际添加、删除、更新事件监听器。它会比较新旧两个事件监听器对象，并根据结果添加、修改或删除事件监听器。createOnceHandler()用于创建一个只执行一次的事件监听器。

最后，该函数完成了事件监听器的更新操作。
 */
 
function updateDOMListeners(oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}
  // vnode is empty when removing all listeners,
  // and use old vnode dom element
  target = vnode.elm || oldVnode.elm
  normalizeEvents(on)
  updateListeners(on, oldOn, add, remove, createOnceHandler, vnode.context)
  target = undefined
}



/**
这段代码导出了一个对象，其中包含了三个方法：create、update、destroy。这些方法用于处理 DOM 事件绑定。

create 和 update 方法都调用了 updateDOMListeners 方法，它的作用是在对应的 DOM 元素上添加或更新事件监听器。这两个方法的区别在于 create 是在初次渲染时调用，而 update 是在组件数据发生变化时重新渲染时调用。

destroy 方法则是在组件销毁前调用，它通过传入 vnode 和 emptyNode 参数来清除该节点上的所有事件监听器。

在代码中，有一个 @ts-expect-error 注释，它告诉 TypeScript 忽略了 emptyNode 对象没有 VNodeWithData 类型的问题。emptyNode 实际上是一个空 VNode 对象，但因为它没有 data 属性，所以编译器无法确定其类型。
 */
 
export default {
  create: updateDOMListeners,
  update: updateDOMListeners,
  // @ts-expect-error emptyNode has actually data
  destroy: (vnode: VNodeWithData) => updateDOMListeners(vnode, emptyNode)
}


