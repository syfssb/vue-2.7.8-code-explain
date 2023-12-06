
/**
`./dist/src/core/instance/proxy.ts` 文件是 Vue 源码中的一个核心文件，它的作用是创建并返回一个 `Proxy` 对象，将用户设置的数据属性转化为响应式的属性。这个过程被称为“响应式系统”。

在 Vue 中，当开发者使用 Vue 构造函数创建一个 Vue 实例时，Vue 会对组件实例的数据对象进行劫持（Observe），从而使得当数据对象发生变化时，能够及时地更新视图。

`proxy.ts` 文件定义了 `createReactiveProxy` 函数，该函数接收两个参数： `target` 和 `handler`，分别代表需要劫持的数据对象和一个 handler 对象，用于处理代理对象上的各种操作。

`createReactiveObject` 函数通过调用 `Proxy` 构造函数，创建代理对象，并对代理对象的属性进行劫持。在这个过程中，会依次对属性值进行递归劫持，从而实现了 Vue 的响应式系统。

此外，`proxy.ts` 文件还提供了一些其他的方法，包括 `shallowReactive`、`reactive`、`readonly`、`shallowReadonly` 等，用于创建不同类型的响应式对象。

总之，`proxy.ts` 文件是实现 Vue 响应式系统的核心部分，负责将组件实例的数据对象转化为响应式的对象，是整个 Vue 框架中非常重要的一个文件。
 */
 



/**
这个注释的意思是说，这个文件没有使用类型检查（type checking），因为Flow静态类型检查器对于Proxy API的支持不够完善。在Vue源码中，有时候会使用一些新的JavaScript特性或API，但是这些特性可能还没有得到广泛的支持，导致在某些环境下会出现兼容性问题。为了解决这些问题，Vue通常会附带一些兼容性处理的代码，以便在各种环境下都能正常运行。

在这个文件中，Vue使用了ES2015提供的Proxy API来实现响应式数据代理的功能。Proxy API可以让我们拦截并修改对象属性的读取和赋值操作，从而实现数据劫持的效果。但是，由于Proxy API还没有被所有浏览器完全支持，所以Vue做了一些兼容性处理来确保它可以在不同的浏览器环境下正常运行。
 */
 
/* not type checking this file because flow doesn't play well with Proxy */



/**
在Vue的源码中，./dist/src/core/instance/proxy.ts是用于实现Vue实例对象的代理（Proxy）功能。该模块导入了config、warn、makeMap和isNative四个函数。

1. config：这是Vue的全局配置对象，它包含了许多Vue实例的默认配置选项，例如data、watch、computed等等。

2. warn：该函数用来发出警告信息，通常在Vue内部使用，用于提醒开发人员可能存在的一些问题或潜在的错误。

3. makeMap：该函数用于生成一个能够快速判断某个字符串是否为特定值的函数。例如，makeMap('div,p,ul,li')生成的函数可以判断某个字符串是否为'div'、'p'、'ul'或'li'中的任意一个。

4. isNative：该函数用于判断当前环境下某个函数是否为原生实现。如果是，则返回true；否则返回false。在Vue源码中，这个函数主要用于检测Promise、Set等ES6新增的全局构造函数是否存在，以便将其挂载到Vue的全局配置对象中去。

这些函数都是Vue内部实现所必需的工具函数。通过引入它们，我们可以在proxy.ts中更方便地访问Vue的全局配置，并进行相关的逻辑处理。
 */
 
import config from 'core/config'
import { warn, makeMap, isNative } from '../util/index'



