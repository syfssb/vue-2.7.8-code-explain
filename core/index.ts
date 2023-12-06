/**
./dist/src/core/index.ts文件是Vue源码中的核心文件之一，它是整个Vue框架的入口文件。它主要负责Vue框架的初始化工作，包括：

1. 定义了Vue类，Vue类是整个框架的核心，所有Vue实例都是由该类创建的。
2. 定义了Vue构造函数的静态方法，包括extend、nextTick，以及一些工具函数等。
3. 通过对Vue.prototype对象进行扩展，定义了Vue实例的公共方法和属性，比如$set、$delete、$watch等。
4. 导入和注册全局组件和指令，并将其挂载到Vue实例上。
5. 定义了用于处理组件、指令、过滤器等相关逻辑的函数。

./dist/src/core/index.ts文件在整个Vue源码中和其他文件的关系非常紧密，它引用和导出了许多其他模块，比如：

1. Vue.config模块：定义了Vue的全局配置项，包括silent、optionMergeStrategies、devtools、errorHandler等。
2. Vue.util模块：定义了Vue的一些工具函数，比如warn、looseEqual等。
3. Observer模块：负责数据响应式，实现了数据劫持等功能。
4. Dep模块：定义了依赖收集器，负责管理Watcher对象。
5. VNode、VNodeData、VNodeDirective等模块：定义了虚拟节点相关的类型和接口。
6. Watcher模块：负责监听数据变化并执行回调函数。

此外，./dist/src/core/index.ts文件还导入了许多其他核心模块，包括组件、指令、事件、渲染等模块，它们共同构成了整个Vue框架的核心。
 */

/**
这段代码主要是引入了Vue的关键部分，具体解释如下：

1. `import Vue from './instance/index'` 从`./instance/index`中导入Vue实例构造函数。这个文件是Vue的核心代码，定义了Vue实例的各种属性和方法。

2. `import { initGlobalAPI } from './global-api/index'` 从`./global-api/index`中导入`initGlobalAPI`函数。这个函数用来初始化全局API，如`Vue.extend`、`Vue.mixin`等。

3. `import { isServerRendering } from 'core/util/env'` 从`core/util/env`中导入`isServerRendering`函数。这个函数用来判断当前是否处于服务器端渲染环境。

4. `import { FunctionalRenderContext } from 'core/vdom/create-functional-component'` 从`core/vdom/create-functional-component`中导入`FunctionalRenderContext`类。这个类用来创建函数式组件的渲染上下文对象。

5. `import { version } from 'v3'` 从`v3`模块中导入Vue的版本号。这个模块是Vue.js官方提供的一个包含版本号的模块。

综上所述，这段代码主要是引入Vue的核心代码，并初始化全局API和一些常用的工具函数和类。
 */

import Vue from "./instance/index";
import { initGlobalAPI } from "./global-api/index";
import { isServerRendering } from "core/util/env";
import { FunctionalRenderContext } from "core/vdom/create-functional-component";
import { version } from "v3";

/**
在Vue的源码中，`initGlobalAPI(Vue)`是一个函数调用，它的作用是初始化全局API。在这个函数内部，会给Vue构造函数添加一些静态方法和属性，这些方法和属性可以用于全局访问。

具体来说，`initGlobalAPI(Vue)`会做以下几件事情：

1. 将一些常量、错误码等定义到Vue上，例如`Vue.version`、`Vue.nextTick`等。
2. 将`Vue.use()`方法添加到Vue上，该方法用于安装插件。
3. 将`Vue.mixin()`方法添加到Vue上，该方法用于全局混入选项。
4. 将`Vue.extend()`方法添加到Vue上，该方法用于创建子类，可以继承父类的选项。
5. 将`Vue.directive()`、`Vue.component()`、`Vue.filter()`方法添加到Vue上，用于注册全局指令、组件、过滤器。
6. 将`Vue.set()`、`Vue.delete()`方法添加到Vue上，用于在响应式对象上设置/删除属性。
7. 将`Vue.observable()`方法添加到Vue上，用于将普通对象转换为响应式对象。

通过这些静态方法和属性，我们可以在全局范围内轻松地访问Vue提供的功能。
 */

