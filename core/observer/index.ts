
/**
./dist/src/core/observer/index.ts 文件是Vue的响应式系统的核心部分，它定义了Observer类、Dep类和Watcher类。这三个类共同构成了Vue的响应式机制。

Observer类用来监听数据变化，当数据发生变化时，它会通知所有依赖该数据的Watcher对象。Dep类用来管理数据所依赖的Watcher对象，当数据变化时，Dep会通知所有依赖它的Watcher对象去更新视图。

Watcher类则是监听者，它会在数据变化时触发回调函数，从而更新视图。Watcher对象中包含一个指向Dep对象的引用，Watcher每次被实例化时都会将自己添加到Dep中去，以此建立起数据与Watcher之间的关联。

整个Vue的src中，./dist/src/core/observer/index.ts 文件可以说是非常重要的。因为Vue的响应式机制是Vue框架最为核心的机制，也是Vue框架的灵魂。其他的文件如./dist/src/core/vdom/index.ts、./dist/src/core/instance/index.ts、./dist/src/core/global-api/index.ts等，都需要依赖于./dist/src/core/observer/index.ts 文件中所定义的Observer类、Dep类和Watcher类。
 */
 



/**
这段代码主要是引入了一些Vue的核心依赖，包括Dep、VNode、arrayMethods、各种工具函数等。

具体解释如下：

1. `import Dep from './dep'`：这里引入了一个名为Dep的类，该类用于实现Vue中数据响应式系统的核心功能。在观察者模式中，Dep就是一个被观察对象，当其属性发生变化时，会通知所有订阅它的观察者进行更新。

2. `import VNode from '../vdom/vnode'`：这里引入了Vue中虚拟DOM节点的定义。在Vue中，使用虚拟DOM可以显著提高渲染性能，因为不必每次都重新渲染整个页面。

3. `import { arrayMethods } from './array'`：这里引入了Vue中数组数据劫持的核心方法。由于JavaScript中的数组本质上是一种特殊的对象，因此不能像普通对象那样直接进行数据劫持。为了解决这个问题，Vue通过重写数组原型上的一些方法来实现数组数据劫持。

4. `import {...}`：这里引入了Vue中一些常用的工具函数，例如`def`、`warn`、`hasOwn`等等。这些工具函数都是为了方便开发者编写代码而提供的，可以帮助我们更加高效地操作对象、数组、字符串等数据类型。

5. `import { isReadonly, isRef, TrackOpTypes, TriggerOpTypes } from '../../v3'`：这里引入了Vue3中一些新的概念。例如，`isReadonly`和`isRef`用于判断一个对象是否为只读或引用类型；`TrackOpTypes`和`TriggerOpTypes`则用于跟踪依赖项和触发更新。这些概念在Vue3中都被重视，并且得到了更好的支持。

这些核心依赖是Vue能够实现数据响应式、虚拟DOM、数据劫持等功能的基础，对理解Vue源码是非常重要的。
 */
 
import Dep from './dep'
import VNode from '../vdom/vnode'
import { arrayMethods } from './array'
import {
  def,
  warn,
  hasOwn,
  isArray,
  hasProto,
  isObject,
  isPlainObject,
  isPrimitive,
  isUndef,
  isValidArrayIndex,
  isServerRendering,
  hasChanged,
  noop
} from '../util/index'
import { isReadonly, isRef, TrackOpTypes, TriggerOpTypes } from '../../v3'



/**
在Vue的响应式系统中，为了能够监听数组的变化（比如添加、删除元素等），Vue对原生的数组方法进行了重写。而`arrayKeys`则是用来存储重写后的数组方法名的一个数组。

在JavaScript中，可以使用`Object.getOwnPropertyNames()`方法获取一个对象自身所有属性的名称，并以字符串数组的形式返回。因此，在代码中，`Object.getOwnPropertyNames(arrayMethods)`返回的就是一个包含重写后的数组方法名的字符串数组，该数组会被赋值给`arrayKeys`常量。这样在后续的代码中就可以通过`arrayKeys`数组来遍历重写后的数组方法了。
 */
 
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)



