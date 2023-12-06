
/**
resolve-scoped-slots.ts 文件的作用是在渲染组件时解析scoped slot。

在 Vue 中，当一个组件内部包含了一个具名插槽（named slot）时，我们可以使用 v-slot 指令来将其绑定到子组件的数据中。但是，在一些情况下我们需要在父组件中使用 scoped slot，即把一个函数传递给子组件，在子组件中调用该函数并传递参数，最后子组件返回一个 VNode，从而实现动态插入的效果。这时候就需要使用 resolveScopedSlots 函数来解析 scoped slot。

resolveScopedSlots 函数接收一个参数 $slots，它是一个对象，包含了父组件中所有的插槽。$slots 的属性名就是插槽的名字，属性值是一个函数，该函数返回一个 VNode 数组。resolveScopedSlots 函数会遍历 $slots 对象中的所有属性，对于每个插槽，它会调用该插槽对应的函数，并传递参数，最后得到一个 VNode 数组。这些 VNode 组成的数组就是父组件传递给子组件的 scoped slot。

在整个 Vue 的源码中，resolve-scoped-slots.ts 是作为 render-helpers 目录下的一个辅助文件存在的。render-helpers 目录下的文件都是 Vue 在渲染过程中使用的一些帮助函数。resolve-scoped-slots.ts 这个文件的作用是为了支持 scoped slot 的功能，它的具体使用可以在 render-slot.ts 文件中找到。
 */
 



/**
这段代码主要是导入了Vue中的ScopedSlotsData类型和isArray函数。

ScopedSlotsData是一个类型定义，用来描述作为插槽值传递的组件数据对象。它包含一个属性名和具体的插槽内容，通常由父组件通过v-slot指令传递给子组件。

而isArray函数则是来判断一个变量是否是数组类型的函数。在resolve-scoped-slots.ts中，可能会用到这个函数来判断父组件传递的插槽内容是否有多个，从而进行对应的处理。
 */
 
import type { ScopedSlotsData } from 'types/vnode'
import { isArray } from 'core/util'



/**
这是Vue中用于解析作用域插槽（scoped slots）的帮助函数。作用域插槽是一种特殊类型的插槽，允许父组件向子组件传递一个具名插槽，并在子组件中使用该插槽来访问父组件的数据。

该函数接受四个参数：

- fns: ScopedSlotsData，一个包含作用域插槽的数组。
- res?: Record<string, any>，一个可选的对象，用于存储解析后的作用域插槽。
- hasDynamicKeys?: boolean，一个可选的布尔值，指示是否存在动态键（dynamic keys）。
- contentHashKey?: number，一个可选的数字，用于生成内容哈希键（content hash key）。

该函数首先初始化一个结果对象res，如果不存在动态键，则将$stable属性设置为true。然后，该函数遍历fns数组中的每个插槽，并为每个插槽添加到res对象中。

如果插槽是一个数组，则递归调用resolveScopedSlots函数，继续处理其内部的插槽。否则，如果插槽存在且不为空，则将其添加到res对象中，其中键为插槽的key属性，值为插槽的fn属性（表示插槽函数）。

最后，如果存在contentHashKey，则将其添加到$res对象中，并返回$res对象。该函数返回的结果是一个对象，其中包含$stable属性和所有解析后的作用域插槽的键值对。
 */
 
export function resolveScopedSlots(
  fns: ScopedSlotsData,
  res?: Record<string, any>,
  // the following are added in 2.6
  hasDynamicKeys?: boolean,
  contentHashKey?: number
): { $stable: boolean } & { [key: string]: Function } {
  res = res || { $stable: !hasDynamicKeys }
  for (let i = 0; i < fns.length; i++) {
    const slot = fns[i]
    if (isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys)
    } else if (slot) {
      // marker for reverse proxying v-slot without scope on this.$slots
      // @ts-expect-error
      if (slot.proxy) {
        // @ts-expect-error
        slot.fn.proxy = true
      }
      res[slot.key] = slot.fn
    }
  }
  if (contentHashKey) {
    ;(res as any).$key = contentHashKey
  }
  return res as any
}


