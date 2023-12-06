
/**
`dep.ts` 文件是 Vue.js 响应式系统中的核心模块之一，它负责管理观察者对象（watcher）并且在数据发生变化时通知这些观察者。每个响应式数据（如：data 属性、computed 属性等）都对应着一个 `Dep` 实例，当这个数据发生了变化时，`Dep` 实例会通知所有订阅它的观察者。

具体来说，`dep.ts` 中定义了一个名为 `Dep` 的类，它包含以下主要属性和方法：

- `id`：每个 Dep 实例都有一个唯一标识符，用来区分不同的依赖
- `subs`：存储订阅该依赖的所有观察者对象
- `addSub(sub: Watcher)`：添加一个观察者对象到 `subs` 数组中
- `removeSub(sub: Watcher)`：从 `subs` 数组中移除一个观察者对象
- `depend()`：将当前的 Dep 实例与正在运行的观察者对象建立关联
- `notify()`：通知所有订阅该依赖的观察者对象执行更新操作

在整个 Vue.js 源码中，`dep.ts` 文件与其他模块之间有着密切的关系。例如，在 `defineReactive()` 函数中会创建一个 Dep 实例，并且在 getter 中调用 `depend()` 方法，建立当前正在运行的观察者对象与 Dep 实例之间的关联。在 setter 中，`dep.notify()` 方法会通知所有订阅该依赖的观察者对象执行更新操作。

总之，`dep.ts` 文件是 Vue.js 响应式系统中非常重要的一个模块，它为 Vue.js 提供了强大的数据响应能力，并且与其他核心模块（如：`watcher.ts`、`observer.ts` 等）密切合作，共同构成了 Vue.js 响应式系统的基石。
 */
 



/**
这段代码主要是对依赖收集器（Dep）进行了定义。下面逐行解释一下：

1. `import { remove } from '../util/index'`: 引入了工具函数`remove`，该函数用于从数组中移除某个元素。

2. `import config from '../config'`: 引入Vue的全局配置对象`config`。

3. `import { DebuggerOptions, DebuggerEventExtraInfo } from 'v3'`: 引入调试器选项和调试器事件额外信息的类型声明。这里的'v3'表示Vue的第三版（即Vue3），在Vue3源码中我们可以找到这些类型声明。

4. 接下来就是定义Dep类，在Vue中Dep是一个非常重要的概念，它用于管理响应式数据的依赖关系。在这里，Dep类被定义为一个具有以下方法的类：
    - `static target: Watcher | null`: 一个静态属性，用于存放当前正在计算的Watcher实例。
    - `id: number`: Dep实例的唯一标识符。
    - `subs: Array<Watcher>`：一个Watcher实例的数组，表示当前Dep实例所管理的所有Watcher实例。
    - `addSub(sub: Watcher)`: 将一个Watcher实例添加到当前Dep实例的`subs`数组中。
    - `removeSub(sub: Watcher)`: 从当前Dep实例的`subs`数组中移除一个Watcher实例。
    - `depend()`: 通知所有注册的Watcher实例，当前计算的响应式数据依赖于这个Dep实例。
    - `notify()`: 通知所有注册的Watcher实例，当前计算的响应式数据已经发生变化。

以上就是Dep类的定义及其方法的作用。需要注意的是，在Vue2.x版本中每个响应式数据（如data、computed、watch等）都会对应一个Dep实例，来管理它们的依赖关系。而在Vue3中，则使用`WeakMap`来管理响应式数据和Dep实例之间的映射关系，以提高性能。
 */
 
import { remove } from '../util/index'
import config from '../config'
import { DebuggerOptions, DebuggerEventExtraInfo } from 'v3'



/**
在 Vue 的响应式系统中，每一个被观察的对象都会对应一个依赖(Dep)实例。而在 Dep 实例中，有一个 id 属性用来区分不同的 Dep 实例。

为了保证每个 Dep 实例的 id 不重复，Vue 采用了一个计数器变量 uid ，每当创建一个新的 Dep 实例时，就会将该变量自增1，并将其赋值给当前实例的 id 属性。

因此，在代码中可以看到 let uid = 0 这句声明语句，用来初始化计数器变量 uid 的初始值为 0。然后在 Dep 类的构造函数中，使用 this.id = ++uid 将每个 Dep 实例的 id 属性设置为当前 uid 值，并将 uid 自增1，以保证之后创建的 Dep 实例的 id 值不与之前的重复。
 */
 
let uid = 0



/**
在Vue.js中，一个响应式对象会对应一个Dep实例，当这个响应式对象的属性被访问或修改时，就会通知和收集所有依赖于这个属性的Watcher，这些Watcher都被添加到Dep实例中。

在Dep类定义中，我们可以看到一个接口DepTarget。这是内部使用的接口，它扩展了DebuggerOptions，并且有三个方法和一个属性:

- id: 标识DepTarget的唯一ID
- addDep(dep: Dep): 向DepTarget中添加一个Dep实例
- update(): 更新DepTarget的状态

这个接口主要是为了方便管理所有依赖于当前响应式对象的Watcher，把它们都保存在一个DepTarget里面，方便统一更新和控制。这也是Vue源码中响应式系统的核心设计之一。
 */
 
