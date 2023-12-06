
/**
./dist/src/core/instance/init.ts文件的作用是在Vue实例化时，初始化实例。这个文件中定义了Vue类的构造函数，以及Vue原型上的一些属性和方法。

具体来说，init.ts文件主要做以下几件事情：

1. 定义Vue类的构造函数，并将Vue的$options对象合并到实例的$options对象中。

2. 初始化Vue实例的各种属性，包括$data、$props、$el、$options等。

3. 初始化Vue实例的生命周期钩子函数，包括beforeCreate、created、beforeMount、mounted、beforeUpdate、updated、beforeDestroy和destroyed。

4. 初始化Vue实例的事件系统，包括$on、$once、$off和$emit等方法。

5. 初始化Vue实例的插件系统，包括use方法和install方法。

./dist/src/core/instance/init.ts文件是整个Vue源码中非常重要的一部分，它负责了Vue实例的初始化和基本功能的实现。与其他文件的关系比较紧密，例如在该文件中会调用其他模块的方法，如生命周期模块、事件模块、state模块等。同时，其他模块也会引用init.ts文件中定义的Vue类和Vue原型上的方法。因此，在学习Vue源码时，必须对init.ts文件有深刻的理解。
 */
 



/**
这段代码是Vue实例化的核心部分，它包括了初始化各种功能和属性的过程。

首先，它引入了config配置文件，以及一些工具函数如mark、measure等。然后使用ES6的模块语法分别引入了initProxy、initState、initRender、initEvents、initLifecycle、initProvide、initInjections等方法，这些方法用于初始化Vue实例的代理、响应式状态、渲染等相关属性和功能。

随后，通过extend、mergeOptions和formatComponentName等工具函数处理组件选项，生成一个新的组件选项对象，并将其传递给initLifecycle方法进行生命周期初始化。在这个过程中，也会调用callHook方法，执行组件相应的生命周期钩子函数。

最后，它还引入了EffectScope类，用于创建一个作用域对象，用于管理响应式数据变化时产生的副作用。

总之，这段代码的作用是将各种功能和属性初始化完成，为Vue实例的正常运行提供必要的支持。
 */
 
import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'
import type { Component } from 'types/component'
import type { InternalComponentOptions } from 'types/options'
import { EffectScope } from 'v3/reactivity/effectScope'



/**
在Vue的源码中，uid是一个全局计数器。在init.ts文件中，它被初始化为0。

当创建Vue实例时，Vue会为每个实例分配一个唯一的标识符（id），这个标识符就是通过uid++来递增生成的。通过不断增加该计数器，确保每个Vue实例都有一个唯一的标识符。

在Vue的响应式系统中，每个对象/数组都有一个内部的__ob__属性，用于跟踪该对象/数组是否已经被观察过。而且，这个__ob__属性的值也是通过uid++来递增生成的。因此，在Vue中，uid可以用来唯一标识每个实例和每个观察对象/数组。
 */
 
let uid = 0



/**
`initMixin` 是 Vue.js 的初始化函数的一部分，该函数在 Vue.js 构造函数中被调用，主要作用是将选项对象初始化为 Vue 实例并进行一些必要的设置。

在 `initMixin` 中，我们看到 `Vue.prototype._init` 函数被定义，并返回一个函数。这个函数接受一个可选的参数 options，在实例化 Vue 的时候传递进来。

在该函数的第一行，我们可以看到 `const vm: Component = this`，它表示当前调用 _init 函数的实例。`vm._uid = uid++` 语句给当前实例生成一个随机的唯一ID，并将其保存在 `_uid` 属性中。

`uid` 变量是全局变量，它用于生成随机的唯一 ID，每次生成的 ID 都不相同。这种方式确保了每个 Vue 实例都具有唯一的标识符，使得开发者可以方便地跟踪和诊断问题。

总之，这段代码的作用是为每个 Vue 实例生成一个唯一的 ID。
 */
 