/**
在Vue的观察者模块中，我们会定义一些响应式的数据对象，在这些数据对象上添加属性或者修改属性时，Vue会监听这些变化，并及时更新视图。当我们创建一个新的响应式数据对象时，我们需要提供它的初始值，但是有些情况下我们不想提供初始值，那么这个时候就可以使用一个初始值为 {} 的常量 NO_INITIAL_VALUE 来代替。

在 Vue 的源码实现中，NO_INITIAL_VALUE 常量主要用于 createReactiveObject 方法中，作为参数的默认值，例如：

```ts
export function createReactiveObject(
  target: unknown,
  options: ReactiveOptions
) {
  // 如果没有初始值，则将 NO_INITIAL_VALUE 作为默认值
  const proxyMap = new WeakMap()
  const isReadonly = !!options.readonly
  const reactiveFlag = isReadonly ? READONLY : REACTIVE

  // ...
}
```

如果我们在调用 createReactiveObject 方法时没有传入初始值参数，那么这里就会使用 NO_INITIAL_VALUE 作为默认值。
 */
 
const NO_INIITIAL_VALUE = {}



/**
在Vue中，响应式系统是指当数据发生变化时自动更新视图的机制。这个机制是基于Vue的观察者模式实现的。在这种模式下，Vue会监听对象的变化，并在数据发生变化时通知所有依赖该数据的组件进行更新。

在Vue的响应式系统中，shouldObserve变量用来控制是否开启观测模式。当shouldObserve为true时，Vue将对数据进行观测并通知组件进行更新。而当shouldObserve为false时，Vue不会对数据进行观测，也不会通知组件进行更新。

在某些场景下，我们可能希望在组件的更新计算过程中禁用观测功能，例如当我们手动修改一个数据时，我们不希望该数据被观测到并触发视图更新。在这种情况下，我们可以将shouldObserve设置为false，从而禁用观测功能。

需要注意的是，在大部分情况下，我们不需要手动操作shouldObserve变量，因为Vue已经做好了默认的观测和更新机制，我们只需要按照Vue的规范编写代码即可。
 */
 
/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
export let shouldObserve: boolean = true



/**
`toggleObserving` 函数是用于控制是否对属性进行观察的开关。在 Vue 中，通过 `Object.defineProperty()` 方法来实现数据响应式，当对象的某个属性被访问或设置时，会自动调用一些方法来通知视图进行更新。

然而，并不是所有的属性都需要进行观察，如果属性只是一些临时变量或者计算属性等，对其进行观察可能会增加无谓的性能消耗。

所以，Vue 设计了一个开关来控制是否对属性进行观察。在 Vue 的源码中，这个开关的变量名为 `shouldObserve`，默认值为 `true`。

`toggleObserving` 函数就是用来修改这个开关的值的。当传入的参数为 `false` 时，就表示关闭对属性的观察。
 */
 
export function toggleObserving(value: boolean) {
  shouldObserve = value
}



/**
在Vue.js中，Dep是一个订阅者列表，用于收集依赖项和通知它们。当响应式对象的属性被读取时，它们会在getter中添加到该属性的依赖项列表中，同时在setter中通知每个依赖项。

在上面这行代码中，mockDep是一个模拟的Dep对象，它没有任何实际的功能，只是提供了一些虚假的方法。这个对象主要用于在服务器端渲染期间，模拟客户端环境下的Dep对象，因为服务器端渲染不需要真正的Dep对象来管理依赖关系，而是在服务器端直接将所有数据序列化后发送给客户端，所以这里只需要一个空的、不做任何事情的对象就可以了。
 */
 
// ssr mock dep
const mockDep = {
  notify: noop,
  depend: noop,
  addSub: noop,
  removeSub: noop
} as Dep



