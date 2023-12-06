
/**
./dist/src/core/instance/state.ts 是Vue源码中的一个核心文件，它主要负责实现Vue实例的响应式数据绑定和状态管理。

具体来说，state.ts 定义了 Vue 实例中 data、props、computed 等属性的处理逻辑，并通过调用 defineReactive 函数将这些属性转换为响应式数据。同时，state.ts 还定义了一些辅助函数，如 proxy 和 set，用于访问和修改响应式数据。

在整个Vue源码中，state.ts 与其他文件存在紧密联系。例如，在 ./dist/src/core/instance/index.ts 文件中，Vue 实例的构造函数会调用 initState 函数来初始化 Vue 实例的各种状态，其中就包括调用 state.ts 中定义的函数来处理响应式数据。此外，state.ts 也会被其他模块引用，如 ./dist/src/core/observer/watcher.ts，该模块定义了 Vue 的观察者模式，用于监听响应式数据的变化并触发视图更新。

总之，./dist/src/core/instance/state.ts 在整个Vue源码中扮演着非常重要的角色，它是 Vue 响应式数据绑定系统的核心部分，并与其他模块密切配合来实现 Vue 的各种功能。
 */
 



/**
好的，让我来解释一下这段代码。

首先，这里的`import config from '../config'`是导入Vue实例的全局配置对象，它包含了关于Vue实例的一些默认设置和常量。

接下来的`import Watcher from '../observer/watcher'`是导入观察者对象Watcher，它的作用是观察数据的变化并更新界面。

而`import Dep, {pushTarget, popTarget} from '../observer/dep'`则是导入依赖存储对象Dep以及相关的方法pushTarget和popTarget。在Vue中，当一个组件中的数据发生改变时，会通知该组件所依赖的其它组件来更新自己的状态。依赖存储对象就是用来存储这些依赖关系的。

接下来的`import { isUpdatingChildComponent } from './lifecycle'`是导入一个方法isUpdatingChildComponent，它的作用是判断当前组件是否正在进行更新。在Vue中，组件的更新分为两种：父级组件的更新和子级组件的更新。通过这个方法，我们可以判断当前组件是否处于父级或子级更新的过程中。

最后，`import { initSetup } from 'v3/apiSetup'`则是导入初始化setup函数的方法。在Vue3中，为了更好地支持Composition API，引入了新的setup函数，同时也需要对原有的初始化逻辑进行调整。因此，需要导入该方法进行初始化。

总的来说，这些导入的模块和方法都是Vue实例中非常重要的组成部分。它们共同支撑了Vue的响应式数据更新机制以及组件的生命周期管理等核心功能。
 */
 
import config from '../config'
import Watcher from '../observer/watcher'
import Dep, { pushTarget, popTarget } from '../observer/dep'
import { isUpdatingChildComponent } from './lifecycle'
import { initSetup } from 'v3/apiSetup'



/**
在 Vue 中，数据观测是实现响应式的核心。这个代码片段中，首先引入了 `set()`、`del()`、`observe()`、`defineReactive()`、`toggleObserving()` 这 5 个方法。

其中，`set()` 和 `del()` 分别用来向对象添加属性和删除属性；`observe()` 用来将一个对象转换成可观测的对象（即监听对象属性的变化）；`defineReactive()` 用来定义响应式对象的属性；`toggleObserving()` 用来控制是否需要对一个对象进行观测。

这些方法都被定义在 `../observer/index.ts` 文件中，也就是用来实现数据观测的模块。

在 `state.ts` 文件中，这些方法的作用是帮助 Vue 实例实现响应式状态管理。例如，在 Vue 实例创建时，会通过调用 `observe()` 方法来将 `data` 对象转换成可观测的对象，然后再通过递归遍历 `data` 对象的属性，使用 `defineReactive()` 定义每个属性的 setter 和 getter 方法，从而实现对 `data` 对象属性的监听。当属性发生变化时，这些方法会自动触发更新操作，使得页面上的数据与实际数据保持同步。

总的来说，这段代码是 Vue 响应式系统的核心之一，负责实现数据的双向绑定、依赖收集等功能。
 */
 
