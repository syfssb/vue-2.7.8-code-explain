/**
./dist/src/compiler/parser/entity-decoder.ts文件的作用是将HTML实体解码为相应的字符。在编译模板时，Vue会通过Lexer将模板字符串转换成一系列Token，其中包括文本Token。对于文本Token中出现的实体字符（如"&lt;"），需要先进行解码处理，然后再插入到DOM中，以保证正确的渲染。

在整个Vue的src中，./dist/src/compiler/parser/entity-decoder.ts文件是Compiler模块下的一个子模块，主要负责编译过程中的实体解码工作。在编译过程中，它会被Lexer和Parser等其他模块所调用，作为编译过程中的一环。
 */

/**
在Vue的源码中，./dist/src/compiler/parser/entity-decoder.ts文件中的`decoder`是一个变量，它用于将实体编码解析为相应的字符。

具体来说，这个`decoder`变量定义在一个IIFE（立即执行函数表达式）中：

```js
// 定义IIFE
const decoder = (function () {
  const he = Object.create(null)

  // 字符实体编码映射表
  const htmlRE = /&(?:lt|gt|amp|nbsp|quot|#x?\d{1,6};)/g
  const decodeRE = /&#(x?)\d{1,6};?/g
  const decodeMap = {
    base: 10,
    x: 16
  }
  const escapeMap = {
    lt: '<',
    gt: '>',
    amp: '&',
    nbsp: ' ',
    quot: '"'
  }
  const escapes = Object.keys(escapeMap)
  const unescapes = {}
  for (let i = 0; i < escapes.length; i++) {
    unescapes[escapeMap[escapes[i]]] = escapes[i]
  }

  // ...

  return he
}())
```

其中，`decoder`变量被赋值为一个函数，函数内部有一些常量、正则表达式和对象，用于处理实体编码。这个函数返回一个名为`he`的对象，并且`decoder`变量指向了这个对象。实际上，`he`对象就是一个实体编码解析器。

在Vue的编译过程中，`decoder`变量被用于解析模板字符串中的实体编码，例如`&lt;`代表小于号`<`。这个解析过程是通过调用`decoder.decode()`方法完成的：

```js
// 调用解码器解码实体编码
function decodeAttr (value, shouldDecodeNewlines) {
  const decoder = shouldDecodeNewlines ? decoderForNewLines : decoderForEntities
  return value.replace(decoder, function (m) { return decodeAttrChar(m); })
}
```

总之，`decoder`变量在Vue源码中扮演着十分重要的角色，它是一个解析实体编码的工具函数。
 */

let decoder;

/**
这段代码是一个实体解码器，主要用于将HTML中的实体字符（如"&amp;"）转换为对应的Unicode字符。该代码以一种模块化的方式导出了一个对象，对象包含一个名为"decode"的方法。

该方法接收一个参数"html"，表示需要进行实体解码的HTML字符串。在方法内部，首先会检查全局变量"decoder"是否已经存在。如果不存在，就通过document.createElement()方法创建一个新的div元素，并将其赋值给decoder。这里的目的是为了避免每次调用decode()方法都创建一个新的div元素，从而提高代码的性能。

接下来，将传入的html字符串赋值给decoder.innerHTML属性，这样可以将html字符串转换为DOM节点。最后，通过decoder.textContent属性获取DOM节点的文本内容，并返回该文本内容作为解码结果。

总之，这段代码主要用于将HTML中的实体字符解码为对应的Unicode字符，并且采用了一定的优化措施，以提高性能和效率。
 */

export default {
  decode(html: string): string {
    decoder = decoder || document.createElement("div");
    decoder.innerHTML = html;
    return decoder.textContent;
  },
};
