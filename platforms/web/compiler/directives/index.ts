
/**
./dist/src/platforms/web/compiler/directives/index.ts文件主要负责注册和导出Vue.js编译器中的指令。该文件是Vue.js编译器的一部分，位于Web平台。具体来说，它定义了如何处理模板中的指令，包括v-model、v-bind、v-show等常见的指令。

在整个Vue.js源码中，该文件与其他文件的关系是比较独立的，它主要被Vue.js编译器所使用，与底层的响应式系统、虚拟DOM等密切相关的代码都在其他文件中实现，例如./src/core/observer、./src/core/vdom等目录下的文件。但是，指令是Vue.js编译器非常重要的功能之一，因此这个文件在整个Vue.js框架中扮演着重要的角色。
 */
 



/**
这段代码是Vue的编译器部分，用于处理模板中的指令。其中:

1. `model` 指令用于实现双向数据绑定，将输入框的值与数据对象进行关联。
2. `text` 指令用于将文本节点的内容与数据对象进行关联，在数据发生变化时自动更新文本节点的内容。
3. `html` 指令用于将 HTML 节点的内容与数据对象进行关联，在数据发生变化时自动更新 HTML 节点的内容。

这三个指令都是Vue.js核心库中的指令，可以在 Vue 实例的 template 中使用。而在这里，import语句则是将这些指令导入到编译器中，以便在编译过程中对应指令的处理可以被正确地执行。
 */
 
import model from './model'
import text from './text'
import html from './html'



/**
这段代码是导出了三个对象，包括model、text和html。这三个对象分别对应Vue编译器中的三个指令，即v-model、v-text和v-html。

在Vue模板中，如果我们想要将元素的value与组件的data属性进行双向绑定，我们可以使用v-model指令来实现。而v-text指令则用于将一个数据渲染为纯文本形式；v-html指令则用于将一个数据渲染为HTML标签。

因此，这段代码主要是导出了三个DirectiveOptions对象，其中每个对象都包含了对应指令所需的所有选项信息，例如优先级、解析函数、更新函数等等。这样就能够在Vue源码中灵活地使用这些指令了。
 */
 
export default {
  model,
  text,
  html
}


