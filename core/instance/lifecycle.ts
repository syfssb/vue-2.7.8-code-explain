
/**
`./dist/src/core/instance/lifecycle.ts` 文件主要负责 Vue 实例的生命周期管理。它定义了 Vue 实例在不同阶段会被调用的一系列钩子函数，例如 `beforeCreate`, `created`, `beforeMount`, `mounted` 等等。

这些钩子函数会在 Vue 实例的不同生命周期阶段被依次调用，从而实现对应的功能。比如 `beforeCreate` 钩子函数可以用来初始化一些实例变量， `mounted` 钩子函数可以用来进行 DOM 操作等。

在整个 Vue 的 src 中，lifecycle.ts 文件是和 `init.js`、`state.js`、`events.js`、`render.js` 等文件紧密相关的。其中，`init.js` 主要用于初始化 Vue 实例，包括数据响应式处理、注入插件、初始化生命周期、事件等；`state.js` 主要用于实现 Vue 实例上的数据响应式系统；`events.js` 则负责实现 Vue 实例中的事件系统；`render.js` 则负责将模板编译成渲染函数等。

总结起来，lifecycle.ts 文件和其他文件一起构成了 Vue 实例的完整生命周期和核心功能实现，是 Vue 源码中非常重要的一个部分。
 */
 



/**
./dist/src/core/instance/lifecycle.ts文件主要是Vue的生命周期相关代码，包括组件实例化、更新、销毁等过程中需要执行的操作。该文件中import导入了一些其他模块和函数，这里简单解释一下它们的作用：

- import config from '../config': 导入Vue配置对象，包含全局配置信息。
- import Watcher, { WatcherOptions } from '../observer/watcher': 导入Watcher类和WatcherOptions接口，用于对数据变化进行监听，当数据发生变化时触发回调函数。
- import { mark, measure } from '../util/perf': 导入浏览器性能分析工具，用于在开发环境中对性能进行分析。
- import VNode, { createEmptyVNode } from '../vdom/vnode': 导入虚拟节点相关代码，用于构建虚拟DOM树。
- import { updateComponentListeners } from './events': 导入事件相关代码，用于管理组件事件的注册和移除。
- import { resolveSlots } from './render-helpers/resolve-slots': 导入渲染帮助函数，用于处理插槽内容。
- import { toggleObserving } from '../observer/index': 导入响应式系统相关代码，用于控制数据是否需要被监听。
- import { pushTarget, popTarget } from '../observer/dep': 导入Dep类相关代码，用于创建依赖收集器。

除此之外，该文件定义了一些常量和类型，包括：

- const activeInstance: null | Component = null: 定义一个全局变量activeInstance，用于记录当前活跃的组件实例。
- const queue: Array<Component> = []: 定义一个队列queue，用于存储需要更新的组件实例。
- interface QueueItem { id: number; fn: Function; }：定义一个接口类型QueueItem，包含id和fn两个属性。用于存储异步更新任务。

在该文件中还定义了一些方法和函数，包括：

- function lifecycleMixin(Vue: Class<Component>): void: 给Vue原型上添加了_init、$forceUpdate、$destroy等生命周期相关方法。
- function mountComponent(vm: Component, el?: Element, hydrating?: boolean): Component: 挂载组件实例到DOM上，并开始执行组件的生命周期函数。
- function updateChildComponent(vm: Component, propsData: ?Object, listeners: ?Object, parentVnode: MountedComponentVNode, renderChildren: ?Array<VNode>): boolean: 在父组件更新子组件时触发的函数，用于更新子组件的props和listeners等内容。
- function activateChildComponent(vm: Component, direct?: boolean): void: 激活子组件的生命周期函数。
- function deactivateChildComponent(vm: Component, direct?: boolean): void：停用子组件的生命周期函数。

以上是./dist/src/core/instance/lifecycle.ts中比较重要的部分，该文件的作用是提供组件的生命周期管理和事件机制，保证组件能够稳定地运行和处理用户输入和数据变化。
 */
 
import config from '../config'
import Watcher, { WatcherOptions } from '../observer/watcher'
import { mark, measure } from '../util/perf'
import VNode, { createEmptyVNode } from '../vdom/vnode'
import { updateComponentListeners } from './events'
import { resolveSlots } from './render-helpers/resolve-slots'
import { toggleObserving } from '../observer/index'
import { pushTarget, popTarget } from '../observer/dep'
import type { Component } from 'types/component'
import type { MountedComponentVNode } from 'types/vnode'



/**
该文件是Vue核心模块之一，主要包含Vue实例的生命周期相关方法。

这里引入了一些工具函数和 Vue 的内部模块：

1. `warn`：警告日志输出函数。
2. `noop`：一个空的函数，用于占位或者默认值。
3. `remove`：从数组或对象中删除对应元素或属性的方法。
4. `emptyObject`：一个空对象。
5. `validateProp`：验证组件 prop 的合法性。
6. `invokeWithErrorHandling`：调用带错误处理的函数。

另外还引入了以下两个模块：

1. `currentInstance` 和 `setCurrentInstance` 这两个函数定义在 `v3/currentInstance` 模块中，用于获取或设置当前正在执行的组件实例。
2. `syncSetupProxy` 定义在 `v3/apiSetup` 模块中，用于同步组件的 props、data 和属性等。
 */
 
import {
  warn,
  noop,
  remove,
  emptyObject,
  validateProp,
  invokeWithErrorHandling
} from '../util/index'
import { currentInstance, setCurrentInstance } from 'v3/currentInstance'
import { syncSetupProxy } from 'v3/apiSetup'