/**
上述注释解释了Observer类的作用。Observer类是被附加到每个被观察对象上的。一旦被附加，这个Observer类会将目标对象的属性键转换为getter/setter，以便收集依赖项和派发更新。

在Vue中，数据响应式原理是通过Observer类来实现的。Observer类会递归地遍历所有的属性，并将它们转换成getter/setter，这样当属性值改变时就能够自动触发响应式更新。同时，Observer类还会创建一个Dep（依赖）实例，用于管理所有的Watcher（观察者）实例，以便在数据发生变化时通知它们进行更新。

这里还有一个vmCount属性，表示有多少个Vue实例使用这个对象作为根数据。这个属性主要是用于优化性能，在组件销毁时可以判断是否需要继续监听该对象的更新事件。
 */
 
/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
export class Observer {
  dep: Dep
  vmCount: number // number of vms that have this object as root $data



/**
这段代码是Vue的响应式系统的核心实现之一，它定义了一个Observer对象来监听数据的变化。

在构造函数中，Observer对象会接收三个参数：value、shallow、mock。其中value表示要监听的目标对象，shallow表示是否只监听对象自身属性的变化而不监听其子属性的变化，mock表示是否使用Mock Dependency，这是用于测试的一个辅助依赖对象。默认情况下，shallow和mock都是false。

接着，在构造函数中，Observer对象会创建一个Dep对象（如果mock为true，则使用mockDep对象）。这个Dep对象用于存储所有观察者（Watcher）实例，当被监听的属性发生变化时，Dep对象会通知所有观察者进行更新操作。

然后，Observer对象会通过调用def方法，把自身挂载到value对象的__ob__属性上。这样，当value对象被访问时，就可以找到对应的Observer对象，并且能够及时地收集到所有的依赖关系。

接下来，Observer对象会判断value对象的类型，如果是数组，就会执行以下操作：

1. 如果mock为false，将value对象的原型指向arrayMethods对象，该对象包含了能够拦截数组方法的一组方法。
2. 如果mock为true或者hasProto为false，就需要遍历arrayKeys数组，将其上的所有方法都转换成getter/setter。
3. 如果shallow为false，就需要递归遍历数组中的每个元素，并对其进行observe。

如果value对象不是数组，就需要遍历value对象的所有属性，并使用defineReactive方法将其转换成getter/setter。其中，NO_INITIAL_VALUE表示没有初始值，undefined表示当前访问路径为空，shallow和mock参数同样表示是否进行深度监听。

总之，这段代码负责在创建Observer对象时，将目标对象上的所有属性转换为响应式的 getter/setter，并且能够及时地收集到依赖关系。这是Vue实现数据双向绑定的核心之一。
 */
 
  constructor(public value: any, public shallow = false, public mock = false) {
    // this.value = value
    this.dep = mock ? mockDep : new Dep()
    this.vmCount = 0
    def(value, '__ob__', this)
    if (isArray(value)) {
      if (!mock) {
        if (hasProto) {
          /* eslint-disable no-proto */
          ;(value as any).__proto__ = arrayMethods
          /* eslint-enable no-proto */
        } else {
          for (let i = 0, l = arrayKeys.length; i < l; i++) {
            const key = arrayKeys[i]
            def(value, key, arrayMethods[key])
          }
        }
      }
      if (!shallow) {
        this.observeArray(value)
      }
    } else {
      /**
       * Walk through all properties and convert them into
       * getter/setters. This method should only be called when
       * value type is Object.
       */
      const keys = Object.keys(value)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        defineReactive(value, key, NO_INIITIAL_VALUE, undefined, shallow, mock)
      }
    }
  }



/**
这段代码的作用是观测一个数组中的所有元素，即对数组进行响应式化。在 Vue 中，数组是通过拦截数组方法来实现响应式的。当我们修改数组时，Vue 会重新渲染页面。

在这段代码中，我们可以看到传入的参数 value 是一个数组。接下来我们使用 for 循环遍历数组，并对每个元素进行 observe 操作。observe 函数是用来观测数据变化并更新视图的。

需要注意的是，observeArray 函数第三个参数 this.mock 是用于指定是否为 mock 数据（即模拟数据）。如果是 mock 数据，那么不会将其设置为响应式的。这主要是为了防止 mock 数据影响到真实数据的响应式处理。

总的来说，这段代码的作用是将数组中的每个元素都转换成响应式的数据，并添加相应的监视器，以便能够对任意数组操作进行响应。
 */
 
  /**
   * Observe a list of Array items.
   */
  observeArray(value: any[]) {
    for (let i = 0, l = value.length; i < l; i++) {
      observe(value[i], false, this.mock)
    }
  }
}



