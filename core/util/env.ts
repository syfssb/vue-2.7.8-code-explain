
/**
./dist/src/core/util/env.ts文件的作用是检测当前环境是否支持原生的 Promise 和 Set 对象，并提供了一些检测环境和判断浏览器及其版本号的工具函数。

在整个Vue源码中，env.ts文件是一个基础工具模块，主要用来提供跨平台、全局变量和运行环境相关的一些工具函数，包括：

1. isServer：判断当前是否是服务器端运行环境。
2. devtools：检测当前是否可以使用 Vue Devtools 调试工具。
3. hasSymbol：检测当前环境是否支持 Symbol 类型。
4. inBrowser：判断当前环境是否是浏览器端。
5. UA：获取当前浏览器的 userAgent 字符串。
6. isIE、isIE9、isEdge：分别用于判断当前浏览器是否是 IE、IE 9、Edge 浏览器（基于 UA 字符串判断）。
7. isIOS、isIphone、isIPad、isAndroid、isPhantomJS、isChrome、isFF、isOpera、isSafari：分别用于判断当前浏览器是否是 iOS 系统、iPhone 手机、iPad 平板、Android 系统、PhantomJS 引擎、Chrome 浏览器、Firefox 浏览器、Opera 浏览器、Safari 浏览器（基于 UA 字符串判断）。
8. supportsPassive：检测当前浏览器是否支持添加 passvie 选项的事件监听器。
9. _isServer：在检测 isServer 时使用，用于存储缓存值。

在整个 Vue 源码中，env.ts 文件是一个非常基础的工具模块，被其它模块大量引用。例如，在初始化 Vue 实例时，会引入该文件，判断当前环境是否支持 Promise 对象和 Set 对象，如果不支持，则引入 polyfill；在创建虚拟节点时，也会引入该文件，判断当前是否是服务器端运行环境，以决定是否需要使用原生 DOM API 来创建元素。
 */
 



/**
这段代码是用来判断当前环境是否支持原型链的语法`__proto__`。

在JavaScript中，每个对象都有一个内置的`__proto__`属性，它指向该对象的原型（prototype）。通过原型链，一个对象可以访问到另一个对象的方法和属性。例如，如果我们有一个对象`person`有一个名为`name`的属性，那么`person`的原型对象也可能有一个名为`age`的属性。我们可以通过`person.__proto__.age`获取到这个属性值。

但是，在ES6之前，`__proto__`并不是标准规范中定义的属性，而是由浏览器自己实现的一种扩展特性，所以在某些情况下它可能会被禁用或者不兼容。

因此，上述代码中的判断，就是检查当前浏览器是否支持`__proto__`这个属性，如果支持返回true，否则返回false。
 */
 
// can we use __proto__?
export const hasProto = '__proto__' in {}



/**
这段代码主要用于浏览器环境的嗅探，即判断当前代码运行的环境是否为浏览器环境，并根据不同的浏览器环境设置一些常量。下面是每个常量的含义：

- inBrowser：判断当前是否在浏览器环境中，通过判断window对象是否存在来实现。
- UA：如果当前环境是浏览器环境，则获取用户代理字符串，将其转为小写并存储在变量UA中。
- isIE：判断当前是否为IE浏览器，在UA中查找"msie"或"trident"字符串，如果存在则说明是IE浏览器。
- isIE9：判断当前是否为IE9浏览器，在UA中查找"msie 9.0"字符串，如果存在则说明是IE9浏览器。
- isEdge：判断当前是否为Edge浏览器，在UA中查找"edge/"字符串，如果存在则说明是Edge浏览器。
- isAndroid：判断当前是否为Android系统，在UA中查找"android"字符串，如果存在则说明是Android系统。
- isIOS：判断当前是否为iOS系统，在UA中查找"iphone"、"ipad"、"ipod"或"ios"字符串，如果存在则说明是iOS系统。
- isChrome：判断当前是否为Chrome浏览器，在UA中查找"chrome/"字符串并且不是Edge浏览器，如果存在则说明是Chrome浏览器。
- isPhantomJS：判断当前是否为PhantomJS浏览器，在UA中查找"phantomjs"字符串，如果存在则说明是PhantomJS浏览器。
- isFF：判断当前是否为Firefox浏览器，在UA中查找"firefox/"字符串并获取版本号，如果存在则将版本号存储在isFF中。

通过这些常量的设置，可以方便地在代码中根据不同的浏览器环境做出相应的处理。
 */
 
// Browser environment sniffing
export const inBrowser = typeof window !== 'undefined'
export const UA = inBrowser && window.navigator.userAgent.toLowerCase()
export const isIE = UA && /msie|trident/.test(UA)
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0
export const isEdge = UA && UA.indexOf('edge/') > 0
export const isAndroid = UA && UA.indexOf('android') > 0
export const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)
export const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge
export const isPhantomJS = UA && /phantomjs/.test(UA)
export const isFF = UA && UA.match(/firefox\/(\d+)/)