/**
在 Vue.js 中，活动实例（Active Instance）指的是当前正在执行的实例。在组件的生命周期函数中，Vue.js 会将当前组件实例作为活动实例来进行操作。

lifecycle.ts 文件中定义了两个全局变量：

1. activeInstance：表示当前正在执行的组件实例。在组件的初始化、更新等过程中，Vue.js 会将当前组件实例赋值给该变量，以方便其他模块调用。

2. isUpdatingChildComponent：表示是否正在更新子组件。在组件更新期间，如果有子组件需要重新渲染，则会将该变量设置为 true，以避免重复更新子组件。

这些变量的定义和使用都非常关键，它们帮助 Vue.js 实现了组件化开发模式中的一些核心特性，如组件嵌套、数据传递和事件机制等。
 */
 
export let activeInstance: any = null
export let isUpdatingChildComponent: boolean = false



/**
这段代码定义了一个名为`setActiveInstance`的函数，该函数接收一个`vm`参数，表示Vue实例。在函数内部，首先保存了当前激活的Vue实例，然后将`activeInstance`变量设置为传入的Vue实例，最后返回一个函数。

这个返回的函数会在组件更新完成后被调用，它会将`activeInstance`重新设置为之前保存的值，以确保下一次组件更新时使用的是正确的激活实例。这样做的原因是，在组件更新期间，Vue会将当前实例设置为活动实例，以便在运行期间进行许多操作，例如检测变更，计算属性等。因此，如果不恢复先前的激活实例，则可能会导致意外的行为或错误。
 */
 
export function setActiveInstance(vm: Component) {
  const prevActiveInstance = activeInstance
  activeInstance = vm
  return () => {
    activeInstance = prevActiveInstance
  }
}



/**
在Vue框架中，一个Vue实例的生命周期非常重要。在初始化Vue实例时，Vue会调用`initLifecycle`方法来为该实例设置一些基础属性和其他生命周期相关的数据。

`initLifecycle`函数接收一个Vue组件实例`vm`作为参数，并从该实例上获取它的配置选项`options`。

这个`options`对象包含了Vue实例的所有选项。例如，`data`、`methods`、`computed`、`watch`等都是`options`对象的属性。在Vue实例的生命周期中，这些选项会被用来创建响应式数据、挂载组件、执行计算属性等操作。

因此，在`initLifecycle`函数中获取`options`的目的是为了在后续的生命周期中使用这些选项。同时，Vue还会对`options`进行一些处理，例如将`props`转化成响应式数据，将`computed`和`watch`转化成相应的getter和setter等。

总之，`initLifecycle`函数是初始化Vue实例的重要一步，它为Vue实例准备了必要的生命周期数据，并进行了一些预处理，确保后续的生命周期能够正常运行。
 */
 
export function initLifecycle(vm: Component) {
  const options = vm.$options



/**
这段代码实现了在创建Vue实例时，将当前实例添加到父级Vue实例的子组件列表中。

首先，获取传入的 Vue 实例的选项对象 `options` 中的 `parent` 选项，该选项指定了该实例的父级 Vue 实例。如果存在父级实例且当前实例不是抽象组件，则继续执行以下操作：

使用一个循环来查找离当前实例最近的非抽象父级实例，即找到第一个 `!$options.abstract` 的祖先实例。这里的 `$options.abstract` 表示该组件是否是抽象组件，即只用于提供给其他组件继承而不会渲染任何内容的组件。

找到目标父级实例后，将当前实例 `vm` 添加到其 `$children` 数组中，以便在父组件销毁时能够递归地销毁它的所有子组件。

需要注意的是，由于模板中的组件可能没有显式地指定父级组件，因此父级实例最初可能为 `null` 或 `undefined`。在这种情况下，将不执行以上的操作，因为没有父级实例对应的 `$children` 数组可以添加子组件。
 */
 
  // locate first non-abstract parent
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }



/**
在 Vue 中，每个组件实例都有一个 `$parent` 属性和一个 `$root` 属性。这两个属性主要用于组件之间的通信。

`vm.$parent` 指向当前组件的父组件，如果当前组件没有父组件，则该属性为 `null`。

`vm.$root` 指向当前组件所在的根组件实例。如果当前组件没有父组件，则该属性指向自身，即 `vm.$root = vm`。

在 `./dist/src/core/instance/lifecycle.ts` 中，这两个属性是在组件实例化时被赋值的。`vm.$parent = parent` 表示将父组件实例传递给当前组件实例，从而建立两者之间的关系。`vm.$root = parent ? parent.$root : vm` 则表示如果当前组件有父组件，则将 `$root` 属性指向父组件的 `$root` 属性；否则将 `$root` 属性指向自身。
 */
 
  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm



/**
在Vue的生命周期中，当一个组件实例被创建时，它会执行一系列的初始化操作。其中就包括对 `vm.$children` 和 `vm.$refs` 的初始化。

`vm.$children` 是在 `Vue` 实例化时创建的数组，用来存储该组件下的所有子组件实例。这个数组是通过 `initLifecycle(vm)` 函数进行初始化的。在这个函数中，会检查当前组件是否具有子组件，并将子组件推入到 `$children` 数组中。如果没有子组件，则 `$children` 将为空数组。

`vm.$refs` 是用来存储组件上使用 `ref` 属性定义的所有子组件或 DOM 元素的引用。也是在 `initLifecycle(vm)` 函数中初始化的。`$refs` 对象的 key 就是 `ref` 属性的值，而 value 则是该子组件或 DOM 元素的引用。

需要注意的是，这两个属性都是为了方便我们在父组件内访问子组件或 DOM 元素。在 Vue 中，父组件可以通过 `$children` 数组和 `$refs` 对象来访问子组件实例和 DOM 元素，从而完成相应的交互逻辑。
 */
 
  vm.$children = []
  vm.$refs = {}



