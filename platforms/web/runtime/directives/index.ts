
/**
`./dist/src/platforms/web/runtime/directives/index.ts`文件的作用是注册Vue的内置指令（directives），这些指令可以在Vue模板中使用。具体来说，该文件包含了以下几个指令的实现：

- `v-model`：用于双向数据绑定，即将表单元素的值与Vue实例中指定的属性进行双向绑定。
- `v-show`：根据指定的表达式的真假值来切换元素的显示/隐藏状态。
- `v-if`：根据指定的表达式的真假值来添加/删除元素。
- `v-else-if`：在`v-if`指令之后使用，当前一个`v-if`表达式为假且当前表达式为真时，渲染当前元素。
- `v-else`：在`v-if`和`v-else-if`之后使用，当之前所有的条件都不满足时，渲染当前元素。
- `v-html`：将指定的字符串解析成HTML，并渲染到当前元素中。
- `v-text`：将指定的表达式的值转为文本并插入到当前元素中。

该文件与其他Vue源码文件的关系比较密切，因为它定义了Vue最常用的一些指令，这些指令在Vue模板编译的过程中会被处理成对应的渲染函数。这些渲染函数最终会被添加到Vue组件实例的`_render`方法中，用于实现模板的渲染。因此，理解这些内置指令的实现对于深入理解Vue的运作机制非常重要。
 */
 



/**
在Vue源码的./dist/src/platforms/web/runtime/directives/index.ts文件中，这两个import语句引入了model和show指令的实现。

1. model指令：用于实现表单元素与数据之间的双向绑定。它的主要作用是监听表单元素的input或change事件，并把表单元素的值同步到组件的data中。同时，当组件的data变化时，也会把最新的值同步回表单元素中。这个指令的实现代码在./dist/src/platforms/web/runtime/directives/model.ts文件中。

2. show指令：用于控制元素的显示和隐藏。这个指令的实现代码在./dist/src/platforms/web/runtime/directives/show.ts文件中。它的主要作用是根据指令的参数值（布尔类型）来决定元素是否显示。当参数为真时，元素显示；当参数为假时，元素隐藏。这个指令通常用于v-if的实现中，而v-if指令是在./dist/src/compiler/directives/if.ts文件中实现的。

总体来说，Vue的指令是用于控制DOM元素的属性或行为的，如双向绑定、显示隐藏等。Vue提供了一些内置的指令，同时也可以自定义指令来满足不同的需求。在Vue的开发中，理解和掌握指令的使用和实现是非常重要的。
 */
 
import model from './model'
import show from './show'



/**
这段代码导出了Vue中所支持的两个内置指令：`v-model` 和 `v-show`。

- `model`：v-model是用来实现双向数据绑定的，通过监听输入框（或者其他表单元素）的input事件以及组件的value属性的变化来实现双向绑定。
- `show`：v-show是用来控制元素的显示和隐藏的，它通过修改元素的display样式来实现。

导出这两条指令的作用是让使用者可以直接在模板中使用这两个指令而不需要手动注册它们。同时也方便了使用者快速了解Vue中已经内建支持哪些指令。
 */
 
export default {
  model,
  show
}