/**
这段代码主要是判断当前浏览器是否支持原生的`watch`方法，如果当前浏览器支持，则将其赋值给`nativeWatch`变量。

但是在注释中提到，Firefox浏览器在`Object.prototype`上有一个名为`watch`的函数，因此这里需要使用`@ts-expect-error`注释禁止TypeScript发出错误警告。因为这个函数存在于`Object.prototype`中，所以不能直接通过对象字面量来检查它是否存在。因此，这里通过将`{}.watch`赋值给`nativeWatch`来检查浏览器是否支持原生的`watch`方法。
 */
 
// Firefox has a "watch" function on Object.prototype...
// @ts-expect-error firebox support
export const nativeWatch = {}.watch



/**
这段代码主要用于检测浏览器是否支持 `passive` 事件监听器选项。在 Vue 中，当注册某个事件时，我们可以通过给事件处理函数传递一个 `options` 对象来控制该事件的行为，其中的 `passive` 选项可以指定事件监听器是否可以调用 `preventDefault()` 方法来阻止默认行为。

这段代码首先判断当前是否处于浏览器环境中（即是否存在 `window` 对象），然后创建一个空的 `opts` 对象，并定义该对象的 `passive` 属性的 getter 函数，在 getter 函数中将全局变量 `supportsPassive` 赋值为 `true`。接着，它尝试通过添加一个名为 `test-passive` 的测试事件来检测浏览器是否支持 `passive` 选项。如果浏览器支持，则会调用该事件的 `passive` 选项，从而触发 `opts.passive` 的 getter 函数，进而将 `supportsPassive` 设置为 `true`。

需要注意的是，这里使用了 TypeScript 类型断言将 `opts` 对象转换为了 `object` 类型，以解决 Flow 类型检测工具的一个 bug。
 */
 
export let supportsPassive = false
if (inBrowser) {
  try {
    const opts = {}
    Object.defineProperty(opts, 'passive', {
      get() {
        /* istanbul ignore next */
        supportsPassive = true
      }
    } as object) // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null as any, opts)
  } catch (e: any) {}
}



/**
这段代码主要是用于检测当前环境是否为服务器端渲染。在Vue.js中，服务器端渲染和客户端渲染有许多不同的实现方式，因此我们需要区分它们。

其中，`_isServer`是一个私有变量，表示当前环境是否为服务器端。在函数`isServerRendering`中，我们首先判断`_isServer`是否已经被初始化。如果没有初始化，就会根据以下条件进行判断：

1. 如果当前环境不是浏览器环境（比如在Node.js环境中），且全局对象存在，则说明当前环境是Node.js环境。我们可以通过判断全局对象的process属性中的env.VUE_ENV属性是否为'server'来判断当前环境是否为服务器端渲染。

2. 否则，默认为客户端渲染，将`_isServer`赋值为false。

最后，返回`_isServer`的值，即表示当前环境是否为服务器端渲染。这里使用了惰性求值的策略，即只有在必要时才初始化`_isServer`的值，避免了不必要的计算。
 */
 
// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
let _isServer
export const isServerRendering = () => {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && typeof global !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer =
        global['process'] && global['process'].env.VUE_ENV === 'server'
    } else {
      _isServer = false
    }
  }
  return _isServer
}



/**
这段代码的作用是检测当前环境下是否存在Vue开发者工具，并将检测结果以布尔类型的方式存储在常量`devtools`中。

其中，`inBrowser`表示当前是否处于浏览器环境下，如果不是则无法使用开发者工具；而`window.__VUE_DEVTOOLS_GLOBAL_HOOK__`则是Vue开发者工具注入到页面中的一个全局变量，如果该变量存在，则说明当前环境下已经安装了Vue开发者工具。因此，当`inBrowser`和`window.__VUE_DEVTOOLS_GLOBAL_HOOK__`均为真时，`devtools`才会被赋值为真。

该常量的用途是在调试时判断是否需要开启Vue开发者工具相关的功能，例如在组件挂载时的性能分析、事件跟踪等。
 */
 
// detect devtools
export const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__



/**
这段代码的作用是检测一个函数是否为原生函数，返回值为布尔类型。

具体实现步骤如下：

1. 判断传入参数Ctor是否为函数类型
2. 将Ctor转化为字符串类型，并判断字符串中是否含有'native code'字样
3. 如果满足上述两个条件，则认为Ctor为原生函数，返回true；否则返回false。

该函数通常用于判断某些浏览器环境下一些特定的函数是否为原生函数，以此来进行不同的处理方式。同时，由于原生函数的执行效率往往更高，因此在一些性能敏感的场景下也可以优先选择原生函数进行相关操作。
 */
 
/* istanbul ignore next */
export function isNative(Ctor: any): boolean {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}



