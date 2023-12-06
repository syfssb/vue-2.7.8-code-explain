
/**
`transition-util.ts` 文件的作用是为 Vue 的过渡效果提供了一些工具函数，这些函数包括：

- `enter()`: 定义元素进入过渡时的行为；
- `leave()`: 定义元素离开过渡时的行为；
- `ensureCSSValue()`: 确保 CSs 值的格式正确；
- `getElementPosition()`: 获取元素在页面中的位置和尺寸；
- `applyTranslation()`: 对元素应用平移变换。

在整个 Vue 的源码中，它与其他文件的关系主要体现在以下几个方面：

1. 该文件属于 `platforms/web/runtime` 目录下，主要服务于 Vue 在 Web 平台上的运行；
2. 它被 `transition.ts` 文件所引用，作为 Vue 过渡效果的底层实现；
3. 它依赖于 `dom-util.ts` 和 `style.ts` 两个文件中的一些工具函数，借此完成对元素的操作。
 */
 



/**
这段代码主要是引入了一些Vue源码中用于处理过渡动画的工具函数和工具方法。

其中，`inBrowser` 和 `isIE9` 都是从 `core/util/index` 中导入的。它们分别用于判断当前是否在浏览器环境下以及是否是IE9浏览器。

`addClass` 和 `removeClass` 是从 `web/runtime/class-util` 中导入的，它们用于给DOM元素添加或删除CSS类名，用于实现过渡动画效果。

`remove`、`extend` 和 `cached` 则是从 `shared/util` 中导入的。它们都是一些常用的工具方法，`remove` 用于删除数组中指定的元素，`extend` 用于将多个对象合并成一个对象，`cached` 则可以生成一个带缓存的函数。这些方法在 Vue 的源码中被广泛使用。
 */
 
import { inBrowser, isIE9 } from 'core/util/index'
import { addClass, removeClass } from 'web/runtime/class-util'
import { remove, extend, cached } from 'shared/util'



/**
这段代码主要是用来解析过渡动画的配置。该函数接受一个参数 `def`，它可以是一个字符串或对象类型。

如果 `def` 为空，直接返回 `undefined`，否则进行下面的操作：

如果 `def` 是一个对象类型，则通过 `autoCssTransition` 函数生成 CSS 过渡动画的配置，然后调用 `extend` 函数将 `def` 对象和生成的 CSS 配置合并，并返回结果。

如果 `def` 是一个字符串类型，则直接调用 `autoCssTransition` 函数生成 CSS 过渡动画的配置，并返回结果。

其中 `autoCssTransition` 函数也在同一文件中定义，它主要是根据传入的过渡名称生成对应的 CSS 类名，例如将过渡名称 `fade` 转换为 `fade-enter`、`fade-leave-to` 等。
 */
 
export function resolveTransition(
  def?: string | Record<string, any>
): Record<string, any> | undefined {
  if (!def) {
    return
  }
  /* istanbul ignore else */
  if (typeof def === 'object') {
    const res = {}
    if (def.css !== false) {
      extend(res, autoCssTransition(def.name || 'v'))
    }
    extend(res, def)
    return res
  } else if (typeof def === 'string') {
    return autoCssTransition(def)
  }
}



/**
这段代码定义了一个函数 `autoCssTransition`，该函数接受一个字符串类型的参数 `name`，返回一个对象。该对象有以下 6 个属性：

- `enterClass`: 进入过渡动画开始时的 CSS 类名，即 `${name}-enter`。
- `enterToClass`: 进入过渡动画结束时的 CSS 类名，即 `${name}-enter-to`。
- `enterActiveClass`: 进入过渡动画应用时的 CSS 类名，即 `${name}-enter-active`。
- `leaveClass`: 离开过渡动画开始时的 CSS 类名，即 `${name}-leave`。
- `leaveToClass`: 离开过渡动画结束时的 CSS 类名，即 `${name}-leave-to`。
- `leaveActiveClass`: 离开过渡动画应用时的 CSS 类名，即 `${name}-leave-active`。

这里使用了 `cached` 函数对 `autoCssTransition` 进行了缓存。`cached` 函数的作用是创建一个缓存对象，如果缓存对象中已经存在相同的 key，直接返回缓存值，否则执行函数并将结果保存到缓存对象中。这样可以提高程序性能，避免重复计算。所以，当多次调用 `autoCssTransition` 时，只会执行一次函数体内部的代码，后续的调用都会直接返回缓存中的结果，而不需要重新计算。
 */
 
