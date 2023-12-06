
/**
./dist/src/platforms/web/runtime/modules/attrs.ts文件是Vue在web平台下的运行时模块之一，它负责处理元素上的特性和属性。

在Vue中，元素的特性和属性可以通过v-bind绑定或直接写在模板中。这些特性和属性在被渲染成真实DOM时需要被处理，attrs.ts模块就是用来处理这个过程的。

具体来说，attrs.ts模块会在createElement函数中被调用，在创建元素时对特性和属性进行处理和规范化。它会先将所有的特性和属性收集起来，然后将特殊的特性（如class、style等）进行处理并合并为一个对象，最后将其他特性和属性也放入到该对象中，最后返回一个包含特性和属性的对象作为createElement函数的第二个参数。

attrs.ts模块的作用是非常重要的，因为它涉及到了Vue模板与真实DOM之间的数据交互，而这也是Vue框架的核心功能之一。同时，它也与其它模块有着紧密的关系，如class、style等模块都会在attrs.ts中被调用，共同完成对特性和属性的处理。
 */
 



/**
`isIE`、`isIE9` 和 `isEdge` 是来自于 `core/util/env` 模块中的三个函数。这些函数是用来检测当前浏览器是否为 IE 浏览器或 Edge 浏览器。

在 Vue 的运行时模块中，`attrs.ts` 文件是用来处理元素的属性。由于不同浏览器对属性的支持程度各不相同，因此需要根据当前浏览器的类型来判断如何处理这些属性。

例如，当浏览器为 IE 或 Edge 时，它们可能会以不同的方式处理某些属性（比如 class 和 style 属性）。因此在处理这些属性时，需要根据浏览器的类型采取不同的策略来保证兼容性。

这就是为什么在 `attrs.ts` 文件中会引入 `isIE`、`isIE9` 和 `isEdge` 函数的原因。这些函数可以根据当前浏览器的类型返回一个布尔值，以便在处理元素属性时作出正确的判断和处理。
 */
 
import { isIE, isIE9, isEdge } from 'core/util/env'



/**
这段代码中的 `import` 关键字是用于引入模块中的其他依赖。在这个文件中，它们被用来引入了一个名为 `extend` 的函数和三个类型属于 `types/vnode` 模块的接口： `VNodeWithData`。

- `extend` 函数是一个工具函数，可以将一个对象复制到另一个对象中。可以理解为对象浅拷贝的实现。这个函数在 Vue 中封装了很多地方都会用到，例如合并选项、混入等操作。
- `isDef` 函数用于检查一个值是否已定义。如果一个值已经定义，则返回 true；否则返回 false。
- `isUndef` 函数用于检查一个值是否未定义。如果一个值未定义，则返回 true；否则返回 false。
- `isTrue` 函数用于检查一个值是否为真。如果一个值为真，则返回 true；否则返回 false。

`VNodeWithData` 接口则定义了一个带有 data 属性的虚拟节点 VNode，其中 data 属性必须是一个对象。

这些函数和接口在这个文件中被用来处理属性相关的逻辑，例如，检查属性是否存在、合并属性等操作。
 */
 
import { extend, isDef, isUndef, isTrue } from 'shared/util'
import type { VNodeWithData } from 'types/vnode'



/**
./dist/src/platforms/web/runtime/modules/attrs.ts是Vue在Web平台上的运行时模块之一，主要负责处理HTML元素上的属性。其中引入了许多工具函数，这些工具函数主要用于帮助我们处理不同类型的属性。

1. `isXlink`：用于判断一个属性名是否以"xlink:"开头，如果是，则代表这是一个xlink属性。
2. `xlinkNS`：代表xlink命名空间。
3. `getXlinkProp`：用于获取一个xlink属性名。
4. `isBooleanAttr`：判断一个属性是否为布尔类型属性。
5. `isEnumeratedAttr`：判断一个属性是否为枚举类型属性。
6. `isFalsyAttrValue`：判断一个属性值是否为falsy值。
7. `convertEnumeratedValue`：将一个枚举属性的值转换为其对应的字符串形式。

这些工具函数的作用是让attrs模块能够更加高效地处理不同类型的属性。同时，在Vue源码中，使用这些工具函数也会提高代码的可读性和可维护性。
 */
 
