
/**
`./dist/src/v3/reactivity/reactive.ts` 文件是 Vue3 中响应式系统的核心实现，它定义了 `reactive()` 函数。这个函数可以将一个对象转化为响应式对象，当对象被修改时会自动触发视图更新。

在整个 Vue3 的源码中，`./dist/src/v3/reactivity/reactive.ts` 文件是比较关键的，因为响应式系统是 Vue3 中重要的特性之一，它使得开发者可以方便地进行状态管理和视图更新。

在其他文件中，比如 `./dist/src/v3/runtime-core/renderer.ts` 和 `./dist/src/v3/runtime-core/component.ts` 中都使用了 `reactive()` 函数来创建响应式数据，并且通过其实现了组件的数据绑定、计算属性等功能。此外，`./dist/src/v3/reactivity/effect.ts` 文件也是响应式系统中重要的文件，它定义了 `effect()` 函数，用于监听响应式数据变化并执行相应的副作用函数，从而实现了响应式系统的双向绑定机制。
 */
 



/**
这段代码主要是在定义Vue的响应式系统中使用的一些工具函数和类型，具体解释如下：

1. `import { observe, Observer } from 'core/observer'`

此处导入了`core/observer`模块中的`observe`和`Observer`函数，它们是Vue实现响应式系统的核心。

2. `import { def, isArray, isPrimitive, warn, toRawType, isServerRendering } from 'core/util'`

这里导入了`core/util`模块中的一些常用工具函数，包括：
- `def`: 用于给对象添加或修改属性，并在必要时触发更新。
- `isArray`: 判断变量是否为数组。
- `isPrimitive`: 判断变量是否为原始类型。
- `warn`: 打印警告信息。
- `toRawType`: 获取变量的类型字符串。
- `isServerRendering`: 判断当前是否处于服务器渲染环境。

3. `import type { Ref, UnwrapRefSimple, RawSymbol } from './ref'`

这里通过`import type`语法导入了`./ref`模块中的一些类型。其中：
- `Ref`: Vue3新增的响应式数据类型，可以理解为一个带有读取和写入操作的引用。
- `UnwrapRefSimple`: 用于获取`Ref`类型的内部值。
- `RawSymbol`: 用于创建一个特殊的Symbol值，表示一个未被代理的对象（即非响应式的原始对象）。
 */
 
import { observe, Observer } from 'core/observer'
import {
  def,
  isArray,
  isPrimitive,
  warn,
  toRawType,
  isServerRendering
} from 'core/util'
import type { Ref, UnwrapRefSimple, RawSymbol } from './ref'



/**
`ReactiveFlags` 是一个枚举类型，包含了 4 个属性：

- `SKIP`: 标记对象为不可响应的。当一个对象被标记为 SKIP 后，Vue 将不会对该对象进行响应式处理。
- `IS_READONLY`: 标记对象为只读。当一个对象被标记为 IS_READONLY 后，Vue 将禁止对该对象进行修改操作。
- `IS_SHALLOW`: 标记对象为浅层响应式。当一个对象被标记为 IS_SHALLOW 后，Vue 将对该对象进行浅层响应式处理，即仅监听该对象的直接属性变化，而不监听该对象的深层属性变化。
- `RAW`: 存储对象的原始值。当我们使用 reactive 函数将一个对象转换成响应式对象时，Vue 会将对象的原始值存储在 `__v_raw` 属性中，并返回一个 Proxy 对象。

这些属性都是以双下划线开头的，这是因为它们属于 Vue 内部使用的属性，避免与用户自定义属性产生冲突。
 */
 
export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
  RAW = '__v_raw'
}



/**
在Vue的响应式系统中，Target是指被观察的目标对象。这个接口定义了目标对象可以有的一些属性，包括__ob__、SKIP、IS_READONLY、IS_SHALLOW和RAW。

- __ob__：一个指向Observer实例的引用，用于检测该对象是否已经被观察。
- [ReactiveFlags.SKIP]：一个布尔值，表示该对象是否应该跳过观察。通常用于标记VNode节点或不可扩展的对象。
- [ReactiveFlags.IS_READONLY]：一个布尔值，表示该对象是否是只读的。当对象被标记为只读时，就不能再添加新的响应式属性了。
- [ReactiveFlags.IS_SHALLOW]：一个布尔值，表示该对象是否做浅层观察。当其为true时，对象的属性将不会被递归地进行深度观察。
- [ReactiveFlags.RAW]：原始值，用于在Proxy代理中记录对象的原始值。

以上这些属性都是为了更好地支持Vue的响应式系统而设计的，在响应式系统中发挥重要作用。
 */
 
export interface Target {
  __ob__?: Observer
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: any
}



