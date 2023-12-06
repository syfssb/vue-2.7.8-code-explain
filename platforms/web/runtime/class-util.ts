
/**
`class-util.ts` 文件是 Vue 源码中用于处理 class 相关操作的工具函数模块，其主要包括以下几个功能：

1. `addProp`: 该函数用于向 VNode 的 `data` 对象的 `class` 属性添加新的类名。如果 `class` 属性已经存在，则会将新的类名与原有的类名合并，否则会创建一个新的 `class` 属性并赋值为当前的类名。

2. `addClass`: 该函数用于向 VNode 的 `data` 对象的 `class` 属性添加单个类名。如果 `class` 属性已经存在，则会将新的类名追加到原有的类名之后，否则会创建一个新的 `class` 属性并赋值为当前的类名。

3. `removeClass`: 该函数用于从 VNode 的 `data` 对象的 `class` 属性中删除一个指定的类名。如果 `class` 属性不存在则不执行任何操作，如果存在且其中包含了要删除的类名，则会将其删除。

这些函数被其他 Vue 组件库的源码所调用，在组件渲染时对 class 类名进行操作，比如在 `VueRouter` 中使用路由切换时动态改变组件 class 类名以实现过渡动画效果。
 */
 



/**
在Vue的源码中，./dist/src/platforms/web/runtime/class-util.ts是一个工具文件，主要用于处理DOM元素的class类名。其中，whitespaceRE是一个正则表达式变量，它的值是/\s+/。

这个正则表达式的含义是匹配一个或多个空格符。在Vue中，我们经常需要操作DOM元素的class类名，比如添加、删除、切换类名等。但是在操作之前，通常需要对类名进行处理，比如去除多余的空格符、分隔符等。whitespaceRE就是为了这个目的而存在的。通过使用这个正则表达式，我们可以很方便地匹配到字符串中的所有空格符，并进行相应的处理。

举个例子，假设我们有一个类名字符串"   foo  bar  baz   "，如果我们想把其中的多余空格符去除，只保留一个空格符作为分隔符，可以这样写：

```js
const className = "   foo  bar  baz   "
const trimmedClassName = className.replace(whitespaceRE, ' ').trim()
console.log(trimmedClassName) // "foo bar baz"
```

在上面的代码中，我们使用了whitespaceRE来替换掉多余的空格符，并使用trim方法去除首尾空格符，从而得到了一个干净的类名字符串"foo bar baz"。
 */
 
const whitespaceRE = /\s+/



/**
这段代码的作用是向DOM元素添加class，但是由于IE浏览器不支持SVG元素上的classList属性，所以这里使用了一个兼容性处理。该函数接收两个参数，第一个参数el是要添加class的DOM元素，第二个参数cls是要添加的class名字。在代码中通过判断传入的cls是否存在和是否为空格字符串来进行一些简单的过滤处理。如果传入的cls为undefined或者为空，则直接返回，不进行任何操作。如果传入了要添加的class名字，则对其进行trim()处理，去除首尾空格。最后，通过调用元素的setAttribute()方法，在元素上添加class。利用了setAttribute方法可以向SVG元素上添加class的特性，达到兼容SVG元素的目的。
 */
 
/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
export function addClass(el: HTMLElement, cls?: string) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }



/**
这段代码是封装了一个添加class的方法，可以通过传入DOM元素和要添加的class名来实现对DOM元素的class进行修改或者新增。下面是这段代码的详细解释：

首先判断`el.classList`是否存在，`classList`是DOM元素自带的一个属性，它包含了该元素的所有class，如果存在，则直接调用`classList.add`方法添加需要添加的class。

如果`classList`不存在，则说明浏览器版本比较旧，没有支持`classList`，此时我们就需要手动去设置class。具体做法是获取该元素的原有的class，并判断是否已经存在需添加的class，如果不存在，则将新class添加到原有的class后面并重新赋值给该元素的`class`属性。如果原有class已经包含需添加的class，则不做任何操作。

需要注意的是，` `是一种注释语法，用于告诉代码覆盖率工具istanbul忽略else分支的计算，因为在这里else分支是由浏览器版本决定的，无法在测试中模拟出现，因此忽略掉这个分支不影响测试结果。
 */
 
  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(c => el.classList.add(c))
    } else {
      el.classList.add(cls)
    }
  } else {
    const cur = ` ${el.getAttribute('class') || ''} `
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim())
    }
  }
}



/**
这段代码实现的是移除指定元素的类名（class），其中针对SVG元素做了兼容处理。首先会判断传入的类名是否存在（cls参数是否为undefined或空字符串），如果不存在，则直接返回，不做任何操作。如果存在，则将cls参数去除前后空格，并根据classList属性是否支持来执行对应的操作。

在IE浏览器中，SVG元素不支持classList属性，所以需要使用el.getAttribute('class')获取当前元素的类名，并进行一系列处理后再重新设置元素的类名；对于其他支持classList属性的浏览器，则直接使用classList.remove()方法来移除元素的指定类名。

需要注意的是，由于该函数主要用于DOM操作，因此在测试覆盖率上，有时候需要忽略这部分代码。
 */
 
/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
export function removeClass(el: HTMLElement, cls?: string) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }



/**
这段代码的作用是移除一个元素 el 的 class 类名。该方法分为两个部分，首先判断浏览器是否支持 classList 属性，如果支持，则直接使用 classList 对象来操作 DOM 的 class。如果不支持，则使用getAttribute和setAttribute方法来获取和设置 class。

在第一部分中，如果被移除的类名 cls 中包含空格，则使用正则表达式 whitespaceRE 将其拆分成多个类名，然后遍历所有类名逐一从元素的 classList 对象中移除。如果移除后该元素的 classList 长度为0，则删除 class 属性。

在第二部分中，如果浏览器不支持 classList，则使用 getAttribute 和 setAttribute 方法来获取和设置 class 属性。首先通过 getAttribute 获取元素当前的 class 值，然后将要移除的类名 cls 拼接成完整的字符串 tar（前后各加了一个空格）。接着使用 while 循环将元素当前的 class 值（cur）中的 tar 字符串替换为空字符串，最后再使用 trim 方法去掉开头和结尾的空格。如果处理完后 cur 不为空，则使用 setAttribute 方法将其设置为元素的新 class 值，否则使用 removeAttribute 方法移除 class 属性。
 */
 
  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(c => el.classList.remove(c))
    } else {
      el.classList.remove(cls)
    }
    if (!el.classList.length) {
      el.removeAttribute('class')
    }
  } else {
    let cur = ` ${el.getAttribute('class') || ''} `
    const tar = ' ' + cls + ' '
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ')
    }
    cur = cur.trim()
    if (cur) {
      el.setAttribute('class', cur)
    } else {
      el.removeAttribute('class')
    }
  }
}


