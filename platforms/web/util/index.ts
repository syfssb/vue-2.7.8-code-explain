
/**
./dist/src/platforms/web/util/index.ts文件是Vue在Web平台上的工具库，主要提供了一些跨浏览器兼容性处理的方法，例如修复事件监听器、属性处理、样式绑定等。该文件与其他Vue源码文件有着紧密的关系，在许多组件和指令中都会用到该文件中的方法。在Vue的构建过程中，会根据不同的目标平台选择不同的构建入口，其中就包括./dist/src/platforms/web/util/index.ts。因此，该文件可以说是Vue Web平台构建的核心之一。
 */
 



/**
在Vue 2.7.8版本的源码中，"./dist/src/platforms/web/util/index.ts"是Vue.js在Web平台上使用的工具类模块。其中，import { warn } from 'core/util/index'是从Vue.js核心库的"/src/core/util/index.js"导入了warn函数。

warn函数用于向控制台输出警告信息。在开发过程中，我们可能会遇到一些潜在的错误或者不规范的使用方式，此时可以通过调用warn函数来提醒开发者注意。例如：

```javascript
if (condition) {
  warn('Something went wrong!')
}
```

这段代码会在控制台输出警告信息："Something went wrong!"。这样有助于开发者及时发现问题并进行修复，提高代码的质量和可维护性。
 */
 
import { warn } from 'core/util/index'



/**
这段代码的意思是从./dist/src/platforms/web/util/attrs、./dist/src/platforms/web/util/class和./dist/src/platforms/web/util/element三个文件中导出所有的内容并重新导出，也就是将它们合并为一个模块导出。

具体来说，这三个文件都是Vue在构建web平台时用到的工具类。其中，attrs.js中定义了处理元素属性的方法，class.js中定义了处理元素class的方法，element.js中定义了创建元素、插入元素、删除元素等基本方法。

通过使用`export * from ...`语法，我们可以简化从这些文件中导入各个方法的过程，直接从index.ts文件中导入需要的方法，提高代码的可读性和可维护性。
 */
 
export * from './attrs'
export * from './class'
export * from './element'



/**
这是一个用于查询元素选择器的函数。它接受一个参数el，可以是字符串或元素对象。如果参数el是一个字符串，则调用`document.querySelector`方法查询对应的元素，如果查询不到则返回一个创建的`div`元素作为占位符，并在开发模式下打印警告信息。如果参数el是一个元素对象，则直接返回该元素对象。这个函数的作用非常简单，它被其他一些Vue的API使用，例如在Vue实例化的时候指定`el`选项时，就会使用这个函数来查询DOM元素。
 */
 
/**
 * Query an element selector if it's not an element already.
 */
export function query(el: string | Element): Element {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    if (!selected) {
      __DEV__ && warn('Cannot find element: ' + el)
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}