/**
这段代码是 Vue 中一个组件实例化后的生命周期钩子函数 `created` 的实现。其中，这些属性都是在组件实例化时被初始化的。

1. `vm._provided` 是一个对象，用来存储当前组件中注入的依赖，也就是父组件传递给子组件的数据。如果有父组件，则从父组件中继承 `_provided`；否则创建一个新的空的 `_provided` 对象。

2. `vm._watcher` 是用来监听并响应数据变化的一个观察者对象。这个属性会在之后的组件更新周期（update）中被初始化和使用。

3. `vm._inactive` 是一个标志位，用来记录当前组件是否处于非活跃状态。这个属性会在之后的组件激活周期（activated）中被使用。

4. `vm._directInactive` 是一个标志位，用来记录当前组件是否直接处于非活跃状态，即不包括其子组件的非活跃状态。这个属性会在之后的组件激活周期（activated）中被使用。

5. `vm._isMounted` 是一个标志位，用来记录当前组件是否已挂载。这个属性会在之后的组件挂载周期（mounted）中被使用。

6. `vm._isDestroyed` 是一个标志位，用来记录当前组件是否已销毁。这个属性会在之后的组件销毁周期（destroyed）中被使用。

7. `vm._isBeingDestroyed` 是一个标志位，用来记录当前组件是否正在销毁。这个属性会在之后的组件销毁周期（beforeDestroy 和 destroyed）中被使用。

这些属性的定义和初始化都是在组件实例化时进行的，而它们的具体作用和使用则需要在后续的组件生命周期中进行理解和掌握。
 */
 
  vm._provided = parent ? parent._provided : Object.create(null)
  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}



/**
这段代码是Vue的生命周期 mixin，定义了 Vue 实例的 _update 方法。当一个组件实例被挂载时（或更新时），Vue 会调用该方法进行 DOM 更新。

该方法接受两个参数：第一个参数是要渲染的新虚拟节点 vnode，第二个参数是一个可选的布尔值 hydrating，表示是否启用服务端渲染。该方法主要执行以下几个步骤：

1. 获取当前 Vue 实例 vm，并记录其上一次的 $el 和 _vnode 属性；
2. 设置当前 Vue 实例的 _vnode 属性为传入的 vnode；
3. 调用 Vue 的 patch 方法来更新 DOM；
4. 恢复当前实例 vm 的激活状态 setActiveInstance；
5. 更新 __vue__ 引用；
6. 如果当前实例有 $parent，且其 $vnode 等于父级实例的 _vnode，就将 $el 设置为父级实例的 $el；
7. 调用 updated 钩子函数以确保在父级的 updated 钩子函数中更新子节点。

总的来说，该方法是 Vue 实例的重要方法之一，负责将虚拟 DOM 转换成真正的 DOM，并完成 DOM 的插入、删除和更新操作。
 */
 
export function lifecycleMixin(Vue: typeof Component) {
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const restoreActiveInstance = setActiveInstance(vm)
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    restoreActiveInstance()
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  }



/**
这段代码是在 Vue 的原型上挂载了 $forceUpdate 方法，用于强制更新组件。当数据发生改变时，Vue 会自动更新视图，但有些情况下我们需要手动触发更新，比如使用了一些非响应式的数据或者手动修改了一些组件内部的状态。这时就可以调用 $forceUpdate 来强制更新。

具体实现中，首先获取当前的 Vue 实例，并判断其是否拥有 _watcher 属性（Watcher 是一个负责监听数据变化并执行回调函数的对象）。如果有，则通过调用 _watcher.update() 方法来触发更新。最终目的是重新渲染组件，使其与最新的数据保持同步。
 */
 
  Vue.prototype.$forceUpdate = function () {
    const vm: Component = this
    if (vm._watcher) {
      vm._watcher.update()
    }
  }



/**
这段代码是Vue.js实例的销毁方法，主要作用是将一个组件销毁，并且清除掉相关的内存、事件等资源。具体函数逻辑如下：

1. 首先判断实例是否已经正在被销毁中（通过_isBeingDestroyed属性），如果是则直接返回。
2. 触发beforeDestroy生命周期钩子函数。
3. 将_isBeingDestroyed设为true，表示该实例正在被销毁。
4. 如果该实例存在父组件，并且其父组件未被销毁，同时该实例不是抽象组件，则从其父组件的$children数组中删除该实例。
5. 停止所有scope中的watcher并移除observer监听，以及减少data ob的vmCount值。
6. 将_isDestroyed设为true，表示该实例已经被销毁。
7. 通过__patch__方法将该实例的虚拟DOM节点与null进行比较，进而移除该实例所创建的所有DOM节点并释放相应的事件监听器和其他资源。
8. 触发destroyed生命周期钩子函数。
9. 关闭该实例所有的事件监听器。
10. 移除该实例的$el上面绑定的__vue__引用。
11. 最后，如果该实例存在$vnode节点，则将其父级节点设为null，以释放对其的引用。

需要注意的是，在这个过程中，Vue.js会自动递归地销毁实例的子组件，所以开发者不需要手动处理。
 */
 
  Vue.prototype.$destroy = function () {
    const vm: Component = this
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy')
    vm._isBeingDestroyed = true
    // remove self from parent
    const parent = vm.$parent
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm)
    }
    // teardown scope. this includes both the render watcher and other
    // watchers created
    vm._scope.stop()
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--
    }
    // call the last hook...
    vm._isDestroyed = true
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null)
    // fire destroyed hook
    callHook(vm, 'destroyed')
    // turn off all instance listeners.
    vm.$off()
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
      vm.$vnode.parent = null
    }
  }
}



