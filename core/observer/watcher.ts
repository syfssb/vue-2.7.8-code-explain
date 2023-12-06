
/**
./dist/src/core/observer/watcher.ts是Vue源码中用于实现响应式系统的Watcher类的定义文件。

在Vue的响应式系统中，Watcher是一个核心概念。它的作用是监听被观察数据（如data）的变化，并且可以触发相应的回调函数进行更新操作。Watcher可以在模板编译阶段或者Vue实例初始化阶段创建，并且可以根据需要进行销毁和重新创建。

./dist/src/core/observer/watcher.ts文件中定义的Watcher类具有以下功能：

1. 依赖收集：当Watcher实例被创建时，会自动将当前Watcher实例作为依赖加入到被观察数据（如data）的依赖列表中。这样当被观察数据发生变化时，Watcher实例就可以接收到通知，从而触发更新操作。
2. 更新操作：当被观察数据发生变化时，Watcher实例会自动触发更新操作。更新操作包括获取新值、旧值以及执行回调函数等步骤。
3. 异步更新：Vue使用异步更新策略来优化性能。当多个Watcher实例同时需要更新时，Vue会将这些Watcher实例排队，只进行一次异步更新操作，从而减少不必要的重复计算和DOM操作。

Watcher类在整个Vue源码中被广泛使用，特别是在Vue的响应式系统和计算属性中。例如，在Vue组件的mounted生命周期钩子函数中，Vue会创建一个Watcher实例来监听组件内部数据的变化，并且在变化时触发重新渲染组件的操作。
 */
 



/**
代码中的这些变量和函数都是从Vue的工具函数中引入的。

- warn：一个用于输出警告信息的函数。
- remove：把数组中某个元素移除的函数。
- isObject：判断传入参数是否为对象的函数。
- parsePath：解析路径字符串的函数，返回一个数组。
- _Set as Set：将_Set重命名为Set，后面Watcher类会使用到Set。
- handleError：处理错误的函数，用于捕获错误并调用全局配置的errorHandler函数。
- invokeWithErrorHandling：带有错误处理的函数调用器，用于在组件方法中执行函数时进行错误处理。
- noop：空函数，一般用作占位符。
- isFunction：判断传入参数是否为函数的函数。
 */
 
import {
  warn,
  remove,
  isObject,
  parsePath,
  _Set as Set,
  handleError,
  invokeWithErrorHandling,
  noop,
  isFunction
} from '../util/index'



/**
好的，这里是关于`./dist/src/core/observer/watcher.ts`文件中导入的模块的解释：

1. `traverse`: 这是一个递归遍历对象/数组属性的函数，用于对响应式数据进行依赖收集和派发更新操作。

2. `queueWatcher`: 这是Vue异步更新队列的核心方法，它会将需要更新的`Watcher`对象添加到队列中，并在下一次事件循环中异步执行更新操作。

3. `Dep`: 这是Vue的依赖收集器，在响应式数据变化时，`Dep`会通知被观察者`Watcher`对象进行更新操作。而在`Watcher`对象初始化时，它会通过`Dep`进行依赖收集，收集当前`Watcher`对象依赖的所有响应式数据。同时，在`Watcher`对象更新时，它会通知所有依赖它的`Dep`对象进行更新操作。

4. `pushTarget`、`popTarget`和`DepTarget`: 这三个方法和变量都是用于处理`Watcher`对象的依赖关系的。`pushTarget`用于将当前正在处理的`Watcher`对象压入栈中；`popTarget`用于将栈顶的`Watcher`对象弹出；而`DepTarget`则是一个全局变量，用于存储当前正在处理的`Watcher`对象，以便在依赖收集过程中能够正确地访问到`Watcher`对象。这三个方法和变量的作用都是为了解决多个嵌套的响应式数据变化时，能够正确地处理依赖关系。

5. `DebuggerEvent`和`DebuggerOptions`: 这两个是在Vue3版本中新增的调试相关的类型。`DebuggerEvent`是一个事件对象，包含了当前的事件类型和触发事件的组件实例等信息；而`DebuggerOptions`则是一些调试选项，例如是否启用性能追踪等。
 */
 
