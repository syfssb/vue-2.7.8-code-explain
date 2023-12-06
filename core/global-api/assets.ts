
/**
`./dist/src/core/global-api/assets.ts` 文件定义了 Vue 全局 API 中的 `$set`、`$delete` 和 `$nextTick`。这些 API 是通过 `Vue.util.defineReactive()` 方法和 `Observer`（观察者）对象实现的。

- `$set`: 该方法用于给一个对象添加一个新属性，并且能够触发响应式更新。
- `$delete`: 该方法用于从一个对象中删除一个属性，并且能够触发响应式更新。
- `$nextTick`: 该方法用于在 DOM 更新后执行回调函数，主要是为了解决异步更新数据导致无法正确获取更新后的 DOM 的问题。

`./dist/src/core/global-api/assets.ts` 文件被 `./dist/vue.runtime.esm.js` 引用，而 `vue.runtime.esm.js` 则是 Vue 运行时的核心文件，它包括了 Vue 实例的创建、虚拟 DOM 的生成和渲染等功能。因此，`assets.ts` 文件与其他 Vue 源码文件是相互关联的，共同构成了 Vue 的整个运行机制。
 */
 



/**
这段代码主要是导入了一些变量和函数，并且主要用于全局API中的资源管理（assets）。具体解释如下：

- `ASSET_TYPES` 是从 `shared/constants` 中导入的常量，它定义了 Vue 实例上注册的三种资源类型，分别是 `component`、`directive` 和 `filter`。
- `GlobalAPI` 是从 `types/global-api` 中导入的类型，它定义了 Vue 全局 API 的接口。
- `isFunction` 和 `isPlainObject` 是从 `../util/index` 中导入的两个工具函数，主要用于数据类型判断。
- `validateComponentName` 是从 `../util/index` 中导入的函数，主要用于校验组件名称是否合法。

这些导入的变量和函数，都是在 Vue 的全局 API 中用于注册组件、指令或过滤器的。比如可以通过 `Vue.component` 方法注册一个组件，而该方法就是在全局API中实现的。而 `validateComponentName` 则是用于校验组件名称是否符合规范，以避免出现不必要的错误。
 */
 
import { ASSET_TYPES } from 'shared/constants'
import type { GlobalAPI } from 'types/global-api'
import { isFunction, isPlainObject, validateComponentName } from '../util/index'



/**
这段代码定义了一个名为`initAssetRegisters`的函数，它接收一个参数`Vue`，这个`Vue`参数是Vue核心库中的GlobalAPI对象。`ASSET_TYPES`是一个数组，里面包含了`component`、`directive`、`filter`三种类型。

该函数的作用是在Vue实例上注册资源，例如组件、指令、过滤器等。通过遍历`ASSET_TYPES`数组，分别给`Vue`实例添加`component`、`directive`、`filter`方法。当我们调用`Vue.component(id, definition)`或者其他两个方法时，会先判断是否有第二个参数`definition`，如果没有，则返回当前Vue实例的options中对应类型下的id对应的值，否则就将`definition`注册到Vue实例的options中对应类型下，并返回`definition`。此外，还做了一些边界情况的处理，比如检查组件名是否符合要求，以及当注册组件时，需要先扩展基础组件再注册。
 */
 
export function initAssetRegisters(Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(type => {
    // @ts-expect-error function is not exact same type
    Vue[type] = function (
      id: string,
      definition?: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (__DEV__ && type === 'component') {
          validateComponentName(id)
        }
        if (type === 'component' && isPlainObject(definition)) {
          // @ts-expect-error
          definition.name = definition.name || id
          definition = this.options._base.extend(definition)
        }
        if (type === 'directive' && isFunction(definition)) {
          definition = { bind: definition, update: definition }
        }
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}