/**
这段代码定义了一个类型 `UnwrapNestedRefs<T>`，该类型用于将嵌套在 `Ref` 中的数据类型进行解包。如果 `T` 是 `Ref` 类型，则直接返回 `T`；否则，调用 `UnwrapRefSimple` 进行简单的解包处理。

例如，假设有一个对象 `obj` 包含一个 `Ref` 类型的属性 `count`，我们想要获取 `count` 的值：

```typescript
const obj = reactive({
  count: ref(0)
})

// 获取 count 值
const countValue = obj.count.value
```

在这种情况下，我们必须使用 `.value` 来访问 `Ref` 类型中的实际值。但是，假设 `obj` 不仅包含一个 `Ref` 类型的属性，还嵌套了另一个对象 `subObj`，`subObj` 中也有一个 `Ref` 类型的属性 `subCount`，我们想要获取 `subCount` 的值：

```typescript
const subObj = {
  subCount: ref(0)
}

const obj = reactive({
  count: ref(0),
  subObj
})

// 获取 subCount 值
const subCountValue = obj.subObj.subCount.value
```

在这种情况下，我们必须使用 `.value` 来访问 `subCount` 的值，并且需要连续调用两次 `.value`。为了方便起见，我们可以使用 `UnwrapNestedRefs` 类型来自动解包嵌套在 `Ref` 中的值：

```typescript
const subObj = {
  subCount: ref(0)
}

const obj = reactive({
  count: ref(0),
  subObj
})

// 使用 UnwrapNestedRefs 解包 subCount 值
const subCountValue = (obj.subObj.subCount as UnwrapNestedRefs<typeof obj>).value
```

这样，我们可以使用 `UnwrapNestedRefs` 类型来方便地访问嵌套在 `Ref` 中的值，而无需手动连续调用 `.value`。
 */
 
// only unwrap nested ref
export type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRefSimple<T>



/**
在Vue中，响应式是一个非常重要的概念。reactive函数就是用于将一个对象变成响应式的。

这里实际上是采用了函数重载（overload）的方式，提供了两个版本的reactive函数：

1. 第一个版本定义了一个泛型函数，接收一个类型为T的对象，返回值是解开嵌套引用后的对象类型。
2. 第二个版本定义了一个普通函数，接收一个任意类型的对象参数 target，并调用 makeReactive 方法将其转换成响应式对象。最后返回转换后的结果。

makeReactive 函数会遍历对象属性，将所有属性的 getter 和 setter 重写，使得在访问和修改属性时都可以触发更新函数，从而实现响应式的效果。
 */
 
export function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
export function reactive(target: object) {
  makeReactive(target, false)
  return target
}



/**
在 Vue3 中，`reactive` 函数的实现使用了 Proxy 对象。Proxy 可以拦截对象上的所有属性的访问、赋值、删除等操作，因此可以用来实现对响应式数据的监听。

在 `reactive` 函数中，为了标识一个对象是否是“浅层响应式”的，Vue3 使用了 `ShallowReactiveMarker` 这个唯一的 symbol 值。

具体来说，在某个对象被代理成响应式对象时，如果这个对象本身是一个普通对象（即非数组、非 Map、非 Set 等特殊类型），那么这个对象会被包装成一个 Proxy 对象，并且这个 Proxy 对象上会附加一个 `[[ReactiveFlags]]` 属性，该属性是一个对象，其中 `shallow` 字段被设置为 `true`，表示当前对象是浅层响应式的。

而 `ShallowReactiveMarker` 就是用于给 `[[ReactiveFlags]]` 属性添加 `shallow` 字段的标识符。具体来看 `ShallowReactiveMarker` 的定义：

```typescript
export declare const ShallowReactiveMarker: unique symbol
```

这里使用了 TypeScript 的 `unique symbol` 类型，它表示一个唯一的 symbol 值，并且不允许通过其他方式创建相同的 symbol。因此，我们可以通过判断一个对象的 `[[ReactiveFlags]]` 属性中是否包含 `ShallowReactiveMarker` 来确定该对象是否是浅层响应式的。
 */
 
export declare const ShallowReactiveMarker: unique symbol



/**
`ShallowReactive<T>` 是一个泛型类型，表示对传入的对象 `T` 进行浅响应式处理后得到的类型。具体来说，它是 `T` 类型的子集，包含了 `T` 对象上的所有属性，并且添加了一个可选属性 `[ShallowReactiveMarker]`，该属性的值为 `true`。

这个 `[ShallowReactiveMarker]` 属性并不会实际存在于原始对象中，而是在经过浅响应式处理后被添加进去的一个标识符，用于标记该对象已经进行了浅响应式处理。

通过使用这个 `ShallowReactive` 类型，我们可以将某个对象进行浅响应式处理后得到一个新的类型，并且能够保留原始对象上的所有属性和方法，同时又可以通过检查是否存在 `[ShallowReactiveMarker]` 属性来判断该对象是否已经进行了浅响应式处理。
 */
 
