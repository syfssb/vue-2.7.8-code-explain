
/**
`effectScope.ts`文件是Vue3.x中新引入的响应式系统中的一个重要概念，用于隔离副作用函数的执行范围。这个文件主要包含了`EffectScope`类的定义，该类是Vue3.x中新引入的用于管理副作用函数执行范围的类。

在Vue3.x的响应式系统中，每次触发响应式数据的变化时，都会产生一系列副作用函数的执行。而这些副作用函数可能会涉及到多个组件或者模板，如果不加以限制，就有可能导致副作用函数的执行出现混乱。因此，为了避免这种情况的发生，Vue3.x中引入了`EffectScope`类来管理副作用函数的执行范围。

具体来说，`EffectScope`类可以理解为一个作用域对象，用于限定副作用函数只在指定的作用域内执行。当某个副作用函数需要执行时，它会首先检查当前是否存在已经创建好的`EffectScope`实例，如果存在，则将该副作用函数添加到该实例的执行队列中；否则，就会自动创建一个新的`EffectScope`实例，并将该副作用函数添加到该实例的执行队列中。这样，就可以保证每个副作用函数的执行范围都被限制在它所属的`EffectScope`实例内部，从而避免了副作用函数之间的干扰和冲突。

在整个Vue3.x的源代码中，`effectScope.ts`文件属于响应式系统相关的文件，它主要与`effect.ts`、`reactivity.ts`等文件相互依赖，共同构成了Vue3.x的响应式系统。其中，`effect.ts`文件定义了副作用函数的基本概念和实现；`reactivity.ts`文件定义了响应式数据模型的基本概念和实现。这些文件一起构成了Vue3.x的响应式系统，为开发者提供了强大的状态管理能力。
 */
 



/**
好的，让我来解释一下这段代码。

首先，`import Watcher from 'core/observer/watcher'`是从Vue核心包中导入了一个名为`Watcher`的类。这个类负责观察数据变化并执行相应的回调函数。在Vue的响应式系统中，当数据被修改时，会通知注册了该数据的所有Watcher去执行相应的回调函数，以更新DOM元素的视图。

接着，`import { warn } from 'core/util'`是从Vue核心包中导入了一个名为`warn`的函数。在Vue开发中，我们经常需要对某些操作进行警告或错误提示，而`warn`函数就是用于输出警告信息的。

最后，`effectScope.ts`文件中的其他代码则是定义了一个名为`EffectScope`的类，可以帮助我们管理和控制`Watcher`实例的作用域。

总结来说，这段代码主要是为了导入依赖的类和函数，并为`EffectScope`类提供所需的功能。
 */
 
import Watcher from 'core/observer/watcher'
import { warn } from 'core/util'



/**
在Vue中，effect是响应式系统中最重要的部分之一。它用于追踪一个响应式对象所依赖的其他响应式对象，并在这些响应式对象发生变化时自动执行相应的回调函数以更新视图。

而EffectScope则是Vue3中新增的一个API，用于管理effect的作用域和状态。具体来说，EffectScope可以让我们创建一个独立的effect作用域，使得这个作用域内的所有effect都可以被统一管理和控制。

在./dist/src/v3/reactivity/effectScope.ts文件中，activeEffectScope就是用于记录当前正在运行的effect作用域的变量。当我们在一个新的effect作用域中创建一个新的effect时，它会将该作用域设置为activeEffectScope，这样我们就可以在整个作用域内轻松地管理和控制所有的effect，包括挂起、恢复、停止等操作。

需要注意的是，activeEffectScope是一个可选的变量，因此它有可能为undefined。在使用它之前，我们需要先判断其是否存在，否则可能会导致一些意外的错误。
 */
 
export let activeEffectScope: EffectScope | undefined