const autoCssTransition: (name: string) => Object = cached(name => {
  return {
    enterClass: `${name}-enter`,
    enterToClass: `${name}-enter-to`,
    enterActiveClass: `${name}-enter-active`,
    leaveClass: `${name}-leave`,
    leaveToClass: `${name}-leave-to`,
    leaveActiveClass: `${name}-leave-active`
  }
})



/**
在Vue中，有很多动画和过渡效果的功能可以使用。这些动画和过渡效果是通过 CSS3 的 transition 和 animation 属性来实现的。在 Vue 中，我们可以使用一些内置的工具函数来方便地处理这些动画和过渡效果。

其中，./dist/src/platforms/web/runtime/transition-util.ts 这个文件是 Vue 用来处理动画和过渡效果的工具函数。该文件中定义了一个常量 hasTransition，它表示当前浏览器是否支持 CSS3 的 transition 属性，并且不是 IE9 浏览器。如果当前浏览器不支持 CSS3 的 transition 属性或者是 IE9，那么 hasTransition 就为 false。

同时，该文件也定义了两个常量 TRANSITION 和 ANIMATION，分别表示 CSS3 的 transition 和 animation 属性的名称。在后续的代码中，将会使用这些常量来操作 CSS3 的动画和过渡效果。
 */
 
export const hasTransition = inBrowser && !isIE9
const TRANSITION = 'transition'
const ANIMATION = 'animation'



/**
这段代码主要实现了对浏览器 transition 和 animation 属性以及事件的嗅探。其中 transitionProp、transitionEndEvent、animationProp、animationEndEvent 四个变量分别存储了 transition 属性、transition 结束事件、animation 属性、animation 结束事件。

在代码中，首先将 transitionProp、transitionEndEvent、animationProp、animationEndEvent 四个变量赋值为默认值 'transition'、'transitionend'、'animation'、'animationend'。然后使用 hasTransition 变量判断当前浏览器是否支持 transition 属性，若支持，则检查 ontransitionend 和 onwebkittransitionend 两个事件是否都存在，若 ontransitionend 不存在但 onwebkittransitionend 存在，则表示当前浏览器是 Webkit 内核浏览器，需要将 transitionProp 和 transitionEndEvent 分别修改为 'WebkitTransition' 和 'webkitTransitionEnd' 以适配该浏览器。同样地，如果浏览器支持 animation 属性，则检查 onanimationend 和 onwebkitanimationend 两个事件是否都存在，若 onanimationend 不存在但 onwebkitanimationend 存在，则同样表示当前浏览器是 Webkit 内核浏览器，需要将 animationProp 和 animationEndEvent 分别修改为 'WebkitAnimation' 和 'webkitAnimationEnd' 以适配该浏览器。

这样，在 Vue 的过渡动画和动画组件中，就可以通过这四个变量来判断浏览器对于过渡和动画的支持情况，并进行相应的兼容处理。
 */
 
// Transition property/event sniffing
export let transitionProp = 'transition'
export let transitionEndEvent = 'transitionend'
export let animationProp = 'animation'
export let animationEndEvent = 'animationend'
if (hasTransition) {
  /* istanbul ignore if */
  if (
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  ) {
    transitionProp = 'WebkitTransition'
    transitionEndEvent = 'webkitTransitionEnd'
  }
  if (
    window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  ) {
    animationProp = 'WebkitAnimation'
    animationEndEvent = 'webkitAnimationEnd'
  }
}



/**
这段代码的作用是定义一个 `raf` (requestAnimationFrame) 函数，它用于在浏览器中执行动画或处理其他重复性任务时实现平滑渲染。

这个函数的具体实现取决于当前是否处于浏览器环境中。如果是浏览器环境，则直接使用 `window.requestAnimationFrame` 函数，否则使用 `setTimeout` 函数来模拟实现 `requestAnimationFrame` 函数。

值得注意的是，在浏览器环境中绑定到 `window` 对象上是必要的，因为这样才能在严格模式下让 IE 中的热重载正常工作。而对于非浏览器环境，这里使用了注释将其忽略，因为该函数不会被调用。
 */
 
