
/**
`./dist/src/v3/apiInject.ts` 文件的作用是为 Vue 3.x 版本提供应用程序级别的 API 注入机制。

在 Vue 2.x 中，我们可以通过在 Vue 原型上添加属性或在全局 mixin 中定义方法来扩展 Vue 的功能。但是这种方式容易造成全局污染和命名冲突。

Vue 3.x 引入了 API 注入机制来解决这个问题。通过该机制，我们可以将应用程序级别的 API 注入到组件实例中，而不会对全局造成影响。

./dist/src/v3/apiInject.ts 文件和其他文件的关系：

- 该文件位于 `v3` 目录下，表示它是 Vue 3.x 版本的一部分。
- 它主要被用于创建 Vue 应用程序实例时，将应用程序级别的 API 注入到组件实例中。
- 它依赖于其他文件，如 `./componentInjection.ts` 和 `./directiveInjection.ts` 等，用于注入组件和指令相关的 API。
- 它也被其他文件所依赖，如 `./createApp.ts` 和 `./injectionKey.ts` 等，用于创建应用程序实例和管理注入的 API。
 */
 



/**
这段代码主要做的事情是：

1. 引入了 `core/util` 模块中的 `isFunction` 和 `warn` 方法，这两个方法在Vue源码中被广泛使用。`isFunction` 方法用于判断一个变量是否为函数类型，而 `warn` 则用于输出警告信息。
2. 引入了 `currentInstance` 模块，该模块提供了当前组件实例的引用。在Vue3.x中，每个组件都有自己的实例对象，通过 `currentInstance` 可以访问到当前正在运行的组件实例。
3. 引入了 `types/component` 模块中的 `Component` 类型，该类型用于描述 Vue 组件的一些基本属性和方法。

总体来说，这段代码主要是为 Vue3.x 中的组件注入一些公共的 API，比如 `$emit`、`$slots`、`$props` 等，使得这些 API 可以在组件内部直接使用，而无需额外的传参。同时，通过引入 `isFunction`、`warn` 等常用方法和 `currentInstance` 模块，可以方便地在组件内部进行一些操作和调试。
 */
 
import { isFunction, warn } from 'core/util'
import { currentInstance } from './currentInstance'
import type { Component } from 'types/component'



/**
在Vue.js中，Injeckey是一个用于注入依赖项的特殊标识符。通常情况下，我们使用字符串作为依赖项的键值。但是在某些情况下，我们可能需要在不同的组件之间传递复杂的对象或者是函数。这时候，使用字符串作为键值就不再足够了。这时候，我们就可以使用InjectionKey来定义一个具有类型信息的注入标识符。

在上述的代码中，我们可以看到，InjectionKey是一个泛型接口，其继承自Symbol类型。这意味着，使用InjectionKey声明一个变量时，我们必须指定它所对应的类型，如：`const MyInjectionKey: InjectionKey<MyType> = Symbol()`。

通过使用InjectionKey，我们可以避免在不同组件之间误用相同的字符串作为依赖项的键值。同时，使用InjectionKey还可以增强代码的类型安全性和可读性，使得代码更加稳健和易于维护。
 */
 
export interface InjectionKey<T> extends Symbol {}



/**
这段代码是 `provide` 函数的定义，它的作用是在组件实例中提供一个依赖注入（DI）的数据。具体来说，`provide(key, value)` 的意思是在当前组件实例中提供一个键为 `key`，值为 `value` 的 DI 项。

函数接收两个参数：第一个参数 `key` 可以是一个 InjectionKey 类型、字符串或数字类型；第二个参数 `value` 是受提供的值。

这里需要注意的是，在使用 `provide` 之前必须要先在组件的 `setup` 钩子函数中调用 `inject` 函数，否则组件无法正确地获取到此处提供的 DI 数据。

此外，该函数还有一些防错处理，比如判断当前是否处于组件的 `setup` 钩子函数中，如果不是则会在开发环境下打印警告信息。如果当前组件实例存在，则将提供的 DI 数据保存在实例的 `provides` 属性中。

总的来说，`provide` 函数的作用是让一个组件向其所有子组件提供一个共享的对象，使得子组件可以通过注入的方式来使用这个对象。
 */
 
export function provide<T>(key: InjectionKey<T> | string | number, value: T) {
  if (!currentInstance) {
    if (__DEV__) {
      warn(`provide() can only be used inside setup().`)
    }
  } else {
    // TS doesn't allow symbol as index type
    resolveProvided(currentInstance)[key as string] = value
  }
}



