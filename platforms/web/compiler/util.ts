
/**
./dist/src/platforms/web/compiler/util.ts文件的作用是提供了一些编译器所需的工具函数和常量，主要包括以下几个方面：

1. 解析模板中指令属性的函数
2. 判断节点是否为文本节点、注释节点、元素节点、动态组件节点等的函数
3. 创建AST节点的函数
4. 匹配正则表达式的函数
5. 标记静态节点的函数

这些工具函数和常量主要被编译器(vue-template-compiler)用来将Vue的模板编译成渲染函数(render function)，从而实现Vue的模板解析和渲染功能。

在整个Vue的src中，./dist/src/platforms/web/compiler/util.ts文件属于平台相关代码(platform-specific code)部分，它是Vue在Web平台下的编译器实现。在编译器实现中，./dist/src/platforms/web/compiler/util.ts文件与其他编译器相关的文件如ast.ts、codegen/index.ts、directives/index.ts等共同协作，以实现Vue的模板解析和渲染功能。同时，在Vue的运行时实现(runtime implementation)中，./dist/src/core/vdom/create-component.js等文件也会使用./dist/src/platforms/web/compiler/util.ts中定义的一些工具函数。
 */
 



/**
这一行代码的作用是从`shared/util`模块中导入一个名为`makeMap`的方法。`makeMap`方法用来创建一个快速查找某个值是否存在于给定列表中的函数。它接受一个字符串参数，该参数是以逗号分隔的字符串，用于构建一个对象映射，键值对应于给定字符串中的每个值，并且其值为true。 

例如，当我们使用`makeMap('a,b,c')`时，将返回以下对象：

```
{
  a: true,
  b: true,
  c: true
}
```

这个工具方法通常被用来检查标签、属性名等是否属于某个预定义的集合，比如在编译器中判断标签是否为内置的HTML标签或SVG标签。

那么在Vue源码的编译器中，`makeMap`方法是被用来做什么的呢？

在Vue编译器中，它主要被用来判断标签和属性是否为保留关键字或特殊属性，以及指令是否为Vue自带的指令。通过使用`makeMap`方法创建一个对象映射，可以将这些判断操作变得更加高效和灵活。
 */
 
import { makeMap } from 'shared/util'



/**
该代码段中，`isUnaryTag`是一个工具函数，用于判断一个标签名是否是单标签（即没有闭合标签的标签），该函数的实现依赖于`makeMap`工具函数。

在上述代码中，`makeMap`接受一个字符串参数，并将其拆分成数组，用于创建一个对象字面量。这个对象字面量的属性名称为传入的字符串中的每个元素，且值均为`true`。这样一来，我们可以使用该对象字面量作为一个哈希表，快速判断某个字符串是否在原始字符串中出现过。

对于`isUnaryTag`函数，它的作用就是使用`makeMap`工具函数创建了一个包含所有单标签名称的对象字面量，即当传入的标签名位于该对象字面量内时，返回`true`，否则返回`false`。这样一来，在Vue的模板编译过程中，就能够方便地判断哪些标签是单标签，从而正确生成对应的AST节点和VNode节点。
 */
 
export const isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr'
)



/**
在Vue的模板编译过程中，会将模板解析为AST（抽象语法树），并在此基础上生成渲染函数。在这个过程中，需要对HTML标签进行处理。

在HTML中，有一些标签是可以不关闭的，在这些标签中内容会被自动闭合。比如像`<option>`标签在HTML中就可以不用闭合，浏览器会自动添加闭合标签。

而在Vue的模板编译过程中，也需要知道哪些标签可以不用闭合，以便正确地生成渲染函数。因此，在这段代码中，通过调用`makeMap`工具函数生成了一个键值对集合，其中包含了可以不用手动闭合的HTML标签。这个集合被命名为`canBeLeftOpenTag`，它将在模板编译过程中被使用。

总结来说，这段代码的作用是定义了一个可以不用手动闭合的HTML标签集合，方便Vue在模板编译时正确地生成渲染函数。
 */
 
// Elements that you can, intentionally, leave open
// (and which close themselves)
export const canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
)



/**
这段代码是在定义一个名为 `isNonPhrasingTag` 的函数，它接受一个参数并返回一个布尔值。这个函数用于检查传入的标签是否被视为非短语内容标签。

所谓“非短语内容标签”，指的是 HTML5 中一些特定的标签，这些标签不应该被包含在短语级别的内容中，例如 `<p>` 标签内部不能包含 `<div>` 标签等。在 Vue 的编译器中，这个函数主要用于生成对应的 AST（Abstract Syntax Tree）节点，以便后续将其转换为真正的 DOM 元素。

该函数使用了名为 `makeMap` 的工具函数，它将一个以逗号分隔的字符串作为参数，返回一个包含这些字符串作为键的对象。在这里，我们把所有的非短语内容标签组成的字符串作为参数传入 `makeMap` 函数，并将返回的对象赋值给 `isNonPhrasingTag` 变量。这样，我们就可以通过调用 `isNonPhrasingTag` 函数并传入任意一个标签名来判断它是否是非短语内容标签了。
 */
 
// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
export const isNonPhrasingTag = makeMap(
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
    'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
    'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
    'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
    'title,tr,track'
)


