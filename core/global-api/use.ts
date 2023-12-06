
/**
在Vue中，use函数是一个全局API，它用于安装Vue插件。./dist/src/core/global-api/use.ts文件的作用就是定义了Vue.use方法的实现，也就是用来安装Vue插件的方法。

具体来说，Vue.use接受一个插件（可以是一个对象或者函数）作为参数，并且这个插件必须有一个install方法。在Vue.use内部，会判断这个插件是否已经被安装过，如果已经安装过，则直接返回；如果没有安装过，则执行该插件的install方法，将Vue实例作为参数传入。

这个文件与其它文件的关系主要表现在两个方面：

1. 与Vue构造函数相关的一些全局API（如Vue.mixin、Vue.directive等）都通过Vue.use来进行安装，而Vue.use则是定义在./dist/src/core/global-api/use.ts文件中的。

2. Vue.use方法本身是一个全局API，因此它可以在整个Vue应用中使用。其他模块如果需要使用已经安装的插件，也可以通过Vue.use来进行安装。
 */
 



/**
首先，Vue的源码分布在很多不同目录中，其中`./dist/src/core/global-api/use.ts`是一个Core（核心）模块下的全局API模块，这个模块主要负责Vue的插件管理。

接下来，我们来看这段代码的详细解释：

1. `import type { GlobalAPI } from 'types/global-api'`

这句代码的作用是导入一个`GlobalAPI`类型，这个类型定义在`types/global-api`模块中。`GlobalAPI`是一个接口，它包含了Vue.js全局API的所有属性和方法。在这里，我们使用了Typescript的类型导入语法，通过这种方式，我们可以在代码中使用`GlobalAPI`类型的所有成员，而不需要再进行类型声明。

2. `import { toArray, isFunction } from '../util/index'`

这句代码的作用是导入`toArray`和`isFunction`函数，它们来自于`../util/index`路径下的一个常用工具库。`toArray`函数的作用是将类数组对象转换为真正的数组；`isFunction`函数的作用是判断给定值是否为函数。

总的来说，这段代码主要是在导入了`GlobalAPI`类型以及一些常用的工具函数，为后续代码做准备。
 */
 
import type { GlobalAPI } from 'types/global-api'
import { toArray, isFunction } from '../util/index'



/**
`initUse`是Vue全局API的一部分，它主要是定义了 `Vue.use()` 方法。这个方法用于安装 Vue.js 插件。当你调用此方法并传入一个插件时，该插件将被安装到 Vue.js 中。

在 `initUse` 方法中，我们可以看到 `Vue.use` 函数被定义为一个函数。这个函数接受一个参数 plugin，它可以是一个函数或任何类型的值。

在函数体内，我们首先创建了一个变量 `installedPlugins`，它存储已经安装的插件列表。如果插件已经安装，则直接返回 Vue 实例本身，否则将插件添加到已安装插件列表中。

总的来说，`initUse`方法的作用就是初始化Vue实例的use方法，并提供了检测插件是否已经被安装的功能。这使得我们能够通过简单地调用 `Vue.use()` 方法来安装并使用Vue插件。
 */
 
export function initUse(Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | any) {
    const installedPlugins =
      this._installedPlugins || (this._installedPlugins = [])
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }



/**
这段代码是 `Vue.use` 函数的实现。

首先，我们来看一下 `use` 函数接收到的第一个参数 `plugin`，它可以是一个对象或一个函数。如果 `plugin` 是一个对象，那么它必须提供 `install` 方法，这个方法将在调用 `Vue.use(plugin)` 的时候执行。如果 `plugin` 是一个函数，它将直接被调用。

接下来，代码中的 `toArray(arguments, 1)` 将传递给 `Vue.use` 函数的额外参数转换为数组形式。这里 `arguments` 表示当前函数的所有参数，使用 `toArray` 函数的第二个参数 `1` 来表示从第二个参数开始截取并转换成数组。例如，你调用了 `Vue.use(plugin, arg1, arg2)`，那么 `args` 就是 `[this, arg1, arg2]`。

接着，我们把 `this` （当前的 Vue 实例）插入到 `args` 数组的开头，保证在调用 `install` 或者 `plugin` 函数的时候，都会传入当前的 Vue 实例。

然后，我们判断 `plugin` 是否拥有 `install` 方法，如果有则调用，否则直接执行 `plugin` 函数。注意，这里使用了 `apply` 方法进行调用，传入的参数是 `plugin` 和 `args` 数组。这样做的目的是确保插件可以使用 `Vue` 对象和其他参数。

最后，将 `plugin` 添加到 `installedPlugins` 数组中，并返回当前的 Vue 实例。这样，就可以链式调用 `Vue.use(plugin)`。

总之，这段代码的作用是将一个插件应用到当前的 Vue 实例上。通过调用插件提供的 `install` 方法或者直接执行插件函数，从而扩展 Vue 的功能。
 */
 
    // additional parameters
    const args = toArray(arguments, 1)
    args.unshift(this)
    if (isFunction(plugin.install)) {
      plugin.install.apply(plugin, args)
    } else if (isFunction(plugin)) {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}


