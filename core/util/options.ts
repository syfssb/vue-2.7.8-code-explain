
/**
./dist/src/core/util/options.ts文件的作用是定义了Vue组件和指令的选项对象类型，以及一些通用的选项。这个文件中包括了ComponentOptions、DirectiveOptions、MixinOptions、WatchOptions等选项类型。

这些选项类型在Vue组件和指令的开发中非常重要，可以帮助我们定义组件和指令的数据、方法、生命周期钩子等内容，控制它们的行为和特性。

在整个Vue的src中，./dist/src/core/util/options.ts文件与其他文件之间存在着密切的关系。它被Vue核心模块使用，同时也在其他模块中被引用，如./dist/src/core/instance/lifecycle.ts、./dist/src/core/components/keep-alive.ts等。

因此，理解和熟悉./dist/src/core/util/options.ts文件对于深入理解整个Vue源码是非常必要的。
 */
 



/**
./dist/src/core/util/options.ts是Vue源码中的一个重要文件，用于定义Vue实例化时的各种选项。该文件引入了多个模块：

1. `config`：来自`../config`模块，它导出一个配置对象，该对象包含了一些Vue的全局配置，如`silent`、`optionMergeStrategies`等。

2. `warn`：来自`./debug`模块，它导出了一个函数，用于向控制台输出警告信息。

3. `set`：来自`../observer/index`模块，它导出了Vue数据响应系统中的核心方法`set`，用于在观察者模式中添加依赖关系。

4. `unicodeRegExp`：来自`./lang`模块，它导出一个正则表达式，用于匹配Unicode字符。

5. `nativeWatch`和`hasSymbol`：来自`./env`模块，分别检测是否支持原生的`watch`方法和ES6的`Symbol`类型。

6. `isArray`和`isFunction`：来自`shared/util`模块，是一些常用的工具函数，用于判断变量是否为数组或函数类型。

这些模块的引入使得Vue在实例化时能够处理一些常见的选项，并提供了一些全局的配置和工具函数供用户使用。
 */
 
import config from '../config'
import { warn } from './debug'
import { set } from '../observer/index'
import { unicodeRegExp } from './lang'
import { nativeWatch, hasSymbol } from './env'
import { isArray, isFunction } from 'shared/util'



/**
在Vue的源码中，./dist/src/core/util/options.ts是一个非常重要的文件，其中定义了许多Vue实例的选项。

在这个文件中，通过引入 'shared/constants' 模块，我们可以获取一些常量。其中包括 ASSET_TYPES 和 LIFECYCLE_HOOKS 两个常量。

ASSET_TYPES常量是一个对象，其中包含三个属性：component、directive和filter。这些属性用于指定不同类型的资源，以便在Vue实例中注册时使用。

LIFECYCLE_HOOKS常量是一个字符串数组，其中包含8个字符串，分别对应Vue实例生命周期的不同阶段。这些字符串通常被用作组件选项中的钩子函数名称。

总之，这些常量都是Vue实例选项中非常关键的一部分，它们使得开发人员可以更加灵活地配置和扩展Vue实例，并在运行时动态地添加新的资源类型和钩子函数。
 */
 
import { ASSET_TYPES, LIFECYCLE_HOOKS } from 'shared/constants'



/**
这段代码主要是导入了一些共享的工具函数和类型定义，以及组件选项相关的类型定义。

- extend：用于对象合并的工具函数。
- hasOwn：判断一个对象是否含有一个指定的属性的工具函数。
- camelize：将连字符分隔的字符串转换为驼峰式的字符串的工具函数。
- toRawType：获取一个值的原始类型的工具函数。
- capitalize：将一个字符串的首字母大写的工具函数。
- isBuiltInTag：检查一个标签名是否是内置HTML元素或SVG元素的工具函数。
- isPlainObject：检查一个值是否是纯粹的对象的工具函数。

此外，还导入了两个类型定义：

- Component：表示一个Vue组件实例的类型。
- ComponentOptions：表示一个Vue组件的选项的类型。
 */
 
import {
  extend,
  hasOwn,
  camelize,
  toRawType,
  capitalize,
  isBuiltInTag,
  isPlainObject
} from 'shared/util'
import type { Component } from 'types/component'
import type { ComponentOptions } from 'types/options'