import {
  set,
  del,
  observe,
  defineReactive,
  toggleObserving
} from '../observer/index'



/**
`./dist/src/core/instance/state.ts` 是 Vue 实例状态相关的代码。

以下是这段代码的一些解释：

- `import` 关键字用于导入其他模块的函数、变量或对象。
- `{}` 中的内容是 import 模块中需要导入的函数、变量或对象。
- `'../util/index'` 是要导入的模块的相对路径。
- `warn`, `bind`, `noop`, 等等是从模块中导入的具体函数或变量。这些函数和变量被用来构建 Vue 的状态系统。
- `hasOwn`, `isArray`, `isPlainObject` 等函数是用来检测数据类型或者判断对象属性是否存在的工具函数。
- `shallowReactive` 和 `TrackOpTypes` 是 Vue 3.0 的响应式系统的函数和枚举类型，用于追踪依赖关系和创建响应式数据。
- `import type { Component } from 'types/component'` 是导入了一个类型定义的方式。其中 `Component` 是一个类型别名(alias)，表示的是一个 Vue 组件实例的类型。

总之，这段代码主要通过导入各种工具函数，来帮助 Vue 实现其状态系统。同时还导入了 Vue 3.0 的响应式系统的函数和类型定义。
 */
 
import {
  warn,
  bind,
  noop,
  hasOwn,
  isArray,
  hyphenate,
  isReserved,
  handleError,
  nativeWatch,
  validateProp,
  isPlainObject,
  isServerRendering,
  isReservedAttribute,
  invokeWithErrorHandling,
  isFunction
} from '../util/index'
import type { Component } from 'types/component'
import { shallowReactive, TrackOpTypes } from 'v3'



/**
这里定义了一个名为`sharedPropertyDefinition`的常量，它是一个对象字面量。这个对象字面量有四个属性：

- `enumerable`：表示该属性是否可枚举，值为`true`，说明该属性可以被遍历。
- `configurable`：表示该属性是否可配置，值为`true`，说明该属性可以被修改或删除。
- `get`：表示获取该属性的方法，值为`noop`。`noop`即为空函数，也就是说在默认情况下这个属性没有getter方法，默认返回undefined。
- `set`：表示设置该属性的方法，值也为`noop`。同样地，在默认情况下这个属性没有setter方法，默认赋值操作不会产生任何效果。

这个`sharedPropertyDefinition`对象字面量一般用于创建实例上的共享属性，例如在Vue实例上添加一个计算属性或者添加一个响应式数据等。通过将这个对象作为参数传递给工厂函数，可以在创建组件实例时快速地定义这些共享属性的特性。
 */
 
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}



/**
这段代码的作用是为了实现一个对象属性的代理。在 Vue 中，组件的数据都被保存在 `_data` 对象中，而这个函数就是将 `_data` 对象中的某个属性代理到组件实例上。

参数说明：

- `target: Object`：表示要代理的对象，一般是组件实例对象。
- `sourceKey: string`：表示要代理的对象的属性名，在 Vue 中是 `_data`。
- `key: string`：需要代理的键名，即要在组件实例上添加的属性名。

实现思路：

首先定义一个 `sharedPropertyDefinition` 对象，包含 get 和 set 函数，这两个函数分别在读取和修改该属性时会被调用。在 get 函数中，返回 `this[sourceKey][key]`，即读取 `_data[key]` 的值并返回。在 set 函数中，将传入的值 `val` 赋给 `_data[key]`。

接着，使用 `Object.defineProperty()` 函数将 `target` 对象的 `key` 属性添加到组件实例上，并使用 `sharedPropertyDefinition` 对象定义其特性描述符，这样就可以通过组件实例直接获取和修改 `_data[key]` 的值了。

总结：

在 Vue 中，使用 proxy 函数将组件实例与 _data 对象解耦，使得组件实例可以直接访问和修改 _data 对象上的属性，从而方便地更新视图。
 */
 
export function proxy(target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}



