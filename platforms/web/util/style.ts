
/**
在Vue2.7.8的src源码中，./dist/src/platforms/web/util/style.ts文件主要是用来处理在Web平台上的样式相关操作的工具文件。它定义了一些常用的样式属性名称，并提供了一些方法用于添加、删除、获取以及判断元素是否拥有某个特定的样式类。

这个文件与其他文件的关系比较紧密，因为在Vue的编译过程中，会生成对应的render函数，其中需要使用到这个文件中定义的样式相关操作。同时，在Vue组件中也经常需要使用到这些样式相关操作，例如使用v-bind绑定class或style等。

除此之外，该文件还与渲染器（renderer）相关的代码有着一定的联系，因为在渲染器的实现中，也需要使用到这些样式相关操作。例如，在渲染器中需要为虚拟DOM节点设置样式属性，就需要通过调用style.ts文件中定义的方法来完成。
 */
 



/**
在Vue的源码中，./dist/src/platforms/web/util/style.ts这个文件主要是用来处理DOM元素的样式相关操作的。其中，import VNode from 'core/vdom/vnode' 表示导入VNode类，该类定义了虚拟DOM节点的属性和方法。在Vue中，通过VNode类来创建虚拟DOM节点。

接着，import { cached, extend, toObject } from 'shared/util' 是从Vue的工具函数文件shared/util中导入cached、extend和toObject三个函数。这些函数通常用于优化代码性能和简化代码逻辑。

最后，import type { VNodeData, VNodeWithData } from 'types/vnode' 则表示从vnode.d.ts文件中导入类型定义，用于在编写代码时遵循正确的类型约束。

综上所述，这段代码主要是为了引入必要的模块和类型定义，以方便在样式相关操作中使用。
 */
 
import VNode from 'core/vdom/vnode'
import { cached, extend, toObject } from 'shared/util'
import type { VNodeData, VNodeWithData } from 'types/vnode'



/**
这段代码定义了一个 `parseStyleText` 函数，用于解析 CSS 样式文本并返回一个对象。它的实现方式是首先将传入的 CSS 文本使用正则表达式 `listDelimiter` 拆分成若干个样式属性字符串，然后对每一个样式属性字符串再使用正则表达式 `propertyDelimiter` 拆分成属性名和属性值两部分，并将其存储到结果对象 `res` 中。

具体来说，这里使用了一个 `cached` 工具函数来缓存 `parseStyleText` 函数的执行结果，以提高性能。在函数内部，首先创建了一个空对象 `res` 用来存储解析后的样式属性，然后使用正则表达式 `listDelimiter` 对传入的 cssText 进行拆分，得到若干个样式属性字符串，接着对每个属性字符串都使用正则表达式 `propertyDelimiter` 进行拆分，并将属性名和属性值存储到 `res` 对象中，最后返回 `res` 对象作为解析结果。

例如，当传入的 cssText 参数为 `"color: red; background-color: blue;"` 时，解析结果应该是 `{color: "red", backgroundColor: "blue"}`。
 */
 
export const parseStyleText = cached(function (cssText) {
  const res = {}
  const listDelimiter = /;(?![^(]*\))/g
  const propertyDelimiter = /:(.+)/
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      const tmp = item.split(propertyDelimiter)
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim())
    }
  })
  return res
})



/**
这段代码主要实现了合并静态和动态样式数据的功能，也就是将VNodeData对象中的style属性（包含静态和动态部分）进行合并处理。其中：

- normalizeStyleBinding 函数用于规范化动态样式绑定，它接受一个样式绑定对象，例如{ color: 'red', fontSize: '14px' }，返回一个数组，例如[{color: 'red'}, {fontSize: '14px'}]，这个数组的每个元素都是样式对象的一部分，可以直接作为style属性的值。
- extend函数表示合并两个对象，将第二个对象的属性添加到第一个对象中，并返回结果对象。

具体地说，normalizeStyleData函数首先调用normalizeStyleBinding函数，将动态样式绑定规范化为一个样式对象的数组。然后判断是否存在静态样式，如果存在，则将其与动态样式合并。最后返回合并后的样式对象。

这个函数在Vue的渲染过程中非常重要，因为它能够保证动态和静态样式的正确合并，并处理多种特殊情况（如样式带有前缀等）。
 */
 
// merge static and dynamic style data on the same vnode
function normalizeStyleData(data: VNodeData): Record<string, any> {
  const style = normalizeStyleBinding(data.style)
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle ? extend(data.staticStyle, style) : style
}



