
/**
`readonly.ts` 文件是 Vue3 中的响应式系统中的一个重要文件，用于创建只读的响应式对象。具体作用如下：

1. 定义了 `readonly` 函数：该函数接受一个普通对象作为参数，并返回一个只读的响应式代理对象。

2. 创建了 `shallowReadonly` 函数：该函数与 `readonly` 函数类似，但不会对对象的嵌套属性进行深度代理，而只是对根层属性进行代理。

3. 在 `reactiveEffect.ts` 中被引入：该文件定义了 `effect` 函数，用于创建副作用函数和追踪其依赖项。 `readonly` 和 `shallowReadonly` 代理对象也可以传递给 `effect` 函数来建立响应式关系。

4. 在 `computed.ts` 中被引入：该文件定义了计算属性相关的函数，其中的 `computed` 函数并不强制求值，而是在访问时惰性求值。 `computed` 函数还接受一个 `get` 函数，在依赖项发生变化时触发重新计算。如果使用 `readonly` 或 `shallowReadonly` 对象作为依赖项，则可以避免无谓的重新计算。

总的来说，`readonly.ts` 文件与响应式系统的其他部分紧密相连，负责创建只读的响应式代理对象，并在副作用函数和计算属性中建立响应式关系。
 */
 



/**
`readonly.ts` 文件是 Vue3 中响应式系统中的一个模块，主要用来实现只读的响应式数据。在这个模块中，以下几个变量和函数做了如下定义：

- `def`: 一个函数，可以给对象添加不可枚举的属性，这个函数在 `core/util.js` 中定义。
- `warn`: 一个函数，用于输出警告信息，该函数在 `core/util.js` 中定义
- `isPlainObject`: 一个函数，用于判断是否是普通的对象，该函数在 `shared/util.js` 中定义
- `isArray`: 一个函数，用于判断是否是数组，该函数在 `shared/util.js` 中定义
- `isCollectionType`: 一个函数，用于判断是否是集合类型（即数组或者普通对象），该函数在 `reactive.ts` 中定义
- `isReadonly`: 一个函数，用于判断某个对象是否是只读的，该函数在 `reactive.ts` 中定义
- `isShallow`: 一个函数，用于判断是否是浅层的，该函数在 `reactive.ts` 中定义
- `ReactiveFlags`: 一个常量对象，包括响应式相关的标志位，该对象在 `reactive.ts` 中定义
- `UnwrapNestedRefs`: 一个类型别名，用于将嵌套的 ref 对象解包，该类型别名在 `ref.ts` 中定义
- `isRef`: 一个函数，用于判断是否是 ref 对象，该函数在 `ref.ts` 中定义
- `Ref`: 一个类，用于实现 ref 对象，该类在 `ref.ts` 中定义
- `RefFlag`: 一个常量对象，包括 ref 相关的标志位，该对象在 `ref.ts` 中定义

以上这些变量和函数都是响应式系统中的基础工具和类型定义，用于支持只读响应式数据的实现。其中比较重要的是 `def` 函数和 `ReactiveFlags` 常量对象，`def` 函数可以给对象添加不可枚举的属性，在只读响应式数据中，我们需要通过在对象中添加一个特殊的属性来标记该对象为只读，而 `ReactiveFlags` 常量对象中包含了所有响应式相关的标志位，包括标记只读对象的标志位。
 */
 
import { def, warn, isPlainObject, isArray } from 'core/util'
import {
  isCollectionType,
  isReadonly,
  isShallow,
  ReactiveFlags,
  UnwrapNestedRefs
} from './reactive'
import { isRef, Ref, RefFlag } from './ref'