/**
这段代码主要是用来初始化Vue实例的状态，其中包括props，data，computed，watch等。这里的代码片段是在初始化props状态。具体来说：

1. 首先获取Vue实例的$options属性，该属性包含了Vue实例的所有选项，这里主要关注props选项。
2. 如果$options中有props属性，则调用initProps函数对props进行初始化。

initProps函数则是用来初始化Vue实例的props状态。具体来说：

1. 首先获取props选项中定义的各个prop字段的值，并将其挂载到Vue实例上。
2. 对于每个prop字段，会根据其定义的验证规则（如类型、必填、默认值等）进行验证，并通过Vue的警告机制提示开发者使用不当或错误的地方。
3. 最后，如果定义了合法的默认值，且当前实例未传入该prop字段的值，则使用默认值作为该字段的初始值。

总之，这段代码的作用是在初始化Vue实例时，对props状态进行处理和验证，从而保证组件的正确使用和可靠性。
 */
 
export function initState(vm: Component) {
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)



/**
在Vue2.7.8源码中，`./dist/src/core/instance/state.ts`中的`initSetup(vm)`函数是Composition API的一部分。

Composition API是在Vue3中引入的新特性，它允许开发者将组件逻辑划分为更小的功能块，使得代码结构更加清晰，并且更容易复用和测试。虽然Vue2没有原生的Composition API，但是通过插件或自定义指令等方式也可以实现类似功能。

在Vue2源码中，`initSetup(vm)`函数的作用是初始化组件的`setup()`函数，`setup()`函数是Composition API中的一个重要概念。它是一个可选的函数，可以返回一个包含响应式数据、计算属性、方法等等的对象。

`initSetup(vm)`函数会在组件实例化时被调用，它会检查组件是否存在`setup()`函数，如果存在，则执行`setup()`函数并将其返回值合并到组件实例的响应式数据中。

总之，`initSetup(vm)`函数的作用是支持Composition API的使用，允许开发者将组件逻辑拆分成更小的功能块。
 */
 
  // Composition API
  initSetup(vm)



/**
在Vue的初始化过程中，会根据用户传入的选项（即new Vue()时的参数）来对Vue实例进行初始化，其中包括对状态的初始化。这段代码就是在进行状态初始化的过程中，依次判断用户是否提供了methods、data、computed和watch等选项，并根据不同的情况进行相应的处理。

首先，如果用户提供了methods选项，则调用initMethods函数来初始化Vue实例上的方法；接着，判断用户是否提供了data选项，如果提供了，则调用initData函数来初始化数据；如果没有提供，则创建一个空对象并将其作为Vue实例的_data属性，然后通过observe函数将其转换成响应式对象，并将其挂载到Vue实例上，同时增加ob.vmCount计数器；接下来，如果用户提供了computed选项，则调用initComputed函数来初始化计算属性；最后，如果用户提供了watch选项且不是Vue自带的watch选项，则调用initWatch函数来初始化观察者。

总的来说，这段代码是用来初始化Vue实例上的状态的，主要是为了让Vue能够正常运行并响应状态变化。
 */
 
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    const ob = observe((vm._data = {}))
    ob && ob.vmCount++
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}



/**
这段代码的作用是初始化组件实例的props属性。props是Vue组件中传递数据的一种方式，子组件通过props接收父组件传递过来的数据。

在初始化props之前，先获取到propsData，propsData是父组件传递给子组件的所有prop属性的值组成的对象。然后创建一个响应式的_props对象用于存储组件实例的props属性，并且将_props对象赋值给vm._props。同时，定义一个数组keys，用于缓存propsOptions对象的所有key值，方便后续遍历props更新props属性时使用Array而不是动态对象键枚举。

接下来，判断当前组件是否是根组件，如果不是，则调用toggleObserving(false)，暂停观测props属性，这是为了防止在处理props时无意中修改了props属性的值，导致其他组件共享的props属性被修改。然后遍历propsOptions对象，对每个prop属性进行验证和定义响应式属性。在验证prop属性时，调用validateProp方法，返回验证后的值value，然后使用defineReactive方法将该属性定义为响应式属性，在此过程中，如果检测到组件实例不是根组件，并且不是正在更新子组件，则会发出警告，提示不要直接修改props属性，而应该通过data或computed属性来改变它的值。

最后，将propsOptions对象的所有key值push进keys数组中，判断该属性是否定义在组件实例上，如果没有，则对该属性进行代理，以便在使用该属性时可以直接访问_props对象。最后再调用toggleObserving(true)，恢复观测props属性的功能。
 */
 