import {
  isXlink,
  xlinkNS,
  getXlinkProp,
  isBooleanAttr,
  isEnumeratedAttr,
  isFalsyAttrValue,
  convertEnumeratedValue
} from 'web/util/index'



/**
这段代码是Vue中用于更新元素属性的模块之一。当一个组件实例被创建时，它会根据属性值来渲染出对应的DOM元素。在使用过程中，有时候我们需要动态地改变这个组件实例的属性值，比如给它添加一个class。

updateAttrs函数接收两个参数oldVnode和vnode，分别表示旧的虚拟节点和新的虚拟节点。该函数首先判断组件是否设置了不继承父组件的属性（inheritAttrs），如果是，则直接返回。然后判断旧节点和新节点上是否都没有设置任何属性，如果都没有则也直接返回。接下来通过遍历新节点上的属性来更新元素的属性。

为了防止观察到的对象被污染，该函数还会通过isDef(attrs.__ob__) || isTrue(attrs._v_attr_proxy)判断属性是否是可观察的（ observed objects），如果是，则将其克隆一份，以保证对象不会被修改。最后，更新完属性后，该函数会返回undefined。
 */
 
function updateAttrs(oldVnode: VNodeWithData, vnode: VNodeWithData) {
  const opts = vnode.componentOptions
  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
    return
  }
  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return
  }
  let key, cur, old
  const elm = vnode.elm
  const oldAttrs = oldVnode.data.attrs || {}
  let attrs: any = vnode.data.attrs || {}
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(attrs.__ob__) || isTrue(attrs._v_attr_proxy)) {
    attrs = vnode.data.attrs = extend({}, attrs)
  }



/**
这段代码是Vue源码中用于处理元素属性的模块，主要分为三个部分：

1. 遍历新的属性集合（attrs对象），判断当前属性是否与旧的属性相同，如果不同则调用setAttr方法更新属性。其中，setAttr方法会根据属性名称的不同进行不同的操作，例如class和style属性需要特殊处理；vnode.data.pre是一个标记位，用于标识组件是否处于transition状态。

2. 在IE9及以下版本中，当input元素的type属性变化时，可能会重置其value属性，因此需要在这种情况下手动设置value属性。

3. 遍历旧的属性集合（oldAttrs对象），如果该属性在新的属性集合中不存在，则需要将其从元素中移除。对于xlink命名空间下的属性和非枚举属性，需要使用removeAttributeNS和removeAttribute方法进行移除。

总体来说，这段代码主要是用于解决浏览器兼容性问题和元素属性更新的问题。
 */
 
  for (key in attrs) {
    cur = attrs[key]
    old = oldAttrs[key]
    if (old !== cur) {
      setAttr(elm, key, cur, vnode.data.pre)
    }
  }
  // #4391: in IE9, setting type can reset value for input[type=radio]
  // #6666: IE/Edge forces progress value down to 1 before setting a max
  /* istanbul ignore if */
  if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value)
  }
  for (key in oldAttrs) {
    if (isUndef(attrs[key])) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key))
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key)
      }
    }
  }
}



/**
这段代码是Vue中运行时的模块之一，它主要负责处理元素属性的设置。

具体来说，这个函数需要四个参数：元素本身、属性名、属性值以及一个是否在pre标签内的标识。首先判断元素是否在pre标签内或者是自定义组件（自定义组件名称包含“-”），如果是，则直接调用baseSetAttr方法设置元素属性；否则按照属性名的类型进行分类处理。

对于布尔型属性，如果属性值为false或者undefined，则移除该属性，否则设置该属性，并且如果属性名是"allowfullscreen"，并且元素是EMBED标签，则将属性值设为"true"。

对于枚举型属性，通过convertEnumeratedValue函数将属性值转换成字符串形式，然后设置该属性。

对于xlink命名空间下的属性，如果属性值是false或者undefined，则移除该属性，否则设置该属性。

最后，对于其他情况，仍然调用baseSetAttr方法设置元素属性。
 */
 