import { traverse } from './traverse'
import { queueWatcher } from './scheduler'
import Dep, { pushTarget, popTarget, DepTarget } from './dep'
import { DebuggerEvent, DebuggerOptions } from 'v3/debug'



/**
在 `./dist/src/core/observer/watcher.ts` 中，代码引入了两个类型：

1. `SimpleSet` 类型：用于处理一些集合操作的工具函数，例如实现添加、删除和查找等操作。这个类型在 `../util/index` 中定义。
2. `Component` 类型：用于描述组件的配置选项，例如 `props`、`data`、`methods` 等。这个类型在 `types/component` 中定义。

同时，还引入了 `activeEffectScope` 和 `recordEffectScope` 函数。这两个函数主要是用来处理响应式数据的依赖收集和触发更新的，它们位于 `v3/reactivity/effectScope` 中。

`activeEffectScope` 函数是当前正在执行的响应式副作用范围的变量，可以通过该函数获取到正在执行的 `effect scope` 对象。`recordEffectScope` 函数则是用来记录一个新的响应式副作用范围的变量，并将其与当前的执行上下文关联起来。

总之，这些类型和函数都跟 Vue 的响应式系统密切相关，对于理解 Vue 的数据双向绑定和侦听器功能非常有帮助。
 */
 
import type { SimpleSet } from '../util/index'
import type { Component } from 'types/component'
import { activeEffectScope, recordEffectScope } from 'v3/reactivity/effectScope'



/**
在Vue中，Watcher是一个核心概念，用于监视数据变化并触发相应的回调函数。每个Watcher都有一个唯一的标识符uid，它从0开始递增。在代码中，let uid=0 是创建一个初始值为0的变量uid，并在每次创建新Watcher实例时，将其自增，以确保每个Watcher都有唯一的标识符。这样做的原因是，如果没有唯一的标识符，可能会出现Watcher被重复执行或删除的情况，导致数据更新不稳定。所以，Vue通过给每个Watcher分配唯一的uid来确保数据的稳定性和可靠性。
 */
 
let uid = 0



/**
在Vue源码中，./dist/src/core/observer/watcher.ts文件定义了Watcher类，用于创建响应式数据的观察者。WatcherOptions是Watcher类的构造函数参数类型。

WatcherOptions 中包含以下属性：

1. deep?: boolean： 表示是否深度观测对象内部的变化，默认值为false。

2. user?: boolean：表示该Watcher实例是否是开发者自定义的Watcher，默认值为false。

3. lazy?: boolean：表示是否在首次求值之前不会执行求值函数，默认值为false。

4. sync?: boolean：表示当依赖项变更时是否同步求值并执行回调函数，默认值为true。

5. before?: Function：表示在求值（update）之前要调用的函数。这个函数只被调用一次，并且在依赖项收集之前调用。

以上是对WatcherOptions属性的解释，这些选项提供了创建Watcher实例的各种配置选项，使我们可以根据具体情况来设置和使用Watcher。
 */
 
/**
 * @internal
 */
export interface WatcherOptions extends DebuggerOptions {
  deep?: boolean
  user?: boolean
  lazy?: boolean
  sync?: boolean
  before?: Function
}