function initProps(vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  const props = (vm._props = shallowReactive({}))
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys: string[] = (vm.$options._propKeys = [])
  const isRoot = !vm.$parent
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false)
  }
  for (const key in propsOptions) {
    keys.push(key)
    const value = validateProp(key, propsOptions, propsData, vm)
    /* istanbul ignore else */
    if (__DEV__) {
      const hyphenatedKey = hyphenate(key)
      if (
        isReservedAttribute(hyphenatedKey) ||
        config.isReservedAttr(hyphenatedKey)
      ) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        )
      }
      defineReactive(props, key, value, () => {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
              `overwritten whenever the parent component re-renders. ` +
              `Instead, use a data or computed property based on the prop's ` +
              `value. Prop being mutated: "${key}"`,
            vm
          )
        }
      })
    } else {
      defineReactive(props, key, value)
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}



/**
`state.ts`文件是Vue源码中的一个核心模块，它主要负责Vue实例中响应式数据的处理。这个模块定义了Vue实例中的data属性，以及提供了一些方法对其进行操作，比如对data进行响应式处理、检测数据变化等。

在整个Vue源码中，`state.ts`模块和其他模块有着紧密的关系。例如，在初始化Vue实例时，会通过调用`initState`函数来初始化实例中的数据，这个函数就是在`state.ts`模块中定义的。而在Vue组件中，可以通过`this.$data`或`this._data`来访问组件实例中的数据，这些数据也是在`state.ts`模块中定义的。

总之，`state.ts`模块是Vue源码中非常重要的一个模块，它为Vue实例与组件提供了响应式数据的支持，同时也是整个Vue框架数据驱动的核心所在。
 */
 



/**
这段代码是Vue在初始化实例时调用的一个函数，它的主要作用是将组件的data选项转换为响应式数据，并代理到Vue实例上。

首先，这个函数获取了组件实例的$options.data选项，并判断是否为一个函数。如果是函数，则调用getData函数获取其返回值。否则，将$data设置为data或空对象。

接下来，对于非普通对象类型的$data，会强制将其设置为空对象，并输出警告信息。

之后，通过遍历$data对象中的所有属性，判断当前属性是否已经存在于props或methods中。如果已经存在则输出相应的警告信息，否则，使用proxy方法将属性代理到Vue实例上。

最后，通过observe方法将$data对象转换为响应式对象，并存储到内部变量$ob中，方便在后续进行响应式数据更新时使用。
 */
 
