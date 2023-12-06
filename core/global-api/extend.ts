
/**
./dist/src/core/global-api/extend.ts文件的作用是通过Vue.extend方法来创建一个新的构造函数，该构造函数继承自Vue构造函数，并且具有与Vue实例相同的选项和生命周期钩子。

在整个Vue源码中，./dist/src/core/global-api/extend.ts文件属于全局API部分。该文件的主要目的是定义Vue.extend方法，该方法用于扩展现有的组件构造函数或创建一个新的组件构造函数。

Vue.extend方法的返回值是一个新的构造函数，可以像普通的组件构造函数一样使用。它允许我们创建具有特定选项和生命周期的独立组件，并将其应用于整个应用程序中。

其他文件如./dist/src/core/instance/init.ts和./dist/src/core/vdom/create-component.js都会使用Vue.extend方法来创建新的组件构造函数，以及访问扩展选项和生命周期钩子。因此，./dist/src/core/global-api/extend.ts文件对整个Vue源码具有重要的作用。
 */
 



/**
这段代码主要是扩展Vue的全局API，在Vue中可以通过Vue.extend方法来创建一个组件构造器，这个方法在.vue文件中使用时会自动调用，它返回的就是一个组件构造器。

具体解释如下：
1. 首先从'shared/constants'导入了一个常量ASSET_TYPES，该常量通常用于指定资源类型。
2. 接着，从'types/component'和'types/global-api'导入了两个类型Component和GlobalAPI，用于定义组件和全局api的类型。
3. 接下来，又导入了实例的defineComputed和proxy方法，以及工具函数extend、mergeOptions和validateComponentName，用于实现组件选项、合并选项等功能。
4. 最后，又从'../vdom/create-component'导入了getComponentName方法，用于获取组件的名称。

综上所述，这段代码主要是为Vue添加了一个全局API——Vue.extend，用于创建组件构造器，并且还导入了一些必要的工具函数和类型声明，以便实现组件选项、合并选项等功能，同时也包含了获取组件名称的方法。
 */
 
import { ASSET_TYPES } from 'shared/constants'
import type { Component } from 'types/component'
import type { GlobalAPI } from 'types/global-api'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'
import { getComponentName } from '../vdom/create-component'



/**
在Vue中，每个构造函数都有一个唯一的cid（constructor id），这使得我们可以创建包装的“子构造函数”以实现原型继承并缓存它们。`initExtend()`函数就是用来初始化`Vue`的cid和计数器`cid`的。

具体来说，`Vue.cid`初始化为0，而`cid`则初始化为1。当我们使用`Vue.extend()`方法创建一个子类时，会先从`Vue.cid`中获取当前最大的cid值作为基础值，并将`cid`自增1，然后通过调用`new Sub()`来创建该子类的实例对象。在这个过程中，会给该子类的实例对象设置一个`_cid`属性，这个属性的值就是该子类的cid值。

正如注释所述，这种做法可以实现创建子类的缓存，避免重复创建，提高性能。同时，使用cid还可以解决多版本Vue库共存的问题，因为不同版本的Vue库的cid是不同的，这样就可以避免命名冲突和相互影响。
 */
 
export function initExtend(Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  let cid = 1



/**
上面这段代码是在Vue类上定义了一个extend方法，该方法用于创建一个新的Vue子类。具体解释如下：

- 首先将传入的参数 `extendOptions` 赋值给一个变量，如果没有传入任何参数，则默认为空对象。
- 然后将当前 Vue 类本身赋值给一个常量 `Super` ，以便后面可以在子类中使用父类的一些方法和属性。
- 获取当前 Vue 实例的唯一标识符 `SuperId`（每个 Vue 实例都有一个唯一 ID）。
- 定义一个空对象 cachedCtors，并检查传入的 `extendOptions` 是否有 `_Ctor` 属性。如果没有则将其添加到 `extendOptions` 中，避免重复创建子类。
- 检查当前 Vue 类是否已经存在缓存中，如果存在，则直接返回缓存中的子类，否则继续执行下面的步骤。

总之，这段代码的作用就是用于创建并缓存一个新的 Vue 子类。通过调用 `Vue.extend` 方法，我们可以轻松地派生出一些自定义组件，以扩展 Vue 的基础功能。
 */
 
  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions: any): typeof Component {
    extendOptions = extendOptions || {}
    const Super = this
    const SuperId = Super.cid
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }



/**
这段代码的作用是给Vue构造函数扩展全局API —— Vue.extend()。extendOptions 是使用 Vue.extend() 扩展构造器时传入的选项对象，Super是Vue构造函数本身。在这个函数中使用了 getComponentName 函数来获取组件名字，并通过 validateComponentName 函数对其进行检验。

其中 __DEV__ 是一个全局变量，表示当前环境是否为开发环境。如果是开发环境且组件名字存在，则会调用 validateComponentName() 来验证组件名字是否符合规范，以避免出现一些常见的问题或错误。这样可以提高代码质量和可维护性。
 */
 
    const name =
      getComponentName(extendOptions) || getComponentName(Super.options)
    if (__DEV__ && name) {
      validateComponentName(name)
    }



/**
好的，让我来解释一下这段代码：

首先，定义了一个名为Sub的函数，并将其赋值给变量VueComponent。这个函数作为Vue组件的构造函数，在初始化实例时会被调用，同时也会调用_init方法对实例进行初始化。

接着使用ts中的类型断言（as）将VueComponent的类型指定为Component，Component是另一个类，它定义了组件的基本属性和方法。

然后，通过Object.create()方法创建一个原型对象，该原型对象继承自Super.prototype，也就是父级组件的原型对象，这样子组件Sub就能够继承父级组件Super的所有属性和方法。

接下来，将Sub的构造函数设置为自身，以确保在创建子类实例时能够正确引用自己的构造函数。

然后，将cid加1并赋值给Sub.cid，cid是组件的唯一标识符，每次创建组件实例时都会生成一个新的cid。

最后，使用mergeOptions()函数将父级组件Super的选项与extendOptions合并，并将结果赋给Sub.options。extendOptions是一个可选的选项对象，它用于覆盖或添加新的选项。同时将父级组件Super赋值给Sub['super']，这样在需要访问父级组件时可以方便地获取它。

总之，这段代码的作用就是定义一个新的子组件Sub，该组件继承自父级组件Super，并且具有自己的选项和cid标识符。这也是Vue框架中组件继承的基本实现方式。
 */
 
    const Sub = function VueComponent(this: any, options: any) {
      this._init(options)
    } as unknown as typeof Component
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    Sub.options = mergeOptions(Super.options, extendOptions)
    Sub['super'] = Super



/**
这段代码的作用是，在Vue实例化时，初始化props和computed属性，这样可以避免在每个实例创建时调用Object.defineProperty方法。具体解释如下：

首先，根据上下文可以知道Sub代表子类，即使用Vue.extend()扩展Vue构造函数得到的子类。而该子类可能会定义props和computed属性。因为props和computed属性的获取都需要进行逻辑处理，所以不能直接使用JavaScript对象的方式来定义。

为了实现props和computed属性的逻辑处理，Vue依赖于Object.defineProperty方法来对实例进行拦截。但是，由于每个实例都需要进行一次Object.defineProperty调用，这样会导致性能问题，特别是当我们需要创建大量的实例时。

因此，Vue在子类扩展Vue构造函数时，会在扩展的原型上定义代理getter方法来获取props和computed属性，而不是在每个实例中调用Object.defineProperty方法。这样就能够减少性能问题，并提高效率。而这个过程就是通过调用initProps和initComputed方法来完成的。
 */
 
    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps(Sub)
    }
    if (Sub.options.computed) {
      initComputed(Sub)
    }



/**
首先，这里的 `Super` 和 `Sub` 是指父类和子类的构造函数。

在 Vue 中，我们可以使用 `Vue.extend()` 方法来创建一个子类。这个方法会返回一个新的构造函数（即子类），该构造函数继承了父类的所有属性和方法，并可通过 `$options` 访问父类的配置对象。

那么，为什么要在 `extend.ts` 中声明 `Sub.extend = Super.extend`、`Sub.mixin = Super.mixin` 和 `Sub.use = Super.use` 呢？

这是因为，当我们使用 `Vue.extend()` 创建子类后，如果还想对子类进行进一步的扩展、混入或使用插件，就需要使用 `Sub.extend()`、`Sub.mixin()` 和 `Sub.use()` 这些方法。而这些方法实际上都是从父类 `Super` 继承过来的。

因此，在 `extend.ts` 的这段代码中，将父类 `Super` 的这三个方法赋值给子类 `Sub`，使得子类也能够直接调用这些方法，方便对子类的扩展操作。
 */
 
    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use



