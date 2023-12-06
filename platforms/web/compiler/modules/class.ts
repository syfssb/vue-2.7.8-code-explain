
/**
`class.ts` 文件是 Vue 编译器中的一个模块，用于处理 HTML 元素的 class 属性。这个模块会在编译期间被调用，将 `class` 属性解析成 JavaScript 对象，并生成相应的代码插入到渲染函数中。具体来说，这个模块的核心功能包括：

1. 解析 `class` 属性中的静态类名和动态类名表达式。
2. 将解析后的类名转换为 JavaScript 对象并合并成一个对象，以便在渲染函数中将其作为 `class` 属性的值输出。
3. 生成相应的渲染代码，将 `class` 对象输出到对应的 HTML 元素上。

这个模块在 Vue 源码中的位置一般来说位于 `compiler/modules` 文件夹下，是 Vue 编译器的一个子模块。它与其他编译器模块如 `model.ts`、`style.ts` 等紧密相关，一起构成了编译器的核心部分，负责将 Vue 组件的模板转换为可执行的渲染函数。同时，这些模块也与运行时代码 `src/core` 中的各种组件实现密切相关，共同支撑了 Vue 的完整运行时系统。
 */
 



/**
./dist/src/platforms/web/compiler/modules/class.ts文件是Vue编译器的一个模块，负责处理模板中class相关的属性。这个模块用到了另外三个模块：

1. `parseText`模块：用于解析模板中的文本节点，得到文本节点中的表达式。
2. `getAndRemoveAttr`和`getBindingAttr`模块：用于从AST元素中获取指定属性的值，并将该属性从AST元素上移除。
3. `baseWarn`模块：用于打印编译器警告和错误信息。

在这个模块中，主要处理了class、staticClass和:class等属性的处理逻辑，将这些属性解析成AST元素的class属性，并将这些属性从AST元素上移除。

具体来说，这个模块会遍历AST元素的所有属性，如果发现属性名是"class"或者":class"，就调用`getBindingAttr`模块获取属性的值，然后通过`parseText`模块解析属性的值得到表达式，并将该表达式设置为AST元素的classBindings属性。如果发现属性名是"staticClass"，则直接将属性的值设置为AST元素的staticClass属性。最后，移除解析过的属性，并在需要的情况下打印编译器警告和错误信息。

总之，这个模块的作用是将模板中的class相关的属性解析成AST元素的class属性，并将这些属性从AST元素上移除。
 */
 
import { parseText } from 'compiler/parser/text-parser'
import { getAndRemoveAttr, getBindingAttr, baseWarn } from 'compiler/helpers'
import { ASTElement, CompilerOptions, ModuleOptions } from 'types/compiler'



/**
这段代码是Vue中编译器模块的一部分，主要用于处理元素节点的class属性。下面是代码的详细解释：

1. 首先声明了两个变量：warn和staticClass。

- options.warn是在CompilerOptions中声明的一个函数，用于输出警告信息。
- staticClass表示元素节点上的静态class属性。

2. 使用getAndRemoveAttr函数获取并移除元素节点上的class属性，并赋值给staticClass变量。

3. 如果当前处于开发环境且存在静态class属性，那么使用parseText函数解析class属性中的文本内容。

- 如果存在插值表达式，则输出警告信息，提示使用v-bind或:替代插值表达式。
- el.rawAttrsMap['class']表示class属性在原始属性映射对象中的位置。

4. 对静态class属性进行处理，将多余的空格去掉，并将其转换为JSON格式字符串，并赋值给el.staticClass属性。

5. 使用getBindingAttr函数获取动态class属性，并将其赋值给el.classBinding属性。如果不存在动态class属性，则不做处理。

总结：这段代码的作用是将静态class属性转化为JSON格式字符串，并将动态class属性存储到AST（抽象语法树）节点对象中。这样编译器就可以在生成虚拟DOM时，正确地渲染出元素节点的class属性。
 */
 
function transformNode(el: ASTElement, options: CompilerOptions) {
  const warn = options.warn || baseWarn
  const staticClass = getAndRemoveAttr(el, 'class')
  if (__DEV__ && staticClass) {
    const res = parseText(staticClass, options.delimiters)
    if (res) {
      warn(
        `class="${staticClass}": ` +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div class="{{ val }}">, use <div :class="val">.',
        el.rawAttrsMap['class']
      )
    }
  }
  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass.replace(/\s+/g, ' ').trim())
  }
  const classBinding = getBindingAttr(el, 'class', false /* getStatic */)
  if (classBinding) {
    el.classBinding = classBinding
  }
}



/**
这段代码是Vue中编译器模块之一——class的相关代码。在编译template时，会将template中的所有class属性编译为render函数中的data对象的class属性，作为虚拟DOM的一个重要属性。

该函数接受一个ASTElement类型的参数el，表示一个标签元素对应的抽象语法树节点。该函数返回一个字符串，表示该节点的class属性对应的data对象的字符串形式。

该函数首先定义了一个空字符串变量data，用于存储最终生成的字符串。然后通过判断ASTElement节点上是否存在静态class属性和动态class绑定属性来进行设置class属性的值。如果有静态class属性，则将其添加到data中，以staticClass作为key；如果有动态class属性，则将其添加到data中，以class作为key。

最后，该函数返回data字符串，即该节点class属性对应的data对象字符串形式。
 */
 
function genData(el: ASTElement): string {
  let data = ''
  if (el.staticClass) {
    data += `staticClass:${el.staticClass},`
  }
  if (el.classBinding) {
    data += `class:${el.classBinding},`
  }
  return data
}



/**
这段代码是一个Vue编译器的模块，它实现了处理class属性的功能。具体来说，这个模块会把静态和动态的class属性都转换成v-bind:class指令。

下面是对这个模块选项的三个属性的解释：

1. staticKeys: ['staticClass']
   这个属性表示需要被视为静态属性的键值对的键名。在class模块中，只有staticClass会被视为静态属性。当这个属性是静态的时候，它可以被提前计算并优化。

2. transformNode
   这个属性是一个函数，它接受两个参数：AST节点和编译器的状态（state）。它的作用是将节点上的class属性转换成v-bind:class指令，以便后续的处理。

3. genData
   这个属性也是一个函数，它接受一个AST节点作为参数，并返回一些额外的数据，这些数据会添加到节点的data对象中。在class模块中，genData的作用是检查节点是否有class属性，如果有的话就将其添加到data对象中。
 */
 
export default {
  staticKeys: ['staticClass'],
  transformNode,
  genData
} as ModuleOptions