/**
这段代码定义了一个`Watcher`类，它实现了`DepTarget`接口。`Watcher`用于解析表达式、收集依赖以及在表达式的值发生变化时触发回调。这个类被用于`$watch()` api和指令中。

以下是类的属性：

- `vm?: Component | null`: 观察者所属的Vue实例。
- `expression: string`: 被观察的表达式字符串。
- `cb: Function`: 当表达式的值变化时触发的回调函数。
- `id: number`: watcher的唯一标识符。
- `deep: boolean`: 是否深度监测对象内部的变化。
- `user: boolean`: 标记watcher是否是用户定义的。
- `lazy: boolean`: 标记watcher是否是懒执行的。
- `sync: boolean`: 标记watcher是否同步执行。
- `dirty: boolean`: 标记watcher是否是脏的。
- `active: boolean`: 标记watcher是否是激活的。
- `deps: Array<Dep>`: 存储当前watcher所依赖的dep对象数组。
- `newDeps: Array<Dep>`: 存储新的watcher所依赖的dep对象数组。
- `depIds: SimpleSet`: 存储当前watcher所依赖的dep对象的id的集合。
- `newDepIds: SimpleSet`: 存储新的watcher所依赖的dep对象的id的集合。
- `before?: Function`: 观察者更新之前调用的回调函数。
- `onStop?: Function`: 当观察者被停止时调用的回调函数。
- `noRecurse?: boolean`: 防止观察者递归地收集依赖关系。
- `getter: Function`: 解析表达式得到对应的值的方法。
- `value: any`: 表达式解析后得到的值。
- `post: boolean`: 标记watcher是否是后置的（在渲染完成后执行）。

Watcher对象实例化时，会先触发一次`get`方法，获取表达式的初始值，并且将当前的Watcher实例加入到全局的target属性中，以便收集依赖。然后在表达式的值变化时，会重新触发`get`方法，获取新的值，并且通知相关的dep对象去通知所有的观察者（包括这个Watcher实例）去更新对应的视图。
 */
 
/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 * @internal
 */
export default class Watcher implements DepTarget {
  vm?: Component | null
  expression: string
  cb: Function
  id: number
  deep: boolean
  user: boolean
  lazy: boolean
  sync: boolean
  dirty: boolean
  active: boolean
  deps: Array<Dep>
  newDeps: Array<Dep>
  depIds: SimpleSet
  newDepIds: SimpleSet
  before?: Function
  onStop?: Function
  noRecurse?: boolean
  getter: Function
  value: any
  post: boolean



/**
在 Vue 中，数据响应式的核心机制是利用了 JavaScript 的 getter 和 setter。当一个数据被访问时，会触发 getter 函数，而当一个数据被修改时，会触发 setter 函数。Vue 利用这个特性来实现响应式。

在 `./dist/src/core/observer/watcher.ts` 文件中，定义了 Watcher 类，它是 Vue 的核心之一。Watcher 实例化时，会传入一个函数 `cb`，并且会在内部创建一个 Dep 对象。Dep 对象用于收集依赖，它会存储所有添加到它的依赖项列表中的 Watcher 实例。

当一个响应式数据被访问时，它会触发 getter 函数，并将当前 Watcher 实例添加到该数据的依赖列表中。当数据被修改时，它会触发 setter 函数，并通知所有依赖于该数据的 Watcher 实例更新视图。

在 `Watcher` 类中，`onTrack` 和 `onTrigger` 是用于调试的钩子函数。它们分别在依赖项被添加和依赖项被更新时被调用，可以用于调试或跟踪依赖项的变化。在开发环境下，Vue 会通过传递这两个函数来帮助我们调试代码。在生产环境中，这两个函数都会被省略，以达到优化的目的。
 */
 
  // dev only
  onTrack?: ((event: DebuggerEvent) => void) | undefined
  onTrigger?: ((event: DebuggerEvent) => void) | undefined



/**
这段代码是 Watcher 类的构造函数，Watcher 是 Vue 中用于监听数据变化并执行回调函数的对象。具体来说，这个构造函数接受 5 个参数：

1. vm: Component | null：这是一个组件实例，也有可能为空。

2. expOrFn: string | (() => any)：这是要监视的表达式或函数。

3. cb: Function：当监视的值发生变化时，会执行该回调函数。

4. options?: WatcherOptions | null：这是一些可选的选项。

5. isRenderWatcher?: boolean：这是一个布尔值，用于标识是否为渲染 watcher。

在构造函数内部，首先通过 `recordEffectScope` 函数记录了 watcher 的作用域（effect scope）信息。然后判断传入的组件实例是否存在，如果存在且是一个渲染 watcher，则将该 watcher 赋值给组件实例的 `_watcher` 属性。

接下来处理传入的可选选项。如果存在选项，则根据选项设置实例的属性。其中，`deep` 表示是否深度监听，`user` 表示是否为用户定义的 watcher，`lazy` 表示是否为懒加载（即只有当需要获取该值时才会计算），`sync` 表示是否同步执行回调函数，`before` 表示在计算前要执行的回调函数。如果选项不存在，则将这几个属性都设置为 false。

然后设置实例的其他属性，包括唯一标识符 id，状态是否为 active，是否需要执行回调函数 post，是否需要计算数据 dirty，以及依赖相关的属性 deps、newDeps、depIds 和 newDepIds。

最后处理表达式或函数。如果传入的是函数，则直接将其赋值给实例的 `getter` 属性，如果传入的是字符串表达式，则通过 `parsePath` 函数解析表达式并生成一个对应的函数。如果解析失败，则把 `getter` 属性设置为 noop（空函数）。最后根据是否为懒加载 watcher 来决定是否要立即计算值并存储在实例的 `value` 属性中。
 */
 