/**
这段代码定义了一个类型DeepReadonly<T>，它可以将一个对象及其嵌套属性转化为只读的，即不能被修改。

首先定义了两个类型别名：Primitive和Builtin。Primitive表示可以直接使用的基本数据类型，包括string、number、boolean、bigint、symbol、undefined和null。而Builtin则表示除Primitive以外的内建类型，包括Function、Date、Error、RegExp等。

之后使用条件类型和泛型来定义DeepReadonly<T>。如果T是Builtin中的类型，则返回T；否则会判断T是否是Map、ReadonlyMap、WeakMap、Set、ReadonlySet、WeakSet、Promise或者Ref中的类型，然后做相应的转换。

- 如果是Map类型，则将键和值都转化为只读类型。
- 如果是Set类型，则将元素转化为只读类型。
- 如果是Promise类型，则将Promise中的泛型参数转化为只读类型。
- 如果是Ref类型，则将其包装在一个只读类型的Ref中。
- 如果是空对象，则将其所有属性转化为只读类型。
- 否则，将整个对象转化为只读类型。

这样就可以确保DeepReadonly<T>返回的对象及其嵌套的属性都是只读的，防止被修改。
 */
 
type Primitive = string | number | boolean | bigint | symbol | undefined | null
type Builtin = Primitive | Function | Date | Error | RegExp
export type DeepReadonly<T> = T extends Builtin
  ? T
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends WeakMap<infer K, infer V>
  ? WeakMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends Set<infer U>
  ? ReadonlySet<DeepReadonly<U>>
  : T extends ReadonlySet<infer U>
  ? ReadonlySet<DeepReadonly<U>>
  : T extends WeakSet<infer U>
  ? WeakSet<DeepReadonly<U>>
  : T extends Promise<infer U>
  ? Promise<DeepReadonly<U>>
  : T extends Ref<infer U>
  ? Readonly<Ref<DeepReadonly<U>>>
  : T extends {}
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : Readonly<T>



/**
在Vue中，`readonly`是一个函数，它会返回一个只读的代理对象，该对象会阻止对原始对象进行修改。例如：

```
const obj = { foo: 'bar' }
const readonlyObj = readonly(obj)
// 现在你不能通过readonlyObj.foo = 'baz' 修改 readonlyObj 了
```

但是有些情况下，我们可能需要取消只读代理对象并访问原始对象，这时就可以使用`rawToReadonlyFlag`和`rawToShallowReadonlyFlag`。

当我们使用`toRaw`函数将只读代理对象转换为原始对象时，会给原始对象添加一个特殊的标记属性`__v_isReactive`或`__v_isReadonly`。而我们如果想要将原始对象重新转换为只读代理对象时，就需要用到`rawToReadonlyFlag`和`rawToShallowReadonlyFlag`。

例如：

```
const obj = { foo: 'bar' }

const readonlyObj = readonly(obj)
// 此时 readonlyObj.__v_rawToReadonly 为 true

const rawObj = toRaw(readonlyObj)
// 此时 rawObj.__v_isReadonly 为 true

const newReadonlyObj = readonly(rawObj)
// 此时 newReadonlyObj 和 readonlyObj 是相同的只读代理对象
``` 

`rawToReadonlyFlag`和`rawToShallowReadonlyFlag`都是用来标记一个原始对象是否已经被转换成只读代理对象，区别是前者是深度只读代理，后者是浅层只读代理。
 */
 
const rawToReadonlyFlag = `__v_rawToReadonly`
const rawToShallowReadonlyFlag = `__v_rawToShallowReadonly`



/**
这段代码的作用是将一个对象转化为只读的对象，即不能进行修改操作，类似于const定义的常量。

参数`target`是需要转化为只读对象的目标对象。这个函数返回的是经过处理的只读对象。

这个函数调用了`createReadonly`函数，并传入了两个参数：目标对象`target`和布尔值`false`。其中，`target`表示需要转化为只读对象的目标对象，`false`表示是否深度处理目标对象中的所有嵌套属性。如果为`true`，则会对目标对象中的所有嵌套属性都进行只读处理。

最终返回的是一个 `DeepReadonly`类型的对象，这是一个泛型类型，它接受一个对象类型，并返回这个对象类型的只读版本。在这个函数中，我们使用了 `UnwrapNestedRefs<T>`方法去除了 T 的嵌套响应式属性，以确保我们只读取到其“原始”值。

综上，这个函数的作用就是将传入的对象转化为只读对象，并且如果该对象中存在嵌套属性，则也会被递归地转化为只读对象。
 */
 
