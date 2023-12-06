
/**
在Vue中，作用域插槽（Scoped Slots）是一个非常重要的概念，它能够让父组件向子组件传递数据，并且在子组件中使用这些数据。而./dist/src/core/vdom/helpers/normalize-scoped-slots.ts文件的作用就是将作用域插槽的数据进行归一化处理，方便在VNode节点上进行处理和渲染。

具体来说，这个文件主要有两个函数，分别是normalizeScopedSlots和normalizeScopedSlot。

normalizeScopedSlots函数接收一个作用域插槽对象，返回一个新的对象，将作用域插槽对象中的每个插槽都进行归一化处理。归一化处理的过程包括将插槽的值转换为数组形式，对插槽进行排序等操作。

normalizeScopedSlot函数则是对单个插槽进行归一化处理，接收三个参数：插槽名称、插槽值和插槽的作用域。在归一化处理过程中，会判断插槽值的类型，如果是函数，则将其封装成对象形式并返回，否则直接返回插槽值。同时，还会将插槽的作用域添加到返回对象中。

该文件与其他文件的关系：normalize-scoped-slots.ts文件是Vue源码中VNode节点相关的辅助函数中的一部分，主要用于处理作用域插槽相关数据，并在其他文件中被调用。例如，在./dist/src/core/vdom/create-component.js文件中，normalizeScopedSlots函数会被用来对组件的作用域插槽进行归一化处理。
 */
 



/**
这段代码主要是导入了一些Vue源码中需要用到的工具函数和类型，其中包括：

- `def`：定义一个属性（在Vue中被用于添加响应式数据）
- `normalizeChildren`：将子节点规范化为VNode数组
- `emptyObject`：一个空对象（在Vue中被用于占位符）
- `isArray`：判断一个值是否为数组
- `isAsyncPlaceholder`：判断一个节点是否为异步占位符
- `VNode`：虚拟节点的类型
- `Component`：组件的类型
- `currentInstance` 和 `setCurrentInstance`：在Vue 3.x中用于跟踪当前实例的工具函数

这些导入的工具函数和类型，在后续的代码中会被用到。
 */
 
import { def } from 'core/util/lang'
import { normalizeChildren } from 'core/vdom/helpers/normalize-children'
import { emptyObject, isArray } from 'shared/util'
import { isAsyncPlaceholder } from './is-async-placeholder'
import type VNode from '../vnode'
import { Component } from 'types/component'
import { currentInstance, setCurrentInstance } from 'v3/currentInstance'



/**
该方法是Vue中用于规范化作用域插槽的辅助函数，主要作用是对传入的作用域插槽对象进行处理并返回一个新的对象。下面对该函数的具体实现进行解释：

- normalizeScopedSlots 函数接收四个参数ownerVm、scopedSlots、normalSlots和prevScopedSlots。
- 判断是否有普通插槽，如果有则hasNormalSlots为true，否则为false。
- 判断当前的 scopedSlots 是否稳定（即不会随着父组件的状态变化而变化），如果有则isStable为true，否则为false。
- 如果没有传入 scopedSlots，则直接返回空对象。
- 如果当前 scopedSlots 已经被规范化过，则直接返回已经规范化后的结果。
- 如果当前 scopedSlots 是稳定的，并且之前的 prevScopedSlots 对象也是稳定的，且两者的 key 值相同，并且没有普通插槽需要代理，则可以直接返回 prevScopedSlots。
- 如果以上情况都不满足，则需要对 scopedSlots 进行规范化处理。遍历 scopedSlots 中的所有非 $ 符号开头的属性，对每个属性调用normalizeScopedSlot函数进行规范化处理。
- 遍历 normalSlots 中的所有属性，如果其在 res 中不存在，则需要通过 proxyNormalSlot 函数进行代理处理。
- 最后，将当前的规范化结果存储到 scopedSlots._normalized 属性中，并将 $stable、$key 和 $hasNormal 属性添加到 res 对象中，最后返回 res。
 */
 