  constructor(
    vm: Component | null,
    expOrFn: string | (() => any),
    cb: Function,
    options?: WatcherOptions | null,
    isRenderWatcher?: boolean
  ) {
    recordEffectScope(this, activeEffectScope || (vm ? vm._scope : undefined))
    if ((this.vm = vm)) {
      if (isRenderWatcher) {
        vm._watcher = this
      }
    }
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
      if (__DEV__) {
        this.onTrack = options.onTrack
        this.onTrigger = options.onTrigger
      }
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.post = false
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = __DEV__ ? expOrFn.toString() : ''
    // parse expression for getter
    if (isFunction(expOrFn)) {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
        __DEV__ &&
          warn(
            `Failed watching path: "${expOrFn}" ` +
              'Watcher only accepts simple dot-delimited paths. ' +
              'For full control, use a function instead.',
            vm
          )
      }
    }
    this.value = this.lazy ? undefined : this.get()
  }



/**
这段代码是Watcher类中的get方法，用于计算getter函数的返回值并且重新收集依赖。它主要做了以下几件事情：

1. 调用pushTarget方法将当前Watcher实例压入targetStack数组中，表示当前正在执行的Watcher实例。
2. 在try块中执行getter函数获取新值value，并将当前Vue实例vm作为getter的this指向。
3. 如果执行getter发生任何错误，则根据watcher是否是用户定义抛出不同的错误信息或直接抛出错误。
4. 如果Watcher实例的deep属性为true，就需要深度遍历value对象，并访问对象的每个属性以触发它们的getter方法，从而确保这些属性也被收集为依赖项。
5. 最后调用popTarget方法将Watcher实例从targetStack数组中弹出，并调用cleanupDeps方法清理无效的依赖项。
6. 返回计算后的value值。

总的来说，这个get方法的主要作用是执行getter函数并重新收集依赖项，在getter函数执行时会将该Watcher实例推到一个全局的targetStack中，以便在watcher内部依赖数据变化时可以通知它来更新视图。如果深度监听，则会递归访问所有层级的对象属性，确保它们都被收集为依赖项。最后返回getter函数的返回值。
 */
 
  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get() {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e: any) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }



/**
这段代码是Watcher类中的addDep方法，用于为当前Watcher实例添加依赖项。

在Vue中，当组件渲染时，会创建一个Watcher实例来观察数据变化并更新视图。每个Watcher实例都会维护一组依赖项（Dep），这些依赖项代表了当前Watcher实例所依赖的数据源。

当数据发生变化时，对应的依赖项（Dep）会通知所有依赖它的Watcher实例进行更新。

在addDep方法中：

- 首先获取当前依赖项（Dep）的唯一标识符id。
- 如果当前依赖项的id之前没有被添加到Watcher实例的newDepIds集合中，则将其添加到集合中，并将该依赖项添加到newDeps数组中。
- 如果id之前没有被添加到Watcher实例的depIds集合中，则需要将Watcher实例添加到该依赖项的订阅者列表中（即调用dep.addSub(this)方法）。

这样做的目的是保证同一个Watcher实例不会重复地订阅同一个依赖项，避免重复更新视图。同时，将新的依赖项添加到newDepIds集合和newDeps数组中，则可以在下一次重新渲染时检查是否有新的依赖项被添加或旧的依赖项被移除，从而保证依赖项的正确性。
 */
 
  /**
   * Add a dependency to this directive.
   */
  addDep(dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }



/**
这段代码位于Watcher类中，用于在依赖收集过程中清理依赖列表。它做了以下几件事情：

1. 对于原来存在的依赖项，但是不在新的依赖项列表中的项，将该项从依赖的观察者列表中移除。
2. 将newDepIds赋值给depIds，并清空newDepIds。
3. 将newDeps赋值给deps，并清空newDeps。

具体解释如下：

首先，Watcher对象有一个deps和newDeps数组，分别保存Watcher所关注的所有Dep对象和本次更新新增加的Dep对象。

因为Vue中响应式变量可能会被多个Watcher所关注，所以每个Dep对象都维护了一个subs（Subscribers）数组，里面保存所有关注这个Dep对象的Watcher对象。

在依赖收集的过程中，需要判断是否已经存在相同的依赖。如果已经存在相同的依赖，则只需要在Dep对象的subs数组中添加当前Watcher即可；如果不存在，则需要将当前Watcher对象添加到依赖的观察者列表中。

当数据发生变化时，需要通知所有关注这个Dep对象的Watcher对象进行更新操作。这个通知过程称为派发更新。

因为在某些情况下，一个Dep对象可能被多个Watcher所关注，但是在更新时并不需要通知所有的Watcher对象。例如在计算属性中，如果计算属性依赖的数据发生变化，只需要更新计算属性本身，而不需要通知其他依赖该数据的Watcher对象。

为了解决这个问题，在Watcher类中维护了一个depIds数组和newDepIds数组，分别保存原来依赖的Dep对象的id和本次更新新增加的Dep对象的id。

在派发更新时，只需要遍历所有的Dep对象，如果当前Dep对象的id存在于depIds或newDepIds中，则通知该Dep对象的所有观察者；否则跳过该Dep对象。这样就能够保证只通知关注当前数据变化的Watcher对象。

但是在每次更新前都需要重新进行依赖收集，所以需要清空之前收集的依赖列表。这里的cleanupDeps()函数就是用来清理依赖列表的。具体来说：

1. 遍历原来的依赖列表，如果该依赖不再新的依赖列表中，则将该依赖从该依赖的观察者列表（subs）中删除。
2. 将newDepIds赋值给depIds，并清空newDepIds。
3. 将newDeps赋值给deps，并清空newDeps。

这样做的目的是清除无效的依赖项，同时准备开始新一轮的依赖收集。
 */
 
  /**
   * Clean up for dependency collection.
   */
  cleanupDeps() {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp: any = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }



/**
在 Vue 中，每当一个数据发生变化时，都会触发一系列的更新操作。`Watcher` 类就是用来处理这些更新操作的。

在 `Watcher` 类中，有一个 `update()` 方法，该方法用于通知订阅者（也就是 Watcher 实例对象）发生了变化。当依赖项发生变化时，会调用该方法。

具体来说，当依赖项变化时，首先判断是否有使用到了计算属性，有则设为脏值；如果没有，则将当前订阅者放入异步更新队列中等待更新。

可以看到，这里采用了异步更新的方式，即将当前订阅者加入到一个异步更新队列中，以避免多次不必要的更新操作。这个异步更新队列会在下一次事件循环中执行，具体实现细节可以查看 `nextTick.js` 文件。
 */
 
  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update() {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }



/**
这段代码是Vue中的观察者（Watcher）类中的一个方法，用来执行watcher中的回调函数，并更新值。

首先判断该观察者是否激活（active属性），如果激活，则调用get方法获取最新的值。然后，比较最新的值和旧值是否相等，如果不相等或者是深层监测（deep属性为true）或者是对象/数组，则需要触发回调函数。如果是用户自定义的watcher，则使用invokeWithErrorHandling函数调用回调函数并捕获错误，否则直接调用回调函数。

在回调函数中，会将新值和旧值作为参数传入，以便在回调函数中使用。如果是用户自定义的watcher，则还会将vm实例和回调函数的信息（expression属性）一同传给invokeWithErrorHandling函数。最后，将新值赋值给value属性，更新观察者的值。

总之，这段代码就是观察者在监测到变化时要执行的操作，它会检查当前观察者是否处于激活状态，如果激活，则会调用get方法获取最新的值，比较新旧值是否相等，如果不相等则调用回调函数进行处理，并将新值赋给value属性。
 */
 
  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run() {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
          const info = `callback for watcher "${this.expression}"`
          invokeWithErrorHandling(
            this.cb,
            this.vm,
            [value, oldValue],
            this.vm,
            info
          )
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }



/**
在Vue.js中，Watcher是观察者模式的实现，用于监听数据变化并及时更新视图。其中有两种类型的Watcher：即计算属性(watcher)和侦听器(watcher)，它们都继承自一个基本的Watcher类。

在Watcher类中，有一个evaluate方法，这个方法只会被lazy watchers（计算属性）调用。所谓lazy watcher指的是在初始化Watcher对象时不会立刻执行get方法，而是等到真正需要计算值时再去执行。

evaluate()方法的作用就是计算出当前Watcher的值，并将其赋给value属性。同时，将dirty属性设置为false，表示该Watcher已经计算过一次了，可以直接使用它的value属性进行缓存，避免重复计算。
 */
 
  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }



/**
这段代码的作用是收集当前Watcher所依赖的所有Dep对象，并将这些Dep对象添加到Watcher的deps数组中。在执行 depend 方法时，会遍历 deps 数组中的每个 Dep 对象，然后调用该 Dep 对象的 depend 方法，以通知它们重新收集当前 Watcher 对象。

在Vue的数据响应系统中，Watcher对象负责监听Vue实例中所有的数据变化，并向订阅者发送通知。而Dep对象则负责管理所有依赖它的Watcher对象，当Dep对象发生变化时，会通知其所有的Watcher对象更新视图。

因此，在访问Vue实例中的数据时，会首先创建一个Watcher对象，并将该Watcher对象与当前的Dep对象关联起来，在数据发生变化时，Dep对象会通知与之关联的所有Watcher对象进行更新操作。而 depend 方法则是Watcher对象内部使用的方法，用于触发更新操作的过程。
 */
 
  /**
   * Depend on all deps collected by this watcher.
   */
  depend() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }



/**
这段代码在 Watcher 实例销毁时，从其依赖项的订阅列表中移除自身。

在 Vue.js 数据响应式系统中，Watcher 是观察者，负责监听数据变化，并执行回调函数来更新视图。一个 Watcher 实例可能会依赖多个数据属性，这些属性发生变化时，Watcher 实例需要被通知执行回调函数更新视图。这些被 Watcher 实例所依赖的数据属性也需要知道关注它们的 Watcher 实例，以便在其变化时通知相关的 Watcher 实例去更新视图。

在Watcher实例销毁时，我们需要将其从所有依赖项的订阅列表中移除，以避免引起内存泄漏或逻辑错误。具体过程是：首先判断Watcher实例所在的Vue组件是否正在销毁（this.vm._isBeingDestroyed），如果没有，则从vm实例的_scope对象的effects数组中移除当前Watcher实例；然后遍历Watcher实例收集到的所有依赖项，调用每个依赖项的removeSub方法，将当前Watcher实例从其对应的dep实例的subs数组中移除；最后将Watcher实例的active标记设置为false，表示该实例已不再活跃，如果Watcher实例定义了onStop回调函数，则执行它。
 */
 
  /**
   * Remove self from all dependencies' subscriber list.
   */
  teardown() {
    if (this.vm && !this.vm._isBeingDestroyed) {
      remove(this.vm._scope.effects, this)
    }
    if (this.active) {
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
      if (this.onStop) {
        this.onStop()
      }
    }
  }
}


