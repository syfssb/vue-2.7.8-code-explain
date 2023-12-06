/**
computed.ts 文件是 Vue 3 中响应式系统中的计算属性相关代码。具体来说，它定义了一个 `computed` 函数，该函数接收两个参数：getter 和 setter，分别用于获取和设置计算属性的值。

在整个 Vue 3 源码中，computed.ts 文件主要和以下文件有关联：

1. reactive.ts：定义了 `reactive` 函数，该函数用于将一个对象转换为响应式对象。computed 函数通常会在 reactive 对象内部使用。
2. effect.ts：定义了 `effect` 函数，该函数用于创建副作用函数，并且会自动追踪其依赖项。computed 函数中会使用 effect 函数来追踪其依赖项，以便在依赖项变化时重新计算 computed 属性的值。
3. ref.ts：定义了 `ref` 函数，该函数用于将一个基本类型数据转换为响应式数据。computed 函数也可以使用 ref 函数来创建响应式数据。

总之，computed.ts 文件与响应式系统密切相关，是 Vue 3 响应式系统中的重要组成部分。
 */

/**
这段代码主要是引入了一些Vue内部使用的工具和依赖，其中包括：

- `isServerRendering`：用于检测当前是否处于服务器渲染环境中。
- `noop`：一个空函数，主要用于占位或者默认值。
- `warn`：一个警告函数，用于在控制台输出警告信息。
- `def`：一个定义对象属性的函数。
- `isFunction`：用于检测一个变量是否为函数类型。
- `Ref`：一个封装基本数据类型的响应式对象。它实现了`Ref`接口，可以通过`.value`来访问其内部的值。
- `RefFlag`：`Ref`对象内部使用的一些标志位。
- `Watcher`：观察者类，用于监听响应式对象数据的变化，并执行对应的回调函数。
- `Dep`：依赖类，用于跟踪响应式对象的依赖关系，并在数据变化时通知所有依赖进行更新。
- `currentInstance`：当前组件实例对象，在组件创建时被赋值，在组件销毁时被清空。
- `ReactiveFlags`：响应式对象内部使用的一些标志位。
- `TrackOpTypes`：响应式追踪操作类型。
- `DebuggerOptions`：用来设置调试器相关选项的配置对象。

这些工具和依赖是Vue内部实现响应式机制的重要部分，它们被用于实现计算属性等功能。在了解这些工具和依赖的基础上，我们才能更深入地学习Vue响应式机制的实现细节。
 */

import { isServerRendering, noop, warn, def, isFunction } from "core/util";
import { Ref, RefFlag } from "./ref";
import Watcher from "core/observer/watcher";
import Dep from "core/observer/dep";
import { currentInstance } from "../currentInstance";
import { ReactiveFlags } from "./reactive";
import { TrackOpTypes } from "./operations";
import { DebuggerOptions } from "../debug";

/**
在 ./dist/src/v3/reactivity/computed.ts 文件中，该行代码声明了一个名为 `ComputedRefSymbol` 的常量，并使用了 `unique symbol` 关键字来标记它的唯一性。

在 TypeScript 中，`symbol` 类型用于创建唯一的标识符。通过创建一个 `symbol` 类型的变量或常量，可以确保其值在程序中是独一无二的，因此可以用来表示一些需要保持唯一性的概念或属性。

在 Vue 源码中，`ComputedRefSymbol` 被用来表示计算属性的类型标识符。由于计算属性是一种特殊的响应式数据，因此需要使用一个唯一的标识符来区分它们和普通的响应式数据。这样，在使用计算属性时，Vue 可以通过检查该属性的类型标识符来确定它是计算属性还是普通的响应式数据，并做出相应的处理。
 */

declare const ComputedRefSymbol: unique symbol;

/**
这段代码主要是定义了一个`ComputedRef`接口，它继承了`WritableComputedRef`接口，并声明了一个只读的`value`属性和一个`ComputedRefSymbol`属性。

具体来说：

1. `ComputedRef`是响应式计算属性的类型标识符，通过这个类型可以访问到计算属性的值。
2. `ComputedRef`继承自`WritableComputedRef`接口，表示即使计算属性是只读的，它也能够被修改。
3. `readonly value: T`表示`ComputedRef`实例的值只读，不能被修改。
4. `[ComputedRefSymbol]: true`是一个特殊的符号，用于判断一个对象是否为计算属性。如果一个对象拥有该属性，则表示它是一个计算属性实例。

通过这段代码，我们可以看出Vue对计算属性的处理方式：Vue会将每一个计算属性封装成一个`ComputedRef`对象，并提供一个只读的`value`属性来获取其值。同时，在内部使用`ComputedRefSymbol`来判断一个对象是否是计算属性实例。
 */

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
  readonly value: T;
  [ComputedRefSymbol]: true;
}