/**
在 Vue 中，很多配置项都可以通过选项对象（例如 `new Vue({ ... })` ）进行设置。在 `./dist/src/core/util/options.ts` 文件中，`strats` 是一个对象，它用来存储选项合并策略。

Vue 中的选项合并是指将父组件和子组件的同名选项进行合并，生成最终的选项值。这个过程中，如果没有特别指定合并策略，那么默认的合并方式是简单地覆盖（即子组件的选项会覆盖父组件的选项）。但是，对于一些特殊的选项，我们需要更复杂的合并策略，所以 Vue 提供了一个灵活的机制来自定义选项合并策略。

在 `strats` 对象中，每个属性都代表一个选项名，而对应的值则是一个函数，它接收两个参数：`parentVal` 和 `childVal`，分别表示父组件和子组件中该选项的值。函数的返回值就是最终的合并结果。

例如，如果我们想要给 `options` 中的 `directives` 选项指定一个自定义的合并策略，我们可以这样写：

```
import { mergeOptions } from './merge-options'

function myMergeFn(parentVal, childVal) {
  return mergeOptions(parentVal, childVal)
}

export const strats = Object.create(null)

// 自定义 directives 合并策略
strats.directives = function(parentVal, childVal) {
  const res = Object.create(parentVal || null)
  if (childVal) {
    // 将 childVal 合并到 res 中
    return mergeOptions(res, childVal)
  } else {
    return res
  }
}

// ...
```

这样，在 Vue 合并选项时，就会先检查 `strats` 对象中是否有与当前选项名相同的属性，如果有则执行对应的合并策略函数，否则就按照默认的覆盖方式进行合并。
 */
 
/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
const strats = config.optionMergeStrategies



/**
这段代码主要是针对Vue实例的选项进行限制处理，其中涉及了一个叫做“策略函数”的概念。

在Vue中，当创建一个组件实例时，会将选项对象进行处理，并为每个选项指定一个默认的处理策略。但是，有些选项可能需要特殊的处理，如`el`和`propsData`。

在这段代码中，`if (__DEV__)`表示只有在开发环境下才会使用这种策略，而且这种策略就是针对`el`和`propsData`这两个选项的处理。具体来说，通过定义`strats.el`和`strats.propsData`这两个函数来处理它们。

这两个函数的参数分别是父组件实例、子组件实例、组件实例本身以及当前选项的键名。在函数内部，首先判断是否存在组件实例，如果不存在，则说明该选项只能用于实例创建时，同时还会提示开发者在实例创建时使用该选项。

最后，通过调用`defaultStrat`函数来获取对应选项的值。这个函数定义在同一个文件中，是一个通用的默认策略函数，用于处理大多数选项。

总之，这段代码的作用是限制Vue实例选项的使用范围，并提供特殊的处理策略。
 */
 
/**
 * Options with restrictions
 */
if (__DEV__) {
  strats.el = strats.propsData = function (
    parent: any,
    child: any,
    vm: any,
    key: any
  ) {
    if (!vm) {
      warn(
        `option "${key}" can only be used during instance ` +
          'creation with the `new` keyword.'
      )
    }
    return defaultStrat(parent, child)
  }
}



/**
这是一个用于将两个数据对象递归合并的帮助函数。该函数接受两个参数：`to`和`from`，它们都是具有字符串或符号为键的任意值的记录。

首先，如果`from`为空，则直接返回`to`。否则，遍历`from`中的所有键，将每个键存储在变量`key`中。

然后，检查`to`中是否已存在与`from`中相同的键。如果存在，使用`to[key]`来存储`to`中对应的值，否则创建一个新的键值对，并将其添加到`to`对象中。

对于每个键值对，如果该值是对象，我们将递归调用`mergeData`函数，以确保将来自`from`的属性合并到`to`中。最后返回完整的`to`对象。
 */
 
/**
 * Helper that recursively merges two data objects together.
 */
function mergeData(
  to: Record<string | symbol, any>,
  from: Record<string | symbol, any> | null
): Record<PropertyKey, any> {
  if (!from) return to
  let key, toVal, fromVal



/**
在 Vue 的源码中，./dist/src/core/util/options.ts 这个文件主要是包含了一些帮助我们处理组件选项的辅助函数。其中，有一个名为 `extend` 的函数，它的作用是将传入的对象合并到 Vue 实例的 `options` 属性上。

在 `extend` 函数中，我们可以看到以下代码：

```ts
const componentVNodeHooks = {
  init(vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      const mountedNode: any = vnode // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
    } else {
      const child = (vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      ))
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },
 
  // ...
}

export function mergeHook(
  parentVal: ?Object,
  childVal: ?Function | ?Array<Function>
): ?Function | ?Array<Function> {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
      ? childVal
      : [childVal]
    : parentVal
}

export function mergeOptions(
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)
  }

  if (typeof child === 'function') {
    child = child.options
  }

  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)

  const extendsFrom = child.extends
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm)
  }

  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }

  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }

  function mergeField(key: string) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }

  return options
}
```

我们可以看到，`mergeOptions` 函数是用于将父组件的选项对象 `parent` 和子组件的选项对象 `child` 合并成一个新的选项对象的。在这个函数中，有以下代码：

```ts
const keys = hasSymbol
  ? (Reflect.ownKeys(from) as string[])
  : Object.keys(from)
```

这段代码主要是为了获取 `from` 对象上的所有属性名或者 Symbol 属性，然后返回一个数组。其中，如果当前环境支持 Symbol 类型，那么就使用 Reflect.ownKeys 来获取属性名和 Symbol 属性，否则就使用 Object.keys 来获取属性名。

这样做的目的是为了确保合并选项时不会丢失任何属性，因为在 JavaScript 中，属性既可以是字符串，也可以是 Symbol 类型的。因此，我们需要使用 `Reflect.ownKeys` 来获取所有的属性名和 Symbol 属性，才能确保合并选项时不会漏掉任何属性。
 */
 
  const keys = hasSymbol
    ? (Reflect.ownKeys(from) as string[])
    : Object.keys(from)



/**
这段代码的作用是将一个对象(`from`)中的属性浅复制到另一个对象(`to`)中，并返回合并后的对象。在这个过程中，如果`to`对象中已经存在相同的属性，则保留`to`对象中的属性值。

具体实现的过程如下：

1. 遍历`from`对象的所有属性，将属性名赋值给变量`key`；
2. 如果属性名为`'__ob__'`，则直接跳过，因为该属性是Vue自身观察数据时添加的属性；
3. 获取`to`和`from`中对应`key`属性的值，分别赋值给`toVal`和`fromVal`变量；
4. 如果`to`对象没有该属性，则通过`set`方法将该属性添加到`to`对象中，并设置属性值为`fromVal`；
5. 如果`to`和`from`对象都有该属性，且`toVal`和`fromVal`不相等且都是普通对象（即不包含响应式数据），则递归调用`mergeData`函数，将`toVal`和`fromVal`进行深度合并；
6. 最后返回合并后的`to`对象。

总的来说，这段代码实现了对象之间的浅合并，并且处理了一些特殊情况，确保合并的结果是正确的。
 */
 
  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    // in case the object is already observed...
    if (key === '__ob__') continue
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}