export type ShallowReactive<T> = T & { [ShallowReactiveMarker]?: true }



/**
这段代码是一个工具函数，用于返回一个原始对象的浅层响应式拷贝，仅有根级别的属性是响应式的。它不会自动解包(refs)，即使在根级别也不会。

在使用Vue时，我们经常需要把一些数据转换成响应式的，这样在数据发生改变时，视图能够及时更新。这个过程通常是通过Vue的响应式系统来完成的。但是有时候我们只需要对对象的根级别属性进行响应式处理，而不需要深层次地监听整个对象，这时就可以使用这个函数。它会调用makeReactive函数，将目标对象转换为响应式对象，同时在目标对象上设置一个标志（ReactiveFlags.IS_SHALLOW），表示该对象是一个浅层响应式对象。

需要注意的是，这个函数不会自动解包(refs)，因此如果你有一个ref类型的根级别属性，它也不会被转换成响应式对象。如果想要对整个对象进行深度监听，应该使用Vue提供的reactive函数。
 */
 
/**
 * Return a shallowly-reactive copy of the original object, where only the root
 * level properties are reactive. It also does not auto-unwrap refs (even at the
 * root level).
 */
export function shallowReactive<T extends object>(
  target: T
): ShallowReactive<T> {
  makeReactive(target, true)
  def(target, ReactiveFlags.IS_SHALLOW, true)
  return target
}



/**
这是Vue 2的响应式系统的核心代码之一，它用于将一个普通的对象或数组转换为响应式对象或响应式数组。

该函数接收两个参数：`target`和`shallow`。其中，`target`为需要被观测的对象，`shallow`表示是否进行浅层观测。

在函数内部，首先会判断`target`是否为只读代理对象，如果是，则返回只读版本。否则，会进行以下步骤：

1. 如果`target`是数组，会发出警告，因为Vue 2不支持对数组进行深度观测。

2. 如果`target`已经被观测过，并且新的观测方式与旧的观测方式不同，会发出警告。例如，如果之前使用了`shallowReactive()`观测，但现在想要使用`reactive()`来进行深度观测，则会发出警告。

3. 调用`observe()`方法来进行观测，并返回观测后的对象。同时，也会传入`shallow`和`isServerRendering()`等参数进行配置。

4. 如果观测失败，即`ob`为空，则会根据不同情况分别发出警告。例如，如果`target`为空或者为基础类型，则会提示无法将其变为响应式对象；如果`target`是Map或Set等集合类型，则会提示Vue 2不支持对集合类型进行观测。

总的来说，该函数是Vue 2响应式系统实现的重要一环，它可以帮助我们将一个普通对象或数组变为响应式对象或数组，从而实现数据的双向绑定和自动更新。
 */
 
function makeReactive(target: any, shallow: boolean) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (!isReadonly(target)) {
    if (__DEV__) {
      if (isArray(target)) {
        warn(
          `Avoid using Array as root value for ${
            shallow ? `shallowReactive()` : `reactive()`
          } as it cannot be tracked in watch() or watchEffect(). Use ${
            shallow ? `shallowRef()` : `ref()`
          } instead. This is a Vue-2-only limitation.`
        )
      }
      const existingOb = target && target.__ob__
      if (existingOb && existingOb.shallow !== shallow) {
        warn(
          `Target is already a ${
            existingOb.shallow ? `` : `non-`
          }shallow reactive object, and cannot be converted to ${
            shallow ? `` : `non-`
          }shallow.`
        )
      }
    }
    const ob = observe(
      target,
      shallow,
      isServerRendering() /* ssr mock reactivity */
    )
    if (__DEV__ && !ob) {
      if (target == null || isPrimitive(target)) {
        warn(`value cannot be made reactive: ${String(target)}`)
      }
      if (isCollectionType(target)) {
        warn(
          `Vue 2 does not support reactive collection types such as Map or Set.`
        )
      }
    }
  }
}



/**
这段代码实现了一个函数 `isReactive`，用于判断传入的值是否为响应式对象。

首先，它检查该值是否是只读的，如果是，则将其转换为原始对象并递归调用 `isReactive` 函数进行判断。这里使用了 ReactiveFlags.RAW 属性，它表示未经过代理的原始对象。

如果传入的值不是只读的，那么它会检查该值是否存在 `__ob__` 属性，`__ob__` 是 Vue 内部用于实现响应式的标记属性。

最终返回一个布尔值，表示该值是否为响应式对象。
 */
 
export function isReactive(value: unknown): boolean {
  if (isReadonly(value)) {
    return isReactive((value as Target)[ReactiveFlags.RAW])
  }
  return !!(value && (value as Target).__ob__)
}