function initData(vm: Component) {
  let data: any = vm.$options.data
  data = vm._data = isFunction(data) ? getData(data, vm) : data || {}
  if (!isPlainObject(data)) {
    data = {}
    __DEV__ &&
      warn(
        'data functions should return an object:\n' +
          'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (__DEV__) {
      if (methods && hasOwn(methods, key)) {
        warn(`Method "${key}" has already been defined as a data property.`, vm)
      }
    }
    if (props && hasOwn(props, key)) {
      __DEV__ &&
        warn(
          `The data property "${key}" is already declared as a prop. ` +
            `Use prop default value instead.`,
          vm
        )
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  const ob = observe(data)
  ob && ob.vmCount++
}



/**
这段代码实现了获取Vue实例的data属性值的功能。可以看到，该函数接受两个参数：`data`和`vm`。其中，`data`是一个函数，用于返回Vue实例的data属性。`vm`是Vue实例本身。

在函数内部，首先调用了`pushTarget()`方法，将当前watcher对象压入栈中。这是因为在执行`data.call(vm, vm)`时，可能会访问响应式数据（即需要观察者收集依赖），所以需要禁用依赖收集。而当前watcher对象就是用来收集依赖的，所以需要将其暂时从watcher栈中移除。

接着，使用`data.call(vm, vm)`来执行data函数，并传入Vue实例作为唯一参数。由于data函数中可能会存在访问响应式数据的情况，所以需要通过call方法来确保this指向Vue实例。

如果执行data函数中出现了错误，则会调用`handleError(e, vm, 'data()')`方法进行错误处理，并返回一个空对象。

最后，调用`popTarget()`方法将刚才存入栈中的watcher对象弹出，恢复watcher栈的状态。

总之，该函数主要用于获取Vue实例的data属性的值，并且在执行data函数时禁用依赖收集，以保证程序的正确性和可靠性。
 */
 
export function getData(data: Function, vm: Component): any {
  // #7573 disable dep collection when invoking data getters
  pushTarget()
  try {
    return data.call(vm, vm)
  } catch (e: any) {
    handleError(e, vm, `data()`)
    return {}
  } finally {
    popTarget()
  }
}



/**
在Vue的源码中，computed是一种计算属性，其值通过计算得到，而不是直接从数据中取得。当我们使用computed时，Vue会自动创建一个Watcher实例来观察数据变化并执行计算。在这个过程中，Watcher实例会被添加到对应的Dep实例中，以便在数据变化时进行更新。

而computedWatcherOptions则是一个Watcher的配置对象，其中lazy属性设置为true意味着Watcher实例将会在第一次读取时才执行计算。也就是说，如果我们在初始化阶段不需要立即计算computed的值，那么可以将该选项设置为true，以提高性能。等到真正需要computed的值时，再进行计算。
 */
 
const computedWatcherOptions = { lazy: true }



/**
initComputed函数是一个初始化计算属性的函数。计算属性本质上是一个具有get和set方法的对象，通过get方法返回计算后的值。

在这个函数中，首先创建空对象watchers来存储计算属性的监听器，接着判断当前是否处于服务端渲染状态，如果是则将计算属性变为只读的getter。

在Vue的生命周期中，initComputed函数会在实例化Vue对象时被调用，传入Vue实例以及定义的计算属性对象。在initComputed函数中，会遍历计算属性对象，对每一个计算属性都进行初始化操作，创建对应的 watcher 对象，并将该 watcher 对象赋值给 vm._computedWatchers 对象，同时设置 get 和 set 方法。

其中 watcher 对象的作用是监听计算属性变化并触发更新操作。在计算属性被访问时，会执行对应的 getter 函数，当该计算属性依赖的数据发生变化时，就会触发对应的 watcher 对象的 update 方法，最终更新视图。
 */
 
function initComputed(vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = (vm._computedWatchers = Object.create(null))
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()



/**
这段代码是定义computed属性的过程中对于getter进行判断和处理的部分。具体来说，该代码会遍历computed对象中所有的键值对，对于每个键值对中的userDef，判断其是否为函数类型，如果是函数类型，则将该函数作为getter；如果不是函数类型，则获取其get方法作为getter。

同时，如果在开发环境下发现某个computed属性没有getter，则会通过调用warn方法发出警告信息，提示用户需要为该计算属性定义getter。

这里的__DEV__是一个全局变量，代表了当前是否处于开发环境下的标识符。在开发环境下会发出警告信息，而在生产环境下则不会有任何提示信息。
 */
 
  for (const key in computed) {
    const userDef = computed[key]
    const getter = isFunction(userDef) ? userDef : userDef.get
    if (__DEV__ && getter == null) {
      warn(`Getter is missing for computed property "${key}".`, vm)
    }



/**
这段代码的作用是为计算属性创建一个内部观察者。 

在Vue中，computed属性是由依赖其他状态的getter函数组成的。当computed属性所依赖的状态发生改变时，它会重新求值以更新视图。

因此，Vue需要在computed属性上设置一个观察者来监听依赖项的变化，并在必要时重新计算属性值。

这里的代码会根据isSSR参数来决定是否在服务器端渲染（Server-Side Rendering）下运行。如果不是SSR，则为当前实例(vm)上的computed属性创建一个新的观察者对象，该对象的getter函数为computed属性自身的getter函数，setter函数为空函数(noop)，观察选项(computedWatcherOptions)包括lazy和dirty等选项。

通过这个观察者对象，Vue能够跟踪computed属性所依赖的状态的变化，并且只有在需要时才会重新计算计算属性的值，从而避免了不必要的计算和渲染。
 */
 
    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }



/**
这段代码是在Vue实例化时为计算属性做定义的过程中，对已有的计算属性进行处理。

首先，它判断当前key是否已经存在于Vue实例对象（vm）上。如果不存在，则说明这个计算属性是在实例化时被定义的，需要使用defineComputed方法来进行定义。

但是，如果key已经存在于vm对象上，就需要进行一些额外的操作了。这里使用了Vue开发模式下的一个警告函数warn()，用于在控制台中输出警告信息。

接下来，会依次检查key是否已经在data、props、methods中被定义过，若已定义过，则在控制台中输出相应的警告信息。这样做可以避免命名冲突或重复定义问题的出现，让代码更易于维护和调试。
 */
 
    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else if (__DEV__) {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      } else if (vm.$options.methods && key in vm.$options.methods) {
        warn(
          `The computed property "${key}" is already defined as a method.`,
          vm
        )
      }
    }
  }
}