/**
这段代码主要是在实现`Vue.extend()`方法中的一些功能。

首先，`ASSET_TYPES`是一个数组，包含了 Vue.js 中允许注册的组件、指令、过滤器和混入对象四种类型。这个数组的定义在同一目录下的 registerAsset.js 文件中，具体内容为：

```js
export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
```

在代码中，`forEach`循环遍历了这个数组，并将父类构造函数（即 `Super`）的对应属性赋值给子类构造函数（即 `Sub`）。这样就保证了子类可以拥有和父类一样的私有资源。

接着，如果传入了组件名称 `name`，则在子类的选项对象中的 `components` 属性中注册该组件构造函数。这样做的好处是，在模板编译时会自动递归地解析子组件的模板，从而实现了组件树的递归嵌套。如果没有传入组件名称，则不需要进行注册。

总结：这段代码实现了将父类构造函数的私有资源复制给子类构造函数，并且可以将子类注册为全局组件，方便在模板中使用。
 */
 
    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }



/**
这段代码主要是在实现Vue的继承功能。其中，Sub表示子类，Super表示父类。

在这个过程中，首先需要将父类的options保存到子类的superOptions属性中，这样可以在实例化时判断父类的options是否有更新。

接下来，将extendOptions添加到子类的extendOptions属性中。这里的extendOptions指的是子类独有的options，它们不会覆盖父类中相同的options。

最后，使用Object.assign方法将Sub.options和extendOptions合并，并保存到Sub.sealedOptions中。这个过程中，如果Sub.options和extendOptions存在相同的属性，那么extendOptions中的属性会覆盖Sub.options中的属性，这个过程中不会修改父类的options。这个sealedOptions会被用作初始化选项，在组件实例化过程中，不允许其被修改。

总之，这段代码的作用就是为Vue的继承机制做准备工作，方便后续的组件实例化。
 */
 
    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)



/**
在Vue.js中，extend函数是用来创建一个继承自Vue的子组件构造函数的工厂函数。在这个函数中，我们可以看到以下代码：

``` javascript
// cache constructor
cachedCtors[SuperId] = Sub
return Sub
```

这里的`cachedCtors`是一个缓存对象，用于缓存已经创建过的子组件构造函数，以便多次使用时不需要重复创建。`SuperId`是父组件构造函数的唯一标识符，在这里用于作为缓存对象的key值。

当创建完子组件构造函数`Sub`之后，将其存储到`cachedCtors`对象中，并以`SuperId`作为key值。然后返回这个子组件构造函数，供之后使用。

整个流程就相当于：先判断是否已经缓存了该子组件构造函数，如果有则直接返回，否则创建并缓存该子组件构造函数，并返回该子组件构造函数。这样做可以提高性能和减少重复代码。
 */
 
    // cache constructor
    cachedCtors[SuperId] = Sub
    return Sub
  }
}



/**
这段代码的作用是在组件初始化时，将所有属性（props）代理到组件实例上，方便在组件内部使用。

具体来说，这个函数接收一个组件构造函数（typeof Component），然后获取该组件的选项对象中的 props 属性。遍历 props 对象，并通过 proxy 函数将每个属性代理到组件实例的 _props 中。这样就可以直接在组件实例中访问和修改 props 属性了。

值得注意的是，这里使用了 `_props` 这个前缀来区分用户定义的属性与 Vue 内部定义的属性。因为 Vue 实例本身也有一些内置属性（如 $el, $options 等），如果直接将 props 代理到组件实例上可能会覆盖这些内置属性，造成不必要的麻烦。
 */
 
function initProps(Comp: typeof Component) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}



/**
这段代码的作用是初始化计算属性（computed），并将计算属性挂载到组件实例的原型上。

首先，通过`Comp.options.computed`获取组件定义中的计算属性对象，这个对象包含了所有定义在组件中的计算属性。然后遍历这个对象，在组件原型上使用`defineComputed`方法定义这些计算属性。`defineComputed`方法接收三个参数：第一个参数是需要挂载计算属性的对象，这里是组件实例的原型；第二个参数是计算属性的名称；第三个参数是包含计算属性相关配置的对象。

总之，这段代码的作用是实现组件实例可以使用计算属性，并将计算属性的定义挂载到组件实例的原型上，从而实现计算属性的复用。
 */
 
function initComputed(Comp: typeof Component) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}