/**
这段代码实现了Vue中data选项的合并逻辑，它接收三个参数：parentVal代表父级组件的data选项，childVal代表子级组件的data选项，vm为当前组件实例。根据是否存在vm参数，我们可以判断parentVal和childVal是在Vue.extend的过程中被合并还是在组件实例化时被合并。

如果不存在vm参数，即在Vue.extend的过程中，会根据parentVal和childVal是否为空进行不同的处理：
- 如果childVal不存在，直接返回parentVal；
- 如果parentVal不存在，直接返回childVal；
- 如果parentVal和childVal都存在，将它们合并成一个函数mergedDataFn返回，该函数内部调用mergeData方法将parentVal和childVal对应的值进行合并，其中isFunction用于判断parentVal和childVal是否为函数类型。

如果存在vm参数，即在组件实例化的过程中，会根据parentVal和childVal的值进行不同的处理：
- 如果childVal是一个函数，调用它，并传入vm实例作为参数，得到instanceData；
- 如果parentVal是一个函数，调用它，并传入vm实例作为参数，得到defaultData；
- 调用mergeData方法将instanceData和defaultData进行合并，如果instanceData存在，则以instanceData作为基础数据，否则以defaultData作为基础数据。这样就完成了子组件的data选项与父组件的data选项进行合并的操作。

需要注意的是，这里涉及到了mergeData方法的调用，它是一个封装了递归合并对象属性的函数。在Vue中，data选项可以是一个对象或者一个返回对象的函数，因此需要对它们进行特殊的处理。
 */
 
/**
 * Data
 */