/**
在Vue的源码中，./dist/src/core/observer/index.ts是负责实现Vue属性监听机制的文件。在这个文件中，有一段注释为“helpers”，它指的是这个文件中定义的一些辅助函数，可以帮助我们更好地理解属性监听机制的实现原理。以下是这些辅助函数的简要解释：

1. def(obj: Object, key: string, val: any, enumerable?: boolean)

这个函数用于在一个对象上定义一个新属性或修改已有属性。它的作用类似于Object.defineProperty()，但它的功能更加强大。如果对象不可扩展，def会直接返回；如果对象已经存在该属性，则直接返回；如果属性是访问器属性，则将其setter和getter保存到obj[key]的描述符中；否则，将其值保存到obj[key]中。

2. parsePath(path: string)

这个函数用于将一个字符串路径转换成数组路径，例如"a.b.c"转换成["a", "b", "c"]。它内部使用了正则表达式来分割路径，同时也处理了一些特殊字符的转义问题。

3. hasProto()

这个函数用于判断当前浏览器是否支持__proto__属性。如果支持，则返回true；否则，返回false。

4. isObject(obj: any)

这个函数用于判断一个变量是否是一个普通对象。如果是，则返回true；否则，返回false。它通过判断变量类型以及是否有原型链来进行判断。

5. hasOwn(obj: Object, key: string)

这个函数用于判断一个对象是否具有某个自身属性。如果是，则返回true；否则，返回false。它通过in运算符来进行判断。

6. isBuiltInTag(tag: string)

这个函数用于判断一个标签名是否为内置的HTML标签或SVG标签。如果是，则返回true；否则，返回false。它通过创建一个div元素，并尝试将该标签名作为div的innerHTML，然后判断是否被浏览器解析成了一个元素节点来进行判断。

7. isReservedAttribute(attr: string)

这个函数用于判断一个属性名是否为保留属性。如果是，则返回true；否则，返回false。它在Vue中定义了一些保留属性，例如key、ref、slot、v-bind等，这些属性的处理方式与普通属性有所不同。

8. remove(arr: Array<any>, item: any)

这个函数用于从数组中删除指定项。它使用splice方法来实现删除操作，并返回被删除的项。

总的来说，“helpers”是一组辅助函数，它们能够帮助Vue实现属性监听机制中的许多细节处理，使代码更加简洁、高效。熟悉这些函数可以帮助我们更好地理解Vue的源码实现原理。
 */
 
// helpers



/**
这段代码是Vue的响应式系统中的核心方法之一，用于创建或获取一个响应式数据对象的 Observer 实例。

该方法接受三个参数：value、shallow 和 ssrMockReactivity。

第一个参数 value 表示要观察的对象，如果不是对象、ref 对象或虚拟节点，则返回 undefined。

第二个参数 shallow 表示是否开启浅层观察模式，默认为 false。当 shallow 为 true 时，只有对象自身的变化会被观测到，而不包括其属性的变化。

第三个参数 ssrMockReactivity 表示是否在服务器端渲染时模拟响应式行为，默认为 false。在服务端渲染中，为了避免出现全局状态污染的问题，通常会禁用 Vue 的响应式机制，但有些特定场景下需要对部分数据进行模拟响应式处理，这时可以使用该参数。

该方法内部首先判断 value 是否是对象，并且是否已经存在 Observer 实例。如果已经存在，则直接返回该实例；否则，继续判断是否满足创建 Observer 实例的条件，包括：当前处于“可观测”状态、不是服务器端渲染或已明确指定模拟响应式、值是数组或普通对象、对象可扩展、没有被标记为 ReactiveFlags.SKIP。

最后，如果满足条件，则创建一个新的 Observer 实例，将其挂载到 value 的 __ob__ 属性上，并返回该实例。Observer 实例会为 value 的属性添加 getter 和 setter，从而实现响应式数据的变化检测和更新。
 */
 