/**
这段代码的作用是将组件实例挂载到DOM元素上。

首先，将传入的DOM元素赋值给组件实例的$el属性。如果组件实例没有定义render函数，则将其赋值为一个空的虚拟节点。如果当前环境为开发环境，且组件实例的$options中缺少template或render函数，则会发出警告。

接着，调用组件的beforeMount生命周期钩子函数。

总体来说，这个函数的作用是准备好组件实例，使其可以被渲染到页面上。
 */
 
export function mountComponent(
  vm: Component,
  el: Element | null | undefined,
  hydrating?: boolean
): Component {
  vm.$el = el
  if (!vm.$options.render) {
    // @ts-expect-error invalid type
    vm.$options.render = createEmptyVNode
    if (__DEV__) {
      /* istanbul ignore if */
      if (
        (vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el ||
        el
      ) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
            'compiler is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }
  callHook(vm, 'beforeMount')



/**
在Vue的生命周期中，当组件需要更新时，会执行一段名为 `updateComponent` 的逻辑。这段逻辑主要是用于性能统计和调试，代码的作用是在控制台输出组件名称和渲染时间等信息。

首先，这段代码声明了一个变量 `updateComponent`，用于存储后面的函数。然后通过判断当前是否处于开发环境、是否启用了性能统计以及是否存在性能标记（即浏览器 Devtools 中的 Performance 标记）来确定是否需要执行这段逻辑。

如果以上条件都满足，就会生成一个名为 `updateComponent` 的函数。这个函数中，首先获取当前组件的名称和 ID，然后在浏览器中打上两个标记：`vue-perf-start:${id}` 和 `vue-perf-end:${id}`。这样，在浏览器 Devtools 的 Performance 标签页中，可以看到组件渲染所花费的时间。

值得注意的是，在实际的生产环境中，由于性能测试可能会对系统造成一些负担，因此默认情况下 Vue 并不会开启这个功能。只有在开发环境中，并且手动设置了 `config.performance` 属性为 true，才会执行这段逻辑。
 */
 
  let updateComponent
  /* istanbul ignore if */
  if (__DEV__ && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`



/**
在Vue的生命周期中，这段代码位于实例化阶段的mountComponent方法中。

mark(startTag)用于记录当前时间，作为开始时间点。接着，调用vm._render()方法，该方法会根据组件的模板来创建组件的虚拟节点(VNode)。VNode是一个轻量级的JavaScript对象，代表了组件的结构信息和状态。_render()方法内部通过调用组件的render函数来生成VNode。这里需要注意的是，由于Vue采用了异步渲染机制，在第一次执行_render()时并不会立即返回VNode，而是先缓存VNode生成的过程，在下一次组件更新时再获取已经生成好的VNode。

mark(endTag)用于记录当前时间，作为结束时间点。measure(`vue ${name} render`, startTag, endTag)则是将"vue {组件名} render"以及开始时间点和结束时间点传入measure方法中进行计时统计。

总之，这段代码的作用是在组件实例化时记录组件的渲染时间。
 */
 
      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} render`, startTag, endTag)



/**
./dist/src/core/instance/lifecycle.ts是Vue实例的生命周期相关代码，其中包含了一些关键函数和方法。具体来说：

1. `mark(startTag)` 和 `mark(endTag)` 函数用于在性能检测中标记一个时间戳，并记录一个标签名。这个时间戳将被传递给 `measure` 函数。

2. `vm._update(vnode, hydrating)` 函数是 Vue 实例的更新函数，用于将虚拟节点渲染成真实的 DOM，并将其插入到正确的位置。

3. 在组件首次挂载时，会执行 `updatedComponent` 函数，它会先调用 `vm._render()` 方法生成虚拟节点，再交给 `_update` 函数处理。而在组件更新时，则直接执行 `updateComponent` 函数，跳过了渲染阶段的 `vm._render()` 方法。

4. 最后的 `measure(`vue ${name} patch`, startTag, endTag)` 函数根据前面标记的两个时间戳计算出这段代码的执行时间，并打印出来。其中 `${name}` 是组件名称，表示这段代码是属于哪个组件的。
 */
 
      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }



/**
这段代码定义了一个 `watcherOptions` 对象，它是在实例化 `Watcher` 对象时的选项，用于监听数据变化并执行相应的回调函数。这里指定了 `before` 选项，表示在更新前执行一个函数。 

这个函数中，首先判断实例 `vm` 是否已经挂载且未销毁，如果是，则调用 `callHook(vm, 'beforeUpdate')` 函数执行组件实例上的 `beforeUpdate` 钩子函数。

`beforeUpdate` 钩子函数会在组件更新之前被调用，此时组件还没有重新渲染，该钩子函数可以用来做一些准备工作或者获取最新的数据等操作。 

总之，这段代码的作用是在组件更新前执行 `beforeUpdate` 钩子函数，并且只有在组件已经挂载且未销毁时才会触发。
 */
 
  const watcherOptions: WatcherOptions = {
    before() {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }



/**
这段代码的作用是在开发环境下，为 Vue 的渲染函数添加两个事件回调函数：`renderTracked` 和 `renderTriggered`。

具体来说，当一个渲染函数中的响应式数据被访问时，会触发 `renderTracked` 事件回调函数；当一个响应式数据被修改时，会触发 `renderTriggered` 事件回调函数。

这个功能主要是为了辅助开发者进行性能优化和调试。通过这两个事件回调函数，开发者可以收集一些渲染过程中的数据并进行分析。例如，可以根据 `renderTracked` 收集到的数据来判断哪些响应式数据被频繁地访问，从而考虑使用计算属性或缓存数据等方法来优化性能。

需要注意的是，这个功能只在开发环境下起作用，生产环境下不会添加这两个事件回调函数。这是因为在生产环境下，Vue 的渲染函数会被编译为纯 JavaScript 函数，不需要添加额外的事件回调函数。
 */
 
  if (__DEV__) {
    watcherOptions.onTrack = e => callHook(vm, 'renderTracked', [e])
    watcherOptions.onTrigger = e => callHook(vm, 'renderTriggered', [e])
  }



/**
这段代码主要是在Vue实例初始化的生命周期中，创建一个Watcher对象，并将其作为Vue实例的_watcher属性进行设置。这个Watcher对象主要用来观察Vue实例中数据的变化，从而在数据发生变化时执行相应的回调函数进行更新操作。

其中，Watcher对象的构造函数接受五个参数：第一个参数是Vue实例本身，第二个参数是观察者的回调函数，在这里就是updateComponent函数；第三个参数是空函数noop，表示没有渲染函数；第四个参数是Watcher选项对象，包括一些观察者的配置选项；第五个参数是一个布尔值，表示是否是渲染观察者。由于这个Watcher对象是用于渲染观察者，因此isRenderWatcher属性被设置为true。

在这个过程中，还有一个hydrating变量被设置为false，用来表示Vue实例初始化过程中是否处于服务端渲染的状态。如果是服务端渲染，则会将这个变量设置为true，否则为false。
 */
 
  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(
    vm,
    updateComponent,
    noop,
    watcherOptions,
    true /* isRenderWatcher */
  )
  hydrating = false



/**
在Vue中，Watcher（观察者）是实现响应式的核心。当数据发生变化时，Vue会通知对应的Watcher去更新视图。

在Lifecycle中，有一个特殊的Watcher叫做“preWatcher”。这个Watcher用来处理在组件render函数执行前收集到的依赖项（也就是用户定义的watcher），并且在render函数执行前执行这些preWatcher。这些preWatcher的作用是确保渲染之前所有的数据都已经被计算好了。

上述代码片段的含义是：如果存在preWatcher，则遍历preWatcher数组，逐个执行其run方法（该方法用于计算当前Watcher的值并更新其依赖项）。这样可以确保在执行组件render函数时，所有preWatcher所依赖的数据都已经被计算好了，从而避免了由于数据没有被计算好而导致的渲染错误或性能问题。
 */
 
  // flush buffer for flush: "pre" watchers queued in setup()
  const preWatchers = vm._preWatchers
  if (preWatchers) {
    for (let i = 0; i < preWatchers.length; i++) {
      preWatchers[i].run()
    }
  }



/**
这段代码的作用是手动挂载 Vue 实例，并触发实例的 `mounted` 生命周期钩子函数。 

首先，判断该实例的 `$vnode` 是否为 null。 `$vnode` 是一个指向父虚拟节点的引用，在组件渲染时会被设置。如果 `$vnode` 为 null，说明该实例为非组件实例或者该组件未被渲染，则将 `_isMounted` 属性设置为 true，并且调用 `callHook` 函数执行实例的 `mounted` 生命周期钩子函数。

在 Vue 的生命周期中，mounted 钩子函数在实例挂载后调用，可以进行 DOM 操作、数据初始化等操作。这段代码的作用是手动触发 mounted 钩子函数，以便在实例没有被组件渲染时也能执行相关的操作。

最后返回 Vue 实例。
 */
 
  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}



/**
这段代码主要是定义了一个名为`updateChildComponent`的函数，该函数用于更新子组件。

`updateChildComponent`函数接收5个参数：
- `vm`：表示当前Vue实例
- `propsData`：表示传递给子组件的props数据
- `listeners`：表示传递给子组件的事件监听器
- `parentVnode`：表示父级VNode节点
- `renderChildren`：表示子组件的虚拟DOM节点数组

这里需要注意的是，如果开启了开发模式（__DEV__），则会将`isUpdatingChildComponent`设置为true，以便在调试时能够追踪更新子组件的操作。
 */
 
export function updateChildComponent(
  vm: Component,
  propsData: Record<string, any> | null | undefined,
  listeners: Record<string, Function | Array<Function>> | undefined,
  parentVnode: MountedComponentVNode,
  renderChildren?: Array<VNode> | null
) {
  if (__DEV__) {
    isUpdatingChildComponent = true
  }



/**
在Vue中，一个组件可以拥有插槽（slot）子节点，这些子节点可以在组件被渲染时动态地被填充。在 `lifecycle.ts` 中，Vue 的代码需要确定当前组件是否具有插槽子节点，这是因为在渲染组件之前，Vue 将要重写 `$options._renderChildren`，以便正确处理插槽内容。

通过判断组件是否具有插槽子节点，Vue 可以决定是否需要进行特殊处理，以确保插槽内容能够正确地注入到组件的模板中。因此，在更改 `$options._renderChildren` 之前，需要先检查组件是否具有插槽子节点。
 */
 
  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren.



/**
这段代码主要是用来检查是否存在动态作用域插槽。在 Vue 中，插槽（slot）可以分为普通插槽和作用域插槽两种。普通插槽只需要传入具名插槽名称即可，在父组件中使用 v-slot 或者 slot-scope 指令来进行绑定。而作用域插槽除了传入名称外，还可以传入一些数据，这些数据可以在子组件中使用 $slotProps 来获取。 

在这段代码中，首先获取了 parentVnode.data.scopedSlots 和 vm.$scopedSlots 两个变量。其中，parentVnode 是父级虚拟节点，vm 则是当前组件实例。然后通过判断是否存在动态作用域插槽来更新 newScopedSlots 变量，并根据 newScopedSlots 和 oldScopedSlots 的值来确定是否发生了变化。最后返回 hasDynamicScopedSlot 变量。

需要注意的是，$stable 是一个标记，表示当前作用域插槽是否是静态的。如果一个作用域插槽是静态的，则它的内容不会发生变化，因此不需要重新渲染。如果是动态的，则可能会被多次渲染。因此，Vue 在检测到动态作用域插槽时，会对其进行特殊处理，以保证性能。
 */
 
  // check if there are dynamic scopedSlots (hand-written or compiled but with
  // dynamic slot names). Static scoped slots compiled from template has the
  // "$stable" marker.
  const newScopedSlots = parentVnode.data.scopedSlots
  const oldScopedSlots = vm.$scopedSlots
  const hasDynamicScopedSlot = !!(
    (newScopedSlots && !newScopedSlots.$stable) ||
    (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
    (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key) ||
    (!newScopedSlots && vm.$scopedSlots.$key)
  )



/**
在Vue的生命周期中，每个组件都有一个父组件和子组件。其中，父组件可以通过插槽（slot）的方式向子组件传递数据或者模板代码。在组件更新的过程中，父组件的静态插槽可能会发生变化，而动态作用域插槽也有可能发生变化。这时候，需要进行强制更新以确保组件的正确性。

上面提到的`needsForceUpdate`就是为了判断是否需要进行强制更新。首先，如果`renderChildren`存在，则说明有新的静态插槽；其次，如果`vm.$options._renderChildren`存在，则说明旧的静态插槽也有可能发生变化；最后，如果有动态作用域插槽（即`hasDynamicScopedSlot`为真），也需要进行强制更新。

简言之，这段代码的作用是判断当前组件是否需要进行强制更新，以确保组件的正确性。
 */
 
  // Any static slot children from the parent may have changed during parent's
  // update. Dynamic scoped slots may also have changed. In such cases, a forced
  // update is necessary to ensure correctness.
  let needsForceUpdate = !!(
    renderChildren || // has new static slots
    vm.$options._renderChildren || // has old static slots
    hasDynamicScopedSlot
  )



/**
在Vue的生命周期中，组件的渲染过程会生成虚拟DOM(Virtual DOM)，这个虚拟DOM可以用来更新组件的视图。在这段代码中，有三行代码：

```javascript
const prevVNode = vm.$vnode //获取当前组件渲染的虚拟节点
vm.$options._parentVnode = parentVnode //设置当前组件的父虚拟节点为传入的parentVnode
vm.$vnode = parentVnode //将当前组件渲染的虚拟节点设置为传入的parentVnode
```

这里是在组件的挂载(mounting)和更新(updating)过程中，将当前实例(vm)的$vnode属性指向传入的parentVnode。$vnode是一个对象，包含了当前渲染组件的占位符节点信息，而parentVnode则是该组件的父级虚拟节点。

通过这些操作，Vue可以在不重新渲染整个组件的情况下，更新组件的占位符节点信息。这样，当父组件重新渲染时，子组件的占位符节点信息也会被更新。这种方式可以提高性能，因为不需要重新渲染整个组件，只需要更新占位符节点即可。
 */
 
  const prevVNode = vm.$vnode
  vm.$options._parentVnode = parentVnode
  vm.$vnode = parentVnode // update vm's placeholder node without re-render



/**
在 Vue 中，每个组件都会对应一个虚拟节点（vnode），用来描述组件的结构和状态等信息。在组件渲染时，Vue 会通过调用 `_render` 方法生成虚拟节点树，并通过 `update` 方法将虚拟节点渲染成真实 DOM。

在上面的代码中，我们可以看到以下两行代码：

```javascript
if (vm._vnode) {
  // update child tree's parent
  vm._vnode.parent = parentVnode
}
```

这里的意思是，如果组件已经存在一个父级 vnode（即 `_vnode` 存在），则需要更新该组件子树的父级 vnode 为指定的 `parentVnode`。这是因为在组件树的渲染过程中，父级 vnode 对于子组件的运作非常重要。

接下来的代码：

```javascript
vm.$options._renderChildren = renderChildren
```

这里的作用是将当前组件的子节点存储到 `$options._renderChildren` 属性中，以便后续在组件更新时使用。这是因为在组件更新时，可能需要重新渲染子节点，而这个过程需要使用 `$options._renderChildren` 属性中存储的子节点信息。
 */
 
  if (vm._vnode) {
    // update child tree's parent
    vm._vnode.parent = parentVnode
  }
  vm.$options._renderChildren = renderChildren



/**
这段代码的作用是更新父组件传递给子组件的属性和事件监听器。在这里，我们首先获取了父级虚拟节点（parentVnode）中的属性（attrs），如果没有则使用空对象（emptyObject）。接下来，我们检查是否存在_attrsProxy属性，如果存在，则说明该组件需要代理它的属性（$attrs）并跟踪它们的变化。如果attrs被修改，则会触发组件的重新渲染。

如果vue组件实现了响应式，那么当子组件访问其父组件的attrs时，也会引起子组件的更新。因此，我们需要确保每个子组件都具有最新的attrs。因此，我们将父组件的attrs赋值给vm.$attrs，以便在子组件中使用。

需要注意的是，如果在同一组件实例中多次访问attrs，并且它们的值发生了变化，则必须使用forceUpdate()来强制更新该组件。因此，我们需要在这里设置needsForceUpdate标志以通知Vue进行强制更新。
 */
 
  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  const attrs = parentVnode.data.attrs || emptyObject
  if (vm._attrsProxy) {
    // force update if attrs are accessed and has changed since it may be
    // passed to a child component.
    if (
      syncSetupProxy(
        vm._attrsProxy,
        attrs,
        (prevVNode.data && prevVNode.data.attrs) || emptyObject,
        vm,
        '$attrs'
      )
    ) {
      needsForceUpdate = true
    }
  }
  vm.$attrs = attrs



/**
这段代码主要是关于Vue组件生命周期中的“更新”阶段的处理。在这个阶段中，Vue会首先更新组件实例上的监听器，即事件监听器。下面我们来逐行分析一下这段代码。

首先，“listeners = listeners || emptyObject”这行代码是为了确保listeners对象有值。如果listeners没有被定义，则将其赋值为空对象。

然后，“const prevListeners = vm.$options._parentListeners”这行代码是用来获取之前父组件中的监听器，作为之后对比变化的依据。

接着，“if (vm._listenersProxy)”这个判断语句表示当前组件是否使用了事件代理。如果是，则会调用syncSetupProxy方法来将新旧监听器同步到代理对象中。

“vm.$listeners = vm.$options._parentListeners = listeners”这行代码是将组件实例上的监听器与其父组件上的监听器进行合并，并将其挂载到vm.$listeners和vm.$options._parentListeners上。

最后，“updateComponentListeners(vm, listeners, prevListeners)”是一个封装了更新监听器的方法，它会比较新旧监听器的不同，进行相应地添加、删除和更新操作。
 */
 
  // update listeners
  listeners = listeners || emptyObject
  const prevListeners = vm.$options._parentListeners
  if (vm._listenersProxy) {
    syncSetupProxy(
      vm._listenersProxy,
      listeners,
      prevListeners || emptyObject,
      vm,
      '$listeners'
    )
  }
  vm.$listeners = vm.$options._parentListeners = listeners
  updateComponentListeners(vm, listeners, prevListeners)



/**
这段代码是Vue实例在执行生命周期中的beforeCreate钩子时，用于更新实例的props的。具体来说，它做了以下几件事情：

1. 判断是否存在propsData并且当前组件有定义props选项。

2. 如果有props选项，则先调用toggleObserving(false)来禁止对响应式属性进行依赖收集，以提高性能。

3. 获取vm._props对象，这个对象是响应式的，并且保存了组件实例上定义的所有prop属性和它们的值。

4. 获取vm.$options._propKeys数组，该数组保存了所有已定义props的key。

5. 遍历_propKeys数组，对每一个prop属性都调用validateProp函数来校验和转换值，并将结果保存到_props对象中。

6. 最后再调用toggleObserving(true)来重新启用响应式属性的依赖收集。

7. 将propsData保存到vm.$options.propsData中，以备后续使用。

总的来说，这段代码主要是用来处理组件的props属性的，把外部传入的props数据，进行校验、转化，并赋值给响应式的_props对象。
 */
 
  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false)
    const props = vm._props
    const propKeys = vm.$options._propKeys || []
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i]
      const propOptions: any = vm.$options.props // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm)
    }
    toggleObserving(true)
    // keep a copy of raw propsData
    vm.$options.propsData = propsData
  }



/**
在Vue的生命周期中，有一个阶段叫做“挂载阶段”，在这个阶段，Vue会通过虚拟DOM将组件渲染到真实的DOM上。在这个阶段，如果一个组件有子组件，那么子组件也会被渲染。而在渲染子组件的过程中，父组件可能需要更新一些数据，以便正确地渲染子组件。

上述代码片段的作用就是，在父组件渲染子组件之前，检查子组件是否有提供插槽（slot），如果有，则将其解析并保存到vm.$slots中，并强制更新（调用vm.$forceUpdate()）以确保父组件能够正确地渲染子组件。

需要注意的是，只有当子组件存在插槽时，才执行这个逻辑，否则不会触发强制更新。这样可以避免无意义的性能损耗。
 */
 
  // resolve slots + force update if has children
  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context)
    vm.$forceUpdate()
  }