/**
`EffectScope` 是一个类，专门用来管理 `watcher` 实例的生命周期。在 Vue 中，当一个数据源发生变化时，会通知所有依赖于该数据源的 `watcher` 实例重新执行一次更新逻辑。而 `EffectScope` 就是用来控制这些 `watcher` 实例的运行状态。

这个类有三个属性：

1. `active`：用于标记当前 `EffectScope` 的开启/关闭状态。默认为 `true` 表示开启。
2. `effects`：用于存储当前 `EffectScope` 中的所有 `watcher` 实例。每个 `watcher` 实例都会被添加到这个数组中，并在 `EffectScope` 关闭时取消监听。
3. `cleanups`：用于存储当前 `EffectScope` 中的所有清理函数。这些函数会在 `EffectScope` 关闭时执行。

通过上述机制，`EffectScope` 可以确保在某个组件销毁时，其对应的 `watcher` 实例也能够被正确地销毁，从而避免内存泄漏等问题。
 */
 
export class EffectScope {
  /**
   * @internal
   */
  active = true
  /**
   * @internal
   */
  effects: Watcher[] = []
  /**
   * @internal
   */
  cleanups: (() => void)[] = []



/**
这段代码是Vue3中响应式系统的一个关键部分，用于控制数据变化时的副作用（side effect）。具体来说，EffectScope是一个作用域对象，用于将多个数据变化的副作用组合起来进行管理。

在这里，parent属性表示当前作用域对象的父级作用域对象，即该作用域对象所处的上一级作用域对象。而scopes属性则记录了所有未分离作用域对象，即所有与该作用域对象相关联的其他作用域对象。

index属性用于追踪子作用域对象在其父作用域对象的scopes数组中的位置，在删除某个作用域对象时可以提高效率。

总之，EffectScope对象的设计旨在实现对多个数据变化的副作用进行统一管理，并对其进行优化处理，以提高Vue3的性能表现。
 */
 
  /**
   * only assigned by undetached scope
   * @internal
   */
  parent: EffectScope | undefined
  /**
   * record undetached scopes
   * @internal
   */
  scopes: EffectScope[] | undefined
  /**
   * track a child scope's index in its parent's scopes array for optimized
   * removal
   * @internal
   */
  private index: number | undefined



/**
这段代码主要是定义了一个名为 `EffectScope` 的类，用于管理和跟踪 Vue3 中的副作用函数（effect）。

其中 `constructor()` 方法中的 `detached` 参数表示当前 `EffectScope` 是否被分离（即没有父级）；如果未分离并且当前存在激活状态的 `activeEffectScope`，则将该 `EffectScope` 实例的父级设置为 `activeEffectScope`，并将该实例加入到 `activeEffectScope` 的 `scopes` 数组中。同时，计算该实例在 `scopes` 数组中的索引值（即 `index` 属性）。

通过这种方式，Vue3 中的副作用函数可以进行嵌套调用，并能够管理其依赖关系，从而实现响应式数据的自动更新。
 */
 
  constructor(detached = false) {
    if (!detached && activeEffectScope) {
      this.parent = activeEffectScope
      this.index =
        (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
          this
        ) - 1
    }
  }



/**
这段代码是 `./dist/src/v3/reactivity/effectScope.ts` 文件中的 `EffectScope` 类中的 `run` 方法。该方法接收一个函数作为参数，并返回该函数的执行结果。

首先，该方法会判断当前 `EffectScope` 实例是否处于激活状态（即 `active` 为 `true`）。如果未激活，且处于开发环境，则会输出警告信息。如果激活了，则通过将全局变量 `activeEffectScope` 设为当前实例，运行传入的函数并返回其执行结果。

在 `try-finally` 语句块中，我们将当前 `activeEffectScope` 存储在 `currentEffectScope` 变量中，并将 `activeEffectScope` 变量设置为当前实例。这样做的目的是确保在调用 `fn` 函数期间，任何依赖项的更改都会被记录到当前的 `EffectScope` 实例中。

当函数执行完成后，无论是否发生异常，都会将 `activeEffectScope` 变量恢复回之前存储的 `currentEffectScope` 值，以确保全局变量不会被错误地修改。

最终，函数将返回执行结果。若函数有返回值，则返回其返回值，否则返回 `undefined`。
 */
 