export function mergeDataOrFn(
  parentVal: any,
  childVal: any,
  vm?: Component
): Function | null {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn() {
      return mergeData(
        isFunction(childVal) ? childVal.call(this, this) : childVal,
        isFunction(parentVal) ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn() {
      // instance merge
      const instanceData = isFunction(childVal)
        ? childVal.call(vm, vm)
        : childVal
      const defaultData = isFunction(parentVal)
        ? parentVal.call(vm, vm)
        : parentVal
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}



/**
这段代码中，定义了 `data` 属性的策略函数 `strats.data`。在这个函数中，首先判断传入的第三个参数 `vm` 是否存在。如果不存在，则说明当前是在处理全局组件的选项对象，此时需要判断 `childVal` 的类型是否为函数，如果不是则发出警告。

接下来我们可以看到，如果传入了 `vm`，则说明当前是在处理局部组件的选项对象，此时就要根据情况进行合并。具体来说：

1. 如果 `childVal` 是一个函数，则直接使用该函数作为数据对象。
2. 如果 `parentVal` 存在且不是一个函数，则发出警告，并返回 `parentVal`。
3. 如果 `parentVal` 不是一个纯对象，则返回 `childVal`。
4. 否则，将父子对象合并，并返回合并后的结果。

总之，这个函数的作用就是根据不同的情况来决定如何合并 `data` 选项，并在必要时发出警告，以帮助开发者正确地使用Vue组件的选项。
 */
 
strats.data = function (
  parentVal: any,
  childVal: any,
  vm?: Component
): Function | null {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
      __DEV__ &&
        warn(
          'The "data" option should be a function ' +
            'that returns a per-instance value in component ' +
            'definitions.',
          vm
        )



/**
./dist/src/core/util/options.ts文件中的这段代码是Vue框架的选项合并函数，它用于合并父组件和子组件的选项，以便在创建实例时使用。

该函数接收三个参数：parentVal、childVal 和 vm。parentVal 表示父组件的选项值，childVal 表示子组件的选项值，vm 表示当前实例。如果 childVal 不存在，则返回 parentVal，否则调用 mergeDataOrFn 函数将 parentVal 和 childVal 合并后返回。

mergeDataOrFn 函数是一个辅助函数，用于合并两个数据或函数，并返回一个新的函数或数据。如果 parentVal 或 childVal 中有一个是 undefined，则返回另一个。如果都是函数，则返回一个新函数，该函数会执行 parentVal 和 childVal 并将结果合并。如果都是数据，则返回一个新对象，该对象包含 parentVal 和 childVal 的属性和值，并且 childVal 会覆盖 parentVal 的属性和值。

通过使用选项合并函数，Vue 可以很好地继承和扩展组件的选项，使开发者能够更方便地编写复杂的应用程序。
 */
 
      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }



/**
首先，我们需要了解一下该文件中导出的mergeOptions函数的作用，它用于合并两个选项对象（parent和child），最终返回一个新的选项对象。

其中，mergeDataOrFn函数是用于合并data选项的辅助函数。它接收三个参数：

1. parentVal：父级选项中的data属性值。
2. childVal：子级选项中的data属性值。
3. vm：Vue实例。

这个函数的作用是将父级和子级的data属性值合并成一个新的函数或者对象，并返回这个新的函数或对象。在实现过程中，会分别判断父级和子级的data属性值是否存在，如果都不存在，则返回undefined；如果都存在，则返回一个新的函数，这个函数会同时执行父级和子级的data属性值，并返回合并后的结果；否则，返回存在的那个data属性值。

最终，在mergeOptions函数中，会依次调用mergeDataOrFn函数来合并父级和子级的各个选项属性值，从而得到最终的选项对象。
 */
 
  return mergeDataOrFn(parentVal, childVal, vm)
}



/**
这段代码主要实现了合并生命周期钩子的功能，它接收两个参数：`parentVal` 和 `childVal`，分别表示父组件的生命周期钩子和子组件的生命周期钩子。这些生命周期钩子可能是一个函数或者一个函数数组。

在合并的过程中，如果父组件和子组件都有相同名称的生命周期钩子，则会将它们合并为一个数组，并返回。如果只有一个组件有该生命周期钩子，则直接返回该生命周期钩子所在的数组或函数。如果两个组件都没有该生命周期钩子，则返回 null。

其中，使用了 dedupeHooks 函数对合并后的生命周期钩子数组去重，避免重复执行同一个生命周期钩子。
 */
 
/**
 * Hooks and props are merged as arrays.
 */
export function mergeLifecycleHook(
  parentVal: Array<Function> | null,
  childVal: Function | Array<Function> | null
): Array<Function> | null {
  const res = childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : isArray(childVal)
      ? childVal
      : [childVal]
    : parentVal
  return res ? dedupeHooks(res) : res
}



/**
这段代码主要用于对钩子函数进行去重。在Vue中，许多生命周期钩子（如created、beforeMount等）或者自定义的钩子函数都是以数组形式传递的，为了避免重复执行同一个钩子函数，需要对这些钩子函数进行去重处理。

具体来说，该函数接收一个任意类型的hooks参数，这个hooks参数是一个包含一组钩子函数的数组。函数内部使用一个res数组来记录去重后不重复的钩子函数，并遍历hooks数组，将不重复的钩子函数推入res数组中。最后返回res数组，从而实现了对钩子函数的去重。 

其中，indexOf方法用于判断当前元素是否已经存在于结果数组中，如果不存在就加入到结果数组中。这里使用了indexOf，而不是ES6提供的Set方法，可能是因为较早的浏览器版本不支持Set。
 */
 
function dedupeHooks(hooks: any) {
  const res: Array<any> = []
  for (let i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i])
    }
  }
  return res
}



/**
这段代码的作用是将 Vue 的生命周期钩子函数挂载到 `strats` 对象上，并指定它们的合并策略为 `mergeLifecycleHook`。

在 Vue 中，生命周期钩子函数是一组特殊的函数，它们会在组件实例化、更新和销毁等不同阶段被依次调用，在这些钩子函数中可以执行一些特定的操作，比如初始化数据、监听事件、向服务器请求数据等。Vue 提供了一系列的生命周期钩子函数，如 `beforeCreate`、`created`、`beforeMount`、`mounted` 等。

而 `LIFECYCLE_HOOKS` 是一个包含了所有生命周期钩子函数名的数组，如下所示：

```javascript
const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured'
]
```

`strats` 对象则是 Vue 在定义选项对象时用来管理各个选项合并策略的对象，它的结构如下：

```javascript
const strats = {}
```

对于生命周期钩子函数，Vue 的默认合并策略是简单地将它们按照注册顺序依次执行。但是在某些情况下，用户需要自定义生命周期钩子函数的执行逻辑，例如在使用混入(mixins)的时候，Vue 需要将合并多个组件中相同生命周期钩子函数的值。所以，在这里通过调用 `mergeLifecycleHook` 函数来实现自定义生命周期钩子函数的合并策略。

总之，这段代码的作用是将所有生命周期钩子函数挂载到 `strats` 对象的属性上，并指定它们的合并策略为 `mergeLifecycleHook`。这样在后续使用自定义合并策略时，就可以方便地操作生命周期钩子函数了。
 */
 
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeLifecycleHook
})