/**
这段代码的作用是为了解决组件provide和inject过程中共享同一份数据的问题。在Vue中，通过provide和inject可以实现祖先组件向子孙组件传递数据的功能。而这段代码的作用就是为每个组件创建一个独立的provide对象，并将其原型链指向其父级组件的provide对象，从而实现对父组件提供数据的继承，并避免出现不同组件之间的数据冲突。

具体来说，该函数首先获取当前组件实例的_provided属性，该属性记录了当前组件提供的所有数据。然后获取当前组件的父组件提供的数据，如果父组件提供的数据和当前组件提供的数据相同，则说明当前组件没有自己的提供数据，那么就需要创建新的提供数据对象，并将它的原型链指向父组件的提供数据对象；否则，直接返回当前组件提供的数据对象即可。
 */
 
export function resolveProvided(vm: Component): Record<string, any> {
  // by default an instance inherits its parent's provides object
  // but when it needs to provide values of its own, it creates its
  // own provides object using parent provides object as prototype.
  // this way in `inject` we can simply look up injections from direct
  // parent and let the prototype chain do the work.
  const existing = vm._provided
  const parentProvides = vm.$parent && vm.$parent._provided
  if (parentProvides === existing) {
    return (vm._provided = Object.create(parentProvides))
  } else {
    return existing
  }
}



/**
这段代码是关于 Vue3 中提供的 `inject` 方法的实现。该方法用于在组件中访问其他组件或全局中提供的数据或函数。

这里使用了函数重载的方式，根据传入参数的不同，可以返回不同类型的值：

- 如果只传入了一个参数 `key`，则返回该 `key` 对应的值，如果该值不存在，则返回 undefined。
- 如果传入两个参数 `key` 和 `defaultValue`，则返回该 `key` 对应的值，如果该值不存在，则返回默认值 `defaultValue`，此时要判断 `treatDefaultAsFactory` 是否为 true，如果为 true，则把 `defaultValue` 当作工厂函数来执行。
- 如果传入三个参数 `key`、`defaultValue` 和 `treatDefaultAsFactory`，则返回该 `key` 对应的值，如果该值不存在，则返回默认值，此时要判断 `treatDefaultAsFactory` 是否为 true，如果为 true，则把 `defaultValue` 当作工厂函数来执行。

其中，`InjectionKey` 是一个泛型接口，用于指定注入的键的类型。在 Vue3 中，可以通过 `provide` 和 `inject` 来实现父子组件之间的通信。当一个组件通过 `provide` 提供了一些数据或方法时，在其子孙组件中，可以通过 `inject` 来访问这些数据或方法。
 */
 
export function inject<T>(key: InjectionKey<T> | string): T | undefined
export function inject<T>(
  key: InjectionKey<T> | string,
  defaultValue: T,
  treatDefaultAsFactory?: false
): T
export function inject<T>(
  key: InjectionKey<T> | string,
  defaultValue: T | (() => T),
  treatDefaultAsFactory: true
): T
export function inject(
  key: InjectionKey<any> | string,
  defaultValue?: unknown,
  treatDefaultAsFactory = false
) {
  // fallback to `currentRenderingInstance` so that this can be called in
  // a functional component
  const instance = currentInstance
  if (instance) {
    // #2400
    // to support `app.use` plugins,
    // fallback to appContext's `provides` if the instance is at root
    const provides = instance.$parent && instance.$parent._provided



/**
这段代码是 Vue3 中的 `inject` 函数的实现，用于在组件中注入一个指定 token 对应的值。

首先，它会判断当前是否处于 `setup()` 函数内部或函数组件内部。如果不是，则发出警告，因为 `inject` 函数只能在这些地方使用。

接下来，它会尝试从 `instance` 的 `provides` 属性中获取指定 `key` 对应的值。如果能够找到，则直接返回该值。

如果没有提供该值，默认情况下会返回 `undefined`。但是，如果传入了第二个参数 `defaultValue`，则可以返回默认值。此时，如果默认值是一个函数且 `treatDefaultAsFactory` 为真，那么会调用该函数并将实例作为上下文传入，否则直接返回默认值。如果没有提供默认值，它会在开发环境下发出一个警告。

需要注意的是，由于 TypeScript 不支持在索引类型中使用 symbol，所以这里需要将 `key` 强制转换为字符串类型。
 */
 
    if (provides && (key as string | symbol) in provides) {
      // TS doesn't allow symbol as index type
      return provides[key as string]
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue)
        ? defaultValue.call(instance)
        : defaultValue
    } else if (__DEV__) {
      warn(`injection "${String(key)}" not found.`)
    }
  } else if (__DEV__) {
    warn(`inject() can only be used inside setup() or functional components.`)
  }
}


