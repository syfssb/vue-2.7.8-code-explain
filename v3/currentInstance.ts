
/**
./dist/src/v3/currentInstance.ts文件的作用是保存当前运行时实例的引用，它是Vue 3.0版本中新增加的一个模块，主要用于跟踪当前正在运行的Vue实例，以便在创建组件、更新组件等操作中能够正确地获取到当前的实例。

在整个vue的src中，./dist/src/v3/currentInstance.ts文件与其他几个关键模块密切相关。例如，./dist/src/core/instance/index.ts文件中包含了Vue构造函数和Vue实例的定义，这些定义需要使用./dist/src/v3/currentInstance.ts文件中的currentInstance变量进行初始化。同时，在./dist/src/core/component.ts文件中也会使用到当前实例，通过currentInstance可以获取到当前组件实例的相关信息。

因此，./dist/src/v3/currentInstance.ts文件可以说是Vue 3.0版本中非常重要的一个模块，它在管理Vue实例和组件的生命周期、状态等方面都起到了关键作用。
 */
 



/**
在Vue的源码中，./dist/src/v3/currentInstance.ts文件中的import语句主要是为了引入Component类型。这个Component类型可以看作是Vue组件的一个抽象表示，它包含了组件的各种属性和方法。

通过引入Component类型，我们就可以在代码中使用这些属性和方法来操作Vue组件。例如，在组件实例化的过程中，就需要用到Component类型中定义的属性和方法来初始化组件的状态和生命周期钩子函数等。

总之，./dist/src/v3/currentInstance.ts文件中的import { Component } from 'types/component'语句主要是为了能够使用Component类型中定义的属性和方法来操作Vue组件。
 */
 
import { Component } from 'types/component'



/**
在Vue中，一个组件实例是指一个Vue组件的实例化对象。currentInstance是一个变量，用于存储当前活动的组件实例。具体来说，它被用来跟踪正在执行的钩子函数或渲染函数所属的组件实例。

该变量被声明为一个Component类型或null。如果没有组件实例在活动状态（例如，在创建根Vue实例之前），则变量将为null。一旦创建了一个组件实例，该变量将指向该组件实例。在组件内部及其子组件中，可以通过访问`this.$parent`属性来访问该组件实例。

需要注意的是，当前组件实例只在单个线程中处于活动状态，并且在同一时间只能有一个活动的组件实例。因此，该变量是一个全局变量，而不是每个组件实例的实例变量。
 */
 
export let currentInstance: Component | null = null



/**
在 Vue 3 中，我们通过`createApp`来创建应用实例，而在一个组件的生命周期中，我们可以通过`getCurrentInstance()`方法来获取当前组件的实例对象。

在 Vue 2 中，也有类似的方法`vm.$parent`和`vm.$root`来获取父级和根实例。为了兼容某些依赖于这些方法的库，Vue 3 中暴露了`getCurrentInstance()`方法，其返回值为一个包含组件代理对象的对象，或者为`null`。

需要注意的是，该方法只是为了向后兼容，并不建议在内部使用，推荐直接使用`currentInstance`来获取当前实例对象。同时，在函数声明时，需要手动添加类型声明，因为它依赖于 Vue 2 中已经手动编写的类型。
 */
 
/**
 * This is exposed for compatibility with v3 (e.g. some functions in VueUse
 * relies on it). Do not use this internally, just use `currentInstance`.
 *
 * @internal this function needs manual type declaration because it relies
 * on previously manually authored types from Vue 2
 */
export function getCurrentInstance(): { proxy: Component } | null {
  return currentInstance && { proxy: currentInstance }
}



/**
这段代码定义了一个名为`setCurrentInstance`的函数，用于设置当前组件实例对象。该函数接收一个参数，即当前的组件实例对象(vm)，如果没有传入参数，则默认为null。

在函数中，首先判断是否传入了组件实例对象，如果没有，则需要将之前保存的组件实例对象的作用域事件取消掉(currentInstance && currentInstance._scope.off())。

然后将传入的组件实例对象赋值给全局变量currentInstance。如果传入的组件实例对象不为null，则需要开启该组件实例对象的作用域事件(vm && vm._scope.on())。

该函数主要是用于记录当前活动的组件实例对象，以便在处理异步任务时能够正确地访问到当前组件实例的上下文信息。
 */
 
/**
 * @internal
 */
export function setCurrentInstance(vm: Component | null = null) {
  if (!vm) currentInstance && currentInstance._scope.off()
  currentInstance = vm
  vm && vm._scope.on()
}