export function readonly<T extends object>(
  target: T
): DeepReadonly<UnwrapNestedRefs<T>> {
  return createReadonly(target, false)
}



/**
这段代码是用来创建只读的响应式对象。其主要功能是检查传入的目标对象是否为普通对象，如果不是，则给出相应的警告信息，并返回原对象。

isPlainObject是一个用来判断当前对象是否为纯粹的对象（即没有经过Object.create等继承方式得到的对象）的函数，如果不是，则会执行后面的代码块，在开发环境下输出相应的警告信息，提示用户只有普通对象才能做为只读的响应式对象被使用，同时返回原对象。如果目标对象是纯粹的对象，则根据shallow参数来决定是否深度遍历目标对象中的属性并将其转化为响应式对象，最后返回只读的响应式对象。

总之，这段代码的作用是用来创建只读的响应式对象，并且在创建该对象时进行了类型检查和错误处理。
 */
 
function createReadonly(target: any, shallow: boolean) {
  if (!isPlainObject(target)) {
    if (__DEV__) {
      if (isArray(target)) {
        warn(`Vue 2 does not support readonly arrays.`)
      } else if (isCollectionType(target)) {
        warn(
          `Vue 2 does not support readonly collection types such as Map or Set.`
        )
      } else {
        warn(`value cannot be made readonly: ${typeof target}`)
      }
    }
    return target as any
  }



/**
在Vue的响应式系统中，我们通常会使用`reactive()`函数来将一个对象转换为响应式对象。而有时候，我们希望某个对象只能被读取，而不能被修改，此时就可以使用`readonly()`函数。

在`readonly.ts`文件中，这里的代码是用来判断目标对象是否已经被转换为只读对象（即是否已经调用过`readonly()`函数）。如果目标对象已经是只读对象，那么直接返回该对象即可，不需要再次进行转换。这个判断是通过`isReadonly()`函数实现的。

需要注意的是，在类型声明中，`target as any`的作用是将`target`强制转换为`any`类型。原因是，虽然`isReadonly()`函数已经判断了`target`是只读对象，但是由于TypeScript的类型推断限制，编译器无法自动识别出`target`的类型，从而导致类型错误。因此，在这里需要手动将`target`转换成`any`类型，以避免编译错误。
 */
 
  // already a readonly object
  if (isReadonly(target)) {
    return target as any
  }



/**
在这段代码中，Vue使用了一个缓存机制来提高性能。这个机制的作用是：如果一个对象已经被转换成只读代理了（即已经具备只读特性），那么不需要再次将其转换成只读代理，而是直接返回原有的只读代理。

这个机制通过检查目标对象是否已经具备只读代理的标记来实现。如果已经具备只读代理，就直接返回已有的代理；否则，就创建一个新的只读代理。为了避免混淆，这里还根据传入的参数`shallow`选择了不同的标记。

这种缓存机制可以有效地减少重复工作和内存占用。在大型应用程序中，这种优化是非常必要的。
 */
 
  // already has a readonly proxy
  const existingFlag = shallow ? rawToShallowReadonlyFlag : rawToReadonlyFlag
  const existingProxy = target[existingFlag]
  if (existingProxy) {
    return existingProxy
  }



/**
在Vue中，`reactivity/readonly.ts`是一个用于实现只读响应式数据的模块。其中，第一行代码创建了一个新对象`proxy`，它的原型指向`target`对象的原型。这里使用了`Object.create`方法来创建一个空的对象，并将它的原型链指向和`target`对象一样。

接下来的一行代码使用`def`方法，把`proxy`对象挂载到`target`对象上，并赋予`existingFlag`标志。`def`方法实际上是`Object.defineProperty`的封装，它会在`target`对象上定义一个名为`existingFlag`的属性，并且将其值设置为`proxy`对象。这样一来，当我们访问`target.existingFlag`时，实际上得到的是`proxy`对象。

这个过程实际上是对`target`对象进行代理，通过引入一个新的只读代理对象，来保证源对象的只读性。在Vue中，这种代理技术被广泛应用于响应式数据的实现中。
 */
 
  const proxy = Object.create(Object.getPrototypeOf(target))
  def(target, existingFlag, proxy)



/**
在Vue中，reactivity（响应式）是非常重要的概念。而`readonly.ts`文件中的代码主要是为了创建一个只读的响应式数据对象。

下面是对于这两行代码的解释：

1. `def(proxy, ReactiveFlags.IS_READONLY, true)`

    这一行代码的作用是将`proxy`对象标记为只读。在Vue内部，通过`Object.defineProperty`定义的属性都是可读写的，所以需要通过其他方式来实现只读的效果。Vue采用了一种比较巧妙的方法，在`proxy`对象上使用`def`函数来定义一个名为`ReactiveFlags.IS_READONLY`的常量属性，并设置其值为`true`。这样，在后续对`proxy`对象进行访问和修改时，就可以根据这个常量属性来判断是否允许进行修改。

2. `def(proxy, ReactiveFlags.RAW, target)`

    这一行代码的作用是将原始的数据对象`target`保存到`proxy`对象的一个常量属性`ReactiveFlags.RAW`中。这个常量属性可以理解为一个“私有属性”，外部无法直接访问到，因此可以保证数据的封装性和安全性。在后续读取`proxy`对象的数据时，可以从这个常量属性中获取数据源。
 */
 
  def(proxy, ReactiveFlags.IS_READONLY, true)
  def(proxy, ReactiveFlags.RAW, target)



/**
这段代码主要是在创建只读响应式代理对象时，对目标对象进行一些处理。

首先，判断目标对象是否为一个Ref对象，如果是，就使用`def`方法给代理对象设置一个标记`RefFlag`，这个标记表明代理对象是一个Ref类型的值。`def`方法是Vue源码中用来添加或修改对象属性的方法。

其次，如果是浅层代理或者目标对象本身就是一个浅层响应式对象，就给代理对象设置一个标记`ReactiveFlags.IS_SHALLOW`，表示代理对象是浅层响应式对象。这个标记在后面的响应式数据劫持过程中会有用到。

总体来说，这段代码主要是对目标对象和代理对象进行一些标记的设置，以便后续的数据劫持过程可以更好地处理它们。
 */
 
  if (isRef(target)) {
    def(proxy, RefFlag, true)
  }
  if (shallow || isShallow(target)) {
    def(proxy, ReactiveFlags.IS_SHALLOW, true)
  }



/**
`readonly.ts` 是 Vue3 中响应式系统中的一个模块，它提供了一个 `readonly` 函数，该函数可以将传入的对象转换为只读对象。在这个模块中，我们可以看到这个函数的实现方式。

首先通过 `Object.keys(target)` 获取目标对象 `target` 所有的属性名，并以数组形式返回。接下来通过 `for` 循环遍历这个属性名数组，对每个属性调用 `defineReadonlyProperty` 方法进行转换。

`defineReadonlyProperty` 方法是 `readonly.ts` 模块中另一个定义的方法。它用于将 target 对象的属性转换为只读属性，并将这些属性绑定在代理对象 `proxy` 上。其中第三个参数 `keys[i]` 表示要转换的属性名，第四个参数 `shallow` 表示是否需要浅层遍历子属性。

总体来说，这段代码的作用是将传入的对象转换为只读对象，并返回一个新的代理对象。当使用者尝试修改这个只读对象时，将会报错，从而保证对象不被修改。
 */
 
  const keys = Object.keys(target)
  for (let i = 0; i < keys.length; i++) {
    defineReadonlyProperty(proxy, target, keys[i], shallow)
  }



/**
在Vue 3的响应式系统中，利用了ES6的Proxy来监听对象的变化。其中readonly.ts文件是用来实现只读代理的。

在函数`function readonly<T extends object>(target: T): DeepReadonly<UnwrapRef<T>>`中，我们传入一个对象target，表示要创建只读代理的对象。这个函数的返回值是DeepReadonly<UnwrapRef<T>>。

通过函数中的代码可以看出，在函数内部，我们使用了Proxy来创建了一个只读代理，代码如下：

```
const handler: ProxyHandler<any> = {
  get(target: any, key: string | symbol, receiver: any) {
    const result = Reflect.get(target, key, receiver)
    track(target, TrackOpTypes.GET, key)
    return isObject(result) ? readonly(result) : result
  },
  set(target: any, key: string | symbol, value: any, receiver: any): boolean {
    console.warn(`Set operation on key "${key as string}" failed: target is readonly.`, target)
    return true
  },
  deleteProperty(target: any, key: string | symbol): boolean {
    console.warn(`Delete operation on key "${key as string}" failed: target is readonly.`, target)
    return true
  }
}
const proxy = new Proxy(target, handler)
```

handler是一个ProxyHandler类型的对象，它包含了get、set和deleteProperty三个属性。其中，我们重写了get方法，当获取到target对象的某个属性时，会调用get方法。在get方法中，我们先执行原本目标对象上的get操作，并将其结果保存在result中。然后，我们调用了track函数，这个函数会用来追踪对象的变化。最后，如果result是一个对象类型，我们会递归调用readonly函数，将其变为只读代理。

而set和deleteProperty方法都被重写成了直接返回true，并且给出了警告信息。这是因为我们要创建的是一个只读代理，不能被用户修改。

最后一行代码`return proxy as any`表示函数的返回值是proxy对象，但是由于ts的类型检查，需要通过as any语法来强制转换类型。
 */
 
  return proxy as any
}