  run<T>(fn: () => T): T | undefined {
    if (this.active) {
      const currentEffectScope = activeEffectScope
      try {
        activeEffectScope = this
        return fn()
      } finally {
        activeEffectScope = currentEffectScope
      }
    } else if (__DEV__) {
      warn(`cannot run an inactive effect scope.`)
    }
  }



/**
在 Vue3 的 reactivity 模块中，effectScope 是一个用于管理 effect 生命周期的对象。它具有两个主要的属性：activeEffectScope 和 activeEffect。

其中，activeEffectScope 用于追踪当前正在执行的 effectScope 对象，而 activeEffect 则是当前正在执行的 effect 函数。

在 effectScope.ts 文件中，on 方法被标记为 @internal，表示该方法只应该在内部使用。该方法的作用是将当前的 effectScope 对象设置为活动状态，也就是将 activeEffectScope 设置为当前对象。

这一步操作非常重要，因为当我们在调用 effect 函数时，需要知道当前的 effectScope 对象是哪个，以便在执行 effect 函数时能够正确地追踪依赖和触发副作用。如果没有设置 activeEffectScope，就无法准确地追踪 effect 函数与其所依赖的数据之间的关系。

需要注意的是，该方法只应该在非 detached 状态下被调用，也就是说，该 effectScope 对象属于某个组件或者实例，并且尚未被销毁。否则，可能会导致程序出现不可预期的行为。
 */
 
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    activeEffectScope = this
  }



/**
在 Vue 中，响应式系统是通过收集依赖来实现的。当数据发生变化时，会通知所有依赖这个数据的地方进行更新。`effect` 是一个用于收集依赖和触发副作用的函数。

`effectScope` 是一个对 `effect` 的包装，它提供了一种方式来管理 `effect` 的生命周期并在需要时停止触发 `effect`。`off()` 方法是 `effectScope` 的一个内部方法，用于将当前 `effectScope` 的父级作为新的 `activeEffectScope`，从而停止当前 `effect` 的触发。具体而言，它会将 `activeEffectScope` 设置为当前 `effectScope` 的父级，从而使得之后的 `effect` 将不再受到当前 `effectScope` 的影响。 

需要注意的是，`off()` 只能在非分离状态下调用，也就是说只有当前 `effectScope` 被激活时才可以调用该方法。
 */
 
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    activeEffectScope = this.parent
  }



/**
这段代码是 Vue3 的响应式系统中的 effectScope 类的 stop 方法。effectScope 类是一个管理 effect 的作用域对象，当它被停止时，其中所有的 effect 都将被清除。

具体来说，这个 stop 方法会遍历当前 effectScope 对象的 effects 数组和 cleanups 数组，分别执行其中每一个 effect 的 teardown 方法和 cleanup 函数。然后，在处理完当前 effectScope 对象内部的 effects 和 cleanups 后，如果该 effectScope 对象还包含有其他子作用域，也会递归调用这些子作用域的 stop 方法。最后，如果当前 effectScope 对象还有父级作用域，并且 fromParent 参数为 false，则会从其父级作用域的 scopes 数组中移除当前 effectScope 对象，以避免内存泄漏。

总之，这个方法的主要作用就是清除 effect 和 cleanup 函数，以及递归清理其包含的子作用域，最终移除当前作用域对象的引用，以确保垃圾回收可以正常进行。
 */
 
  stop(fromParent?: boolean) {
    if (this.active) {
      let i, l
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].teardown()
      }
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]()
      }
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].stop(true)
        }
      }
      // nested scope, dereference from parent to avoid memory leaks
      if (this.parent && !fromParent) {
        // optimized O(1) removal
        const last = this.parent.scopes!.pop()
        if (last && last !== this) {
          this.parent.scopes![this.index!] = last
          last.index = this.index!
        }
      }
      this.active = false
    }
  }
}



