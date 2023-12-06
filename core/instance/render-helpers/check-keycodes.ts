
/**
`./dist/src/core/instance/render-helpers/check-keycodes.ts`文件定义了一个用于检查按键编码的工具函数，在Vue渲染DOM节点时，可以通过该函数来判断绑定的事件是否是指定的按键触发。该函数主要包括以下几个部分：

1. 定义了一个KeyCodes对象，包含了常见的按键编码及其对应的名称。
2. 定义了一个createFnInvoker函数，用于创建一个包装器函数，将传入的函数fn进行包装，并返回新的函数。
3. 定义了checkKeyCodes函数，用于检查绑定的事件是否是指定的按键触发。该函数接收一个数组keyCodes作为参数，遍历keyCodes数组中的每个项，判断其是否在KeyCodes对象中存在，如果存在则返回true，否则返回false。

该文件并不是整个Vue源码中最核心的部分，它只是Vue源码中的一部分辅助函数库，主要被用于支持Vue的模板语法和底层实现。在Vue源码中，checkKeyCodes 函数主要被用于处理v-on指令中的按键修饰符，如v-on:keyup.enter等等。
 */
 



/**
在Vue源码中，`check-keycodes.ts`这个文件主要用于检查和处理键码的相关操作。在该文件中，首先通过`import config from 'core/config'`语句引入了Vue实例的配置对象，这个配置对象包含了很多全局配置选项，比如是否开启严格模式、错误处理函数等等。

然后，通过`import { hyphenate, isArray } from 'shared/util'`语句引入了`shared/util`模块中的`hyphenate`和`isArray`两个工具函数。其中，`hyphenate`函数主要用于将驼峰命名的字符串转换为以连字符分隔的字符串，比如将`myName`转换为`my-name`；而`isArray`函数则用于判断一个值是否为数组类型。

这两个工具函数在`check-keycodes.ts`文件中被用来处理键码的配置信息，比如将驼峰命名的键名转换为以连字符分隔的键名，并检查配置的键码是否为数组类型。总的来说，`check-keycodes.ts`文件利用了Vue的全局配置对象和一些常用的工具函数，提供了一个方便有效的键码处理机制。
 */
 
import config from 'core/config'
import { hyphenate, isArray } from 'shared/util'



/**
这段代码是用来判断一个按键是否与期望的按键匹配的函数。具体来说，这个函数接收两个参数：一个期望的按键（可以是单个按键或按键数组），以及实际按下的按键。

首先，函数会检查期望的按键是否是一个数组，如果是，则使用`indexOf`方法判断实际按键是否在期望的按键数组中出现过，如果没有则返回`true`表示不匹配，否则返回`false`表示匹配。

如果期望的按键不是数组，那么就直接比较期望的按键和实际按键是否相等，相等则返回`false`表示匹配，不相等则返回`true`表示不匹配。

总之，这个函数的作用就是帮助检查按键是否符合要求，如果不符合则返回`true`，否则返回`false`。
 */
 
function isKeyNotMatch<T>(expect: T | Array<T>, actual: T): boolean {
  if (isArray(expect)) {
    return expect.indexOf(actual) === -1
  } else {
    return expect !== actual
  }
}



/**
这段代码是Vue在处理按键事件时使用的一个辅助函数。它通过检查传入的按键码数值、按键名称、内置按键码数值和内置按键名称来确定是否匹配预期的按键。

该函数主要接收五个参数：

- eventKeyCode: 表示当前触发事件的按键码数值。
- key: 表示当前绑定的按键名称，可以是自定义的按键名称或者内置的按键名称（如"enter"）。
- builtInKeyCode: 表示内置的按键码数值或者一组内置的按键码数值。
- eventKeyName: 表示当前触发事件的按键名称，用于向后兼容。
- builtInKeyName: 表示内置的按键名称或者一组内置的按键名称。

首先，该函数会尝试从全局配置对象config.keyCodes中获取与当前按键名称key对应的按键码数值，如果不存在则使用内置的按键码数值builtInKeyCode。

然后，如果存在内置按键名称builtInKeyName和当前触发事件的按键名称eventKeyName，并且config.keyCodes中没有与当前按键名称key对应的按键码数值，则调用isKeyNotMatch函数判断两者是否匹配。

接着，如果mappedKeyCode存在，就调用isKeyNotMatch函数判断eventKeyCode和mappedKeyCode是否匹配。

最后，如果eventKeyName存在，则将其转换为连字符形式（如"enter"转换为"key-enter"），并判断是否与传入的按键名称key匹配。如果都不匹配，则返回undefined。

最终，如果eventKeyCode为undefined，则返回undefined，否则返回false表示匹配成功，返回true表示匹配失败。
 */
 
/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */
export function checkKeyCodes(
  eventKeyCode: number,
  key: string,
  builtInKeyCode?: number | Array<number>,
  eventKeyName?: string,
  builtInKeyName?: string | Array<string>
): boolean | null | undefined {
  const mappedKeyCode = config.keyCodes[key] || builtInKeyCode
  if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
    return isKeyNotMatch(builtInKeyName, eventKeyName)
  } else if (mappedKeyCode) {
    return isKeyNotMatch(mappedKeyCode, eventKeyCode)
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key
  }
  return eventKeyCode === undefined
}