function setAttr(el: Element, key: string, value: any, isInPre?: any) {
  if (isInPre || el.tagName.indexOf('-') > -1) {
    baseSetAttr(el, key, value)
  } else if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key)
    } else {
      // technically allowfullscreen is a boolean attribute for <iframe>,
      // but Flash expects a value of "true" when used on <embed> tag
      value = key === 'allowfullscreen' && el.tagName === 'EMBED' ? 'true' : key
      el.setAttribute(key, value)
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, convertEnumeratedValue(key, value))
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key))
    } else {
      el.setAttributeNS(xlinkNS, key, value)
    }
  } else {
    baseSetAttr(el, key, value)
  }
}



/**
这段代码定义了一个名为`baseSetAttr`的函数，用于给DOM元素设置属性。该函数接收三个参数：要设置属性的DOM元素、要设置的属性名称和属性值。

首先，这个函数会调用`isFalsyAttrValue`方法判断属性值是否为假值（null、undefined、false等）。如果属性值为假值，则使用`removeAttribute`方法移除该属性；否则，使用`setAttribute`方法设置该属性的值为传入的属性值。

在此之后，该函数会进行一些特殊处理。如果浏览器是IE10/11，并且当前的DOM元素是`<textarea>`标签且要设置的属性是`placeholder`，并且属性值不为空且该元素没有被修补过（即没有添加`__ieph`属性），那么该函数会创建一个事件监听器，在第一次输入时立即阻止事件冒泡，并将该监听器从元素中移除。同时，该函数会将元素的`__ieph`属性设置为`true`，表示该元素已经被修补过。这个特殊处理是为了在IE10/11浏览器中修复`<textarea>`标签的`placeholder`属性无法正常工作的问题。
 */
 
function baseSetAttr(el, key, value) {
  if (isFalsyAttrValue(value)) {
    el.removeAttribute(key)
  } else {
    // #7138: IE10 & 11 fires input event when setting placeholder on
    // <textarea>... block the first input event and remove the blocker
    // immediately.
    /* istanbul ignore if */
    if (
      isIE &&
      !isIE9 &&
      el.tagName === 'TEXTAREA' &&
      key === 'placeholder' &&
      value !== '' &&
      !el.__ieph
    ) {
      const blocker = e => {
        e.stopImmediatePropagation()
        el.removeEventListener('input', blocker)
      }
      el.addEventListener('input', blocker)
      // $flow-disable-line
      el.__ieph = true /* IE placeholder patched */
    }
    el.setAttribute(key, value)
  }
}



/**
这段代码是一个Vue的模块，它是用来更新DOM元素上的属性的。具体来说，这个模块包含了两个方法：

- create: 这个方法在DOM元素创建时调用，用来初始化DOM元素上的属性，通过调用updateAttrs方法实现。
- update: 这个方法在DOM元素更新时调用，用来更新DOM元素上的属性，同样也是通过调用updateAttrs方法实现。

这里export default语句是用于导出整个模块对象的，表示该模块是默认导出的。也就是说，当其他模块需要使用此模块时，可以直接使用import语句导入该模块，而不需要指定具体的变量名。

updateAttrs方法是一个通用方法，它会遍历传入的新props，与旧props进行比较，如果有变化则更新DOM元素的属性。由于create和update方法都需要更新DOM元素上的属性，因此它们都调用了updateAttrs方法来完成这个任务。
 */
 
export default {
  create: updateAttrs,
  update: updateAttrs
}