/**
 * @internal
 */
export interface DepTarget extends DebuggerOptions {
  id: number
  addDep(dep: Dep): void
  update(): void
}



/**
在 Vue 的响应式系统中，`Dep` 是一个非常重要的概念。它表示一个可观察对象，可以有多个指令（或者说观察者）订阅它。

在 `dep.ts` 中，`Dep` 类被定义为一个默认导出。它包含以下属性：

- `target: DepTarget | null`：这是一个静态属性。在计算属性或者监听器中使用数据时，会将当前的 Watcher 实例设置为 `target` 属性。当依赖收集完成后，会将 `target` 属性重置为 `null`。这样做是为了避免重复收集依赖。
- `id: number`：每个 `Dep` 实例都有一个唯一的 ID。
- `subs: Array<DepTarget>`：这是一个数组，用来存储所有订阅该 `Dep` 实例的指令实例（也就是 Watcher 实例）。

`Dep` 实例的核心作用是进行依赖收集和派发更新。在模板编译过程中，如果某个表达式引用了一个响应式数据，那么它就会被封装成一个 Watcher 实例，并且订阅该响应式数据所对应的 `Dep` 实例。当响应式数据发生变化时，`Dep` 实例就会通知其所有订阅者，并触发它们的更新函数。
 */
 
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 * @internal
 */
export default class Dep {
  static target?: DepTarget | null
  id: number
  subs: Array<DepTarget>



/**
在Vue中，Dep是一个重要的类，它用于管理订阅者和观察者之间的关系。当一个观察者（即Watcher）被添加到Dep中时，Dep会把该观察者存储在subs数组中。

在上述代码中，Dep类的构造函数中初始化了id和subs两个属性。id属性是一个唯一标识符，它会被用来检查观察者是否已经存在。而subs属性则是一个存储观察者（即Watcher）对象的数组。当一个观察者被添加到Dep中时，Dep会把该观察者存储在subs数组中，并在数据更新时通知所有存储在subs中的观察者执行更新操作。

总之，Dep类是Vue实现响应式原理的核心部分，它负责管理所有与数据相关的观察者，以实现数据变更时的自动更新。
 */
 
  constructor() {
    this.id = uid++
    this.subs = []
  }



/**
`./dist/src/core/observer/dep.ts` 文件中的 `addSub(sub: DepTarget)` 方法是 `Dep` 类的一个实例方法。该方法的作用是将订阅者（观察者）添加到依赖列表中。

具体来说，当数据发生变化时，会通知 `Dep` 对象中所有的订阅者（观察者），以便它们能够进行相应的更新操作。这个过程就涉及到如何将订阅者添加到依赖列表中。

`addSub(sub: DepTarget)` 方法接收一个参数 `sub`，该参数表示订阅者（观察者）。它将订阅者添加到 `this.subs` 数组中，以便在需要通知订阅者时能够遍历 `this.subs` 数组，并调用每个订阅者的 `update()` 方法进行更新。

总之，在 Vue 中 `Dep` 对象扮演着非常重要的角色，它提供了一种机制，使得数据和视图之间能够建立起关联，并在数据发生改变时能够通知到视图进行更新。`addSub(sub: DepTarget)` 方法则是 `Dep` 对象的一个核心方法，负责将订阅者添加到依赖列表中，以便后续对订阅者进行通知。
 */
 
  addSub(sub: DepTarget) {
    this.subs.push(sub)
  }



/**
在Vue中，观察者模式起到了至关重要的作用。在这一模式中，有一个Subject（被观察者）和多个Observer（观察者）。Subject会维护一个Observer列表，当其状态发生变化时会通知所有的Observer进行更新。

在Vue中，Dep类充当了Subject的角色。它的subs数组中存储了所有的observer实例。当响应式数据发生改变时，会通过Dep.notify()方法通知所有注册的observer进行更新。

而removeSub(sub: DepTarget)方法则是用来从subs数组中移除已经失效的observer实例。具体实现可以看一下remove函数的定义，它使用了splice方法来移除指定的元素。

这个方法的作用很简单，就是将传入的sub对象从subs数组中移除。在Observer中，当一个Watcher实例不再需要观察某个响应式数据时，就会调用该方法将自身从Dep的subs数组中移除。
 */
 
  removeSub(sub: DepTarget) {
    remove(this.subs, sub)
  }



/**
在 Vue 中，一个响应式属性会依赖于多个观察者对象（watcher），当这个响应式属性发生变化时，所有依赖于它的观察者对象都会接收到通知并执行相应的更新操作。Dep 类就是用来管理这些观察者对象的。

在 `depend` 方法中，首先判断当前是否存在正在计算的观察者对象（即 `Dep.target` 是否存在）。如果存在，则将当前的 Dep 对象添加到该观察者对象的依赖列表中，这样当响应式属性发生变化时，观察者对象就能够接收到通知。

另外，在开发模式下，如果传入了 `info` 参数并且该观察者对象定义了 `onTrack` 方法，则调用该方法并传入 `effect`（即观察者对象本身）和 `info` 参数，以便进行调试。
 */
 