/**
这段代码是Vue3中实现响应式数据的readonly(只读)函数所调用的一个内部函数。它的作用是为目标对象的某个属性定义一个只读的代理对象，使得通过代理对象访问该属性时不能进行修改。

该函数接收四个参数：代理对象(proxy)、目标对象(target)、目标属性(key)和是否浅层代理(shallow)。其中，代理对象是指readonly函数返回的只读代理对象，目标对象是指需要被代理的原始对象，目标属性则是指需要被定义为只读属性的属性名，而shallow则表示是否为浅层代理（默认为false）。

在函数内部，通过Object.defineProperty方法为代理对象(proxy)的目标属性(key)定义了一个getter方法，当代理对象的该属性被访问时会执行该getter方法。该方法首先获取目标对象(target)的该属性值(val)，然后根据是否浅层代理(shallow)来判断是否需要递归地创建只读代理对象，最后返回该属性值val或者递归创建出来的只读代理对象。

另外，由于代理对象是只读的，因此也就不能设置该属性的值，所以在setter方法中只是给出了一个警告信息，在开发环境下会打印该警告信息，提示开发人员该属性不可修改。
 */
 
function defineReadonlyProperty(
  proxy: any,
  target: any,
  key: string,
  shallow: boolean
) {
  Object.defineProperty(proxy, key, {
    enumerable: true,
    configurable: true,
    get() {
      const val = target[key]
      return shallow || !isPlainObject(val) ? val : readonly(val)
    },
    set() {
      __DEV__ &&
        warn(`Set operation on key "${key}" failed: target is readonly.`)
    }
  })
}



/**
这段代码中，定义了一个函数`shallowReadonly`，它的作用是返回一个原始对象的响应式拷贝，其中仅根级别属性为只读属性，不会解包ref也不会递归转换返回的属性。这个函数在创建带有状态组件的props代理对象时使用。

整个函数的实现依赖于另一个函数`createReadonly`，它接收两个参数：要被拷贝的目标对象和一个布尔值用来指示是否还需要对拷贝后的对象进行浅层响应式处理。在函数内部，我们通过使用ES6的Proxy API对目标对象进行了拦截，并将其设置为只能读取属性。最后，我们返回了一个只读对象，以确保原始对象不会被意外修改。

如果你想深入了解Vue的响应式系统源码，建议你先学习JavaScript中的Proxy API以及Vue.js的响应式原理（例如，Vue如何追踪数据变化、如何触发视图更新等），然后再尝试阅读Vue的源代码。
 */
 
/**
 * Returns a reactive-copy of the original object, where only the root level
 * properties are readonly, and does NOT unwrap refs nor recursively convert
 * returned properties.
 * This is used for creating the props proxy object for stateful components.
 */
export function shallowReadonly<T extends object>(target: T): Readonly<T> {
  return createReadonly(target, true)
}