/**
这段代码是Vue中定义计算属性的函数，其中`defineComputed`函数接收三个参数：

- `target`：要在其上定义属性的目标对象。
- `key`：要定义的属性的名称。
- `userDef`：计算属性的定义。可以是一个对象，包含`get`和`set`方法，也可以是一个返回值的函数。

该函数首先判断是否应该缓存计算属性的值。如果不是服务器端渲染，则会开启缓存，否则就关闭缓存。接下来，根据传入的`userDef`参数，决定如何定义`get`和`set`方法。如果`userDef`是一个函数，则使用`createComputedGetter`创建`get`方法，这个方法会在需要时调用该函数并缓存结果。如果`userDef`是一个包含`get`和`set`方法的对象，则分别定义对应的`get`和`set`方法。如果`userDef`中没有定义`set`方法，则默认为一个空方法。最后通过`Object.defineProperty`将计算属性定义到`target`对象上。

如果开发模式下，`userDef`参数中没有定义`set`方法，则会给`set`方法设置一个警告提示的方法，提醒开发者不能直接给计算属性赋值。

总的来说，这个函数的作用是：根据传入的参数，在指定的对象上定义一个计算属性。这个计算属性会根据用户定义的规则计算出一个值，并在需要的时候进行缓存。如果需要，还可以通过`set`方法重新计算这个计算属性的值。
 */
 
export function defineComputed(
  target: any,
  key: string,
  userDef: Record<string, any> | (() => any)
) {
  const shouldCache = !isServerRendering()
  if (isFunction(userDef)) {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  if (__DEV__ && sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}



/**
这是一个工厂函数，用于创建计算属性的getter方法。其中key代表计算属性的名称。

这个函数返回一个函数computedGetter，当我们在组件实例中访问计算属性时，就会调用这个函数。

在这个函数中，首先判断该计算属性是否已经存在对应的watcher实例。如果存在，就根据watcher的状态来进行相应的处理。

如果watcher实例的状态为dirty，说明计算属性需要重新计算。此时调用watcher.evaluate()方法重新计算计算属性的值，并将watcher的状态设置为clean。

接着，判断Dep.target是否存在。如果存在，说明当前正在收集依赖关系。则将Dep.target添加到watcher的依赖列表里，同时将当前组件实例作为target传递给Dep.target.onTrack方法，表示该组件实例被追踪过。这样在数据更新时，可以通过这些依赖关系，精确地知道哪些watcher需要重新计算。

最后，返回计算属性的值。

总的来说，这个函数主要功能是获取计算属性的值，并维护相关的依赖关系。
 */
 
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        if (__DEV__ && Dep.target.onTrack) {
          Dep.target.onTrack({
            effect: Dep.target,
            target: this,
            type: TrackOpTypes.GET,
            key
          })
        }
        watcher.depend()
      }
      return watcher.value
    }
  }
}



