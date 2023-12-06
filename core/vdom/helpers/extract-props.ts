
/**
`extract-props.ts` 文件的作用是从VNode节点的属性中提取出真正需要的props对象。

在Vue中，当我们使用模板语法或者 render 函数创建 VNode 的时候，VNode 节点的属性有很多种类型，包括事件监听、样式信息、绑定数据等等。而在组件的实际渲染过程中，有些属性是不需要传递给子组件的。因此 `extract-props.ts` 正是用来过滤掉那些不需要传递的属性，只保留真正需要传递的 props 对象。

该文件主要涉及到了以下几个概念：

1. `propsOptions`: 这是组件的所有 props 对象的配置信息，它是从组件的 options.props 中获取的。
2. `res`: 这是最终提取出来的 props 对象，它是一个纯粹的 JavaScript Object 对象。
3. `attrs`: 这是当前 VNode 节点上不存在于 `propsOptions` 中的属性集合，这些属性都会被添加到 `res` 对象中。

该文件与其他文件的关系是：

1. `extract-props.ts` 是 Vue 核心代码中的一部分，它属于 Virtual DOM 相关的辅助函数。
2. 该文件内部使用了一些 Vue 内核的工具函数，比如 `isPlainObject` 和 `hyphenate` 等，这些函数都定义在 `shared/util.js` 文件中。
3. 该文件主要被用于组件的渲染过程。在 `createComponent` 函数中，会调用该文件内的 `extractPropsFromVNodeData` 函数来提取出 VNode 的属性并返回一个新的 props 对象。最终这个 props 对象会传递给组件实例对象，并且可以通过 `this.$props` 访问到。
 */
 



/**
这段代码中，首先导入了从'core/util/index'模块中导出的一些工具函数和常量，包括`tip`、`hasOwn`、`isDef`、`isUndef`、`hyphenate`、`formatComponentName`等。这些函数和常量在Vue项目中被广泛使用，可以帮助开发人员更方便地编写代码。

接着，这段代码还导入了类型为`Component`和`VNodeData`的两个对象，它们都是定义在'types/'目录下的类型文件。`Component`类型用于描述Vue组件实例对象的结构，而`VNodeData`类型则用于描述虚拟节点的数据结构。

最后，在这个文件中可能会用到这些工具函数，以及`Component`和`VNodeData`类型来辅助进行虚拟DOM的处理，例如提取虚拟节点的props属性等。
 */
 
import {
  tip,
  hasOwn,
  isDef,
  isUndef,
  hyphenate,
  formatComponentName
} from 'core/util/index'
import type { Component } from 'types/component'
import type { VNodeData } from 'types/vnode'



/**
这段代码主要是用于从VNodeData中提取组件的属性，并返回一个对象。参数data表示VNodeData，Ctor表示组件的构造函数，tag表示组件的标签名。

首先会从Ctor.options.props中获取到当前组件的propOptions（即组件声明的props选项），如果propOptions为undefined，则直接返回undefined。

然后定义了一个空对象res，用来存放提取出来的属性。接着判断attrs或者props是否存在，如果存在则遍历propOptions中的所有key，对于每个key，使用hyphenate将其转换成kebab-case形式（例如："myProp" => "my-prop"）作为altKey。

接着会进行props和attrs的检查，如果props中有该属性，则将其保存在res中；否则如果attrs中有该属性，则也将其保存在res中。checkProp方法用于检查属性值，并将其保存在res中。

最后，返回res对象。
 */
 
export function extractPropsFromVNodeData(
  data: VNodeData,
  Ctor: typeof Component,
  tag?: string
): object | undefined {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  const propOptions = Ctor.options.props
  if (isUndef(propOptions)) {
    return
  }
  const res = {}
  const { attrs, props } = data
  if (isDef(attrs) || isDef(props)) {
    for (const key in propOptions) {
      const altKey = hyphenate(key)
      if (__DEV__) {
        const keyInLowerCase = key.toLowerCase()
        if (key !== keyInLowerCase && attrs && hasOwn(attrs, keyInLowerCase)) {
          tip(
            `Prop "${keyInLowerCase}" is passed to component ` +
              `${formatComponentName(
                // @ts-expect-error tag is string
                tag || Ctor
              )}, but the declared prop name is` +
              ` "${key}". ` +
              `Note that HTML attributes are case-insensitive and camelCased ` +
              `props need to use their kebab-case equivalents when using in-DOM ` +
              `templates. You should probably use "${altKey}" instead of "${key}".`
          )
        }
      }
      checkProp(res, props, key, altKey, true) ||
        checkProp(res, attrs, key, altKey, false)
    }
  }
  return res
}



/**
这个函数是用于从传入的对象中提取指定的属性值，它的作用是检查给定的 `key` 或 `altKey` 是否存在于 `hash` 对象中，如果存在，则将其添加到 `res` 对象中，并且如果 `preserve` 参数为 `false`，则从原始 `hash` 对象中删除该属性。

参数说明：

- `res`: 目标对象，提取出来的属性值将被添加到这个对象上。
- `hash`: 源对象，需要从中提取属性值。
- `key`: 属性名。
- `altKey`: 备选属性名，在属性名未找到时使用该备选名称。
- `preserve`: 是否保留原始属性值。如果为 `true`，则不会从源对象中删除属性。

返回值：一个布尔值，表示是否成功提取属性。

具体实现：

首先判断传入的 `hash` 是否存在，如果不存在则直接返回 `false`。

然后在 `hash` 对象中查找 `key` 对应的属性是否存在，如果存在，则将其添加到 `res` 中并返回 `true`，同时如果 `preserve` 为 `false`，则删除 `hash` 对象中的这个属性。

如果 `key` 对应的属性不存在，则查找备选属性名 `altKey` 对应的属性是否存在，存在时则将其添加到 `res` 中，并根据 `preserve` 的值决定是否删除原始 `hash` 对象中的该属性，并返回 `true`。

如果两个属性都不存在，则返回 `false`。
 */
 
function checkProp(
  res: Object,
  hash: Object | undefined,
  key: string,
  altKey: string,
  preserve: boolean
): boolean {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key]
      if (!preserve) {
        delete hash[key]
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey]
      if (!preserve) {
        delete hash[altKey]
      }
      return true
    }
  }
  return false
}


