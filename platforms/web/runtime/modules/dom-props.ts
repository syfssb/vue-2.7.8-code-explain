
/**
./dist/src/platforms/web/runtime/modules/dom-props.ts文件是Vue源码中的一个模块，它定义了一些处理DOM属性的方法，主要用于在运行时修改DOM元素的属性。该模块包含了一些方法，例如`patchAttr`、`patchStyle`和`on`等，这些方法是在运行时应用于虚拟 DOM 的更新过程中。

在整个Vue源码中，./dist/src/platforms/web/runtime/modules/dom-props.ts文件属于Vue运行时的模块，用于处理浏览器环境下的DOM属性操作。它与其他模块（如./dist/src/core/vdom/patch.ts）共同构成了Vue的虚拟DOM操作机制。在Vue组件挂载到页面后，通过该模块提供的方法来更新DOM节点的属性和样式，以及绑定事件等。

总之，./dist/src/platforms/web/runtime/modules/dom-props.ts文件是Vue源码中关键的一部分，负责实现浏览器环境下的DOM属性操作，并且在整个Vue的运行时中都发挥着至关重要的作用。
 */
 



/**
`dom-props.ts`文件是Vue中用于操作DOM属性的模块，包含了一些方法和函数，如`updateDOMProps()`、`updateDOMListeners()`等。这些方法和函数主要是用于在渲染VNode时更新DOM元素的属性和事件监听器。

在该文件的开头，我们可以看到有使用`import`语句引入了几个工具函数和类型定义：

- `isDef`：检查一个值是否已定义。
- `isUndef`：检查一个值是否未定义。
- `extend`：将多个对象合并成一个对象，并返回结果。
- `toNumber`：将一个字符串或其他类型的数据转换为数字。如果无法转换，则返回原始值。
- `isTrue`：检查一个值是否为true。
- `VNodeWithData`：表示带有附加数据的虚拟节点的类型定义。
- `isSVG`：检查当前是否处于SVG环境下。

这些工具函数和类型定义在整个Vue代码库中得到了广泛的应用，用于辅助实现各种功能，提高了代码的可读性和可维护性。
 */
 
import { isDef, isUndef, extend, toNumber, isTrue } from 'shared/util'
import type { VNodeWithData } from 'types/vnode'
import { isSVG } from 'web/util/index'



/**
在Vue的源码中，./dist/src/platforms/web/runtime/modules/dom-props.ts是一个与DOM元素属性相关的模块。在这个模块中，有一个变量名为`svgContainer`。

这个变量是用于创建一个SVG元素的容器，它被用来测试当前浏览器是否支持SVG元素的动态属性绑定。由于SVG元素的属性比普通HTML元素更复杂，所以需要使用该容器进行测试。

当Vue检测到当前浏览器不支持SVG元素的动态属性绑定时，会使用一种备用方法来处理这些元素。因此，`svgContainer`变量的作用就是用来检测当前浏览器是否支持SVG元素的动态属性绑定。
 */
 
let svgContainer



/**
这段代码的作用是更新dom元素上的属性，其中oldVnode和vnode都是虚拟节点对象（VNodeWithData）。通过判断是否有oldVnode和vnode的domProps属性来确定是否需要进行更新。

在函数的开头，使用isUndef方法（该方法用于判断值是否为undefined或null）来判断oldVnode和vnode的domProps属性是否为undefined或null。如果两者都为undefined或null，则直接返回。

接下来，定义了变量key和cur，分别用于记录当前遍历的属性名和属性值。然后获取vnode对应的真实DOM元素对象，存储在elm变量中。

之后，定义了旧节点（oldVnode）和新节点（vnode）的domProps属性值。如果props对象本身是被观察的对象或者为特殊标记_v_attr_proxy，则将其克隆一份，存储到vnode.data.domProps属性中，以防止用户修改原始数据对象。

最后，这个函数会根据新旧节点的domProps属性值进行属性的添加、删除和更新。
 */
 
function updateDOMProps(oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
    return
  }
  let key, cur
  const elm: any = vnode.elm
  const oldProps = oldVnode.data.domProps || {}
  let props = vnode.data.domProps || {}
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(props.__ob__) || isTrue(props._v_attr_proxy)) {
    props = vnode.data.domProps = extend({}, props)
  }



/**
这段代码的作用是遍历旧的DOM属性对象（`oldProps`），如果在新的DOM属性对象（`props`）中不存在该属性，则清空该属性值。

具体来说，这个循环用于处理旧的DOM元素节点的属性，比如之前设置了 `class` 或者 `style` 属性等等。在更新 DOM 元素节点时，新的属性可能减少了一些属性。如果不处理这些旧属性的话会导致这些被删除的属性仍然存在于 DOM 节点上，造成不必要的麻烦。

因此这个循环的作用是将旧的DOM元素节点中存在而新的节点中不存在的属性，统一设置为空字符串，以确保更新后的DOM树中不再存在这些删除的属性。
 */
 
  for (key in oldProps) {
    if (!(key in props)) {
      elm[key] = ''
    }
  }