/**
在Vue中，数据的访问和响应式处理是通过代理对象实现的。在Vue的源码中，`initProxy` 是一个函数，它用于初始化代理。

具体而言，`initProxy` 函数通过 `Object.defineProperty` 方法为目标对象（即 Vue 实例）创建了一个名为 `$data` 的属性。这个属性的 getter 和 setter 都指向了 Vue 实例本身的 `_data` 属性。

在代理过程中，如果我们访问 Vue 实例上的一个属性，例如 `vm.xxx`，实际上是先访问代理对象 `$data` 的对应属性，然后再通过响应式系统进行依赖收集，并且在数据发生变化时触发视图更新。

总之，`initProxy` 函数在 Vue 实例创建时起到了关键作用，它将 Vue 实例与其内部的响应式数据联系起来，实现了 Vue 的核心功能。
 */
 
let initProxy



/**
这段代码主要是用于创建一个白名单，包含了在Vue实例中允许使用的全局变量。如果开启了__DEV__模式（即开发模式下），这个白名单将被创建。

其中makeMap函数是Vue源码中的一个简单工具函数，用于创建一个基于给定字符串生成的映射表（Map）。在这里，makeMap函数将一些常见的全局变量以逗号分隔的形式作为参数传入，在内部将其转换为一个对象，并返回一个函数，该函数可以判断指定的字符串是否在这些全局变量之内。

接着，allowedGlobals变量被声明并初始化为调用makeMap函数后返回的函数，这个函数将检查参数字符串是否在上述白名单之内。

最后，为了确保一些构建工具如Webpack/Browserify能够正常运行，require也被添加到了白名单之内。
 */
 
if (__DEV__) {
  const allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
      'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
      'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,' +
      'require' // for Webpack/Browserify
  )



/**
这段代码定义了一个名为`warnNonPresent`的函数，它接受两个参数：`target`和`key`。这个函数的作用是在Vue实例的渲染过程中，当渲染函数引用了不存在的属性或方法时，在控制台输出警告信息。

该函数会调用`warn`函数，并将以下信息作为参数传递：

```
Property or method "${key}" is not defined on the instance but referenced during render. Make sure that this property is reactive, either in the data option, or for class-based components, by initializing the property. See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.
```

这段信息提示开发者，在Vue实例的数据选项（`data`）或基于类的组件中，声明属性时需要确保这些属性是响应式的，并且需要将其初始化。如果没有正确声明这些属性，则会导致在渲染过程中引用不存在属性或方法的错误。同时提供了链接，以便开发者阅读有关响应性属性的更多信息。
 */
 
  const warnNonPresent = (target, key) => {
    warn(
      `Property or method "${key}" is not defined on the instance but ` +
        'referenced during render. Make sure that this property is reactive, ' +
        'either in the data option, or for class-based components, by ' +
        'initializing the property. ' +
        'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
      target
    )
  }



/**
在Vue的实例中，所有以"$"或"_"开头的属性都不会被代理到Vue实例中。这是为了防止与Vue内部属性产生冲突。因此，如果您尝试使用以下方式访问这些属性：

```javascript
this.$xxx 或 this._xxx
```

那么将无法获得期望的值。相反，你应该使用 `$data` 对象来访问它们，例如：

```javascript
this.$data.xxx 或 this.$data._xxx
```

当然，如果您确实需要使用这些特殊的属性名称，则可以通过在 options 中设置 `delimiters` 或在特定情况下使用 `rawBindings` 来解决此问题。但一般情况下，最好避免使用这些名称以避免冲突。
 */
 
  const warnReservedPrefix = (target, key) => {
    warn(
      `Property "${key}" must be accessed with "$data.${key}" because ` +
        'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
        'prevent conflicts with Vue internals. ' +
        'See: https://vuejs.org/v2/api/#data',
      target
    )
  }