// binding to window is necessary to make hot reload work in IE in strict mode
const raf = inBrowser
  ? window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout
  : /* istanbul ignore next */ fn => fn()



/**
`./dist/src/platforms/web/runtime/transition-util.ts`文件中的`nextFrame`函数，是用来在下一帧执行指定的函数。它利用了浏览器提供的`requestAnimationFrame`（raf）API 来实现。

具体实现：

1. `raf()`函数被调用时，会向浏览器请求在下一帧执行回调函数。
2. 在回调函数中再调用`raf(fn)`，也就是在下下一帧执行`fn`函数。

这两个`raf()`函数调用的结果就是，在下一帧执行一个空的回调函数，而在下下一帧再真正执行`fn`函数。

需要注意的是，由于TypeScript的类型检查限制，我们需要加上`@ts-expect-error`注释，以忽略编译器的错误提示，因为`raf(fn)`可能不符合`raf()`函数的类型定义。
 */
 
export function nextFrame(fn: Function) {
  raf(() => {
    // @ts-expect-error
    raf(fn)
  })
}



/**
这段代码是Vue源码中的关于过渡动画类名添加的工具函数。它实现了向DOM元素el中添加一个过渡动画类名cls的功能，同时也保证每个类名只会被添加一次。

具体来说，它首先从DOM元素上获取已经存在的过渡动画类名数组_transitionClasses（如果没有则创建一个空数组），然后判断要添加的类名cls是否已经在数组中存在，如果不存在，则将其添加到数组中，并使用addClass(el, cls)方法将该类名添加到DOM元素el的classList中。这里的addClass()是另外一个工具函数，它用于向DOM元素中添加类名。最后返回添加完类名的DOM元素el对象。

总的来说，这个函数的作用就是往DOM元素中添加过渡动画类名，以触发过渡动画。通过在过渡的不同状态中添加或移除不同的类名，可以实现丰富多样的过渡效果。
 */
 
export function addTransitionClass(el: any, cls: string) {
  const transitionClasses =
    el._transitionClasses || (el._transitionClasses = [])
  if (transitionClasses.indexOf(cls) < 0) {
    transitionClasses.push(cls)
    addClass(el, cls)
  }
}



/**
这个函数的作用是用来移除元素中的过渡类名，实现过渡动画的结束效果。

这个函数接收两个参数：`el`和`cls`，其中`el`代表需要移除过渡类名的元素，`cls`代表需要移除的过渡类名。

首先判断传入的`el`元素是否有`_transitionClasses`属性。`_transitionClasses`是用来存储元素所添加的过渡类名的数组，如果存在该属性，则调用`remove`函数从数组中移除要移除的过渡类名`cls`。

接下来调用`removeClass`函数，将要移除的过渡类名从元素的`class`属性中删除。`removeClass`函数会遍历`el.classList`（元素的所有类名），找到匹配要移除的类名`cls`，并调用`el.classList.remove(cls)`方法进行移除。
 */
 
export function removeTransitionClass(el: any, cls: string) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls)
  }
  removeClass(el, cls)
}



/**
这段代码定义了一个用于监听过渡/动画结束事件的工具函数 `whenTransitionEnds` 方法。它接受三个参数：

1. `el`: 需要监听过渡/动画结束事件的元素。
2. `expectedType`: 可选，期望的过渡类型，可以是 `transition` 或者 `animation`。
3. `cb`: 监听到过渡/动画结束事件后需要执行的回调函数。

函数首先会调用 `getTransitionInfo` 获取对应元素的过渡/动画信息，包括过渡类型、时间间隔和属性数量等参数。如果获取不到过渡类型，则直接执行回调函数并返回。否则，根据过渡类型绑定对应的事件（`transitionend` 或 `animationend`）并监听其触发时的回调函数 `onEnd`，当所有过渡/动画结束之后，执行传入的回调函数 `cb()`。

为了解决某些浏览器不能正确地触发 `transitionend` 或 `animationend` 事件的问题，还会在超时时间后自动执行一次回调函数。

这个工具函数的作用是在 Vue 过渡系统中非常重要的一部分，用于检测元素上的过渡/动画是否已经结束，以便于在动态添加/删除 DOM 元素时触发合适的过渡效果。
 */
 