  depend(info?: DebuggerEventExtraInfo) {
    if (Dep.target) {
      Dep.target.addDep(this)
      if (__DEV__ && info && Dep.target.onTrack) {
        Dep.target.onTrack({
          effect: Dep.target,
          ...info
        })
      }
    }
  }



/**
这段代码是 Dep 类中的 notify 方法，作用是通知所有依赖于当前观察目标的 Watcher 实例更新自身。

首先，代码执行了一个数组浅拷贝，将订阅者列表复制一份出来。这么做是为了避免在遍历过程中订阅者列表发生变化（比如添加或删除订阅者）导致的问题。

接着，如果当前是开发环境且不是异步更新模式，会对订阅者列表进行排序，以确保它们按正确的顺序被调度执行。

然后，通过 for 循环遍历每个订阅者，并执行其 update 方法，从而触发对应的 Watcher 实例的重新求值和更新操作。如果是开发环境，并且传入了 info 参数，则还会触发每个订阅者的 onTrigger 回调函数，用来收集调试信息。

总体来说，notify 方法是整个响应式系统的核心，它负责管理当前观察目标所依赖的所有 Watcher 实例，以及在数据变化时通知它们进行重新求值和更新操作，最终实现 Vue 双向数据绑定的机制。
 */
 
  notify(info?: DebuggerEventExtraInfo) {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (__DEV__ && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      if (__DEV__ && info) {
        const sub = subs[i]
        sub.onTrigger &&
          sub.onTrigger({
            effect: subs[i],
            ...info
          })
      }
      subs[i].update()
    }
  }
}



/**
在Vue的响应式系统中，当一个数据被修改时，所有依赖于该数据的组件都需要重新渲染。而这个依赖收集的过程就是通过观察者（Watcher）和依赖（Dep）两个核心类来实现的。

其中，观察者负责收集依赖并更新视图，而依赖则负责管理多个观察者，并在数据发生变化时通知它们进行更新。具体地说，每一个观察者都会对应一个或多个依赖，而每一个依赖则对应一个被观察的数据。

在上述代码中，我们可以看到Dep.target这个全局变量，它是当前正在被计算的观察者对象。由于同一时间只能有一个观察者在计算，因此它是唯一的。当一个观察者开始计算时，会将自身设置为Dep.target，计算完毕后再恢复为null。

同时，为了支持嵌套的观察者计算，Vue使用了一个targetStack数组来维护观察者的计算顺序。每当一个观察者开始计算时，会将它压入这个栈中，计算完毕后再弹出。这样做可以确保嵌套的观察者能够按照正确的顺序进行计算。

总结一下，Dep.target和targetStack这两个变量是用来维护观察者的计算顺序的，并确保同一时间只有一个观察者在计算。
 */
 
// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack: Array<DepTarget | null | undefined> = []



/**
在Vue中，我们知道数据响应式和视图更新是通过观察者模式（Observer Pattern）来实现的。Dep类就是其中的一个重要角色，它用于管理所有的Watcher，同时也是Watcher与数据属性之间的桥梁。

在这段代码中，pushTarget函数的作用是将目标依赖（target）推入targetStack栈中，并将Dep.target设置为目标依赖。可以理解为在进行依赖收集时会调用该函数，把当前的依赖对象（比如计算属性或者watcher）入栈。

为什么要这样做呢？因为在Vue中，每个组件都有自己的渲染Watcher。当组件重新渲染时，其渲染Watcher需要重新执行一遍，此时就需要重新进行依赖收集。而pushTarget函数的作用就是在渲染Watcher执行时将其推入依赖栈中，以便后续依赖收集使用。

最后需要注意的是，在Watcher执行完毕后，需要将之前的依赖对象从栈中弹出，保持栈内始终只有一个目标依赖对象。这个操作可以在popTarget函数中完成，具体可以查看Dep.ts中的实现。
 */
 
export function pushTarget(target?: DepTarget | null) {
  targetStack.push(target)
  Dep.target = target
}



/**
这段代码是 Vue 中观察者模式中的一个关键函数，主要作用是在观察者（Watcher）中清除当前正在观察的目标，以便下一个目标能够正确地添加到观察者列表中。

具体来说，Vue 的观察者模式包含了三个重要角色：观察者（Watcher）、被观察者（Observer）和依赖（Dep）。其中，观察者是负责收集依赖、更新视图等工作的核心对象，而被观察者则是指数据对象本身。另外，每个观察者都会关联一个或多个依赖（Dep），用于检测数据变化并通知观察者。

当观察者进行初始化时，会先调用 pushTarget(target) 函数将其添加到观察者栈中，并将 Dep.target 设为当前观察者。这样，在接下来的数据访问过程中，如果有相关数据发生变化，就可以通过依赖的 notify() 方法通知所有观察者进行更新。

而 popTarget() 函数则是在观察者执行完毕后进行调用，用于将当前观察者从观察者栈中移除，并将 Dep.target 设置为上一个观察者。这样，下一个观察者就可以正确地添加到观察者栈中并开始监听数据变化了。
 */
 
export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}