/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe(
  value: any,
  shallow?: boolean,
  ssrMockReactivity?: boolean
): Observer | void {
  if (!isObject(value) || isRef(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    (ssrMockReactivity || !isServerRendering()) &&
    (isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value.__v_skip /* ReactiveFlags.SKIP */
  ) {
    ob = new Observer(value, shallow, ssrMockReactivity)
  }
  return ob
}



/**
这段代码定义了一个响应式属性，即当这个属性发生改变时，会自动触发界面更新。具体解释如下：

- `obj`: 代表要被定义的对象。
- `key`: 代表要被定义的属性名字。
- `val`: 代表该属性的初始值，默认为undefined。
- `customSetter`: 代表可选的setter方法，用于处理属性赋值时需要特殊处理的情况。
- `shallow`: 代表是否进行深层监听，默认为false。
- `mock`: 代表是否在非生产环境下模拟响应式，在生产环境中会被优化掉。

这个函数会创建一个新的 `Dep` 对象，`Dep` 是 `Vue` 中用于实现响应式的核心类之一，它是一个可观察对象，用于收集依赖和通知更新。每次对这个属性进行读写操作时，都会触发依赖收集，将当前的 `watcher` 对象添加到 `Dep` 的依赖列表中，并返回当前属性的值。如果属性的值是一个对象，那么会递归调用 `observe` 函数，将其转换成响应式对象。函数最后会返回这个新建的 `dep` 对象。
 */
 
/**
 * Define a reactive property on an Object.
 */
export function defineReactive(
  obj: object,
  key: string,
  val?: any,
  customSetter?: Function | null,
  shallow?: boolean,
  mock?: boolean
) {
  const dep = new Dep()



/**
在Vue的观察者模式中，一个对象（或数组）被添加到响应式系统后，每个属性都会被转换为getter和setter。当属性发生变化时，Vue将更新相关组件的视图。

在这段代码中，`Object.getOwnPropertyDescriptor`用于获取对象`obj`中属性名为`key`的属性描述符。如果该属性存在且不可配置（即`configurable`属性为`false`），则直接返回，不做任何处理。这是因为不可配置的属性已经被定义为不能被删除、修改或重新定义，因此也不需要被转换成getter和setter。

这个判断是为了避免重复对同一个属性进行转换，并且确保只有可配置的属性才会被添加到响应式系统中。
 */
 
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }



/**
这段代码主要是对定义的getter和setter进行处理，如果有getter但没有setter，或者val的值为NO_INITIAL_VALUE（表示未初始化）或传入2个参数（表示手动赋值），那么就将val的值设置为obj[key]，即取对象中的该属性值。这里的意思是如果属性定义了getter函数，但setter函数不存在，则不允许手动赋值，只能通过getter获取值。

具体解释如下：

1. 首先，根据传入的参数property来获取getter和setter方法。
```
const getter = property && property.get
const setter = property && property.set
```
这里，如果property存在，就分别将它的get和set方法分别赋给getter和setter，如果不存在则分别赋值为undefined。

2. 然后，进入if判断语句：
```
if (
  (!getter || setter) &&
  (val === NO_INIITIAL_VALUE || arguments.length === 2)
) {
  val = obj[key]
}
```
这里，首先判断getter是否存在，如果不存在或者setter存在，则执行if语句内部的代码。其次，判断val的值是否为NO_INIITIAL_VALUE或arguments.length是否为2，如果满足任一条件，则将obj[key]的值赋给val。

注：NO_INIITIAL_VALUE是一个全局常量，表示一个未初始化的值。而arguments.length为2，则表示当前传入了两个参数，即进行手动赋值操作。
 */
 
  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if (
    (!getter || setter) &&
    (val === NO_INIITIAL_VALUE || arguments.length === 2)
  ) {
    val = obj[key]
  }



/**
这段代码是Vue中响应式系统的核心部分，它定义了一个属性的getter和setter方法，使得当这个属性被读取或者修改时，能够通知到对应的依赖（watcher）。

具体来说，这段代码会对一个对象obj的key属性进行劫持（defineProperty），在getter中获取对应的值value，并且在依赖存在的情况下建立依赖关系（调用dep.depend方法），同时如果这个值还是一个对象的话，递归建立子属性的依赖关系。在setter中，检查新旧值是否相同，如果不同则更新值并且通知依赖（调用dep.notify方法）。

在此基础上，Vue通过将组件的所有数据转化为响应式数据，并且依赖系统实时追踪数据的变化，实现了视图与数据的双向绑定。
 */
 
  let childOb = !shallow && observe(val, false, mock)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        if (__DEV__) {
          dep.depend({
            target: obj,
            type: TrackOpTypes.GET,
            key
          })
        } else {
          dep.depend()
        }
        if (childOb) {
          childOb.dep.depend()
          if (isArray(value)) {
            dependArray(value)
          }
        }
      }
      return isRef(value) && !shallow ? value.value : value
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val
      if (!hasChanged(value, newVal)) {
        return
      }
      if (__DEV__ && customSetter) {
        customSetter()
      }
      if (setter) {
        setter.call(obj, newVal)
      } else if (getter) {
        // #7981: for accessor properties without setter
        return
      } else if (!shallow && isRef(value) && !isRef(newVal)) {
        value.value = newVal
        return
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal, false, mock)
      if (__DEV__) {
        dep.notify({
          type: TriggerOpTypes.SET,
          target: obj,
          key,
          newValue: newVal,
          oldValue: value
        })
      } else {
        dep.notify()
      }
    }
  })



