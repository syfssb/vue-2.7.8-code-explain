
/**
`bind-object-listeners.ts` 文件的作用是将组件实例对象的 DOM 事件监听器（v-on 绑定）绑定到该组件的所有子组件及其子孙组件上。

具体来说，这个文件定义了一个 `bindObjectListeners` 函数，这个函数接收一个组件实例对象和一个事件名称作为参数。它遍历组件实例对象上的所有子组件（使用递归方式），并为每个子组件绑定相应的 DOM 事件监听器。它还会在当前组件实例对象上保存一个 `_dataListeners` 对象，用于保存事件监听器。

在整个 Vue 的 src 中，`bind-object-listeners.ts` 主要被以下几个文件引用：

- `instance/events.js`：这个文件定义了 Vue 实例上的 `$on`、`$off`、`$once` 和 `$emit` 方法，其中的 `$on` 方法会调用 `bindObjectListeners` 来绑定事件监听器。
- `vdom/helpers/update-listeners.js`：这个文件定义了一些更新 VNode 上的事件监听器的帮助函数，其中的 `updateListeners` 方法会调用 `bindObjectListeners` 来绑定事件监听器。
- `vdom/patch.js`：这个文件定义了虚拟 DOM 的 patch 方法，在 patch 过程中，它也会调用 `updateListeners` 方法来更新 VNode 上的事件监听器。

因此，`bind-object-listeners.ts` 在整个 Vue 的 src 中扮演着非常重要的角色，帮助 Vue 实现了事件监听器的绑定和更新功能。
 */
 



/**
`bind-object-listeners.ts` 是 Vue 中用于绑定对象监听器的一个工具函数，其中引入了三个函数：`warn`、`extend` 和 `isPlainObject`。

- `warn` 函数用于输出警告信息。在 Vue 的调试模式下，它会输出一些警告信息，帮助开发者进行调试。
- `extend` 函数用于将多个对象合并成一个新的对象。Vue 中很多地方都使用了该函数，比如合并组件选项、mixin 选项等。
- `isPlainObject` 判断一个值是否为普通对象。在 Vue 中，很多地方需要判断一个对象是否为普通对象，比如组件选项、props、computed 等等。

同时，该文件中还引入了一个类型 `VNodeData`，它定义了虚拟节点的数据类型。虚拟节点是 Vue 中重要的概念之一，用于描述真实 DOM 节点的结构和属性等信息。`VNodeData` 中包含了虚拟节点的各种属性，比如 class、style、on 等等。

总体来说，这个文件是 Vue 中用于绑定对象监听器的一个工具函数，其中引入了一些常用的辅助函数和类型。
 */
 
import { warn, extend, isPlainObject } from 'core/util/index'
import type { VNodeData } from 'types/vnode'



/**
这段代码的作用是将一个对象列表中的每个对象的事件绑定到VNodeData的on属性上，返回VNodeData。

具体来说，这个函数接收两个参数：`data`和`value`。`data`是VNodeData对象，`value`是一个对象列表。如果`value`存在且是一个纯对象，则遍历`value`中的每个属性键值对，并将其添加到`data.on`对象中。若`data.on`对象已经存在，则采用扩展方式添加到`on`对象中。

对于`value`中的每一对键值对，首先检查`on`对象中是否已经有该属性的监听器，如果有则将新的监听器与旧的监听器合并为一个数组；如果没有，则直接将新的监听器添加到`on`对象中。最后返回修改后的`data`对象。

这个方法通常在编译模板期间用于处理`v-on`指令，即将组件或DOM元素的事件绑定到相应的事件处理程序函数上。
 */
 
export function bindObjectListeners(data: any, value: any): VNodeData {
  if (value) {
    if (!isPlainObject(value)) {
      __DEV__ && warn('v-on without argument expects an Object value', this)
    } else {
      const on = (data.on = data.on ? extend({}, data.on) : {})
      for (const key in value) {
        const existing = on[key]
        const ours = value[key]
        on[key] = existing ? [].concat(existing, ours) : ours
      }
    }
  }
  return data
}


