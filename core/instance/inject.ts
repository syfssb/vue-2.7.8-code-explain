
/**
./dist/src/core/instance/inject.ts文件是Vue.js中实现依赖注入的部分代码。在Vue.js中，使用provide/inject API实现了组件之间的数据共享，父组件可以通过provide提供数据，子组件可以通过inject获取到这些数据。

具体来说，inject.ts文件定义了两个函数：provide和inject。provide函数用于在父组件中提供数据，inject函数用于在子组件中获取提供的数据。

在整个Vue.js源码中，./dist/src/core/instance/inject.ts文件属于核心代码，它被其他模块使用以实现provide/inject功能。例如，在组件实例化过程中，会调用./dist/src/core/instance/provide.ts模块的provide方法来提供数据，在组件渲染过程中，会调用./dist/src/core/instance/inject.ts模块的inject方法来获取提供的数据。

总之，./dist/src/core/instance/inject.ts文件是Vue.js中实现provide/inject API的重要代码，它和其他模块密切相关，共同构成Vue.js的核心功能。
 */
 



/**
首先，这段代码中导入了一些工具函数和类型定义，包括 `warn`、`hasSymbol`、`isFunction`、`isObject`、`defineReactive`、`toggleObserving`等。这些函数在 Vue 源码的其他地方也会被用到。

其次，这段代码中导入了一个名为 `resolveProvided` 的函数，它来自 `v3/apiInject` 模块。这个函数是用来解析组件提供的注入信息（inject），并返回一个对象，该对象中包含了注入信息对应的值。

最后，这个文件中还定义了一个 `inject` 函数，它接收一个注入配置对象和当前组件实例，并根据配置对象中的属性名从父组件中获取对应的值。如果没有找到对应的值，则会调用 `resolveProvided` 函数尝试从祖先组件中获取。如果仍然没有找到，则会根据配置对象中的默认值或者抛出警告信息。同时，`inject` 函数还会使用 `defineReactive` 函数将获取到的值转换为响应式数据，并返回最终的注入结果。
 */
 
import { warn, hasSymbol, isFunction, isObject } from '../util/index'
import { defineReactive, toggleObserving } from '../observer/index'
import type { Component } from 'types/component'
import { resolveProvided } from 'v3/apiInject'



/**
这段代码是Vue在初始化provide选项时的处理流程。provide选项是在父组件中提供数据给子组件使用的一种方式，因为它能够在整个组件树中传递数据而不用显式地传递props。

首先，获取该组件实例的provide选项内容。根据provide选项的类型进行处理，如果是函数则执行该函数并获取返回值，否则直接使用选项中的对象。

如果提供的内容不是一个Object对象，则退出初始化过程。

如果提供的内容是一个对象，在源对象上定义所提供的属性，这里使用循环遍历所有的属性，并且为每个属性设置defineProperty。这样就可以将提供的内容绑定到vm实例对象中，使得在整个组件树中都可以使用该提供的内容。

需要注意的是，有些浏览器不支持ES2015的API Reflect.ownKeys，所以需要使用polyfill兼容性处理。此外，在这里使用了感叹号(!)来解决TypeScript类型问题，如果没有该操作符则会报告类型错误。
 */
 
export function initProvide(vm: Component) {
  const provideOption = vm.$options.provide
  if (provideOption) {
    const provided = isFunction(provideOption)
      ? provideOption.call(vm)
      : provideOption
    if (!isObject(provided)) {
      return
    }
    const source = resolveProvided(vm)
    // IE9 doesn't support Object.getOwnPropertyDescriptors so we have to
    // iterate the keys ourselves.
    const keys = hasSymbol ? Reflect.ownKeys(provided) : Object.keys(provided)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      Object.defineProperty(
        source,
        key,
        Object.getOwnPropertyDescriptor(provided, key)!
      )
    }
  }
}



/**
这段代码是Vue在组件实例化过程中，初始化注入属性的函数。通过调用 `resolveInject` 函数来解决注入属性，如果有注入属性，则遍历该对象，并将其转换为响应式数据（使用 Vue 内部提供的 defineReactive 函数）。如果在开发环境下进行了改变，会产生警告提示，避免直接修改注入属性。

需要注意的是，在这个函数中有一个叫做 `toggleObserving` 的函数，这个函数是用来控制是否要观测响应式数据，以及处理一些性能优化问题。在此处，它被用来暂时关闭观测响应式数据，再重新打开以提高性能。
 */
 
export function initInjections(vm: Component) {
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    toggleObserving(false)
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      if (__DEV__) {
        defineReactive(vm, key, result[key], () => {
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
              `overwritten whenever the provided component re-renders. ` +
              `injection being mutated: "${key}"`,
            vm
          )
        })
      } else {
        defineReactive(vm, key, result[key])
      }
    })
    toggleObserving(true)
  }
}



/**
这段代码定义了一个 `resolveInject` 函数，该函数用于解析组件中的 `inject` 配置项。在 Vue.js 中，`inject` 选项可以让父组件中的数据或方法在子组件中使用，它是一个对象类型，具体的键值对表示父组件提供给子组件的数据或方法。

`resolveInject` 函数接受两个参数，第一个是 `inject`，代表需要被解析的 `inject` 配置项；第二个是 `vm`，代表当前组件实例对象。

该函数首先会判断传入的 `inject` 是否存在（注：如果不配置 `inject`，则默认为 `null`），如果存在，则创建一个空对象 `result` 和一个数组 `keys`。

接下来，判断当前环境是否支持原型链上的 Symbol 属性（因为 Reflect.ownKeys 支持取到Symbol属性），将返回一个包含自有属性和 Symbol 属性键名的数组，在这里做一个判断，看能否使用Reflect.ownKeys，如果不能，则使用Object.keys()获取所有自有属性键名。

最后，遍历 `keys` 数组，通过 `inject` 对象获取到相应的数据或方法，并添加到 `result` 对象中，最终返回 `result` 对象。如果没有 `inject` 配置项，则返回 `undefined` 或 `null`。
 */
 
export function resolveInject(
  inject: any,
  vm: Component
): Record<string, any> | undefined | null {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null)
    const keys = hasSymbol ? Reflect.ownKeys(inject) : Object.keys(inject)



/**
这段代码是Vue中实现provide/inject功能的核心代码。

首先，这里通过一个for循环遍历了inject对象中所有的key。在每次循环中，如果当前的key是Vue内部使用的观察者对象，则跳过此次循环。

接着，获取到当前key对应的provideKey，并判断该provideKey是否存在于vm._provided中。vm._provided是在父组件中通过provide选项提供的数据集合。如果存在，则将其添加到result中。

如果vm._provided中不存在该provideKey，则判断inject[key]中是否有默认值default，如果有，则使用该默认值；否则，在开发模式下会打印警告信息。

最终返回包含所有注入属性的结果result。

总的来说，这段代码实现了provide/inject的核心逻辑，即从父组件中提供数据并注入到子组件中。
 */
 
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      // #6574 in case the inject object is observed...
      if (key === '__ob__') continue
      const provideKey = inject[key].from
      if (provideKey in vm._provided) {
        result[key] = vm._provided[provideKey]
      } else if ('default' in inject[key]) {
        const provideDefault = inject[key].default
        result[key] = isFunction(provideDefault)
          ? provideDefault.call(vm)
          : provideDefault
      } else if (__DEV__) {
        warn(`Injection "${key as string}" not found`, vm)
      }
    }
    return result
  }
}


