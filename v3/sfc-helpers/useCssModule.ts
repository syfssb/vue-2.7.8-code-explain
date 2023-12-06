
/**
在Vue的单文件组件中，我们可以使用 `module` 属性来启用 CSS 模块化。这意味着，我们可以在组件内部使用类似于 `styles.foo` 的语法来引用 CSS 类名，而不必担心它们可能与其他组件中的名称冲突。

`useCssModule.ts` 文件是 Vue 3.0 版本中关于 CSS 模块化的辅助函数之一。它定义了一个 `createCSSModule` 函数，该函数接受一个参数 `name`，它应该是当前组件的名称。

该函数返回一个对象，其中包含两个属性：`symbol` 和 `createInjector`。

`symbol` 属性是一个唯一的 Symbol 值，在后续处理中会用到。而 `createInjector` 函数则是创建一个 CSS 注入器的工厂函数，该注入器可以将样式应用到当前组件中。

该文件的作用主要是提供了一个便捷的操作，使得在 Vue 3.0 中使用 CSS 模块化更加简单。当然，它也需要和其他相关的文件（如 `compiler-core` 和 `runtime-core` 等）协同工作才能实现完整的功能。
 */
 



/**
这段代码是Vue中使用CSS模块化的一个辅助函数，它的作用是为当前组件实例添加CSS模块化的支持。

具体来说，这里首先引入了Vue核心库中的emptyObject和warn方法。emptyObject是一个空对象，在Vue中经常用于占位符或者默认值的情况。而warn方法则是用于在运行时报警告信息的函数。

然后，这里又引入了Vue中currentInstance方法，它用于获取当前执行上下文中的组件实例。由于Vue是基于组件的框架，因此在开发过程中需要不断地获取和操作组件实例。

总之，这段代码的作用就是为了让当前组件实例支持CSS模块化，其中引入了Vue核心库中的两个常用方法和currentInstance方法。
 */
 
import { emptyObject, warn } from '../../core/util'
import { currentInstance } from '../currentInstance'



/**
这段代码暴露了一个名为“useCssModule”的函数，该函数接收一个名称参数，默认值为“$style”，并返回一个字符串键和字符串值对的对象，这些对象表示在单文件组件中定义的CSS模块。

首先，它检查全局环境变量`__GLOBAL__`是否为真。如果不是，则继续执行条件分支内的代码。如果当前实例不存在，则会发出警告并返回一个空对象。否则，它将使用给定的名称参数获取当前实例的CSS模块，并将其作为字符串键和字符串值对的对象返回。

如果全局环境变量`__GLOBAL__`为真，则意味着正在构建Vue应用程序时，在打包过程中进行了优化。在这种情况下，该函数会发出一条警告，并返回一个空对象，因为在全局环境中无法访问单文件组件中的CSS模块。
 */
 
export function useCssModule(name = '$style'): Record<string, string> {
  /* istanbul ignore else */
  if (!__GLOBAL__) {
    if (!currentInstance) {
      __DEV__ && warn(`useCssModule must be called inside setup()`)
      return emptyObject
    }
    const mod = currentInstance[name]
    if (!mod) {
      __DEV__ &&
        warn(`Current instance does not have CSS module named "${name}".`)
      return emptyObject
    }
    return mod as Record<string, string>
  } else {
    if (__DEV__) {
      warn(`useCssModule() is not supported in the global build.`)
    }
    return emptyObject
  }
}