/**
这段代码主要是为了合并组件或指令等资源选项的函数，具体来说，它接受四个参数：

- parentVal：父级选项对象；
- childVal：子级选项对象；
- vm：当前实例对象；
- key：选项名称。

当实例化Vue组件时，我们需要在构造器选项、实例选项和父级选项之间进行三方合并。因此该函数的作用就是将父级选项与子级选项合并成一个新的选项对象，并返回合并后的结果。

具体实现方式如下：

首先，定义一个res变量，通过Object.create(parentVal || null)以parentVal为原型创建一个新的对象，如果parentVal不存在，则使用null作为原型。

然后，判断childVal是否存在，如果存在，则调用extend(res, childVal)方法将childVal中的属性添加到res中，并返回合并后的结果。注意，在extend方法中，对于重复的属性，会使用子级选项覆盖父级选项。

最后，如果childVal不存在，则直接返回res对象。
 */
 
/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets(
  parentVal: Object | null,
  childVal: Object | null,
  vm: Component | null,
  key: string
): Object {
  const res = Object.create(parentVal || null)
  if (childVal) {
    __DEV__ && assertObjectType(key, childVal, vm)
    return extend(res, childVal)
  } else {
    return res
  }
}



/**
这段代码的作用是在Vue的策略对象 `strats` 中添加多个属性，这些属性表示`ASSET_TYPES` 中定义的资源类型。

具体来说，`ASSET_TYPES` 定义了 Vue 中可用的三种资源类型：component、directive 和 filter。

而 `strats` 则是一个策略对象，它包含了 Vue 的一些默认选项和合并选项的方法。这里通过 `forEach` 方法遍历 `ASSET_TYPES`，动态地为每一种资源类型添加选项合并策略方法。

`type + 's'` 表示该资源类型的复数形式，例如 `'components'`、`'directives'` 和 `'filters'`。`mergeAssets` 是一个工具函数，用于合并同名选项，并返回合并后的结果。经过这样的处理，Vue 就能够正确地对这些资源类型进行选项合并了。
 */
 
ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})



/**
这段代码是Vue中的一个选项合并策略(strat)，用于处理watch选项。在Vue中，组件可以定义自己的选项，在合并选项时需要执行一些策略来确保正确性。

在这个具体的策略中，我们首先将原型中定义的 `nativeWatch` 与当前父、子选项进行比对，如果相等则将其赋值为undefined。然后判断子选项是否为空，若为空则返回一个仅继承自父选项的对象。 

接下来，通过循环遍历子选项，首先检查该子选项的类型是否为对象（如果不是，则表示该子选项无效）。如果开发环境下该子选项格式不符合要求，则会抛出异常。 

最后，我们按照特定规则合并父、子选项。如果父选项中存在当前遍历的key，则将其转化为数组，再将子选项添加到其中；否则直接将子选项添加到对象属性上。最终返回合并后的结果。

总之，这段代码的目标是合并watch选项，并确保子选项不会覆盖父选项。
 */
 
/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (
  parentVal: Record<string, any> | null,
  childVal: Record<string, any> | null,
  vm: Component | null,
  key: string
): Object | null {
  // work around Firefox's Object.prototype.watch...
  //@ts-expect-error work around
  if (parentVal === nativeWatch) parentVal = undefined
  //@ts-expect-error work around
  if (childVal === nativeWatch) childVal = undefined
  /* istanbul ignore if */
  if (!childVal) return Object.create(parentVal || null)
  if (__DEV__) {
    assertObjectType(key, childVal, vm)
  }
  if (!parentVal) return childVal
  const ret: Record<string, any> = {}
  extend(ret, parentVal)
  for (const key in childVal) {
    let parent = ret[key]
    const child = childVal[key]
    if (parent && !isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent ? parent.concat(child) : isArray(child) ? child : [child]
  }
  return ret
}



/**
这段代码定义了Vue中4个选项的合并策略函数（props、methods、inject和computed），以及一个provide选项的合并策略函数。这些选项都是在组件定义时可以传递的选项。

在Vue中，组件可以有默认选项和实例选项。当创建组件实例时，Vue会将默认选项和实例选项合并成最终选项对象，其中实例选项会覆盖默认选项。而这个合并过程就是通过调用这些合并策略函数来实现的。

这里的合并策略函数接收四个参数：

1. parentVal：父级选项的值
2. childVal：子级选项的值
3. vm：当前组件实例
4. key：选项的键名

这些函数首先会检查子级选项的类型是否正确，如果不正确则会抛出一个警告。然后会进行选项合并，将父级选项和子级选项合并成一个新的对象并返回。对于provide选项，它的合并策略函数是mergeDataOrFn，也就是将两个数据或函数合并为一个函数。
 */
 
/**
 * Other object hashes.
 */
strats.props =
  strats.methods =
  strats.inject =
  strats.computed =
    function (
      parentVal: Object | null,
      childVal: Object | null,
      vm: Component | null,
      key: string
    ): Object | null {
      if (childVal && __DEV__) {
        assertObjectType(key, childVal, vm)
      }
      if (!parentVal) return childVal
      const ret = Object.create(null)
      extend(ret, parentVal)
      if (childVal) extend(ret, childVal)
      return ret
    }
strats.provide = mergeDataOrFn



/**
在Vue中，组件选项是用来描述组件的各种属性和行为的对象。`options.ts`文件中定义了一些默认的组件选项策略。

在这段代码中， `defaultStrat` 是一个函数，它接受两个参数：`parentVal` 和 `childVal`。`parentVal`是父级组件的选项值，而`childVal`则是子组件的选项值。该函数的主要作用是确定应该使用哪个选项值。

这里的默认策略是返回子组件的选项值（`childVal`），如果子组件没有定义该选项，则使用父组件的选项值（`parentVal`）。如果两者都没有定义该选项，则返回undefined。

例如，在一个组件中，如果有一个选项值仅在子组件中定义，那么在渲染组件时，Vue将使用该选项值作为组件的属性。如果该选项既没有在子组件中也没有在父组件中定义，则该组件将不会具有该属性。
 */
 
/**
 * Default strategy.
 */
const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined ? parentVal : childVal
}



