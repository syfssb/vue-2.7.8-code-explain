
/**
`template-ref.ts` 文件是 Vue 的虚拟 DOM 内部模块之一，主要负责处理模板中的 `ref` 属性。它被用于收集在模板中使用了 `ref` 属性的元素，并将这些元素挂载到 Vue 实例的 `$refs` 对象上。

具体来说，`template-ref.ts` 模块会在编译模板时解析出所有包含 `ref` 属性的元素，并生成对应的 `vnode` 节点，在渲染过程中通过调用 `createComponentInstanceForVnode` 方法创建组件实例并将其挂载到 `$refs` 上。

在整个 Vue 源码中，`template-ref.ts` 模块是由 `patch` 模块调用的，也就是说，当一个组件的虚拟节点需要被创建或更新时，`template-ref.ts` 模块会被自动调用以处理其中的 `ref` 属性。

需要注意的是，`template-ref.ts` 只是 Vue 源码中的一个小部分模块，与其他模块（如 `instance/index.ts`、`observer/index.ts` 等）共同构成了 Vue 库的核心代码。
 */
 



/**
这段代码主要是引入了一些Vue源码中用到的工具函数和类型，可以分为以下几个部分：

1. `remove`、`isDef`、`hasOwn`、`isArray`、`isFunction`、`invokeWithErrorHandling`、`warn`等函数是Vue源码中常用的工具函数，用于处理各种数据类型和执行错误处理等操作。

2. `VNodeWithData` 是 Vue 源码中定义的一个类型，表示带有数据的 VNode 节点。这里用于在模板引用插件中使用。

3. `Component` 是 Vue 源码中定义的一个类型，表示组件。这里也是模板引用插件中使用的。

4. `isRef` 是 Vue 3 中新增的一个函数，用于检查一个值是否为响应式的 Ref 对象。但是在 Vue 2 的源码中也会引入此函数，可能是为了后续升级到 Vue 3 更加方便。

总体来说，这段代码主要是为了在模板引用插件中使用一些常用的工具函数和类型，并且也预留了一些 Vue 3 中新增的特性。
 */
 
import {
  remove,
  isDef,
  hasOwn,
  isArray,
  isFunction,
  invokeWithErrorHandling,
  warn
} from 'core/util'
import type { VNodeWithData } from 'types/vnode'
import { Component } from 'types/component'
import { isRef } from 'v3'



/**
这段代码是Vue中关于模板引用（Template Refs）的处理逻辑。对于一个Vue组件中的标签，我们可以使用`ref`属性来获取对该元素的引用。Vue会通过这个`ref`属性将对应的DOM节点或组件实例挂载到Vue实例上。

这个模块中的三个方法分别处理创建、更新和销毁模板引用。在创建时，调用`registerRef`方法注册模板引用；在更新时，如果新旧VNode的`ref`属性不一致，则先注销旧的模板引用再注册新的模板引用；在销毁时，注销模板引用。

由于Vue的模板引用机制与模板编译相关，因此这个模块主要被用于Vue的编译器中，生成渲染函数时会将模板引用相关的代码注入到渲染函数中。
 */
 
export default {
  create(_: any, vnode: VNodeWithData) {
    registerRef(vnode)
  },
  update(oldVnode: VNodeWithData, vnode: VNodeWithData) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true)
      registerRef(vnode)
    }
  },
  destroy(vnode: VNodeWithData) {
    registerRef(vnode, true)
  }
}



/**
可以解释一下这段源码的意思：

1. `registerRef` 是用于注册 Vue 模板中的 ref 的函数。
2. 首先获取 vnode 中的 ref 属性，如果没有定义 ref，则直接返回（即不做任何操作）。
3. 如果 vnode 中定义了 ref，那么就会执行相应的逻辑，根据 isRemoval 参数值判断是添加还是移除 ref。 

这段源码的作用是在虚拟 DOM 中注册 ref，当渲染到真实 DOM 上时，ref 将会被正确地绑定和更新。
 */
 
