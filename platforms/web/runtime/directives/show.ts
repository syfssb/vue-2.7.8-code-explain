
/**
`show.ts` 文件是 Vue 运行时的一个内置指令，它对应着 `v-show` 指令。`v-show` 可以用来控制元素的显示和隐藏，当绑定的表达式为 `false` 的时候，元素会被隐藏，而当绑定的表达式为 `true` 的时候，元素会被显示。

具体来说，`show.ts` 文件中定义了 `show` 指令的钩子函数，包括 `bind`、`update` 和 `unbind` 三个函数。其中，`bind` 函数在指令第一次绑定到元素时调用，`update` 函数在指令所在组件的数据更新时被调用，`unbind` 函数则是在指令与元素解绑时被调用。

另外，`show.ts` 文件还定义了一些工具函数，用于处理元素的样式和属性。

在整个 Vue 源码中，`show.ts` 文件属于 Vue 运行时的一部分，位于 `./src/platforms/web/runtime/directives` 目录下。该目录包含了所有内置的指令，如 `v-if`、`v-for`、`v-bind` 等等。这些指令都是通过 Vue 的编译器转换成相应的渲染函数，在组件实例化时执行，从而实现了动态渲染的效果。
 */
 



/**
./dist/src/platforms/web/runtime/directives/show.ts是Vue的指令模块之一。在这个模块中，Vue定义了v-show指令的实现方式。

具体来说，import VNode from 'core/vdom/vnode'是引入Virtual DOM中的VNode类，用于生成虚拟节点。

而type { VNodeDirective, VNodeWithData } from 'types/vnode'则是从Vue的类型定义文件中引入VNodeDirective和VNodeWithData两个接口类型。VNodeDirective定义了一个指令对象的基本结构，而VNodeWithData则是一个带有数据的虚拟节点。

最后，import { enter, leave } from 'web/runtime/modules/transition'则是引入了Vue的过渡动画模块中的enter和leave函数，这些函数会在指令绑定和解绑时被调用，用于添加或移除CSS过渡类名。
 */
 
import VNode from 'core/vdom/vnode'
import type { VNodeDirective, VNodeWithData } from 'types/vnode'
import { enter, leave } from 'web/runtime/modules/transition'



/**
这段代码是实现了Vue中`v-show`指令的具体实现，其作用是在渲染组件时控制元素的显示和隐藏。在这段代码中，`locateNode`函数通过递归搜索组件根节点中是否存在过渡效果（transition），并返回该节点的VNodeWithData类型实例。

具体来说，这个函数首先判断当前节点是否为组件，并且该组件没有定义过渡效果。如果满足这两个条件，则继续搜索该组件的子节点，直到找到最后一个非组件节点为止，然后返回该节点的VNodeWithData类型实例。

在`v-show`指令的具体实现中，该函数的返回值被用来控制元素的显示和隐藏。如果元素需要隐藏，则会将其的样式设置为"display:none"，而如果需要显示，则会将其的样式设置为"display:"。因此，该函数的作用就是在组件树中查找到真正需要被显示或隐藏的元素节点。
 */
 
// recursively search for possible transition defined inside the component root
function locateNode(vnode: VNode | VNodeWithData): VNodeWithData {
  // @ts-expect-error
  return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.componentInstance._vnode!)
    : vnode
}



/**
这段代码是Vue中 v-show 指令的实现。它定义了 v-show 指令的 bind 钩子函数，该钩子函数在指令第一次绑定到元素上时被调用。

在这个钩子函数中，首先通过 locateNode 函数获取 vnode（虚拟节点）的实际节点（el），然后获取 vnode 的 transition 属性和原始的 display 样式。如果指令的值为 true 并且存在 transition，则设置 vnode.data.show 为 true，并执行 enter 函数，在进入过渡状态时将 el 的 display 样式设置为原始值。如果指令的值为 false，则将 el 的 display 样式设置为 'none'。如果指令的值为 true 且不存在 transition，则将 el 的 display 样式设置为原始值。

这段代码展示了 Vue 实现指令的方法，主要使用了 vnode 和 vnode.data 来存储指令信息和状态，并通过钩子函数来对元素进行操作。
 */
 
export default {
  bind(el: any, { value }: VNodeDirective, vnode: VNodeWithData) {
    vnode = locateNode(vnode)
    const transition = vnode.data && vnode.data.transition
    const originalDisplay = (el.__vOriginalDisplay =
      el.style.display === 'none' ? '' : el.style.display)
    if (value && transition) {
      vnode.data.show = true
      enter(vnode, () => {
        el.style.display = originalDisplay
      })
    } else {
      el.style.display = value ? originalDisplay : 'none'
    }
  },



/**
这个文件中的代码是针对Vue的v-show指令进行更新的逻辑。v-show指令的作用是根据表达式的值来控制元素的显示和隐藏，与v-if的区别在于v-show只是通过CSS样式的display属性来控制显示和隐藏，而不是插入和删除DOM元素。

update方法接收三个参数：el、directive以及vnode。其中el代表指令绑定的元素，directive包含指令的值以及旧值，vnode则是这个元素对应的虚拟节点。

首先，代码中使用了一个if判断，判断当前的值与旧值是否相同，如果相同就直接返回，不做任何操作。这里使用了!value === !oldValue的方式来判断，实际上是在判断两者是否均为false或undefined或null。如果是的话，说明值没有改变，可以直接返回。

当值发生变化时，会调用locateNode(vnode)函数获取该节点的真实DOM元素，并检查它是否有transition属性。如果有，则将vnode.data.show属性设置为true，并根据传入的value值，分别调用enter()和leave()函数来执行进入和离开过渡效果。其中，enter()和leave()函数是vue内部定义的处理过渡效果的函数。

如果没有transition属性，则直接根据value值来设置元素的display属性，如果value为true，则将display属性设置为之前缓存的原始display属性，否则设置为'none'。这里使用了el.__vOriginalDisplay来缓存元素的原始display属性，避免因为频繁改变display属性导致浏览器重绘影响性能。
 */
 
  update(el: any, { value, oldValue }: VNodeDirective, vnode: VNodeWithData) {
    /* istanbul ignore if */
    if (!value === !oldValue) return
    vnode = locateNode(vnode)
    const transition = vnode.data && vnode.data.transition
    if (transition) {
      vnode.data.show = true
      if (value) {
        enter(vnode, () => {
          el.style.display = el.__vOriginalDisplay
        })
      } else {
        leave(vnode, () => {
          el.style.display = 'none'
        })
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none'
    }
  },



/**
这是Vue中的一个内置指令`v-show`的解绑函数（unbind function），用于在元素与指令解除绑定时执行。

这个函数主要有两个作用：

1. 如果还没有销毁（isDestroy为false），则将元素的display样式设置为之前保存在`el.__vOriginalDisplay`中的值，这个值是在绑定函数（bind function）中保存的原始display样式。这么做是为了保持元素在绑定指令之前的显示状态。

2. 如果已经销毁（isDestroy为true），则不需要做任何事情。

总之，这个函数的作用是在解除`v-show`指令和元素的绑定时恢复元素的原始显示状态。
 */
 
  unbind(
    el: any,
    binding: VNodeDirective,
    vnode: VNodeWithData,
    oldVnode: VNodeWithData,
    isDestroy: boolean
  ) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay
    }
  }
}