/**
这段代码的作用是检查组件名称是否合法，其中包含一个遍历options对象的循环语句。options对象是在Vue构造函数中传递的选项对象，它包含了组件的各种配置信息，而`options.components`属性则是其中一个子属性，用于注册局部组件。

在遍历options.components时，对每个key进行validateComponentName校验。该函数会判断组件名称是否满足以下条件：

- 必须是字符串类型
- 必须以字母开头
- 只能包含连字符和字母

如果组件名称不符合以上规则，则会抛出警告信息。这样做可以确保组件名称的合法性，从而避免一些意外的错误。
 */
 
/**
 * Validate component names
 */
function checkComponents(options: Record<string, any>) {
  for (const key in options.components) {
    validateComponentName(key)
  }
}



/**
这段代码定义了一个名为`validateComponentName`的函数，用于验证Vue组件的命名。

在代码中，首先使用正则表达式对组件名称进行校验。这个正则表达式会判断组件名称是否以字母开头，后面是否只包含字母、数字、下划线、短横线和Unicode字符（包括中文等）。

如果组件名称不符合规范，则会调用`warn`函数输出警告信息，提示用户组件名称无效。

接下来，代码又会使用`isBuiltInTag`和`config.isReservedTag`函数来进一步验证组件名称是否是HTML标签或者Vue保留标签。如果组件名称是HTML标签或者Vue保留标签，则会输出警告信息，建议不要使用这些名称作为组件ID。

总之，这段代码主要用于确保Vue组件的命名符合规范，并避免使用HTML标签或Vue保留标签作为组件ID带来的问题。
 */
 
export function validateComponentName(name: string) {
  if (
    !new RegExp(`^[a-zA-Z][\\-\\.0-9_${unicodeRegExp.source}]*$`).test(name)
  ) {
    warn(
      'Invalid component name: "' +
        name +
        '". Component names ' +
        'should conform to valid custom element name in html5 specification.'
    )
  }
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
        'id: ' +
        name
    )
  }
}



/**
这是Vue中用于标准化props选项的方法。props就是指组件的属性，以对象的形式传递给组件，在组件内部可以使用this.props来访问它们。这个方法接收一些配置选项和一个可选的vm参数，返回标准化后的props对象。
在这个方法中，首先检查options.props是否存在。如果不存在，直接返回。否则，创建一个空对象res作为结果容器。然后通过判断props是数组还是对象来进行不同的处理。如果props是数组，遍历props数组，将其中的每个字符串值转换成驼峰命名，并将其作为res对象的键，值为{ type: null }。如果props是对象，则遍历props对象，将其中的每个key都转换成驼峰命名，并将其作为res对象的键。如果val是普通对象，则将其直接赋值给res[name]，否则将其转换成{ type: val }的形式。最后，将标准化后的res对象赋值给options.props。
总的来说，这个方法的作用是将props选项的不同语法格式转换成统一的Object-based格式，方便后续的处理和使用。
 */
 
