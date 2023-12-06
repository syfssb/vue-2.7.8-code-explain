
/**
`normalize-children.ts` 文件的作用是将 Vue 组件中的 children 数组规范化(normalize)，使其成为一个统一的格式，方便后续的处理。

Vue 组件中的 children 可以是多种类型，如单个 VNode 实例、数组、字符串、数字等。而这些不同的类型对于后续的处理都有影响，因此需要对它们进行规范化。

具体来说，`normalize-children.ts` 会将 children 数组的每一项转化为 VNode 实例，并将多个连续的文本节点合并成一个文本节点，以便后续处理。

在整个 Vue 的源码中，`normalize-children.ts` 主要被以下几个文件所使用：

- `create-component.ts`：在创建组件时，如果组件传递了 children，就会调用 `normalizeChildren()` 进行规范化。
- `patch.ts`：在更新虚拟 DOM 树时，如果两个节点的 children 发生变化，就会调用 `normalizeChildren()` 对新旧节点的 children 进行规范化后比较。
- `render-helpers/index.ts`：在编译模板时，会将模板转化为渲染函数，其中包含了许多由 `normalizeChildren()` 规范化过的节点处理代码。
 */
 



/**
这段代码主要是导入了几个工具函数和实例化VNode对象的方法。具体解释如下：

1. `import VNode, { createTextVNode } from 'core/vdom/vnode'` :

这一行代码导入了`core/vdom/vnode`模块，并分别从中取出了`VNode`和`createTextVNode`两个对象。其中，`VNode`对象用于创建虚拟节点对象，而`createTextVNode`用于创建纯文本节点对象。

2. `import { isFalse, isTrue, isArray, isDef, isUndef, isPrimitive } from 'shared/util'` :

这一行代码导入了`shared/util`模块，并分别从中取出了6个函数：`isFalse`, `isTrue`, `isArray`, `isDef`, `isUndef`和`isPrimitive`。这些函数在处理节点子元素时非常有用。

总之，这些导入的函数和对象都是在帮助`normalizeChildren`函数对子元素进行规范化处理的过程中使用的。
 */
 
import VNode, { createTextVNode } from 'core/vdom/vnode'
import {
  isFalse,
  isTrue,
  isArray,
  isDef,
  isUndef,
  isPrimitive
} from 'shared/util'



/**
这段注释的意思是：Vue的模板编译器在编译阶段会尽可能地减少对子节点进行标准化处理的次数。对于纯HTML标记来说，由于编译器在编译时会分析模板并生成一个返回Array<VNode>的渲染函数，所以不需要进行额外的标准化处理。但是对于一些特殊情况，还是需要进行额外的标准化处理：

1. 当模板中包含用户自定义组件时，需要对这些组件的子节点进行标准化处理，因为这些子节点可能是一个数组、一个函数或者一个原始值。

2. 当模板中使用了v-for指令时，它通常会生成一个数组作为节点的子节点，而这个数组中的每个元素又可能是一个数组、一个函数或者一个原始值，因此也需要进行标准化处理。

总之，这段代码的作用就是对模板中的子节点进行标准化处理，确保它们都被转换成了VNode节点的形式，方便后续的处理和渲染。
 */
 
// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:



/**
这段代码的作用是对children进行简单规范化，确保它们是一维数组，以便更好地处理和渲染。在Vue中，组件可以返回一个数组而不是单个根节点。如果这样做，我们需要将其扁平化。而函数式组件已经规范化了它们自己的子元素，所以我们只需要简单地将这些子元素拍平成一个一维数组。

具体实现方式是循环遍历children数组，如果发现其中一个子元素是一个数组，就使用Array.prototype.concat方法将整个数组扁平化为一维数组并返回。如果没有子数组，则直接返回原始的children数组。
 */
 
// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
export function simpleNormalizeChildren(children: any) {
  for (let i = 0; i < children.length; i++) {
    if (isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}



/**
这段代码主要是用于规范化子节点，根据子节点的类型进行不同的处理。该函数接收一个children参数，代表当前节点的子节点，可能是一个数组或字符串等各种类型。

在初步判断完children的基本类型后，这个函数会根据以下两种情况进行处理：

1. 当children只包含简单的文本内容时，直接将其包裹为一个text类型的VNode返回。
2. 当children包含特殊语法（例如模板、v-for、手写render函数/JSX等）或者是由用户提供的复杂结构时，需要进行全面的规范化处理以适应所有可能的子节点类型。

如果children是一个数组，则调用normalizeArrayChildren(children)对其进行规范化；否则返回undefined，代表当前节点没有子节点。

总之，这个函数主要是用来规范化子节点的，使得子节点能够被正确地渲染到DOM中。
 */
 
// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
export function normalizeChildren(children: any): Array<VNode> | undefined {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : isArray(children)
    ? normalizeArrayChildren(children)
    : undefined
}



/**
在Vue中，vnode表示虚拟节点，是一个JavaScript对象，它描述了DOM元素的结构和属性。

在./dist/src/core/vdom/helpers/normalize-children.ts文件中，isTextNode(node)函数的作用是判断传入的节点是否为文本节点，并返回一个布尔值。

具体来说，当节点存在（即isDef(node)为真），并且节点上有文本属性（即isDef(node.text)为真），并且该节点不是注释节点（即isFalse(node.isComment)为真）时，我们认为这个节点为文本节点。如果节点不满足以上条件，则不是文本节点。
 */
 
function isTextNode(node): boolean {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment)
}



/**
这段代码是对传入的 children 进行归一化处理的函数，将 children 转换成 VNode 数组。

参数 children 是一个任意类型的值，如果它是一个数组，则递归调用 normalizeArrayChildren，否则判断它是否为原始值，如果是则转换成文本节点 VNode，否则直接作为子节点 VNode 添加到 res 中。在处理过程中，还会对相邻的文本节点进行合并。

这个函数的作用是为了解决使用 template 或 JSX 语法时，传入的子节点可能是多种形式，例如数组、原始值或对象等，需要将它们都转换成 VNode 数组才能进行后续操作，如 DOM 渲染、diff 比较等。

总之，这个函数就是为了将传入的子节点归一化处理，方便后续的处理过程。
 */
 
function normalizeArrayChildren(
  children: any,
  nestedIndex?: string
): Array<VNode> {
  const res: VNode[] = []
  let i, c, lastIndex, last
  for (i = 0; i < children.length; i++) {
    c = children[i]
    if (isUndef(c) || typeof c === 'boolean') continue
    lastIndex = res.length - 1
    last = res[lastIndex]
    //  nested
    if (isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`)
        // merge adjacent text nodes
        if (isTextNode(c[0]) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + c[0].text)
          c.shift()
        }
        res.push.apply(res, c)
      }
    } else if (isPrimitive(c)) {
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c)
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c))
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        res[lastIndex] = createTextVNode(last.text + c.text)
      } else {
        // default key for nested array children (likely generated by v-for)
        if (
          isTrue(children._isVList) &&
          isDef(c.tag) &&
          isUndef(c.key) &&
          isDef(nestedIndex)
        ) {
          c.key = `__vlist${nestedIndex}_${i}__`
        }
        res.push(c)
      }
    }
  }
  return res
}