export function whenTransitionEnds(
  el: Element,
  expectedType: string | undefined,
  cb: Function
) {
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType)
  if (!type) return cb()
  const event: string =
    type === TRANSITION ? transitionEndEvent : animationEndEvent
  let ended = 0
  const end = () => {
    el.removeEventListener(event, onEnd)
    cb()
  }
  const onEnd = e => {
    if (e.target === el) {
      if (++ended >= propCount) {
        end()
      }
    }
  }
  setTimeout(() => {
    if (ended < propCount) {
      end()
    }
  }, timeout + 1)
  el.addEventListener(event, onEnd)
}



/**
在Vue的过渡动画中，我们可以通过transition CSS类来触发动画效果。这个文件中定义了一个函数 `applyTransition`，它用于应用过渡动画。

在该函数内部，使用正则表达式 `transformRE` 检查传入的 `vnode` 中是否包含属性名为 `transform` 或者 `all` 的 CSS 属性，在这里，`\b` 表示一个单词的边界（word boundary），`(transform|all)` 表示匹配 transform 或 all 这两个字符串，`,` 表示匹配后面可能跟着逗号。也就是说，如果一个属性名包含了 transform 或 all 且其后面跟着逗号或者该属性名就是字符串的结尾（即没有后续属性），那么这个属性就会被认为是 transform 相关的属性。

这个正则表达式的作用是用于判断是否存在 transform 相关的 CSS 属性，如果存在，需要在执行过渡动画前将其暂时禁用（因为 transform 会影响元素的位置和大小，会干扰过渡动画的执行），等到过渡动画执行完毕再恢复。
 */
 
const transformRE = /\b(transform|all)(,|$)/



/**
这段代码的作用是获取元素的过渡信息，包括 transition 和 animation 的相关属性。它接受两个参数：

- el: 需要获取过渡信息的元素
- expectedType?: 元素预期的类型，可选值为 'transition'、'animation'。

这个函数会返回一个对象，其中包含以下属性：

- type: 过渡类型，可选值为 null、'transition'、'animation'。
- propCount: 具有过渡效果的属性数量。
- timeout: 过渡的总时间。
- hasTransform: 是否包含 transform 属性。

具体实现上，该函数通过使用 `window.getComputedStyle(el)` 方法获取元素的计算样式，然后解析出 transition 和 animation 相关属性的值，并使用 `getTimeout` 函数计算出过渡的总时间。最后返回一个包含计算结果的对象。
 */
 
export function getTransitionInfo(
  el: Element,
  expectedType?: string
): {
  type?: string | null
  propCount: number
  timeout: number
  hasTransform: boolean
} {
  const styles: any = window.getComputedStyle(el)
  // JSDOM may return undefined for transition properties
  const transitionDelays: Array<string> = (
    styles[transitionProp + 'Delay'] || ''
  ).split(', ')
  const transitionDurations: Array<string> = (
    styles[transitionProp + 'Duration'] || ''
  ).split(', ')
  const transitionTimeout: number = getTimeout(
    transitionDelays,
    transitionDurations
  )
  const animationDelays: Array<string> = (
    styles[animationProp + 'Delay'] || ''
  ).split(', ')
  const animationDurations: Array<string> = (
    styles[animationProp + 'Duration'] || ''
  ).split(', ')
  const animationTimeout: number = getTimeout(
    animationDelays,
    animationDurations
  )



/**
这段代码在Vue的transition过渡和animation动画中起到了关键作用，它会根据传入的参数expectedType、transitionTimeout、animationTimeout、transitionDurations、animationDurations、styles、transitionProp等计算出所需的动效类型、时长、属性数量及是否存在transform。具体解释如下：

首先定义了三个变量type、timeout、propCount，它们都是数字或者undefined/null类型。接着判断expectedType是否为TRANSITION，如果是且transitionTimeout大于0，则将type赋值为TRANSITION，timeout赋值为transitionTimeout，propCount赋值为transitionDurations的长度；否则，如果expectedType为ANIMATION，同理进行赋值操作。

如果expectedType既不是TRANSITION也不是ANIMATION，则通过比较transitionTimeout和animationTimeout的值，确定type的值，如果timeout大于0，则type的值为transitionTimeout大于animationTimeout时的TRANSITION，反之为animationTimeout大于transitionTimeout时的ANIMATION，如果timeout等于0，则type的值为null。

最后，根据type的值，判断是否存在transform，并返回相关信息。例如：如果type为TRANSITION，则检查是否存在transform属性，并将检查结果赋值给hasTransform。最终返回对象包含type、timeout、propCount、hasTransform四个属性。
 */
 
  let type: string | undefined | null
  let timeout = 0
  let propCount = 0
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION
      timeout = transitionTimeout
      propCount = transitionDurations.length
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION
      timeout = animationTimeout
      propCount = animationDurations.length
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout)
    type =
      timeout > 0
        ? transitionTimeout > animationTimeout
          ? TRANSITION
          : ANIMATION
        : null
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0
  }
  const hasTransform: boolean =
    type === TRANSITION && transformRE.test(styles[transitionProp + 'Property'])
  return {
    type,
    timeout,
    propCount,
    hasTransform
  }
}