export function initMixin(Vue: typeof Component) {
  Vue.prototype._init = function (options?: Record<string, any>) {
    const vm: Component = this
    // a uid
    vm._uid = uid++



/**
这段代码中，首先定义了两个变量 `startTag` 和 `endTag`，它们被用于标记性能测试的开始和结束。在开发环境下，如果配置了 performance 并且 mark 函数存在，则会执行以下操作：

1. 将 `startTag` 定义为以 "vue-perf-start" 为前缀，后接当前 Vue 实例的 `_uid` 的字符串；
2. 将 `endTag` 定义为以 "vue-perf-end" 为前缀，后接当前 Vue 实例的 `_uid` 的字符串；
3. 使用 `mark` 方法对 `startTag` 进行标记。

这部分代码的作用是为了在开发环境下方便地进行性能测试，通过在浏览器控制台使用 Performance API 查看 `startTag` 和 `endTag` 标记之间的时间差，就可以得到某个组件或实例的渲染、更新等操作所消耗的时间，从而优化应用程序的性能。
 */
 
    let startTag, endTag
    /* istanbul ignore if */
    if (__DEV__ && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }



/**
这段代码主要是Vue实例初始化时需要执行的一系列操作，下面简单解释每一步的作用：

1. `vm._isVue = true`：标记当前实例为Vue实例，方便在后续使用时进行判断。

2. `vm.__v_skip = true`：避免当前实例被观察，即不需要进行响应式处理。

3. `vm._scope = new EffectScope(true  )`: 创建一个 `EffctScope` 实例，用于存储副作用函数（Effect）的上下文信息。

4. `if (options && options._isComponent)`：判断当前实例是否为组件，如果是，则调用 `initInternalComponent` 方法来初始化内部组件。

5. `else`：如果不是组件，则调用 `mergeOptions` 方法来合并构造函数选项和用户传入选项，最终得到该实例的 `$options` 选项。

6. `if (__DEV__) { initProxy(vm) } else { vm._renderProxy = vm }`：在开发环境中，调用 `initProxy` 方法来为当前实例创建一个代理对象，用于在模板编译阶段收集渲染函数所需的上下文信息（attributes、事件等），而在生产环境中则直接将代理对象设置为当前实例本身。

7. `vm._self = vm`：将当前实例赋值给自身变量 `_self`，方便在后续使用时引用。

8. `initLifecycle(vm)`：初始化当前实例的生命周期相关变量，包括 `$parent`、`$root`、`$children` 等。

9. `initEvents(vm)`：初始化当前实例的自定义事件相关变量，包括 `$listeners`、`$once` 等。

10. `initRender(vm)`：初始化当前实例的渲染函数，主要是调用 `defineReactive` 方法将 `$attrs`、`$props`、`$slots` 等属性变为响应式。

11. `callHook(vm, 'beforeCreate', undefined, false  )`：在当前实例执行 `beforeCreate` 生命周期钩子，此时组件的数据和方法都还未初始化，因此无法访问到 `data`、`computed`、`methods` 等属性。

12. `initInjections(vm)`：初始化当前实例从父组件中注入的依赖。在组件渲染完毕后，会对每个组件进行一次遍历，在这个过程中如果检测到组件上有 `inject` 属性，则会将其注入到组件实例的 `$options.inject` 中。

13. `initState(vm)`：初始化当前实例的状态，包括 `props`、`methods`、`data`、`computed`、`watch` 等属性，并且为这些属性设置 getter 和 setter，以实现响应式效果。

14. `initProvide(vm)`：初始化当前实例提供给子组件使用的数据。与 `inject` 注入相对应，当组件设置了 `provide` 属性时，会将其数据注入到实例的 `$options.provide` 中。

15. `callHook(vm, 'created')`：在当前实例执行 `created` 生命周期钩子，此时组件已经被完整地创建出来了，可以访问到 `data`、`computed`、`methods` 等属性。
 */
 
    // a flag to mark this as a Vue instance without having to do instanceof
    // check
    vm._isVue = true
    // avoid instances from being observed
    vm.__v_skip = true
    // effect scope
    vm._scope = new EffectScope(true /* detached */)
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options as any)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor as any),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (__DEV__) {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate', undefined, false /* setContext */)
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')



/**
这段代码主要是在性能监测方面的应用。其中的 `__DEV__` 是一个全局变量，用来判断当前是否处于开发环境下，如果是生产环境则不会执行这段代码。 

`config.performance` 是 Vue 的一个配置项，用于开启性能监测功能。如果没有开启，也不会执行这段代码。

`mark(endTag)` 使用 performance API 生成一个结束标记，并将该标记存入性能时间表中，其参数为该标记的名称。

`measure('vue ${vm._name} init', startTag, endTag)` 函数用于计算两个时间标记之间的时间差，从而得到程序初始化所花费的时间。其中第一个参数是该时间段的名称，即“vue 组件名 init”，第二个参数是开始标记，第三个参数是结束标记。

总之，这段代码的作用是在开发环境并且开启了性能监测时，记录组件实例初始化所花费的时间，并输出结果。
 */
 
    /* istanbul ignore if */
    if (__DEV__ && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }



/**
这段代码片段是Vue的实例化过程中的初始化部分。

当我们使用`new Vue()`创建Vue实例时，会调用Vue构造函数，在构造函数中会进行一系列的初始化操作，其中之一就是判断是否传入了el选项。

如果传入了el选项，即我们想要将Vue实例挂载到某个DOM元素上，那么就会执行`vm.$mount(vm.$options.el)`来进行挂载操作。这里的`vm.$options.el`表示我们在创建Vue实例时传入的el选项。

如果没有传入el选项，则需要手动调用`vm.$mount`方法来进行挂载操作。

总结一下，这段代码的作用就是在实例化Vue对象时，判断是否传入了el选项，如果有则自动挂载，否则需要手动进行挂载。
 */
 
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}