/**
这段代码实现了一个函数 isShallow，主要作用是判断传入的 value 是否是浅响应式对象。

在 Vue 中，每个被响应式化的对象都有一个 __v_isShallow 属性，该属性的值为 boolean 类型。如果该属性为 true，则表示该对象是浅响应式对象；如果该属性为 false 或不存在，则表示该对象是深度响应式对象。

这里的代码就是判断传入的 value 是否存在 __v_isShallow 属性并且其值为 true，如果是则返回 true，否则返回 false，从而判断该对象是否为浅响应式对象。

需要注意的是，这里使用了类型断言 (value as Target)，将 value 强制转换为 Target 类型，避免 TypeScript 报错。
 */
 
export function isShallow(value: unknown): boolean {
  return !!(value && (value as Target).__v_isShallow)
}



/**
这段代码是用来判断一个对象是否是只读的（readonly）。

在Vue的响应式系统中，可以通过`reactive()`函数将一个普通的JavaScript对象转换为响应式对象。但是有时候我们需要将某个响应式对象标记成只读，这时就可以通过调用`readonly()`函数来实现。

当调用`readonly()`函数后，该函数会返回一个新的只读的响应式对象。同时，它还会在该对象上添加一个`__v_isReadonly`属性，用来标记该对象是只读的。

那么，`isReadonly()`函数就是用来判断一个对象是否是只读的。它会首先判断传入的参数是否存在，并且是否具有`__v_isReadonly`属性。如果存在该属性，则说明该对象是只读的，返回true；否则返回false。
 */
 
export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target).__v_isReadonly)
}



/**
在Vue 3中，响应式系统是通过Proxy来实现的。在这个文件中，我们可以看到isProxy函数的定义，它是用来判断一个对象是否被代理了。

isProxy函数调用了两个其他的函数：isReactive和isReadonly。这两个函数分别用来判断一个对象是否是响应式的或只读的。如果传入的value参数是一个响应式的或只读的对象，那么isProxy函数就会返回true。

使用这个函数可以方便地判断一个对象是否被代理了，从而进行一些相关的操作。
 */
 
export function isProxy(value: unknown): boolean {
  return isReactive(value) || isReadonly(value)
}



/**
这段代码的作用是将一个已经被"响应式化"（即为对象添加了getter和setter函数，使其能够被Vue所观察）的对象还原成原始的数据对象。

具体来说，这个函数接受一个参数`observed`，它是被响应式化后的对象。在这个函数中，首先通过`observed as Target`将`observed`转换成一个`Target`类型的对象，然后通过`[ReactiveFlags.RAW]`获取到该对象上标记为`ReactiveFlags.RAW`的原始数据对象`raw`。

如果`raw`存在，说明`observed`是一个已经被响应式化的对象，那么就递归调用`toRaw(raw)`将`raw`还原成原始数据对象并返回；否则，说明`observed`本身就是原始的数据对象，直接返回即可。
 */
 
export function toRaw<T>(observed: T): T {
  const raw = observed && (observed as Target)[ReactiveFlags.RAW]
  return raw ? toRaw(raw) : observed
}



/**
这个函数的作用是将一个对象标记为“原始”，即该对象不会被响应式系统进行代理转换，直接使用原始值。在Vue中，当我们需要避免某些数据被观察时，可以使用`markRaw`函数。

这个函数接收一个泛型参数`T`，它必须是一个对象类型。函数返回的类型是`T & { [RawSymbol]?: true }`，即返回的对象是泛型参数`T`和一个名为`[RawSymbol]`的可选属性组成的类型，并且该属性的值为`true`。

在函数内部，使用了`def`函数给传入的对象添加了一个名为`ReactiveFlags.SKIP`的标识，并把值设置为`true`。`ReactiveFlags.SKIP`是在`./dist/src/core/reactivity/reactiveConstants.ts`中定义的常量，其值为`"__v_skip"`。这个标识告诉响应式系统不要对这个对象进行代理转换，直接使用原始值。

最后，函数返回传入的对象，该对象已经被标记为“原始”。
 */
 
export function markRaw<T extends object>(
  value: T
): T & { [RawSymbol]?: true } {
  def(value, ReactiveFlags.SKIP, true)
  return value
}



/**
这个函数的主要功能是判断一个值是否为集合类型，返回一个布尔值。

函数内部首先调用了toRawType函数来获取传入值的类型。通过判断类型是不是Map、WeakMap、Set、WeakSet中的一种，来确定其是否为集合类型。

toRawType函数也定义在./dist/src/v3/reactivity/reactive.ts文件中，它的作用是获取变量的原始类型名称，例如Object、Array、Map等。

这个函数被标记为“@internal”，说明它是Vue框架的内部使用，不建议在外部使用它。
 */
 
/**
 * @internal
 */
export function isCollectionType(value: unknown): boolean {
  const type = toRawType(value)
  return (
    type === 'Map' || type === 'WeakMap' || type === 'Set' || type === 'WeakSet'
  )
}