/**
在Vue源码中，开发模式下会定义全局变量 `__DEV__`，用来标识当前是否处于开发模式。在你所提到的代码片段中，当 `__DEV__` 为真时，将 `isUpdatingChildComponent` 设置为 `false`。

`isUpdatingChildComponent` 是一个标志位，用来标识当前是否正在更新子组件。在 Vue 组件渲染过程中，如果组件有子组件，那么子组件也需要进行重新渲染，这个过程就是更新子组件。在子组件更新过程中，会先执行父组件的 `beforeUpdate` 钩子函数，然后执行子组件的 `beforeUpdate` 钩子函数，接着执行子组件的更新操作，最后再执行父组件的 `updated` 钩子函数和子组件的 `updated` 钩子函数。

在子组件更新过程中，我们需要对 `isUpdatingChildComponent` 进行一些特殊的处理，以确保组件更新的正确性。具体来说，我们需要将 `isUpdatingChildComponent` 设置为 `true`，以表示当前正在更新子组件。如果不特殊处理，可能会导致在子组件更新的过程中，父组件的 `beforeUpdate` 和 `updated` 钩子函数被触发多次。

因此，在更新完子组件后，需要将 `isUpdatingChildComponent` 设置为 `false`，以表示子组件的更新过程已经结束。这样做的目的是为了确保父组件的 `beforeUpdate` 和 `updated` 钩子函数能够在正确的时间被触发。
 */
 
  if (__DEV__) {
    isUpdatingChildComponent = false
  }
}