/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps(options: Record<string, any>, vm?: Component | null) {
  const props = options.props
  if (!props) return
  const res: Record<string, any> = {}
  let i, val, name
  if (isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)
        res[name] = { type: null }
      } else if (__DEV__) {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val) ? val : { type: val }
    }
  } else if (__DEV__) {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
        `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}



/**
这段代码是用于将Vue组件中的inject选项进行规范化处理，统一转换为基于对象格式的注入选项。在Vue中，我们可以使用inject来实现跨组件层级的依赖注入。这个函数接收两个参数：options和vm。其中options是组件的配置对象，vm是当前组件实例。

首先，该函数会获取传入的options对象中的inject属性，并判断是否存在。如果没有，则直接返回。如果有，则创建一个新的normalized对象，并将其作为options.inject属性值。normalized对象用于存储经过处理后的注入选项。

当inject为数组类型时，该函数会遍历数组，将每个元素转换成一个形如{from: inject[i]}的对象，并将其添加到normalized对象中。其中，from属性表示注入变量的名称。

当inject为纯对象类型时，该函数会遍历对象，对每个属性进行判断。如果它是一个对象类型，则使用extend函数将{from: key}和val合并成一个新的对象，并将其添加到normalized对象中；否则，直接将{from: val}添加到normalized对象中。

最后，如果inject既不是数组也不是纯对象（如字符串、数字等），且处于开发环境下，会通过warn函数抛出警告信息。警告信息指出了非法的inject选项。

总之，该函数是用于将Vue组件中的inject选项进行规范化处理，统一转换为基于对象格式的注入选项。通过该函数处理后，我们可以方便地使用注入功能，而不需要考虑原始的注入选项格式。
 */
 
/**
 * Normalize all injections into Object-based format
 */
function normalizeInject(options: Record<string, any>, vm?: Component | null) {
  const inject = options.inject
  if (!inject) return
  const normalized: Record<string, any> = (options.inject = {})
  if (isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] }
    }
  } else if (isPlainObject(inject)) {
    for (const key in inject) {
      const val = inject[key]
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val }
    }
  } else if (__DEV__) {
    warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
        `but got ${toRawType(inject)}.`,
      vm
    )
  }
}



/**
这段代码是用来规范化Vue组件中的指令选项的。在Vue组件中，可以通过`directives`选项注册全局或局部的指令，指令是一种可以在模板中重复使用的特殊属性。

该函数接收一个参数`options`，这个参数通常是组件选项对象，在这个选项对象中可能会包含一个`directives`属性，这个属性是一个对象，存储了所有在组件中定义的指令。

函数中首先取出`options.directives`的值，并将其赋给`dirs`变量。然后通过for-in循环遍历`dirs`对象中所有的属性，每个属性都是指令的名字，对应的值是一个指令选项对象。在循环中，判断当前指令选项是否是一个函数，如果是函数，则将其转换成一个具有`bind`和`update`两个钩子函数的对象，并将其赋值回`dirs[key]`中。

这么做的目的是为了方便使用，因为在实际使用指令时，我们希望指令选项对象中至少包含`bind`和`update`两个生命周期钩子函数，这样可以保证指令在绑定和更新时能够正常工作。
 */
 
/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives(options: Record<string, any>) {
  const dirs = options.directives
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key]
      if (isFunction(def)) {
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}



/**
这段代码的作用是为了确保在Vue组件中定义的选项值（如props、computed、data等）都必须是对象类型，否则会发出警告。

具体来说，这个函数接受三个参数：name表示选项名称，value表示选项的值，vm表示Vue组件实例。它首先通过isPlainObject函数判断value是否为纯粹的对象类型，如果不是，则使用warn函数输出警告信息。

其中，toRawType函数用于获取一个值的原始类型，并返回一个字符串表示该类型。例如，如果传入一个数组，toRawType函数会返回"Array"。

总之，这段代码的作用是帮助开发者避免在Vue组件中错误地使用非对象类型的选项值，从而提高代码的可靠性和健壮性。
 */
 
function assertObjectType(name: string, value: any, vm: Component | null) {
  if (!isPlainObject(value)) {
    warn(
      `Invalid value for option "${name}": expected an Object, ` +
        `but got ${toRawType(value)}.`,
      vm
    )
  }
}



/**
这段代码的作用是将两个选项对象合并成一个新的对象，这个函数被应用在Vue实例化和继承方面。其中，第一个参数parent表示父级选项对象，第二个参数child表示子级选项对象，第三个参数vm是可选的，表示Vue实例。如果开启了开发模式，则会调用checkComponents函数来检查子级选项中是否有重复的组件名。

mergeOptions函数会返回合并后的选项对象，这个选项对象包含了父级选项对象和子级选项对象所有的属性，并且对于相同属性名的情况，子级选项对象的属性值会覆盖父级选项对象的属性值。

在Vue实例化时，mergeOptions函数会将传入的组件选项对象和全局配置对象进行合并，得到最终的组件选项对象。在组件继承时，mergeOptions函数会将父组件选项对象和子组件选项对象进行合并，得到子组件最终的选项对象。
 */
 
/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
export function mergeOptions(
  parent: Record<string, any>,
  child: Record<string, any>,
  vm?: Component | null
): ComponentOptions {
  if (__DEV__) {
    checkComponents(child)
  }



/**
这段代码的作用是判断一个子组件是否为一个Vue实例，如果不是Vue实例，则将child转换为Vue实例选项对象。

其中，isFunction()函数是一个工具函数，用于判断传入的参数是否为一个函数。如果child是一个函数，则说明它是一个异步组件的工厂函数，需要通过调用该函数返回的Promise才能获取到真正的组件选项对象。因此，需要将child转换为组件选项对象以便进行后续操作。

在转换时使用了@ts-expect-error注释，这个注释告诉TypeScript忽略这个类型错误，即将一个函数赋值给一个组件选项对象的变量。这是因为在这里，Vue做了一些特殊处理来支持异步组件，因此需要对类型进行一定的容忍。
 */
 
  if (isFunction(child)) {
    // @ts-expect-error
    child = child.options
  }



/**
normalizeProps:
这个函数的作用是将组件的props和propsData规范化，返回一个对象。在Vue中，父组件可以通过props属性向子组件传递数据。normalizeProps函数首先会判断子组件是否存在props选项，如果不存在则直接返回空对象，否则从组件实例vm的$options.props中获取到该组件的所有props，并根据prop的类型、默认值等规范化，最终生成一个props对象并返回。

normalizeInject:
这个函数的作用是规范化inject选项。在Vue中，可以使用inject选项访问祖先组件提供的数据。normalizeInject函数首先判断子组件是否存在inject选项，如果不存在则直接返回空对象，否则遍历inject选项中的每个key，并从组件实例vm的$provide中找到对应的value，最终生成一个injects对象并返回。

normalizeDirectives:
这个函数的作用是将指令规范化成一个数组。在Vue中，指令可以用来操作DOM，比如v-if、v-for等。normalizeDirectives函数首先判断子节点child是否存在指令，如果存在则遍历child的所有指令，并依次调用resolveAsset函数查找指令对应的定义，最终将所有指令规范化为一个数组并返回。
 */
 
  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)



/**
这段代码是`./dist/src/core/util/options.ts`中的一部分，作用是在合并Vue组件选项时，将`extends`和`mixins`选项应用于子组件选项中。但是这仅适用于未在另一个`mergeOptions`调用的结果中的原始选项对象。

首先，它检查`child._base`属性是否已定义。如果没有定义，则表明该子组件选项是一个原始选项对象，而不是另一个`mergeOptions`调用的结果。接下来，它会检查`child.extends`和`child.mixins`选项是否存在。如果存在，则使用`mergeOptions`函数将其与父组件选项`parent`进行合并。通过这种方式，`child.extends`和`child.mixins`中的选项将被合并到父组件选项中。

需要注意的是，只有在调用`mergeOptions`时传入的参数对象具有`_base`属性时，才表示该对象是由`mergeOptions`函数合并生成的。因此，只有未经过合并的原始选项对象才会应用`extends`和`mixins`选项。
 */
 
  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }



/**
这段代码主要是用于合并父组件和子组件的选项，最终返回一个新的组件选项对象。

首先创建了一个空对象 `options`，类型为 `ComponentOptions`。接着通过 `for-in` 循环遍历父组件的选项，调用 `mergeField` 函数合并每个选项。

在合并选项的过程中，会根据当前选项的名称从 `strats` 对象中获取对应的策略函数 `strat`，如果没有找到则使用默认的合并策略函数 `defaultStrat`。然后将父组件选项值、子组件选项值、当前实例 `vm` 以及选项名 `key` 传递给策略函数，获取合并后的值并赋值给 `options[key]`。

接下来再次通过 `for-in` 循环遍历子组件的选项，如果该选项不在父组件中，则调用 `mergeField` 函数合并这个选项。

最后返回 `options` 对象，即为合并后的组件选项。
 */
 
  const options: ComponentOptions = {} as any
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField(key: any) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}



/**
这段代码定义了一个用于解析资源的函数 `resolveAsset`。在 Vue 中，我们可以通过在组件选项（例如 `components`、`directives`）中注册资源来使用它们。但是，在子组件中也可以使用祖先组件中定义的资源。因此，当子组件需要访问其祖先链中定义的资源时，它就需要调用这个 `resolveAsset` 函数。

这个函数接受四个参数：

- `options`：组件选项对象，其中包含了 `components`、`directives` 等属性。
- `type`：资源类型，例如 `'components'` 或 `'directives'`。
- `id`：要解析的资源 ID 值。
- `warnMissing`：可选的布尔值，指示如果未找到资源是否应该发出警告。

在函数内部，首先检查 `id` 是否为字符串类型，如果不是，则返回 `undefined`。然后，从 `options[type]` 中获取对应类型的资源对象，并依次检查以下三种情况：

1. `id` 在资源对象 `assets` 中存在，则直接返回它；
2. `id` 转成驼峰命名格式后的名称在 `assets` 中存在，则返回这个驼峰命名格式的资源；
3. `id` 转成帕斯卡命名格式后的名称在 `assets` 中存在，则返回这个帕斯卡命名格式的资源。

如果以上三种方式都没有找到对应的资源，则尝试从原型链中查找资源。最后，如果开启了 `warnMissing` 并且未找到任何资源，则会发出警告并返回 `undefined`。

这个函数的作用是解决组件实例之间访问资源的问题，使得子组件可以访问祖先组件中注册的全局资源，这也是 Vue 组件化开发的一个基本特点。
 */
 
/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
export function resolveAsset(
  options: Record<string, any>,
  type: string,
  id: string,
  warnMissing?: boolean
): any {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  const assets = options[type]
  // check local registration variations first
  if (hasOwn(assets, id)) return assets[id]
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  // fallback to prototype chain
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  if (__DEV__ && warnMissing && !res) {
    warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id)
  }
  return res
}