export function normalizeScopedSlots(
  ownerVm: Component,
  scopedSlots: { [key: string]: Function } | undefined,
  normalSlots: { [key: string]: VNode[] },
  prevScopedSlots?: { [key: string]: Function }
): any {
  let res
  const hasNormalSlots = Object.keys(normalSlots).length > 0
  const isStable = scopedSlots ? !!scopedSlots.$stable : !hasNormalSlots
  const key = scopedSlots && scopedSlots.$key
  if (!scopedSlots) {
    res = {}
  } else if (scopedSlots._normalized) {
    // fast path 1: child component re-render only, parent did not change
    return scopedSlots._normalized
  } else if (
    isStable &&
    prevScopedSlots &&
    prevScopedSlots !== emptyObject &&
    key === prevScopedSlots.$key &&
    !hasNormalSlots &&
    !prevScopedSlots.$hasNormal
  ) {
    // fast path 2: stable scoped slots w/ no normal slots to proxy,
    // only need to normalize once
    return prevScopedSlots
  } else {
    res = {}
    for (const key in scopedSlots) {
      if (scopedSlots[key] && key[0] !== '$') {
        res[key] = normalizeScopedSlot(
          ownerVm,
          normalSlots,
          key,
          scopedSlots[key]
        )
      }
    }
  }
  // expose normal slots on scopedSlots
  for (const key in normalSlots) {
    if (!(key in res)) {
      res[key] = proxyNormalSlot(normalSlots, key)
    }
  }
  // avoriaz seems to mock a non-extensible $scopedSlots object
  // and when that is passed down this would cause an error
  if (scopedSlots && Object.isExtensible(scopedSlots)) {
    scopedSlots._normalized = res
  }
  def(res, '$stable', isStable)
  def(res, '$key', key)
  def(res, '$hasNormal', hasNormalSlots)
  return res
}



/**
这是一个用于标准化作用域插槽（scoped slot）的辅助函数。

首先，该函数接收了四个参数：vm、normalSlots、key 和 fn。其中，vm 表示当前组件实例，normalSlots 表示普通插槽的对象，key 表示当前作用域插槽名称，fn 表示作用域插槽的渲染函数。

然后，该函数创建了一个名为 normalized 的函数，并在其中执行了以下操作：

1. 保存当前实例，设置当前实例为 vm；
2. 调用传入的渲染函数 fn，并将其参数传递给它，如果没有参数，则传递空对象 {}；
3. 对 fn 返回的结果进行标准化处理，得到一个 VNode 数组 res；
4. 恢复当前实例为之前保存的实例；
5. 根据 res 中的内容返回合适的值。

最后，如果 fn 是通过新的 v-slot 语法编译而成的，则该函数将其添加到 normalSlots 对象中，并返回 normalized 函数；否则，它只返回 normalized 函数。

需要注意的是，该函数主要用于处理作用域插槽的渲染函数，将其标准化为一个符合 Vue 虚拟节点格式的数组，并返回一个函数以及将该函数添加到 normalSlots 对象上。
 */
 
function normalizeScopedSlot(vm, normalSlots, key, fn) {
  const normalized = function () {
    const cur = currentInstance
    setCurrentInstance(vm)
    let res = arguments.length ? fn.apply(null, arguments) : fn({})
    res =
      res && typeof res === 'object' && !isArray(res)
        ? [res] // single vnode
        : normalizeChildren(res)
    const vnode: VNode | null = res && res[0]
    setCurrentInstance(cur)
    return res &&
      (!vnode ||
        (res.length === 1 && vnode.isComment && !isAsyncPlaceholder(vnode))) // #9658, #10391
      ? undefined
      : res
  }
  // this is a slot using the new v-slot syntax without scope. although it is
  // compiled as a scoped slot, render fn users would expect it to be present
  // on this.$slots because the usage is semantically a normal slot.
  if (fn.proxy) {
    Object.defineProperty(normalSlots, key, {
      get: normalized,
      enumerable: true,
      configurable: true
    })
  }
  return normalized
}



/**
在Vue中，有一种叫做scoped slots的功能。它可以让父组件向子组件传递一个或多个具名插槽，并且子组件在渲染时可以使用这些插槽，对这些插槽进行自定义的处理。

normalize-scoped-slots.ts文件中的函数proxyNormalSlot(slots, key)返回了一个函数，这个函数实际上是一个闭包。这个闭包在调用时会返回slots[key]，其中slots是父组件传递给子组件的插槽对象，key则是插槽的名称。

为什么要使用这种方式来获取插槽呢？因为在Vue模板中，我们可以直接使用插槽名称来引用插槽，例如：

```
<child-component>
  <template v-slot:my-slot-name>
    <!-- 这里是插槽内容 -->
  </template>
</child-component>
```

但是在编程时，我们需要以代码的形式动态地获取和操作插槽，这时就需要使用这种通过闭包来获取插槽的方式了。
 */
 
function proxyNormalSlot(slots, key) {
  return () => slots[key]
}