export function registerRef(vnode: VNodeWithData, isRemoval?: boolean) {
  const ref = vnode.data.ref
  if (!isDef(ref)) return



/**
在Vue中，模板引用是指通过在模板中使用特殊的v-xxx属性来给元素或组件命名，并且可以在Vue实例或其他组件的模板中访问这些元素或组件。例如，在模板中使用`<input ref="myInput">`将输入框命名为“myInput”，然后可以在Vue实例或其他组件中使用`this.$refs.myInput`来访问该输入框。

在./dist/src/core/vdom/modules/template-ref.ts中，代码片段的作用是处理模板引用的更新和删除逻辑。具体来说：

1. `const vm = vnode.context`：获取当前vnode所在的Vue实例对象。
2. `const refValue = vnode.componentInstance || vnode.elm`：获取vnode对应的组件实例（如果有）或DOM元素节点。
3. `const value = isRemoval ? null : refValue`：根据isRemoval参数确定是否需要移除模板引用，如果需要则将value置为null，否则值为refValue。
4. `const $refsValue = isRemoval ? undefined : refValue`：同上述步骤，但是此处是针对Vue实例的$refs属性。如果需要移除模板引用，则将$refsValue设置为undefined，否则值为refValue。

总的来说，该代码片段作为模板引用的一个处理模块，通过获取当前vnode所在的Vue实例对象和对应的组件实例或DOM元素节点等信息，来更新或删除模板引用。
 */
 
  const vm = vnode.context
  const refValue = vnode.componentInstance || vnode.elm
  const value = isRemoval ? null : refValue
  const $refsValue = isRemoval ? undefined : refValue



/**
这段代码主要是用于处理模板引用的逻辑，如果该引用是一个函数类型，那么就会调用`invokeWithErrorHandling`函数，并将`vm`、`[value]`等参数传入。其中：

- `ref`表示模板引用；
- `vm`表示Vue实例；
- `value`表示需要引用的元素或组件实例；
- `'template ref function'`是错误提示信息。

通过这样的处理，我们可以在模板中使用`ref`属性来获取到对应元素或组件的实例，方便后续的操作。但是如果引用的不是一个函数类型，那么就会进入到下一个判断逻辑中进行处理。
 */
 
  if (isFunction(ref)) {
    invokeWithErrorHandling(ref, vm, [value], vm, `template ref function`)
    return
  }



/**
好的，让我们一步步来解释这段代码。

首先，这段代码在 `template-ref.ts` 文件中，该文件是 Vue 模板编译器的一个模块。它主要用于处理模板中的 ref 属性，并将其转换为对应的 vnode.data.ref 属性。

下面是对代码的逐行解释：

```javascript
const isFor = vnode.data.refInFor
```

此行代码定义了一个名为 `isFor` 的布尔变量，其值等于当前 vnode 的 `data` 属性中的 `refInFor` 字段。`refInFor` 字段表示该 ref 是否存在于一个循环内部，以便在处理循环时能够正确地创建唯一的 ref 标识符。

```javascript
const _isString = typeof ref === 'string' || typeof ref === 'number'
```

该行代码定义了一个名为 `_isString` 的布尔变量，其值代表传入的 `ref` 参数是否为字符串或数字类型。在 Vue 中，ref 可以是字符串、函数或对象，如果传入的是字符串或数字，则会将其作为 ID 来创建唯一的标识符。

```javascript
const _isRef = isRef(ref)
```

该行代码定义了一个名为 `_isRef` 的布尔变量，其值代表传入的 `ref` 参数是否是一个响应式对象。在 Vue 中，ref 可以是普通的对象和数组，也可以是由 `Vue.observable` 创建的响应式对象。

```javascript
const refs = vm.$refs
```

该行代码定义了一个名为 `refs` 的变量，其值等于当前组件实例的 `$refs` 对象。`$refs` 属性是 Vue 在编译模板时自动生成的属性，用于引用模板中的元素或组件实例。

综上所述，这段代码的主要作用是根据传入的 `ref` 参数，以及当前 vnode 是否位于循环内部，来生成对应的唯一标识符，并将其添加到当前组件实例的 `$refs` 对象中。
 */
 
  const isFor = vnode.data.refInFor
  const _isString = typeof ref === 'string' || typeof ref === 'number'
  const _isRef = isRef(ref)
  const refs = vm.$refs



/**
这段代码是Vue源码中和模板引用相关的逻辑。在Vue 2.x 版本中，我们可以使用 `ref` 属性来获取组件或元素的引用，并通过 `$refs` 属性来访问它们。但在某些情况下，我们可能需要在模板中对同一个引用进行多次绑定，比如在 `v-for` 循环中使用 `ref`。这时候需要用到这部分代码。

这个函数的作用是处理模板中的 `ref` 属性。首先会判断引用值 `_isString` 或者 `_isRef` 是否为字符串或者 Ref 对象，如果是就进入处理逻辑。然后根据是否存在 `v-for` 和是否为移除操作来进行不同的处理。

如果存在 `v-for` ，则需要判断引用值是否已经存在，如果已经存在，就进行添加或删除操作；如果不存在，则创建一个新的数组。

如果不存在 `v-for` ，则直接判断引用值类型并设置对应的 Ref 对象或字符串引用。

最后，如果引用值既不是字符串也不是 Ref 对象，会提示错误信息。

这部分代码主要处理模板引用的具体实现细节，确保 `ref` 的正确性和可靠性，从而保证模板的正常渲染。
 */
 
  if (_isString || _isRef) {
    if (isFor) {
      const existing = _isString ? refs[ref] : ref.value
      if (isRemoval) {
        isArray(existing) && remove(existing, refValue)
      } else {
        if (!isArray(existing)) {
          if (_isString) {
            refs[ref] = [refValue]
            setSetupRef(vm, ref, refs[ref])
          } else {
            ref.value = [refValue]
          }
        } else if (!existing.includes(refValue)) {
          existing.push(refValue)
        }
      }
    } else if (_isString) {
      if (isRemoval && refs[ref] !== refValue) {
        return
      }
      refs[ref] = $refsValue
      setSetupRef(vm, ref, value)
    } else if (_isRef) {
      if (isRemoval && ref.value !== refValue) {
        return
      }
      ref.value = value
    } else if (__DEV__) {
      warn(`Invalid template ref type: ${typeof ref}`)
    }
  }
}