/**
这段代码主要是在初始化Vue组件实例时，用于设置一些内部组件的选项信息。具体解释如下：

1. 首先定义了一个函数initInternalComponent，它有两个参数，一个是Vue组件实例vm，另一个是内部组件选项options。

2. 接着，使用Object.create()方法创建了一个新对象opts，该对象的原型是vm.constructor.options。这里的vm.constructor代表当前实例所属的构造函数，也就是Vue类，而Vue类中的options属性是用户传入的选项信息（包括data、methods、computed等），这里使用Object.create()可以避免直接修改原始选项信息。

3. 然后，将options._parentVnode赋值给parentVnode变量，并将options.parent和parentVnode分别赋值给opts.parent和opts._parentVnode。这里的_parentVnode是内部组件选项，表示该组件在父组件中的占位vnode节点。

总之，这段代码主要是为内部组件选项提供必要的上下文环境，在组件实例化时对各种选项进行初始化设置。
 */
 
export function initInternalComponent(
  vm: Component,
  options: InternalComponentOptions
) {
  const opts = (vm.$options = Object.create((vm.constructor as any).options))
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode



/**
在Vue中，每个组件都是由一个Vue实例来管理的。在创建Vue实例时，需要将一些参数对象传入其中，这些参数包括但不限于数据，计算属性，方法，生命周期等等。

在上述代码中，我们可以看到opts是一个参数对象，它代表着当前Vue实例的所有选项，例如propsData，listeners，renderChildren和componentTag等。这些选项在创建Vue实例时被设置（或者在扩展Vue构造函数时添加）。

vnodeComponentOptions是一个虚拟节点的组件选项，这意味着它包含了父级组件向子组件传递的props信息(propsData)，监听事件(listeners)，子组件的插槽内容(renderChildren)和子组件的标签名(tag)。 

所以在代码中，我们将这些父级组件传递给当前组件的选项赋值给opts，这样就可以通过opts来获取父级组件的一些选项，而不必使用this.$parent来访问它们。
 */
 
  const vnodeComponentOptions = parentVnode.componentOptions!
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag



/**
在Vue 2.x中，组件的渲染都是通过render方法实现的。在初始化Vue实例时，会解析用户传入的选项对象（通常是new Vue()时传入的options参数），其中包含了组件的各种配置信息。

这段代码的作用是判断用户是否定义了组件的render函数，如果有定义，则将其赋值给opts.render，并且将静态渲染函数（如果有的话）赋值给opts.staticRenderFns。

这个操作是为了让Vue在对组件进行渲染时能够正确地找到对应的render函数和静态渲染函数。如果用户没有定义render函数，那么Vue会尝试从template或el选项中解析得到render函数，就不需要手动指定了。但如果用户有自己的render函数，那么必须显式地指定给Vue，否则Vue无法正常渲染组件。
 */
 
  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}



/**
这段代码定义了一个函数`resolveConstructorOptions`，该函数的作用是解析组件的构造函数选项，并返回一个对象。在Vue中，每个组件都有一个选项对象，包括组件所需的各种配置信息，例如数据、方法、生命周期钩子、模板等等。

首先，该函数接受一个 `Ctor` 参数，表示组件的构造函数。然后通过 `Ctor.options` 获取组件的选项对象，如果该组件有父类（即继承自其他组件），则递归调用 `resolveConstructorOptions` 函数获取其父类的选项对象。

如果父类的选项对象发生了变化，则需要更新子组件的选项。具体实现方式如下：

1. 更新父类选项缓存：将当前父类选项保存在 Ctor.superOptions 中。
2. 解析已修改过的选项：使用 resolveModifiedOptions 函数对已经修改的选项进行解析。
3. 更新基础的扩展选项：将 modifiedOptions 合并到 Ctor.extendOptions 中。
4. 通过 mergeOptions 函数合并 superOptions 和 modifiedOptions ，得到一个新的选项 options 。
5. 如果 options 中设置了组件名称，则向 components 对象中添加一个键值对，以便检索该组件。

总之，这个函数是 Vue 常见核心功能之一，主要是处理组件的选项继承和选项合并，确保每个组件都能正确地获取它所需的选项信息。
 */
 
export function resolveConstructorOptions(Ctor: typeof Component) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}



/**
这个方法是用来比较组件实例构造函数的选项对象和其原始选项对象是否有差异（修改）的。

首先，它接收一个组件实例构造函数 `Ctor` 作为参数，并且声明了两个变量 `modified` 和 `latest`。其中，`modified` 变量表示修改后的选项对象，而 `latest` 变量则代表最新的选项对象。

然后，代码定义了一个名为 `sealed` 的变量，它实际上是 `Ctor.options` 执行 Object.freeze() 后返回的结果，即原始选项对象。这里使用 `Object.freeze()` 方法是为了防止选项对象被修改。

之后，代码遍历 `latest` 对象的所有属性，如果某个属性在 `latest` 对象中的值与 `sealed` 对象中的值不同，则将该属性及其对应的值保存到 `modified` 对象中。

最后，返回 `modified` 对象。如果 `modified` 对象存在，则说明选项对象已经被修改过，否则就没有任何修改。
 */
 
function resolveModifiedOptions(
  Ctor: typeof Component
): Record<string, any> | null {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}