/**
这个函数的作用是检查当前的组件实例是否处于非活动（inactive）状态的树中。在Vue中，当一个组件被激活时，它会被添加到一个活动（active）状态的树中，当组件不再激活时，它会从活动状态的树中移除，并且添加到非活动状态的树中。

在这个函数中，我们通过遍历当前组件的父级来检查它是否处于非活动状态的树中。如果找到一个父级组件处于非活动状态，则返回 true，否则返回 false。

此函数通常用于判断当前组件是否需要更新其子组件，因为如果当前组件处于非活动状态的树中，它的子组件也不会被渲染和更新。
 */
 
function isInInactiveTree(vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) return true
  }
  return false
}



/**
这段代码是Vue组件激活函数的实现，主要作用是将一个处于非激活状态的组件及其所有子孙组件激活。下面是对这段代码的详细解释：

1. `activateChildComponent` 函数接收一个 Vue 实例 `vm` 和一个布尔值 `direct`，表示是否直接激活该组件。
2. 如果 `direct` 为 true，则将 `_directInactive` 属性置为 false，如果该组件处于非激活树中则直接返回，否则继续执行后续逻辑。
3. 如果 `direct` 为 false 并且 `_directInactive` 为 true，则直接返回。这个条件的作用是避免重复激活已经激活过的组件。
4. 如果 `vm._inactive` 为 true 或者为 null，则将其置为 false，并递归激活所有子组件。
5. 最后调用 `callHook` 函数触发组件的 `activated` 钩子函数。

总体来说，该函数的作用是将处于非激活状态的组件以及其所有子孙组件都激活，并触发 `activated` 钩子函数。这个函数常常会在组件被动态添加或者显示时被调用，是 Vue 组件生命周期的关键部分之一。
 */
 