/**
这段代码主要是用来获取css过渡动画的总时长（包括延迟时间和持续时间）。

在Vue中，过渡动画可以通过设置`transition`和`animation`属性来定义。这些属性包括延迟时间和持续时间（如`transition-delay`和`transition-duration`），它们都是由字符串数组表示的。

在`getTimeout`函数中，我们传入了两个数组参数：`delays`和`durations`，它们分别表示过渡动画的延迟时间和持续时间。我们需要计算出这些属性的总时长，以便在设置过渡动画时使用。

如果`delays`数组的长度小于`durations`数组的长度，那么就通过`concat()`方法将`delays`数组复制一份并拼接到自身后面。这样做的目的是为了让`delays`数组的长度与`durations`数组的长度相等，方便进行后续的计算。

最后，我们遍历`durations`数组，并将每个元素与对应位置的`delays`相加，得到一个新的数组。这个新数组中的每个元素表示对应过渡动画的总时长。我们取其中最大值作为返回值即可。

总体来说，这个函数的作用就是计算出过渡动画的总时长，在Vue中用于设置过渡动画的持续时间。
 */
 
function getTimeout(delays: Array<string>, durations: Array<string>): number {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays)
  }



/**
这段代码的作用是计算过渡动画的最长时间，其中`durations`和`delays`都是数组，分别表示每个元素的持续时间和延迟时间。首先使用`map`函数将每个元素的持续时间和延迟时间转换成毫秒，然后使用`Math.max.apply`方法返回这些时间中的最大值。

具体来说，`Math.max.apply`方法接受两个参数：第一个参数是要比较的数组，第二个参数是要传递给`max`函数的this值（即max函数中的this指向）。在这里，由于我们只需要对数组进行比较，因此第二个参数传入了`null`。`map`函数返回一个新的数组，其中每个元素都是转换后的毫秒数，然后作为`apply`方法的第一个参数传递给`max`函数，找到这些数字中的最大值并返回。

总之，该函数所做的就是计算多个过渡动画中最长的持续时间加上延迟时间。
 */
 
  return Math.max.apply(
    null,
    durations.map((d, i) => {
      return toMs(d) + toMs(delays[i])
    })
  )
}



/**
这段代码是在Vue的web平台的运行时中，用于处理过渡效果的工具函数toMs。该函数将一个表示时间的字符串转换为毫秒数。

在这个函数中，使用了s.slice(0, -1)来截取输入字符串s中除了最后一位之外的部分，以去掉单位“s”。然后使用replace方法，将字符串中的逗号替换成点号，并将结果乘以1000，以得到毫秒数。

在注释中，提到了旧版本的Chrome浏览器可能会在本地化时使用逗号代替点号来格式化浮点数。如果不将逗号替换为点号，则输入值将被向下舍入，导致意外的行为。

因此，在这个函数中，我们需要将逗号替换为点号，这样可以确保正确性并避免错误的行为。
 */
 
// Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors
function toMs(s: string): number {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000
}