/**
在Vue的源码中，./dist/src/core/observer/index.ts文件是观察者模式的实现，其中包含了一个Dep类。

在Dep类中有一个addSub方法，它用于将新的观察者对象添加到Dep实例的subs数组中。在addSub方法中，会首先判断该观察者是否已经存在于subs数组中，如果不存在则将其添加进去。

接着，addSub方法中还会调用sub对象的addDep方法，并将当前的Dep实例作为参数传递过去。

最后，addSub方法会返回当前的Dep实例。

因此，在代码片段return dep中，返回的是当前的Dep实例，这就是为什么可以通过Dep.target.dep.addSub(Dep.target)来将当前的观察者对象添加进Dep实例的subs数组中。
 */
 
  return dep
}



/**
这段代码定义了Vue中响应式系统的核心方法之一——set方法。这个方法可以设置对象和数组的属性，并且在属性不存在时触发更改通知。

set方法的第一个参数是要设置的目标对象或数组，第二个参数是要设置的键名，第三个参数是要设置的值。如果目标对象是数组，则该键名必须是数字类型。

在实现过程中，首先进行了一系列的判断和警告。例如，如果目标对象为undefined、null、或基本数据类型，则无法设置响应式属性，会产生错误提示；如果目标对象是只读的，则也无法设置响应式属性，同样会产生错误提示。

接着，根据传入的参数类型，执行不同的操作。如果目标对象是数组并且键名为有效的数组索引，则使用splice方法来设置指定位置的值，并将其观察为响应式对象；如果目标对象已经存在指定的属性，则直接设置属性的值；否则，创建一个新的响应式属性，并在该对象上添加一个新的观察者。

最后，如果开启了开发模式，则使用依赖项(observing)通知(dep.notify)，通知所有观察该对象的watcher对象属性已经被修改。如果没有开启开发模式，则只需简单地通知所有观察该对象的watcher对象属性已经被修改。最终返回设置的值。
 */
 