/**
这段代码主要是用来判断浏览器是否支持ES6的Symbol和Reflect.ownKeys方法。具体解释如下：

1. `typeof Symbol !== 'undefined'` 用来判断当前环境是否支持ES6的Symbol类型，因为Symbol是ES6中新增的数据类型，早期浏览器并不支持，所以需要进行判断。

2. `isNative(Symbol)` 判断当前环境中的Symbol是否为原生的Symbol实现，这里的isNative函数是Vue源码自己实现的一个判断某个方法是否为原生方法的工具函数。

3. `typeof Reflect !== 'undefined'` 判断当前环境是否支持Reflect对象，同样地，Reflect也是ES6中新增的API，早期浏览器也可能不支持。

4. `isNative(Reflect.ownKeys)` 判断当前环境中的Reflect.ownKeys方法是否为原生实现。

综上所述，这段代码的作用就是判断当前环境是否支持ES6的Symbol和Reflect.ownKeys方法，并且这两个方法必须是原生实现才行。如果都支持且是原生实现，则会将hasSymbol变量赋值为true，否则为false。在Vue源码中，这个变量被用来决定是否使用Symbol作为组件的唯一标识符。
 */
 
export const hasSymbol =
  typeof Symbol !== 'undefined' &&
  isNative(Symbol) &&
  typeof Reflect !== 'undefined' &&
  isNative(Reflect.ownKeys)



/**
`env.ts` 文件中的代码段主要是用来定义 `_Set` 变量，该变量的值取决于当前环境下是否支持原生的 `Set` 数据结构。

首先，代码声明了一个 `_Set` 变量（注意这里并没有直接使用 `let` 或者 `const` 关键字），这个变量会在后续被用作集合（Set）数据结构的实现。

然后，代码使用条件语句判断当前环境是否支持原生的 `Set` 数据结构。如果支持，那么将 `_Set` 变量赋值为 `Set` 对象本身，表示在这种环境下可以直接使用原生的 `Set` 数据结构。

如果当前环境不支持原生的 `Set` 数据结构，那么就需要使用一个简单的 Set 实现。这里给出了一个非标准的 Set polyfill，它只能处理基本类型的键值，即字符串、数字等简单类型的数据。

最后，在这个 polyfill 中，`set` 属性是用来存储集合元素的对象，它采用了 JavaScript 中的一种常见技巧：使用 `Object.create(null)` 创建一个空的对象，以免因为对象字面量语法而产生的一些意外问题。
 */
 
let _Set // $flow-disable-line
/* istanbul ignore if */ if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = class Set implements SimpleSet {
    set: Record<string, boolean> = Object.create(null)



/**
这段代码是定义了一个名为`Set`的类，它通过添加、判断和清空一个内部的对象`set`来维护一组键值对。

其中`has(key)`方法用于判断`set`对象中是否存在一个指定的键名，如果存在则返回`true`，否则返回`false`。

`add(key)`方法用于向`set`对象中添加一个键名，并将其对应的值设置为`true`。

`clear()`方法用于清空`set`对象，即将其重新赋值为空对象`{}`。

这个`Set`类通常被Vue框架内部用于记录已经处理过的组件，避免重复处理。例如，在递归渲染组件树时，Vue会使用一个`Set`实例来记录已经处理过的组件，防止组件重复渲染导致死循环。
 */
 
    has(key: string | number) {
      return this.set[key] === true
    }
    add(key: string | number) {
      this.set[key] = true
    }
    clear() {
      this.set = Object.create(null)
    }
  }
}



/**
这段代码定义了一个 `SimpleSet` 接口，这个接口包含三个函数：`has`、`add` 和 `clear`。

其中，`has` 函数接受一个参数 `key`，类型为 `string` 或者 `number`，并返回一个布尔值表示这个 `Set` 中是否存在该键名。`add` 函数也接受一个 `key` 参数，并将其添加到 `Set` 中，返回值可以是任意类型。`clear` 函数则用于清空这个 `Set`。

总体来说，这段代码定义了一个简单的 `Set` 数据结构，可用于管理一组键名。在 Vue 的源代码中，可能会使用这个 `SimpleSet` 这个接口来实现一些特定的逻辑。
 */
 
export interface SimpleSet {
  has(key: string | number): boolean
  add(key: string | number): any
  clear(): void
}



/**
在Vue的源码中，`./dist/src/core/util/env.ts`文件是用于检测环境和特性支持的工具函数模块。其中，`_Set`是一个全局变量，它指向了一个原生的`Set`构造函数或者是一个由Vue自定义的`Set`类。

通过`export { _Set }`语句，我们可以将`_Set`导出，使得其他模块可以使用它。这个导出还可以被其他模块进行解构引入，例如：

```
import { _Set } from './env'

const set = new _Set([1, 2, 3])
```

上述代码就使用了从`./env`模块中导出的`_Set`构造函数来创建了一个新的`Set`实例对象。

总之，`export { _Set }`语句是Vue中的一种模块导出方式，它将一个全局变量导出为一个命名的导出。
 */
 
export { _Set }


