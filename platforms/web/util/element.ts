
/**
`./dist/src/platforms/web/util/element.ts` 文件是 Vue 源码中负责封装 DOM 操作的工具函数。

在 Vue 整个源码中，`./dist/src/platforms/web/util/element.ts` 占据着重要的位置，它被广泛地应用于各个模块中，如虚拟 DOM 的生成、标准化、修补等。因此，了解该文件的作用及其代码实现对于理解整个 Vue 框架的运作原理非常重要。

该文件主要做以下几件事情：

1. 封装 DOM 操作方法，通过 `$domAPI` 对象来访问平台特有的 DOM API。
2. 定义元素操作相关的方法，包括创建元素、插入元素、删除元素、修改元素属性和样式等。
3. 定义事件操作相关的方法，包括添加事件监听、移除事件监听等。
4. 定义文本节点操作相关的方法，包括创建文本节点、设置文本内容等。

总之，`./dist/src/platforms/web/util/element.ts` 文件是 Vue 框架中负责 DOM 操作的核心模块之一，也是 Vue 可以跨平台运行的关键所在。
 */
 



/**
这里的代码导入了两个模块，分别是从`core/util/env`中导入`inBrowser`函数和从`shared/util`中导入`makeMap`函数。

`inBrowser`函数是一个用于检测当前环境是否为浏览器的工具函数。在 Vue 的源码中会有很多地方需要根据不同的环境来执行不同的逻辑，比如 SSR（服务端渲染）和客户端渲染，在这些场景下需要使用不同的 API 和方法。通过调用`inBrowser`函数可以判断当前的环境是否为浏览器，如果是则返回`true`，否则返回`false`。

`makeMap`函数是 Vue 内部常用的工具函数之一，它用于创建一个简单的纯对象映射表，这个映射表可以方便地对比某个值是否存在于这个映射表中。在 Vue 中经常使用该函数来处理类名、标签名等字符串相关的操作。具体来说，`makeMap`接收一个以逗号分隔的字符串作为参数，然后返回一个函数，这个函数会检查传入值是否在这个字符串中出现过，并返回一个布尔值。例如：


```
const isHTMLTag = makeMap('html,body,head,div,p') // 传入字符串
console.log(isHTMLTag('div')) // true
console.log(isHTMLTag('span')) // false
```

以上代码中，我们使用`makeMap`函数创建了一个名为`isHTMLTag`的函数，这个函数会检查传入的值是否在给定的字符串中出现过。我们将字符串`'html,body,head,div,p'`传给`makeMap`函数，然后使用返回的函数检查`'div'`和`'span'`两个值是否在这个字符串中出现过，最终输出结果分别为`true`和`false`。
 */
 
import { inBrowser } from 'core/util/env'
import { makeMap } from 'shared/util'



/**
在Vue2.7.8的源码中，./dist/src/platforms/web/util/element.ts是与浏览器 DOM 元素相关的工具函数模块，其中的 namespaceMap 就是一个命名空间映射对象。

在 XML（包括 SVG 和 MathML）文档中，如果没有指定命名空间，则元素和属性的名称被认为属于默认命名空间。例如，在 HTML 文档中，div 标签属于默认命名空间，而 SVG 中的 rect 标签则属于 SVG 命名空间。

而在 JavaScript 中创建 XML 元素时，需要使用 createElementNS() 方法来指定对应的命名空间。因此，我们需要在 Vue 中对 DOM 操作时，判断元素是否属于命名空间，才能正确地创建对应的标签元素。

namespaceMap 就是一个将命名空间字符串映射到其 URI 的对象。例如，svg 命名空间对应的 URI 是 http://www.w3.org/2000/svg，MathML 命名空间对应的 URI 是 http://www.w3.org/1998/Math/MathML。在使用 createElementNS() 创建元素时，我们可以通过传入该命名空间字符串及 namespaceMap 对象获取其对应的 URI。
 */
 
export const namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
}



/**
这段代码定义了一个名为 `isHTMLTag` 的常量，其值是通过调用 `makeMap` 函数得到的。`makeMap` 函数返回一个函数，它接收一个字符串作为参数，然后判断这个字符串是否存在于一个预设的集合中。

在本例中，预设的集合是由一系列 HTML 标签组成的字符串，包括常见的块元素（如 `<div>`、`<p>`）和内联元素（如 `<a>`、`<span>`）等。因此，当我们调用 `isHTMLTag(tagName)` 时，如果 `tagName` 参数是上述字符串中的任意一个标签，那么返回值将为 `true`，否则为 `false`。

这个常量的作用是在 Vue 执行编译过程时，判断某个标签是否是 HTML 原生标签，从而决定是否需要使用 createElement 方法创建该元素（对于原生标签使用 createElement 方法，对于自定义组件则使用 createComponent 方法）。
 */
 
export const isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
)



/**
在Vue的源码中，`makeMap`是一个用于创建函数的工具函数。它接收一个以逗号分隔的字符串和一个可选的布尔值作为参数，并返回一个函数。这个函数实际上是用来判断一个字符串是否在给定的逗号分隔字符串列表中的。

在这段代码中，`isSVG`是一个用于判断一个标签名字是否为SVG元素的函数。这个函数使用了`makeMap`，并将所有可能包含子元素的SVG元素的标签名字作为一个逗号分隔的字符串传入给`makeMap`。这样生成的`isSVG`函数就可以通过检查传入的标签名字是否存在于这个字符串中来判断该标签是否是SVG元素。这个选择性映射的目的就是只覆盖可能包含子元素的SVG元素，以提高性能。
 */
 
// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
export const isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignobject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
)



/**
在Vue中，模板编译器会对模板进行静态分析，以便在运行时快速生成虚拟DOM。而在模板编译过程中，有一些标签是具有特殊含义的，比如<pre>标签，它里面的HTML代码会被保留，不会被浏览器解析为实际的HTML元素。

在Vue的源码中，./dist/src/platforms/web/util/element.ts文件定义了一些与DOM元素相关的工具函数，其中isPreTag函数用于检测指定的标签是否为<pre>标签。如果是，则返回true，否则返回false。

该函数接收一个可选参数tag，表示要检测的标签名。如果传入的tag等于'pre'，则说明是<pre>标签，返回true；否则返回false。这个判断逻辑主要用于后续的编译过程中，帮助Vue正确地处理<pre>标签，避免在编译过程中出现错误。
 */
 
export const isPreTag = (tag?: string): boolean => tag === 'pre'



/**
在Vue.js中，isReservedTag函数用于检测给定的标签名是否是一个保留的HTML或SVG元素。它被定义在`./dist/src/platforms/web/util/element.ts`文件中。

该函数接收一个参数tag，代表传入的标签名。函数内部调用了两个工具函数isHTMLTag和isSVG来判断tag是否是一个保留的HTML或SVG元素。如果tag是保留的HTML或SVG元素，则该函数返回true，否则返回undefined。

其中，isHTMLTag和isSVG函数用于检测传入的标签名是否是一个合法的HTML或SVG元素。isHTMLTag函数会从浏览器的预定义标签列表中查找标签名，并返回结果。isSVG函数则会先检查当前浏览器是否支持SVG元素，如果支持，则从浏览器的预定义SVG元素列表中查找标签名并返回结果，否则返回false。

通过这种方式，Vue.js可以在渲染模板时快速确定一个元素是否是保留的HTML或SVG元素，并对其进行不同的处理。
 */
 
export const isReservedTag = (tag: string): boolean | undefined => {
  return isHTMLTag(tag) || isSVG(tag)
}



/**
这个函数是用来获取 HTML 标签的命名空间（namespace）的，它接收一个字符串类型的标签名称 `tag` 作为参数。在 HTML 中，有一些元素/标签需要使用特定的命名空间，比如 SVG 标签和 MathML 标签。如果没有正确指定命名空间，浏览器可能无法正确解析渲染相应的内容。

该函数首先调用 `isSVG(tag)` 函数判断当前标签是否为 SVG 标签。如果是，那么返回 `'svg'` 命名空间。

如果不是 SVG 标签，则会判断当前标签是否为 `'math'`。如果是，那么返回 `'math'` 命名空间。这里的目的是为了支持基本的 MathML。

如果既不是 SVG 也不是 MathML 标签，则返回 `undefined`，表示该标签不需要使用特定的命名空间。

总之，该函数主要是用于在创建 VNode 时，根据传入的标签名自动判断是否需要添加命名空间，以保证生成的虚拟节点符合规范。
 */
 
export function getTagNamespace(tag: string): string | undefined {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}



/**
这段代码主要是用于判断传入的标签名字是否为未知元素（unknown element），如果是未知元素，则返回 true，否则返回 false。其中，引入了一个 unknownElementCache 对象来缓存已经判断过的标签。如果这个标签已经在 unknownElementCache 中被缓存过了，则直接从缓存中读取结果并返回；否则，会通过 document.createElement(tag) 创建一个对应的元素，然后进一步判断该元素是否为未知元素。

具体的判断方法如下：
- 如果标签名是保留标签，则不是未知元素。
- 将标签名转换成小写形式，并检查是否已经在 unknownElementCache 中被缓存过了。
- 如果标签名中包含连字符（-），则说明可能是自定义组件，需要进一步检查该元素的构造函数是否为 window.HTMLUnknownElement 或 window.HTMLElement，并将结果缓存到 unknownElementCache 中。
- 否则，将元素对象转换成字符串形式，并检查是否包含 "HTMLUnknownElement" 字符串，并将结果缓存到 unknownElementCache 中。

总之，这段代码主要是用于判断一个标签名是否为未知元素，以便在 Vue 的编译器中进行相应的处理。
 */
 
const unknownElementCache = Object.create(null)
export function isUnknownElement(tag: string): boolean {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase()
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  const el = document.createElement(tag)
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] =
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement)
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}



/**
`makeMap` 是 Vue 源码中的一个工具函数，用于创建一个能够快速判断某个字符串是否在一组给定字符串中出现的函数。

在 `element.ts` 中，`isTextInputType` 的作用是用来判断传入的参数是否为文本输入类型。`makeMap` 将 `'text,number,password,search,email,tel,url'` 字符串按逗号分隔成数组，并返回了一个函数，这个函数接受一个字符串参数并返回一个 boolean 值。如果这个参数是 `'text'`、`'number'`、`'password'`、`'search'`、`'email'`、`'tel'` 或 `'url'` 中的任意一个，则返回 true，否则返回 false。

使用 `makeMap` 可以方便地定义一个可以被多次调用的判断函数。在 `element.ts` 中，`isTextInputType` 用于判断 input 标签的 type 属性是否为文本输入类型，例如：

```
<input type="text" />
```

此时，`isTextInputType('text')` 将会返回 true，因为 'text' 符合文本输入类型的定义。
 */
 
export const isTextInputType = makeMap(
  'text,number,password,search,email,tel,url'
)