/**
这段代码主要是实现将样式绑定转换成对象的功能。Vue中可以通过`v-bind:style`或`:style`指令来绑定样式，这个指令接收一个对象或者一个包含多个对象的数组作为参数。而在这段代码中，对于传入的绑定样式参数，可能会出现以下情况：

1. 传入的是一个数组：需要将数组转换成一个对象；
2. 传入的是一个字符串：需要将字符串解析成一个对象；
3. 传入的是一个普通的对象：直接返回该对象。

具体实现时，首先判断传入的参数是不是一个数组，如果是，则调用`toObject()`方法将数组转换成一个对象；如果不是数组，则判断是否是字符串类型，如果是，则调用`parseStyleText()`方法将字符串解析成对象；否则直接返回原始对象。最终返回的都是一个对象类型的数据，其中包含了所有与样式相关的属性和值。

通过这个方法，我们可以非常灵活地绑定样式信息，同时也便于开发人员针对样式的修改、扩展等操作，从而达到更好的可维护性和灵活性。
 */
 
// normalize possible array / string values into Object
export function normalizeStyleBinding(bindingStyle: any): Record<string, any> {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle)
  }
  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle)
  }
  return bindingStyle
}



/**
这段代码主要是定义了一个名为 `getStyle` 的函数，用于获取组件（即 `vnode`）的样式。其中 `vnode` 是一个 VNodeWithData 类型的参数（VNodeWithData 类型是 Vue 内部用来描述节点信息的一个类），checkChild 参数表示是否检查子节点的样式。

该函数返回一个对象作为样式，而在函数内部使用了 const 定义了一个名为 res 的空对象用于存储样式。接下来，通过遍历 vnode.data.staticStyle、vnode.data.style 和 vnode.context.$style 对象中的属性，将所遍历到的属性名和对应的属性值保存到 res 对象中。最后返回 res 对象作为组件的样式。

需要注意的是，parent component style should be after child's，即父组件的样式应该放在子组件的样式后面，这样父组件的样式才能覆盖子组件的样式。
 */
 
/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
export function getStyle(vnode: VNodeWithData, checkChild: boolean): Object {
  const res = {}
  let styleData



/**
这段代码的作用是在 VNode 的 data 属性中查找并合并所有子组件的 style 数据。具体流程如下：

1. 首先判断是否要遍历子节点。如果 checkChild 为 true，那么表示需要遍历子节点，否则直接返回 res 对象。

2. 定义 childNode 变量为当前 vnode，即最外层的 VNode 节点。

3. 使用 while 循环遍历子组件的 vnode，直到 childNode 没有 componentInstance 属性为止，此时 childNode 即为子组件内部的 vnode。

4. 判断 childNode 是否存在，并且其 data 属性是否存在。

5. 如果满足条件，使用 normalizeStyleData 函数对 childNode.data 进行规范化处理，将结果保存在 styleData 变量中。

6. 最后，使用 extend 函数将 styleData 合并到 res 中。

总结：这段代码的作用是将子组件的 style 数据合并到当前组件的 style 数据中，从而实现样式的继承和覆盖。
 */
 
  if (checkChild) {
    let childNode: VNodeWithData | VNode = vnode
    while (childNode.componentInstance) {
      childNode = childNode.componentInstance._vnode!
      if (
        childNode &&
        childNode.data &&
        (styleData = normalizeStyleData(childNode.data))
      ) {
        extend(res, styleData)
      }
    }
  }



/**
在Vue的渲染过程中，当组件或元素节点被创建时，需要对其样式进行处理。而样式数据可以存在于vnode中的data属性中。

normalizeStyleData函数是将传入的样式数据进行规范化处理的函数，返回一个对象类型的样式数据。如果vnode中存在样式数据，就会执行if语句内的代码块。其中，styleData变量用来接收从vnode中获取到的样式数据，然后通过extend函数将这些样式数据合并到res对象中。

最终，这个res对象将包含所有的样式信息，用于在渲染过程中应用样式。
 */
 
  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData)
  }



/**
这段代码是用来获取VNode的最终样式的。

首先，我们将传入的vnode作为起始点赋值给`parentNode`变量。接下来，使用while循环不断向上遍历该节点的父节点，直到没有父节点为止。

在每次循环中，我们检查当前节点的data属性是否存在，并且调用`normalizeStyleData`方法来获取规范化后的style数据。如果style数据存在，我们就使用`extend`方法将其添加到结果对象`res`中。

最后，返回合并后的`res`对象，它包含了所有祖先节点的style数据。这样做的原因是，一个元素的最终样式可能受到其父元素的影响，因此我们需要将这些样式合并起来以计算出最终样式。

需要注意的是，在这段代码中，我们对`parentNode.parent`进行了类型断言，将其标记为`VNodeWithData | VNode | undefined`类型，这是由于在Vue的VNode树中，有一些节点可能没有`parent`属性，因此我们需要将其标记为可选类型。同时，`@ts-expect-error`注释告诉TypeScript编译器忽略当前行的类型检查错误。这是因为`parentNode.parent`的类型可能会更改，所以不能完全确定其类型。
 */
 
  let parentNode: VNodeWithData | VNode | undefined = vnode
  // @ts-expect-error parentNode.parent not VNodeWithData
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData)
    }
  }
  return res
}


