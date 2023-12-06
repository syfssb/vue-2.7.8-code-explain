
/**
./dist/src/core/util/lang.ts 文件主要提供了一些通用工具函数，用于处理 JavaScript 基本数据类型，并且这些函数是 Vue 内部使用的。具体来说，这个文件中定义的函数包括：

- isReserved：检查字符串是否是保留字（如 JavaScript 的关键字）；
- def：为对象定义新属性或更新现有属性；
- parsePath：解析对象属性路径，比如 'a.b.c'；
- hasProto：检查当前环境是否支持 __proto__；
- copyOwnProperties：复制对象自身的所有属性到目标对象中。

这个文件在整个 Vue 源码中被广泛使用，尤其是在其他核心模块中。例如，在响应式模块中，parsePath 函数用于解析表达式中的属性路径；在全局 API 模块中，def 函数被用于定义 Vue.config、Vue.options 等静态配置；而在虚拟 DOM 模块中，copyOwnProperties 函数被用于复制原始 VNode 对象的属性到克隆对象中。总之，./dist/src/core/util/lang.ts 文件可以说是 Vue 源码的基础工具库之一，它为其他模块提供了必要的工具和支持。
 */
 



/**
这段代码定义了一个正则表达式 `unicodeRegExp`，它用于匹配 HTML 标签、组件名称和属性路径中合法的 Unicode 字符。

这个正则表达式的具体含义为：

* `a-zA-Z`：匹配所有 ASCII 大小写字母。
* `\u00B7`：中间点字符（·）。
* `\u00C0-\u00D6`：拉丁字母。
* `\u00D8-\u00F6`：拉丁字母。
* `\u00F8-\u037D`：拉丁字母、希腊字母、西里尔字母、亚美尼亚字母等。
* `\u037F-\u1FFF`：其他语言字母，如古希腊字母、基本多文种平面中的一些辅助汉字等。
* `\u200C-\u200D`：零宽度非连接符和零宽度连接符。
* `\u203F-\u2040`：下划线和差号。
* `\u2070-\u218F`：数学符号、箭头、技术符号、方块元素等。
* `\u2C00-\u2FEF`：格拉哥里字母、楔形文字、苏美尔字母等。
* `\u3001-\uD7FF`：CJK 统一表意符号、带音节文字符号等。
* `\uF900-\uFDCF`：CJK 兼容象形文字、部首扩展等。
* `\uFDF0-\uFFFD`：其他语言的符号、标点、半角片假名、全角片假名等。

这个正则表达式并不包含 \u10000-\uEFFFF 这一范围内的字符，是因为该范围内的字符可能会导致 PhantomJS 卡死。
 */
 
/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 */
export const unicodeRegExp =
  /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/



/**
这段代码主要是用来判断一个字符串是否以 "$" 或 "_" 开头，如果是则返回 true，否则返回 false。

这个函数的实现非常简单，它首先将传入的字符串转换成字符串类型，并获取该字符串的第一个字符的 Unicode 编码 (使用 `charCodeAt(0)`)，然后与 0x24 和 0x5f 进行比较。其中，0x24 对应的是 "$" 字符的 Unicode 编码，0x5f 对应的是 "_" 字符的 Unicode 编码。

如果传入的字符串以 "$" 或 "_" 开头，则其第一个字符的 Unicode 编码与 0x24 或 0x5f 中的一个相等，此时函数会返回 true；否则，函数会返回 false。

这个函数的主要作用是在 Vue.js 的内部实现中，用来避免使用者在定义组件或者添加自定义属性时，不小心使用了以 "$" 或 "_" 开头的变量名，从而覆盖了 Vue.js 内部已有的一些属性或方法。
 */
 
/**
 * Check if a string starts with $ or _
 */
export function isReserved(str: string): boolean {
  const c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5f
}



/**
这段代码是定义一个函数 `def`，它用于给一个对象定义一个新属性或者修改已有属性的值。

该函数接收四个参数：
- `obj`：要被添加/修改属性的对象。
- `key`：属性名。
- `val`：属性的值。
- `enumerable`：可选参数，表示属性是否可枚举，默认为 `false`。

在函数内部，使用 `Object.defineProperty` 方法给 `obj` 对象定义（或修改）属性 `key`，并设置相应的属性描述符。其中：

- `value: val` 表示该属性的值为 `val`。
- `enumerable: !!enumerable` 表示该属性是否可枚举（转成布尔值后，如果 `enumerable` 为真，则表示该属性可枚举；否则不可枚举）。
- `writable: true` 表示该属性的值可以被修改。
- `configurable: true` 表示该属性的描述符可以被修改或删除。

通过这个函数，我们可以方便地给一个对象添加新属性，也可以灵活地控制该属性的特性。
 */
 
/**
 * Define a property.
 */
export function def(obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}



/**
这段代码主要是定义了一个解析简单路径的函数parsePath，用于将一个点分隔的字符串路径转换为一个函数，该函数可以在给定对象上获取路径指向的值。

具体来说，这个函数接收一个参数path表示路径，先通过正则表达式判断路径是否合法。如果不合法，则直接返回。然后再将路径按'.'分隔成一个数组segments。最后返回一个匿名函数，该函数接收一个参数obj即对象，并通过循环遍历segments数组来依次获取对象中对应属性的值。如果某个属性不存在，则返回undefined。

举个例子，假设我们有以下对象：

```
const obj = {
  name: '张三',
  age: 18,
  address: {
    city: '北京',
    street: '朝阳区'
  }
}
```

如果我们调用parsePath('name')，会返回一个函数，该函数接收一个参数obj并返回obj['name']即'张三'。如果调用parsePath('address.street')，则返回一个函数，该函数接收一个参数obj并返回obj['address']['street']即'朝阳区'。
 */
 
/**
 * Parse simple path.
 */
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`)
export function parsePath(path: string): any {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}