export function activateChildComponent(vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = false
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i])
    }
    callHook(vm, 'activated')
  }
}



/**
该函数是Vue组件生命周期中的一个重要钩子，在组件失活时被调用。其中，传入了一个名为vm的组件实例对象和一个名为direct的可选参数。

函数首先判断是否需要直接标记该组件实例对象为不活跃状态（即_directInactive属性值为true）。如果直接标记且该组件实例对象已经在不活跃树中，则直接返回；否则，将该组件实例对象标记为不活跃状态（即_inactive属性值为true）。

如果组件实例对象不处于不活跃状态，则遍历其所有子组件实例对象并递归执行deactivateChildComponent函数。最后，调用callHook函数触发该组件实例对象的deactivated生命周期钩子函数。

总体来说，该函数的作用是将组件及其子组件置为不活跃状态，并触发相应的生命周期钩子函数。
 */
 
export function deactivateChildComponent(vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = true
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i])
    }
    callHook(vm, 'deactivated')
  }
}



/**
这个函数是Vue组件生命周期钩子的调用函数。它接受四个参数：vm，hook，args和setContext。

- vm: Component 是一个Vue实例对象
- hook: string 是一个字符串，表示生命周期钩子的名称（如"created"、"mounted"等）
- args?: any[] 是可选的，表示传递给生命周期钩子的参数数组
- setContext = true 是一个布尔值，表示是否在执行生命周期钩子时将当前实例设置为上下文

这个函数主要做了以下几件事情：

1. 禁用依赖收集器（disable dep collection when invoking lifecycle hooks）。
2. 保存当前实例对象并将其设置为当前实例（setCurrentInstance(vm)）。
3. 获取当前实例对象的生命周期钩子函数（vm.$options[hook]）。
4. 如果存在生命周期钩子函数，则遍历它们并调用invokeWithErrorHandling处理函数（handlers[i], vm, args || null, vm, info）。
5. 如果_vm._hasHookEvent为true，则触发'hook:' + hook的事件。
6. 将之前保存的实例对象恢复（setCurrentInstance(prev)）。
7. 启用依赖收集器（popTarget()）。

总的来说，callHook函数可以让我们在组件生命周期的特定时刻执行一些自定义的操作，例如在created钩子中进行初始化操作，在mounted钩子中进行DOM操作等等。
 */
 
export function callHook(
  vm: Component,
  hook: string,
  args?: any[],
  setContext = true
) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget()
  const prev = currentInstance
  setContext && setCurrentInstance(vm)
  const handlers = vm.$options[hook]
  const info = `${hook} hook`
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, args || null, vm, info)
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
  setContext && setCurrentInstance(prev)
  popTarget()
}