initGlobalAPI(Vue);

/**
这段代码的作用是在Vue实例对象的原型上添加一个 `$isServer` 属性，该属性表示当前是否为服务端渲染。它的值是一个布尔类型，通过调用 `isServerRendering` 函数来获取。

具体来说，`Object.defineProperty` 方法定义了一个对象的新属性或修改已有属性的特性（比如可写、可枚举和可配置等），这里使用该方法将 `$isServer` 属性添加到 Vue.prototype 上。第一个参数是要在其上定义属性的对象（这里是 Vue.prototype），第二个参数是要定义或修改的属性的名称，第三个参数是属性描述符对象。

其中，属性描述符对象包含 get 和 set 两个选项，它们分别表示获取属性值时的回调函数和设置属性值时的回调函数。在这里，只用到了 get 选项，并把它的值设置为 `isServerRendering` 函数，它会判断当前环境是否为服务端渲染并返回一个布尔值。

最终效果是，在使用 Vue 创建的所有实例对象中都可以通过 `$isServer` 属性获取当前是否为服务端渲染。
 */

Object.defineProperty(Vue.prototype, "$isServer", {
  get: isServerRendering,
});

/**
这段代码主要是在 Vue.prototype 上定义了一个 $ssrContext 的属性，它的作用是获取当前组件所在的 SSR 上下文对象。

使用 Object.defineProperty 方法将 $ssrContext 定义为 Vue.prototype 上的一个 getter 属性。当访问 this.$ssrContext 时，它会返回当前组件实例的 $vnode.ssrContext 属性。$vnode 是 Vue 内部的一个变量，它代表了当前组件对应的虚拟节点。

在服务器端渲染时，可以通过在渲染函数中手动传入一个 ssrContext 对象，来让所有的子组件都能够访问到该对象。这样，在组件内部就可以通过 this.$ssrContext 来获取到该对象，从而实现更加灵活的组件交互。
 */

Object.defineProperty(Vue.prototype, "$ssrContext", {
  get() {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext;
  },
});

/**
这段代码的作用是在Vue对象上定义一个名为FunctionalRenderContext的属性，并将其值设置为FunctionalRenderContext函数。

FunctionalRenderContext是一个SSR（服务端渲染）帮助程序，它提供了一种方式来创建一个函数式组件的上下文，该上下文可以在服务端和客户端之间共享。在Vue SSR中，通过使用FunctionalRenderContext可以避免某些常见的问题，例如误用this指针或在服务端触发异步行为。

这里将FunctionalRenderContext暴露出去，在需要使用它的时候可以直接从Vue对象中获取并使用它。
 */

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, "FunctionalRenderContext", {
  value: FunctionalRenderContext,
});

/**
在Vue的核心文件index.ts中，它首先导入了一些需要用到的模块和变量（比如config、initGlobalAPI等），然后定义了Vue类，并且通过给这个类增加一个静态属性version来表示当前Vue的版本号。

这里的代码：

```
Vue.version = version
```

是在将Vue的版本号赋值给Vue的静态属性version。在实际开发中，我们可以通过Vue.version来获取Vue的版本号信息，用于调试或其他用途。同时，Vue的版本号也可以帮助我们判断是否需要升级Vue，以便使用新的功能或修复已知的问题。
 */

Vue.version = version;

/**
首先，./dist/src/core/index.ts是Vue源码中的一个文件路径，它主要是用来导出Vue核心代码的。在这个文件中，通过export default Vue语句将Vue作为默认输出导出。

这意味着，当其他模块想要使用Vue时，只需要导入./dist/src/core/index.ts文件，就可以像下面这样使用：

```
import Vue from './dist/src/core/index.ts';

// 使用Vue去创建组件和实例
new Vue({
  el: '#app',
  data() {
    return {
      message: 'Hello world'
    }
  }
})
```

这里的Vue就是从./dist/src/core/index.ts文件中导入的，默认导出的Vue对象。通过这种方式，我们可以在整个应用程序中轻松地使用Vue，而不必担心Vue的实现细节。
 */

export default Vue;