/**
在Vue中，计算属性是一种可以依赖于其他响应式数据的属性，当依赖数据发生变化时，计算属性会重新计算并返回新的值。在computed.ts文件中，定义了一个可写计算属性类型的接口`WritableComputedRef<T>`，该接口继承自`Ref<T>`。

`Ref`是Vue中响应式数据的基本类型，表示一个具有读取和写入能力的数据，当该数据发生变化时会触发视图更新。而`WritableComputedRef<T>`则是在`Ref<T>`的基础上扩展了计算属性的功能，它不仅具有读取能力，还可以手动设置其值。

除此之外，在`WritableComputedRef<T>`中还定义了一个只读的属性`effect`，该属性是一个Watcher对象。Watcher是Vue中侦听器的实现，用于监听一个响应式数据的变化并执行相应的回调函数。在计算属性中，Watcher会监测所依赖的数据是否发生变化，并在需要时重新计算计算属性的值。

因此，`WritableComputedRef<T>`接口中的`effect`属性即为计算属性所对应的Watcher对象，通过该属性可以访问到Watcher对象的信息，例如依赖的响应式数据等。
 */

export interface WritableComputedRef<T> extends Ref<T> {
  readonly effect: any /* Watcher */;
}

/**
在Vue中，computed是一个非常常用的特性，可以方便地根据数据的变化来重新计算衍生出来的数据。在这段代码中，我们定义了两个类型别名：ComputedGetter和ComputedSetter。

- ComputedGetter: 它是一个函数类型，函数的返回值类型为T（即泛型T），并且该函数可以接收任意数量的参数。在Vue中，computed属性的getter函数就是类似这样的函数类型，它会根据依赖的响应式数据的值去计算衍生出来的计算属性值，并且当依赖的响应式数据发生变化时，它会自动调用更新计算属性的值。因此，这个类型别名定义了一个符合Vue computed属性getter函数的函数类型。

- ComputedSetter: 它也是一个函数类型，函数的参数类型为T（即泛型T），并且该函数没有返回值。在Vue中，如果我们给computed属性设置了setter函数，那么当我们在组件中修改计算属性的值时，就会调用这个setter函数，并且通过这个函数将修改后的值传递进来。因此，这个类型别名定义了一个符合Vue computed属性setter函数的函数类型。

这两个类型别名是为了让开发者在创建计算属性时，可以更加灵活地定义getter和setter函数的参数和返回值类型。
 */

export type ComputedGetter<T> = (...args: any[]) => T;
export type ComputedSetter<T> = (v: T) => void;

/**
`./dist/src/v3/reactivity/computed.ts` 中定义了 Vue 3.x 响应式系统中的 `computed` 函数，而 `WritableComputedOptions<T>` 定义了计算属性的可写选项。

在 Vue 3.x 中，计算属性可以不仅仅只是一个“计算”结果，还可以被设置（set）。这个设置过程需要使用到 `WritableComputedOptions<T>` 中的 `set` 方法。同时，为了获取计算属性的值，我们也需要使用到 `get` 方法。

因此，`WritableComputedOptions<T>` 的作用就是提供了对计算属性进行读写操作的能力，使得我们可以更加灵活地控制计算属性的行为。具体来说：

- `get` 是一个函数，它会返回计算属性的值；
- `set` 是一个函数，它接收一个参数，这个参数就是我们要给计算属性赋的新值。
 */

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>;
  set: ComputedSetter<T>;
}