/**
这段代码是一个函数导出，它的作用是创建一个新的EffectScope对象。

在Vue中，一个EffectScope对象就是一组相关联的响应式副作用函数的集合。这个对象可以被用来管理这组函数，比如说可以控制这些函数的生命周期、共享一些状态等等。

具体来说，effectScope函数接收一个布尔类型的参数detached，如果传入了该参数并且值为true，那么表示当前创建的EffectScope对象是“已分离”的，也就是说它和父级EffectScope对象不再有联系，创建它的代码不负责管理它的生命周期了；否则，表示创建的EffectScope对象是“未分离”的，也就是说它和父级EffectScope对象相互关联，由创建它的代码负责管理它的生命周期。

最后，effectScope函数会返回一个新的EffectScope对象，我们可以将其保存下来并使用它的api来注册响应式副作用函数或者进行其他操作。
 */
 
export function effectScope(detached?: boolean) {
  return new EffectScope(detached)
}



/**
这段代码主要是定义了一个名为`recordEffectScope`的函数。这个函数用于记录当前正在执行的`effect`以及其所在的作用域`scope`。其中，`effect`是一个观察者对象（Watcher），表示一个响应式数据的依赖项；而`scope`则是一个作用域对象（EffectScope），表示当前`effect`所在的作用域。

具体来说，如果`scope`存在且处于激活状态，就将`effect`添加到它的`effects`数组中。这个操作相当于把`effect`加入到当前作用域的依赖项列表中，随后在响应式数据发生变化时，会调用这个作用域的更新函数，从而触发`effect`的重新求值。

需要注意的是，这个函数并不是对外暴露的接口，而是一个内部实现细节，因此使用了`@internal`注释说明。
 */
 
/**
 * @internal
 */
export function recordEffectScope(
  effect: Watcher,
  scope: EffectScope | undefined = activeEffectScope
) {
  if (scope && scope.active) {
    scope.effects.push(effect)
  }
}



/**
在Vue 3中，`reactivity`模块是负责响应式数据的机制和实现。其中，有一种特殊的函数叫做 `effect`，它是用来创建响应式副作用的。

在 Vue 3 的 `reactivity` 模块中，`effect` 函数会被包装成一个 `Effect` 类的实例对象。而 `EffectScope` 则是用来管理多个 `Effect` 实例对象的类，它可以让我们控制一个或多个效果的生命周期。

`getCurrentScope` 就是一个获取当前活动 `EffectScope` 对象的函数。在 Vue 3 中，每次调用 `effect` 函数时，都会为当前 `Effect` 实例对象创建一个新的 `EffectScope` 对象，并将其设置为当前 `activeEffectScope` 属性的值。这样就可以跟踪并控制各个 `Effect` 实例对象的运行状态，以及它们之间的依赖关系。

因此，`getCurrentScope` 函数的作用就是获取当前正在运行的 `EffectScope` 对象，以便我们能够控制和管理它内部的所有 `Effect` 实例对象。
 */
 
export function getCurrentScope() {
  return activeEffectScope
}



/**
`onScopeDispose` 函数用于在作用域销毁时注册清理函数。它接受一个回调函数作为参数，并将其添加到当前活动的 `activeEffectScope` 的 `cleanups` 数组中，以待在作用域销毁时被执行。

如果没有当前活动的 `activeEffectScope`，则会在开发环境下报出警告信息 "`onScopeDispose() is called when there is no active effect scope to be associated with.`"。

这个函数表明了 Vue 响应式系统中的“作用域”概念，它是一种在响应式数据变化时进行管理副作用（如：计算属性、绑定的监听器等）的机制，作用域销毁时就可以自动清理这些副作用，避免内存泄漏等问题。
 */
 
export function onScopeDispose(fn: () => void) {
  if (activeEffectScope) {
    activeEffectScope.cleanups.push(fn)
  } else if (__DEV__) {
    warn(
      `onScopeDispose() is called when there is no active effect scope` +
        ` to be associated with.`
    )
  }
}