/**
这段代码的作用是判断当前环境是否支持ES6中的Proxy代理对象，并且该代理对象是否为原生实现。

在JavaScript中，Proxy是一个非常强大的对象，它可以拦截对象的一些操作，如获取、设置属性值、函数调用等。Vue在响应式数据绑定中就使用了Proxy来监听数据的变化。

但是，由于旧版浏览器不支持Proxy，所以Vue在运行之前需要检查当前环境是否支持该对象。这里使用typeof Proxy !== 'undefined'来检查当前环境下是否有Proxy对象，同时使用isNative(Proxy)来判断该对象是否为原生实现。如果两个条件都满足，则代表当前环境支持Proxy对象，并且可以使用它来实现Vue的响应式数据绑定。反之，则需要使用一些其他的技术来实现Vue的响应式数据绑定。
 */
 
  const hasProxy = typeof Proxy !== 'undefined' && isNative(Proxy)



/**
在 Vue 中，`config.keyCodes` 是一个对象，它包含了一些键码和相应的别名。当我们在模板中使用 `v-on` 绑定事件时，可以通过别名来指定一个特殊的键码，比如 `.enter`、`.delete` 等等。

上面这段代码是用来代理 `config.keyCodes` 对象的，它使用了 ES6 中的 Proxy 对象，当外部代码访问 `config.keyCodes` 时，实际上是先通过代理获取到原始对象，然后对其进行操作。具体来说，当外部代码向 `config.keyCodes` 中添加属性时，会调用 `set` 函数，该函数首先判断新增的属性是否是 Vue 内置的修饰符，如果是，则会打印警告信息，并返回 false，表示添加失败；否则，将该属性添加到原始对象中，并返回 true，表示添加成功。

该代码的作用是防止开发者不小心覆盖 Vue 内置的修饰符，从而导致一些问题。通过这种方式，Vue 可以保证内置的修饰符始终可用，同时也为开发者提供了自定义键码别名的能力。
 */
 
  if (hasProxy) {
    const isBuiltInModifier = makeMap(
      'stop,prevent,self,ctrl,shift,alt,meta,exact'
    )
    config.keyCodes = new Proxy(config.keyCodes, {
      set(target, key: string, value) {
        if (isBuiltInModifier(key)) {
          warn(
            `Avoid overwriting built-in modifier in config.keyCodes: .${key}`
          )
          return false
        } else {
          target[key] = value
          return true
        }
      }
    })
  }



/**
这段代码是定义了一个 Proxy 对象的处理器对象（handler）。在 Vue.js 中，组件实例中的数据都存在 vm 实例的 $data 属性中，而且还会有一些 Vue 内部使用的属性和方法。在模板中，我们可以直接访问到这些数据和方法，比如通过 `{{ message }}` 访问 data 中的 message 属性，或者通过 `@click="handleClick"` 直接调用 methods 中的 handleClick 方法。

Vue.js 使用了 ES6 的 Proxy 对象来拦截对 vm 实例中不存在的属性的访问。在访问 target 对象上的某个属性 key 时，Proxy 对象会优先调用 has 方法，并返回一个布尔值标示该属性是否存在。

在这里，has 方法被定义为一个函数，它的两个参数分别是 target 和 key。当我们在访问一个不存在的属性时，has 方法会首先判断该属性名是否在 allowedGlobals 函数返回的全局变量白名单中，如果是，则返回 true；否则，如果该属性名以 _ 开头并且不在 $data 中，也返回 true。否则，就认为该属性名是非法的，此时会发出警告。

最后，has 方法会根据 target 对象是否存在该属性和该属性名是否合法，来决定是否返回 true。如果该属性名是非法的，则返回 false，再次访问该属性时，就会触发 get 代理方法，而不是直接返回 undefined。
 */
 
  const hasHandler = {
    has(target, key) {
      const has = key in target
      const isAllowed =
        allowedGlobals(key) ||
        (typeof key === 'string' &&
          key.charAt(0) === '_' &&
          !(key in target.$data))
      if (!has && !isAllowed) {
        if (key in target.$data) warnReservedPrefix(target, key)
        else warnNonPresent(target, key)
      }
      return has || !isAllowed
    }
  }