/**
这段代码是 Vue 中 vdom 模块下的 template-ref.ts 文件中的函数 setSetupRef，主要用于在组件实例的 _setupState 对象上设置一个指定的键值对。

这里的参数 { _setupState }: Component 表示函数接收一个组件实例对象，并从该实例对象中获取它的 _setupState 属性。_setupState 是在组件实例初始化时通过 createSetupProxy 函数创建的响应式对象，用来存储 setup 函数返回的数据。如果当前组件没有设置 setup 函数，则 _setupState 为 undefined。

接着，函数判断 _setupState 对象中是否存在指定的 key 键，如果存在，会再次判断该键对应的值是否为 Ref 类型。如果是 Ref 类型，则修改其内部 value 值为 val，否则直接将 val 赋值给该键。

这个函数的作用是，当组件中的模板引用了某个 ref，即在模板中使用了 ref 属性绑定到了某个变量上时，就会在组件实例的 _refs 对象中创建一个以 ref 名称命名的属性，并把该属性值设置为对应的 DOM 元素或组件实例。而在 setup 函数中，我们也可以通过 ref 函数来访问这个属性，以便在组件逻辑中使用。当然，如果我们需要在 setup 函数中修改这个 ref 的值，就需要通过 setSetupRef 来实现。
 */
 
function setSetupRef(
  { _setupState }: Component,
  key: string | number,
  val: any
) {
  if (_setupState && hasOwn(_setupState, key as string)) {
    if (isRef(_setupState[key])) {
      _setupState[key].value = val
    } else {
      _setupState[key] = val
    }
  }
}