/**
在Vue中，有一个重要的概念是计算属性（computed）。计算属性是根据其它数据计算所得到的值，并且具有缓存机制，只有当依赖的数据发生改变时才会重新计算。

这段代码中的`createGetterInvoker`函数实际上是用来创建计算属性的getter函数。传入的参数`fn`就是计算属性的计算函数。这个函数在被调用时，会返回一个新的函数`computedGetter`，这个函数是计算属性的getter函数。

在`computedGetter`函数内部，`this`指向了当前组件的实例对象。并且通过`fn.call(this, this)`的方式，把当前实例对象作为参数传递给了计算函数`fn`，从而让计算函数可以访问到组件实例的所有数据和方法。最终，`computedGetter`返回了`fn`函数的执行结果，也就是计算属性的值。

通过这种方式，我们可以将计算属性的计算函数和组件实例关联起来，实现了计算属性功能的实现。
 */
 
function createGetterInvoker(fn) {
  return function computedGetter() {
    return fn.call(this, this)
  }
}



/**
这段代码是用来初始化Vue实例的methods选项的。在Vue实例化过程中，将会把用户定义的methods选项赋值到实例对象上，并且绑定this指向vue实例本身。

具体来说，函数initMethods接收两个参数：vm和methods。其中，vm即为Vue实例本身，methods则是开发者定义在组件选项中的methods属性。

然后，从vm.$options.props中获取props。$options是在new Vue(options)时合并传入的选项，而props则是组件选项中的一项。它是一个对象，其中包含了组件 props 的定义，以及非 prop 的 key。因此，这里的目的是为了避免在 methods 中定义了跟 props 重名的方法。

接下来就是遍历 methods 对象，判断当前key是否存在于 vm 实例中或者是 Vue 实例的保留方法（以 _ 开头或者 $ 开头），如果有则发出警告。

最后，对每个方法进行绑定，确保了调用该方法时总是绑定到当前 Vue 实例上。通过bind()方法，将当前 Vue 实例作为 this 指向，传递给 bind 函数的第二个参数，从而保证了this的正确性。如果该方法不是一个函数，则使用noop函数代替，noop函数什么都不做直接返回undefined。
 */
 
function initMethods(vm: Component, methods: Object) {
  const props = vm.$options.props
  for (const key in methods) {
    if (__DEV__) {
      if (typeof methods[key] !== 'function') {
        warn(
          `Method "${key}" has type "${typeof methods[
            key
          ]}" in the component definition. ` +
            `Did you reference the function correctly?`,
          vm
        )
      }
      if (props && hasOwn(props, key)) {
        warn(`Method "${key}" has already been defined as a prop.`, vm)
      }
      if (key in vm && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
            `Avoid defining component methods that start with _ or $.`
        )
      }
    }
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)
  }
}



/**
这段代码主要的作用是在Vue实例初始化时，初始化其中的watch选项。watch选项是一个对象，包含一个或多个属性，每个属性对应一个需要监听的数据属性，其值可以是一个函数或者一个由函数组成的数组。

该函数接受两个参数，第一个参数是Vue实例，第二个参数是watch选项对象。它通过遍历watch选项对象，针对每一个key-value对，执行createWatcher方法来创建观察者(watcher)，并将watcher添加到Vue实例中。

如果handler是一个数组，则会遍历数组中的每一个函数，为每一个函数创建一个观察者(watcher)，并将其添加到Vue实例中；否则，直接为该函数创建一个观察者(watcher)并添加到Vue实例中。

总之，initWatch函数的作用是初始化Vue实例中的观察者(watcher)，用于监视数据变化，当数据发生变化时，观察者就会收到通知并执行相应的回调函数。
 */
 