/**
这段代码是在遍历props对象的属性，并针对其中的textContent和innerHTML做了一些特殊处理。如果vnode有子节点，那么先将其清空。如果当前属性与旧属性相同，则直接跳过。

接下来的部分是解决Chrome版本55及以下的bug：当使用innerHTML或textContent替换一个单独的文本节点时，会保留它的parentNode属性。为了解决这个问题，需要手动移除该节点，从而避免后续更新时出现错误。

总体来说，这段代码主要是针对textContent和innerHTML这两个属性进行了特殊处理，在存在子节点、避免重复更新等方面做了优化。
 */
 
  for (key in props) {
    cur = props[key]
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) vnode.children.length = 0
      if (cur === oldProps[key]) continue
      // #6601 work around Chrome version <= 55 bug where single textNode
      // replaced by innerHTML/textContent retains its parentNode property
      if (elm.childNodes.length === 1) {
        elm.removeChild(elm.childNodes[0])
      }
    }



/**
这段代码是定义了 DOM 属性模块，主要用于更新元素的属性。这个模块会在虚拟 DOM 中调度，通过对比新旧 VNode 的 data 对象中的 props 和 attrs 属性，来决定是否需要更新元素的相应属性。

具体来说，上述代码中有三种情况：

1. 如果 key 是 'value' 并且元素不是 'PROGRESS' 标签，那么将当前的值存储为 '_value'，同时避免在值相同的情况下重新设置光标位置，然后将字符串化的值赋值给元素的 value 属性。

2. 如果 key 是 'innerHTML' 并且元素是 SVG 元素并且没有 innerHTML 属性，那么创建一个 div 元素（svgContainer）用于包含 SVG 元素，并将 cur 插入到 svgContainer 中。接着，移除原先的所有子节点，然后将新的 SVG 节点添加到 elm（也就是 SVG 元素）中。

3. 如果 key 不是 value 或者 innerHTML，那么直接将 cur 赋值给 elm 的属性 key 上，这里有 try-catch 语句处理异常。
 */
 
    if (key === 'value' && elm.tagName !== 'PROGRESS') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur
      // avoid resetting cursor position when value is the same
      const strCur = isUndef(cur) ? '' : String(cur)
      if (shouldUpdateValue(elm, strCur)) {
        elm.value = strCur
      }
    } else if (
      key === 'innerHTML' &&
      isSVG(elm.tagName) &&
      isUndef(elm.innerHTML)
    ) {
      // IE doesn't support innerHTML for SVG elements
      svgContainer = svgContainer || document.createElement('div')
      svgContainer.innerHTML = `<svg>${cur}</svg>`
      const svg = svgContainer.firstChild
      while (elm.firstChild) {
        elm.removeChild(elm.firstChild)
      }
      while (svg.firstChild) {
        elm.appendChild(svg.firstChild)
      }
    } else if (
      // skip the update if old and new VDOM state is the same.
      // `value` is handled separately because the DOM value may be temporarily
      // out of sync with VDOM state due to focus, composition and modifiers.
      // This  #4521 by skipping the unnecessary `checked` update.
      cur !== oldProps[key]
    ) {
      // some property updates can throw
      // e.g. `value` on <progress> w/ non-finite value
      try {
        elm[key] = cur
      } catch (e: any) {}
    }
  }
}



/**
在Vue中，./dist/src/platforms/web/runtime/modules/dom-props.ts是负责处理DOM属性的模块。其中有一个类型定义`acceptValueElm`用于描述一些HTML元素类型，这些元素类型接受值并支持value属性。这个类型定义和其他相关代码一起用于在处理表单元素时进行类型检查和正确的取值。具体来说，它指定了三种HTML元素类型：`HTMLInputElement`、`HTMLSelectElement`和`HTMLOptionElement`，这些元素类型都具有value属性，并且能够接收值。

总之，这个类型定义的作用是帮助Vue在处理表单元素时保证数据的正确性和一致性。
 */
 
// check platforms/web/util/attrs.js acceptValue
type acceptValueElm = HTMLInputElement | HTMLSelectElement | HTMLOptionElement