/**
这段代码是Vue3.x版本中计算属性的实现，具体解释如下：

1. `computed` 函数接收两个参数，第一个参数可以是 getter 函数，也可以是 options 对象；第二个参数是可选的调试选项。

2. 函数根据传入的参数类型确定返回值类型，如果第一个参数是 getter 函数，则返回的是只读的 `ComputedRef<T>` 类型；如果第一个参数是 options 对象，则返回的是可读写的 `WritableComputedRef<T>` 类型。

3. 在函数内部，首先定义了两个变量 `getter` 和 `setter` 。这两个变量分别用于存储计算属性的 getter 和 setter 函数。

4. 如果第一个参数是 getter 函数，则直接将该函数赋值给 `getter` 变量；否则说明第一个参数是一个 options 对象，需要从中解构出 getter 和 setter 函数，并将它们赋值给 `getter` 和 `setter` 变量。

5. 最后，在函数内部根据传入的参数类型，创建对应的计算属性对象并返回。
 */

export function computed<T>(
  getter: ComputedGetter<T>,
  debugOptions?: DebuggerOptions
): ComputedRef<T>;
export function computed<T>(
  options: WritableComputedOptions<T>,
  debugOptions?: DebuggerOptions
): WritableComputedRef<T>;
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>,
  debugOptions?: DebuggerOptions
) {
  let getter: ComputedGetter<T>;
  let setter: ComputedSetter<T>;

  /**
这段代码主要是处理computed属性的getter和setter函数的赋值。其中，computed属性可以接收一个函数或者一个对象作为参数，如果只传入一个函数，则默认该函数为getter函数，setter函数为空；如果传入的是一个对象，那么需要从这个对象中获取getter和setter函数。

首先，代码通过 `isFunction()` 函数判断传入的参数是否为函数类型，如果是，则将该函数赋值给 `getter` 变量，并设置 `setter` 变量为一个只能读取的空函数。

如果传入的参数不是函数类型，那么就认为其是一个对象类型。此时，代码会从对象中分别获取 `get` 和 `set` 属性值，并分别赋值给 `getter` 和 `setter` 变量。

最终，无论 `getter` 和 `setter` 的值是如何被得到的，它们最终都会被传递给 `computed` 函数，以便创建计算属性。
 */

  const onlyGetter = isFunction(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = __DEV__
      ? () => {
          warn("Write operation failed: computed value is readonly");
        }
      : noop;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  /**
这段代码主要是定义一个`watcher`，用来观察`computed`属性的变化，并在需要时进行计算。下面对这段代码逐行分析：

1. `const watcher`: 定义一个常量`watcher`，用来存储创建出来的`Watcher`实例。

2. `isServerRendering() ? null :`: 这个三目运算符的作用是判断是否为服务端渲染。若是，则不需要创建`Watcher`实例，返回`null`。否则，继续执行后续代码。

3. `new Watcher(currentInstance, getter, noop, { lazy: true })`: 创建一个`Watcher`实例，其中`currentInstance`表示当前组件实例，`getter`表示`computed`属性的计算函数，`noop`表示回调函数（在`lazy`为true时不需要），而`{ lazy: true }`则表示该`Watcher`实例是懒加载的。也就是说，在最初渲染时并不会计算`computed`属性的值，只有在访问该`computed`属性时才会进行计算。
 */

  const watcher = isServerRendering()
    ? null
    : new Watcher(currentInstance, getter, noop, { lazy: true });

  /**
这段代码主要是针对开发环境下（__DEV__为true）的情况，用于给计算属性的watcher对象设置onTrack和onTrigger属性。

在Vue的响应式系统中，每个计算属性都会有一个watcher对象来管理它的依赖收集和派发更新。这些watcher对象在计算属性被访问（track）或者被更新（trigger）时会调用一些方法，比如onTrack和onTrigger。

而debugOptions则是通过Vue.config.debug来配置的，可以用于在开发环境下对响应式系统进行调试。该属性包含了一个onTrack和一个onTrigger函数，分别在watcher对象执行track和trigger操作时会被调用，以便在开发过程中更好地追踪问题。

因此，在上述代码中，如果当前处于开发环境且存在watcher和debugOptions，则将debugOptions中的onTrack和onTrigger赋值给watcher对象的onTrack和onTrigger属性，以便在debug模式下方便开发者进行调试。
 */

  if (__DEV__ && watcher && debugOptions) {
    watcher.onTrack = debugOptions.onTrack;
    watcher.onTrigger = debugOptions.onTrigger;
  }

  /**
这段代码是定义一个 computed 的实现，返回一个 ref 类型的对象。其中包含了 getter 和 setter 方法，getter 方法用来获取计算属性的值，setter 方法用来设置计算属性的值。

在 getter 方法中，如果 watcher 对象存在且它的 dirty 属性为 true，则表示需要重新计算计算属性的值，于是调用 watcher.evaluate() 方法进行计算。接着判断当前是否有依赖项（Dep.target）并将 ref 对象作为 target 参数传入，然后调用 watcher.depend() 方法将其加入到依赖列表中。最后返回 watcher 的值。

如果 watcher 不存在，则说明此时计算属性没有被依赖，直接返回 getter 函数的返回值。

在 setter 方法中，直接调用 setter 函数设置计算属性的值。
 */

  const ref = {
    // some libs rely on the presence effect for checking computed refs
    // from normal refs, but the implementation doesn't matter
    effect: watcher,
    get value() {
      if (watcher) {
        if (watcher.dirty) {
          watcher.evaluate();
        }
        if (Dep.target) {
          if (__DEV__ && Dep.target.onTrack) {
            Dep.target.onTrack({
              effect: Dep.target,
              target: ref,
              type: TrackOpTypes.GET,
              key: "value",
            });
          }
          watcher.depend();
        }
        return watcher.value;
      } else {
        return getter();
      }
    },
    set value(newVal) {
      setter(newVal);
    },
  } as any;

  /**
在Vue 2.x版本中，computed属性是通过一个特殊的函数实现的，该函数返回一个被依赖的值，并缓存计算结果，只有在依赖的值发生变化时才会重新计算。在这个过程中，Vue使用了一些内部标记来跟踪响应式对象和属性的状态。

在./dist/src/v3/reactivity/computed.ts中的代码中，`def`函数用于定义一个新的响应式对象或属性，它接受三个参数：

- `obj`：要定义的对象或属性。
- `key`：要定义的属性名。
- `value`：要定义的属性值。

其中RefFlag和ReactiveFlags.IS_READONLY是内部常量，分别表示引用标识和只读标识。这两个常量在Vue的响应式系统中经常被使用。

下面详细解释一下这两个参数的含义：

1. `def(ref, RefFlag, true)`

这行代码主要是在定义一个新的ref属性时使用，ref属性是Vue3.x版本中新增加的响应式数据类型。它可以包装任意类型的普通JavaScript值，并且提供了访问包装值的.value属性的方法。

`RefFlag`是一个内部常量，它表示引用标识。在这里，我们使用`def`函数来将`ref`对象的`.value`属性定义为一个响应式属性，并设置`RefFlag`标识为true。这个标识告诉Vue，这个属性是一个引用类型的响应式属性，需要进行特殊处理。

2. `def(ref, ReactiveFlags.IS_READONLY, onlyGetter)`

这行代码主要是在定义一个只读的computed属性时使用。`ReactiveFlags.IS_READONLY`是一个内部常量，它表示只读标识。在这里，我们使用`def`函数来将`ref`对象的只读标识定义为`onlyGetter`。这个标识告诉Vue，这个属性是一个只读的computed属性，并且只能通过getter方法访问。

总之，这两行代码都是用于Vue响应式系统中的标记和定义操作，帮助Vue跟踪对象和属性的状态，从而实现响应式更新。
 */

  def(ref, RefFlag, true);
  def(ref, ReactiveFlags.IS_READONLY, onlyGetter);

  /**
在 `./dist/src/v3/reactivity/computed.ts` 中，`computed` 函数的定义如下：

```typescript
export function computed<T>(
  getter: ComputedGetter<T>,
  debugOptions?: DebuggerOptions
): ComputedRef<T> {
  let dirty = true

  let value: T

  let computed: ComputedRef<T>

  const runner = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true
        trigger(computed, TriggerOpTypes.SET, 'value')
      }
    }
  })

  computed = {
    __v_isRef: true,
    effect: runner,
    get value() {
      if (dirty) {
        value = runner()
        dirty = false
      }
      track(computed, TrackOpTypes.GET, 'value')
      return value
    },
    set value(newValue: T) {
      setter(newValue)
    }
  } as any

  return computed
}
```

在函数末尾，我们可以看到这一句代码：

```typescript
return ref
```

但实际上这应该是写错了，正确的代码应该是：

```typescript
return computed
```

这条语句的作用是将计算属性对象返回。计算属性对象是一个包含 `get` 和 `set` 方法的对象，并且具有被依赖项追踪和缓存值的能力。通过返回该对象，可以让开发者在模板中像使用普通变量一样使用计算属性。
 */

  return ref;
}