/**
这段代码是针对Vue实例中使用Proxy进行代理处理时的一个get Handler。 当我们使用`new Vue()`创建一个Vue实例时，Vue内部会使用ES6的Proxy来将该实例对象进行代理。这个代理会拦截对实例对象的所有访问和修改，并在代理过程中执行Vue框架的一些操作，比如依赖收集、响应式更新等。

`getHandler`是用来定义这个代理的get方法。当使用Vue实例的属性时，get方法就会被触发。具体来说，它首先判断该属性是否存在于原始对象中，如果不存在，则会判断该属性名是否存在于 `$data` 对象上，如果存在于 `$data` 上，则会警告开发者不要使用保留前缀（如 `_$` 或 `$` 开头）；如果也不存在于 `$data` 上，则会报错提示该属性不存在。如果这个属性存在于原始对象中，则返回该属性值。

综上所述，这段代码的作用是为了对 Vue 实例进行代理时，在取值时对一些特殊情况进行判断和提示。
 */
 
  const getHandler = {
    get(target, key) {
      if (typeof key === 'string' && !(key in target)) {
        if (key in target.$data) warnReservedPrefix(target, key)
        else warnNonPresent(target, key)
      }
      return target[key]
    }
  }



/**
这段代码中的 `initProxy` 函数是用来初始化 Vue 实例的渲染代理的。它主要有两个作用：

1. 让 Vue 实例在访问其属性时，能够触发相关响应式更新。
2. 在进行模板编译时，将模板表达式生成的 VNode 节点与当前 Vue 实例关联。

其中，这里重点介绍一下第一个作用。

当 Vue 实例被创建时，会调用 `initProxy` 函数来创建一个 `_renderProxy` 属性，并将该属性设置为代理对象。实际上，代理对象就是一个 Proxy 实例。

接着，Vue 内部会通过遍历 Vue 实例上的所有属性（包括 data、computed、methods 等），将这些属性都转换成访问代理对象的形式。例如，当我们在组件中使用 `this.msg` 访问 data 中的 msg 属性时，实际上是在访问代理对象的 `this._renderProxy.msg` 属性。

由于代理对象是一个 Proxy 实例，所以在访问它的属性时，会自动触发 Proxy 的 get 方法，在 get 方法中会收集依赖并返回相应的数据。因此，这样做可以实现响应式更新。

总之，`initProxy` 函数的作用就是创建一个代理对象，然后将 Vue 实例上的各种属性都转换成代理对象的属性，以实现响应式更新。
 */
 
  initProxy = function initProxy(vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      const options = vm.$options
      const handlers =
        options.render && options.render._withStripped ? getHandler : hasHandler
      vm._renderProxy = new Proxy(vm, handlers)
    } else {
      vm._renderProxy = vm
    }
  }
}



/**
在Vue的源码中，./dist/src/core/instance/proxy.ts文件是负责初始化代理的模块。在这个模块中，主要导出了一个函数叫做initProxy。这个函数的作用是为实例对象创建一个代理。下面是对该函数的解释：

Vue实例中有许多属性和方法，这些属性和方法都可能被用户直接访问或者修改，但是有一些属性或者方法是应该被保护的，不应该被用户直接访问或者修改。因此，Vue框架会在初始化时为每个实例对象创建一个代理。这样一来，用户就可以通过代理来访问或者修改Vue实例中的属性或者方法，而且代理还能够保护那些不应该被访问或者修改的属性或者方法。

initProxy函数主要的作用就是为Vue实例创建一个代理，并且设置代理的get和set拦截器，分别用来获取和修改Vue实例的属性。其中最关键的部分是使用Object.defineProperty()方法为代理对象设置getter和setter方法，使得当外部访问Vue实例时，可以通过代理间接访问到实例的属性和方法，从而保护实例中不能被直接访问的属性。

总之，initProxy函数的作用就是为Vue实例创建一个代理，使得用户可以通过代理来访问或者修改Vue实例的属性或者方法，并且代理还能够保护那些不应该被访问或者修改的属性或者方法。
 */
 
export { initProxy }