/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set<T>(array: T[], key: number, value: T): T
export function set<T>(object: object, key: string | number, value: T): T
export function set(
  target: any[] | Record<string, any>,
  key: any,
  val: any
): any {
  if (__DEV__ && (isUndef(target) || isPrimitive(target))) {
    warn(
      `Cannot set reactive property on undefined, null, or primitive value: ${target}`
    )
  }
  if (isReadonly(target)) {
    __DEV__ && warn(`Set operation on key "${key}" failed: target is readonly.`)
    return
  }
  const ob = (target as any).__ob__
  if (isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    // when mocking for SSR, array methods are not hijacked
    if (ob && !ob.shallow && ob.mock) {
      observe(val, false, true)
    }
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  if ((target as any)._isVue || (ob && ob.vmCount)) {
    __DEV__ &&
      warn(
        'Avoid adding reactive properties to a Vue instance or its root $data ' +
          'at runtime - declare it upfront in the data option.'
      )
    return val
  }
  if (!ob) {
    target[key] = val
    return val
  }
  defineReactive(ob.value, key, val, undefined, ob.shallow, ob.mock)
  if (__DEV__) {
    ob.dep.notify({
      type: TriggerOpTypes.ADD,
      target: target,
      key,
      newValue: val,
      oldValue: undefined
    })
  } else {
    ob.dep.notify()
  }
  return val
}



/**
这段代码实现了删除一个reactive对象的属性，并在必要时触发响应式更新。该函数接收两个参数，第一个参数是目标数组或对象，第二个参数是要删除的键值。

首先，该函数会对传入的target进行检查，如果是undefined或原始类型，则无法删除响应式属性并发出警告。如果target是数组类型且key是有效的数组索引，则使用splice方法从数组中删除元素。如果target是Vue实例或其$ data根属性，则不建议删除其属性并发出警告。如果target是只读的，则删除操作失败并发出警告。如果target包含该属性，则使用delete运算符从对象中删除该属性。最后，如果target对象具有响应式能力，则通知其依赖项进行更改通知。如果在开发模式下，则还将发送操作类型和相关的目标和key。

需要注意的是，此函数的实现体现了Vue的响应式系统的核心思想-数据劫持。Vue通过Object.defineProperty()方法来拦截数据对象的访问，使得当这些数据被访问或修改时，可以自动触发相应的响应式更新。这样，在我们使用Vue时，就可以方便地实现数据与视图的绑定和同步。
 */
 
/**
 * Delete a property and trigger change if necessary.
 */
export function del<T>(array: T[], key: number): void
export function del(object: object, key: string | number): void
export function del(target: any[] | object, key: any) {
  if (__DEV__ && (isUndef(target) || isPrimitive(target))) {
    warn(
      `Cannot delete reactive property on undefined, null, or primitive value: ${target}`
    )
  }
  if (isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = (target as any).__ob__
  if ((target as any)._isVue || (ob && ob.vmCount)) {
    __DEV__ &&
      warn(
        'Avoid deleting properties on a Vue instance or its root $data ' +
          '- just set it to null.'
      )
    return
  }
  if (isReadonly(target)) {
    __DEV__ &&
      warn(`Delete operation on key "${key}" failed: target is readonly.`)
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  if (__DEV__) {
    ob.dep.notify({
      type: TriggerOpTypes.DELETE,
      target: target,
      key
    })
  } else {
    ob.dep.notify()
  }
}



/**
这段代码是用来收集数组元素的依赖的。当一个数组被访问时，Vue会检查这个数组是否已经被响应式地观察了变化，如果已经被观察，则需要为该数组中每个元素建立依赖关系。

在 Vue 中，当数据发生变化时，会触发相应的更新操作，而这些更新操作是由数据所依赖的 watcher 触发的。这里的 `dependArray` 函数就是用来建立数组元素与 watcher 之间的依赖关系的。具体来说，此函数会递归遍历数组的每一个元素，如果某个元素是对象并且已经被 Vue 观察过，那么它就会将这个对象的依赖加入到当前执行上下文的 Watcher 的依赖列表中。

需要注意的是，在 JavaScript 中，无法像获取对象属性那样直接获取数组元素，因此无法拦截对数组元素的访问。因此，Vue 只能在访问整个数组时检测到其变化，然后遍历整个数组来建立依赖关系。这也是为什么使用 Vue 时要尽量避免直接改变数组中的元素，而是要通过 Vue 暴露出来的一些 API 方法来进行操作，例如 `push()`、`pop()`、`splice()` 等。
 */
 
/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray(value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    if (e && e.__ob__) {
      e.__ob__.dep.depend()
    }
    if (isArray(e)) {
      dependArray(e)
    }
  }
}