/**
这段代码主要是用于判断是否需要更新DOM元素的值，其中参数`elm`表示DOM元素，参数`checkVal`表示新的值。

函数返回一个布尔值，说明是否需要更新。具体来说：

- `!elm.composing`表示不处于输入法输入状态，因为此时输入法输入的内容还没有确定下来，我们不应该将其作为元素的值。
- `(elm.tagName === 'OPTION' || isNotInFocusAndDirty(elm, checkVal) || isDirtyWithModifiers(elm, checkVal))`，如果满足以下任意一条，则表明需要更新：
  - 当前元素是`<option>`元素，因为`<option>`的值需要被设置为`value`属性而不是`textContent`属性。
  - 元素不在聚焦状态，并且新的值与旧的值不相等，需要更新。
  - 或者使用了自定义修饰符，也需要更新。

总之，这个函数主要是用来判断是否需要更新DOM元素的值。
 */
 
function shouldUpdateValue(elm: acceptValueElm, checkVal: string): boolean {
  return (
    //@ts-expect-error
    !elm.composing &&
    (elm.tagName === 'OPTION' ||
      isNotInFocusAndDirty(elm, checkVal) ||
      isDirtyWithModifiers(elm, checkVal))
  )
}



/**
这段代码是用来判断一个元素是否失去了焦点，并且其值发生了变化。主要用于处理文本框的情形。

具体来说，isNotInFocusAndDirty接受两个参数：elm和checkVal。其中，elm代表一个DOM元素（通常是一个input元素），而checkVal代表该元素应有的值。

该函数首先尝试判断当前页面上的活动元素是否为elm，以此来判断elm是否失去了焦点。如果无法获取当前活动元素，就默认认为elm已失去了焦点。然后，通过比较elm的实际值和期望值来确定elm的值是否发生了变化，如果发生了变化，则返回true，否则返回false。

这段代码的作用在于，在Vue中，当用户输入一个新的值时，Vue需要检查DOM元素的值是否发生了变化，以此来决定是否需要更新组件的状态。因此，Vue需要监测DOM元素的变化，并实时与组件状态进行同步。isNotInFocusAndDirty函数提供了一种判断DOM元素是否发生了变化的方式，从而帮助Vue实现这个功能。
 */
 
function isNotInFocusAndDirty(elm: acceptValueElm, checkVal: string): boolean {
  // return true when textbox (.number and .trim) loses focus and its value is
  // not equal to the updated value
  let notInFocus = true
  // #6157
  // work around IE bug when accessing document.activeElement in an iframe
  try {
    notInFocus = document.activeElement !== elm
  } catch (e: any) {}
  return notInFocus && elm.value !== checkVal
}



/**
这段代码的作用是判断一个元素的属性值是否被修改，并且考虑到了 v-model 指令的修饰符。

具体来说，这个函数接受两个参数：一个元素对象 `elm` 和一个新的属性值 `newVal`。它首先获取该元素已有的属性值 `value`，然后查看该元素是否有 v-model 指令的修饰符，如果有则根据修饰符对比该元素的属性值和新的属性值是否相等：

- 如果有 `.number` 修饰符，则将属性值转为数字再进行比较；
- 如果有 `.trim` 修饰符，则将属性值去除两端空格再进行比较。

最后，如果没有修饰符或者修饰符不符合上述情况，则直接比较该元素的属性值和新的属性值是否相等。

这个函数主要用于优化组件更新性能，避免不必要的 DOM 操作。在使用 v-model 指令时，当用户输入引起模型数据变化时，Vue 会通过监听 input 或者 change 事件来更新模型数据和元素的属性值，而该函数则用于判断是否需要更新元素的属性值，如果不需要则可以避免不必要的 DOM 操作。
 */
 
function isDirtyWithModifiers(elm: any, newVal: string): boolean {
  const value = elm.value
  const modifiers = elm._vModifiers // injected by v-model runtime
  if (isDef(modifiers)) {
    if (modifiers.number) {
      return toNumber(value) !== toNumber(newVal)
    }
    if (modifiers.trim) {
      return value.trim() !== newVal.trim()
    }
  }
  return value !== newVal
}



/**
这段代码导出了一个对象，该对象包含两个属性：create和update。这些属性的值都是指向同一个函数 updateDOMProps。

在Vue中，组件的虚拟 DOM 节点最终会转换成真实的 DOM 节点，这样才能渲染到页面上。当我们更新组件时，需要根据新的数据来更新组件的 DOM 属性（比如 class、style、attr 等），而不是直接替换整个 DOM 节点。

为了优化性能，Vue 会尽可能地复用已有的 DOM 节点，并且只更新必要的 DOM 属性。因此，在这个文件中，定义了一个名为 updateDOMProps 的函数，它被用来更新 DOM 属性。

同时，将 updateDOMProps 函数赋值给 create 和 update 属性，意味着在初始化时和更新时都可以使用同一个函数来处理 DOM 属性的变化。这也符合 Vue 响应式系统的设计理念：对于同一种类型的操作，只需要定义一次处理函数。
 */
 
export default {
  create: updateDOMProps,
  update: updateDOMProps
}