function initWatch(vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    if (isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}



/**
这段代码主要是声明了一个 `createWatcher` 函数，用来创建一个观察者。观察者模式是 Vue 实现响应式的核心机制，Vue 通过侦测数据变化从而更新视图。

函数接受4个参数：

- vm: Component：组件实例对象
- expOrFn: string | (() => any)：表达式或者函数
- handler: any：回调函数
- options?: Object：可选的选项对象

如果 `handler` 是一个普通对象，则将其作为选项对象处理。

如果 `handler` 是一个字符串，则在组件实例上获取同名方法作为回调函数。

最后，调用 `$watch` 方法创建并返回一个 Watcher 对象。Watcher 的作用是执行回调函数，并在数据变化时更新组件界面。
 */
 
function createWatcher(
  vm: Component,
  expOrFn: string | (() => any),
  handler: any,
  options?: Object
) {
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}



/**
这段代码的作用是为Vue的实例添加 $data 和 $props 属性，并且这些属性的值分别是实例的 _data 和 _props 属性的值。

首先，通过 stateMixin 函数将 Vue 作为参数传入。然后定义两个对象 dataDef 和 propsDef，用于存储访问器函数(getter)和可选的修改器函数(setter)。这两个对象分别用 Object.defineProperty 方法定义了 Vue 实例的 $data 和 $props 访问器属性。其中 get 函数返回当前实例的 _data 和 _props 属性，set 函数在开发环境（__DEV__）下会输出相应的警告信息。

最后，通过 Object.defineProperty 将 dataDef 和 propsDef 对象定义到 Vue.prototype 上，这样就能够在 Vue 的实例上直接访问 $data 和 $props 属性了。
 */
 
export function stateMixin(Vue: typeof Component) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef: any = {}
  dataDef.get = function () {
    return this._data
  }
  const propsDef: any = {}
  propsDef.get = function () {
    return this._props
  }
  if (__DEV__) {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
          'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)



/**
在Vue.js中，我们可以使用`Object.defineProperty()`来响应数据的变化。但是这种方式只能监听已经存在的属性。如果想要监听新添加的属性的变化，就需要使用`Vue.set()`和`Vue.delete()`这两个方法了。

`Vue.prototype.$set`实际上是在`Vue`的原型对象上添加一个`$set`方法，它接受三个参数：对象、属性名和属性值。当我们调用`this.$set(obj, propName, value)`时，它会将`value`设置为`obj.propName`的值，并且会让这个新添加的属性也能够被响应式地监听到，即使这个属性在定义对象时没有被声明。

同样地，`Vue.prototype.$delete`也是在`Vue`原型对象上添加一个`$delete`方法，它也接受两个参数：对象和属性名。当我们调用`this.$delete(obj, propName)`时，它会从`obj`对象中删除`propName`属性，并且会触发相关组件的重新渲染，以更新UI界面。

这两个方法是Vue.js框架中非常重要的API，主要用来处理动态添加或删除属性的场景，以便在后续的程序运行中自动完成响应式更新和渲染。
 */
 
  Vue.prototype.$set = set
  Vue.prototype.$delete = del



/**
这段代码是 Vue.prototype.$watch 方法的定义，它用于监听 Vue 实例上指定数据的变化，并且在数据变化时执行回调函数。

该方法接收三个参数：要监听的表达式（可以是字符串或者函数）、回调函数以及一些可选配置项。如果回调函数是一个普通对象，则会转换成配置项，传递给 createWatcher 方法进行创建观察者对象。

在实现中，首先获取了当前的 Vue 实例 vm，然后判断回调函数是否为对象，如果是的话则使用 createWatcher 方法来创建观察者对象。否则，将可选配置项赋值给 options，并设置 options.user 为 true，表示这是一个用户定义的观察者。

接下来，通过 new Watcher 创建观察者对象 watcher，同时，如果配置项中有 immediate 属性，则立即执行回调函数 cb 并传入当前的值作为参数。

最后，返回一个取消监听的函数 unwatchFn，它在调用时会调用 watcher.teardown() 方法，用于销毁观察者对象并清除相关引用。

总之，Vue.prototype.$watch 方法是 Vue 数据响应系统中非常重要的一环，它用于实现数据的双向绑定等功能，对于理解 Vue 响应式原理和源码来说至关重要。
 */
 
  Vue.prototype.$watch = function (
    expOrFn: string | (() => any),
    cb: any,
    options?: Record<string, any>
  ): Function {
    const vm: Component = this
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    options.user = true
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      const info = `callback for immediate watcher "${watcher.expression}"`
      pushTarget()
      invokeWithErrorHandling(cb, vm, [watcher.value], vm, info)
      popTarget()
    }
    return function unwatchFn() {
      watcher.teardown()
    }
  }
}


