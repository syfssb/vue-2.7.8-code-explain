
/**
`model.ts` 是 Vue 框架中的一个内置指令，它主要用于双向绑定表单元素的值和组件实例中数据的变化。

具体来说，在使用 `v-model` 指令时，Vue 会自动为该元素添加事件监听器，从而实现视图与数据的同步更新。当用户在元素上输入数据时，Vue 会将输入的值更新至绑定的数据属性中；反过来，当数据属性的值发生变化时，Vue 也会将最新的值渲染到视图上。

`model.ts` 文件中的代码定义了 `v-model` 指令的行为，并且通过调用 `BaseDirective` 父类的 `bind`、`update` 和 `unbind` 方法来处理指令的各个生命周期。

在整个 Vue 源码中，`model.ts` 文件是属于 `web` 平台销售版的文件，这意味着它主要用于处理用户交互的场景，如表单输入、点击等行为。同时，该文件还有其他相关的类和函数，如 `genAssignmentCode`、`genCheckboxModel`、`genComponentModel` 等，用于扩展 `v-model` 的功能，支持不同类型的表单元素和自定义组件。
 */
 



/**
该注释的意思是：在这个文件中，不使用flow类型检查，因为flow不能很好地处理给Element添加属性的情况。

具体来说，在Vue的模板中，我们可以使用v-model指令来实现双向绑定。而该文件中的代码是负责处理v-model指令的实现逻辑。其中，涉及到给原生的input、select和textarea元素添加value属性以及对value属性进行监听等操作。由于Flow对于DOM元素的类型定义比较有限，而该文件需要给DOM元素添加属性和监听属性变化，因此使用Flow类型检查会导致一些问题。所以，为了避免Flow类型检查出现问题，开发者选择了不使用Flow类型检查的方式编写该文件的代码。
 */
 
/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */



/**
在Vue的源码中，./dist/src/platforms/web/runtime/directives/model.ts文件是用来处理v-model指令的实现的。下面解释一下这个文件中引入的四个工具函数的作用：

1. `isTextInputType`函数：这个函数在web/util/element.ts文件中定义，作用是判断一个元素是否为文本输入框（<input>、<textarea>等）类型。

2. `looseEqual`函数：这个函数在shared/util.ts文件中定义，作用是比较两个值是否相等，包括NaN和undefined。

3. `looseIndexOf`函数：这个函数在shared/util.ts文件中定义，作用是在数组中查找某个元素的索引，与indexOf不同的是，它使用looseEqual进行比较。

4. `mergeVNodeHook`函数：这个函数在core/vdom/helpers/index.ts文件中定义，作用是合并两个VNode节点的钩子函数。

此外，还引入了一些常用的工具函数，例如`warn`函数用于在控制台输出警告信息，`isIE9`,`isIE`,`isEdge`函数用于检测当前浏览器是否为IE9及以上版本、IE浏览器、Edge浏览器。这些工具函数都是为了帮助程序员更方便地开发程序，在Vue源码中被广泛使用。
 */
 
import { isTextInputType } from 'web/util/element'
import { looseEqual, looseIndexOf } from 'shared/util'
import { mergeVNodeHook } from 'core/vdom/helpers/index'
import { warn, isIE9, isIE, isEdge } from 'core/util/index'



/**
这段代码主要是为了兼容IE9浏览器的一个问题而存在的。

在IE9浏览器中，使用input事件监听输入框内容变化时会出现一些问题。具体来说，当用户通过鼠标或键盘改变输入框的值时，会触发input事件；但是当程序通过JavaScript代码改变输入框的值时，不会触发input事件，这就导致了一些BUG。

为了解决这个问题，Vue源码使用了一个hack的方式，即对document绑定了selectionchange事件，在selectionchange事件触发时检查当前获取焦点的元素是否具有v-model指令，如果有的话，则手动触发input事件，以保证数据同步。

需要注意的是，由于该代码只是用于兼容IE9浏览器，因此在其他现代浏览器中并不会执行到。这也是在代码注释中添加 的原因，即告诉测试覆盖率工具忽略这个未被覆盖的分支。
 */
 
/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', () => {
    const el = document.activeElement
    // @ts-expect-error
    if (el && el.vmodel) {
      trigger(el, 'input')
    }
  })
}



/**
这段代码是一个 Vue 指令的实现，该指令名为 "v-model"，它的作用是将表单元素的值与 Vue 实例的数据进行双向绑定。

该指令在 Vue 的渲染过程中被使用，当解析到带有 "v-model" 属性的元素时，就会调用这个指令的 inserted 钩子函数。

其中，当元素的标签名为 select 时，会将选项的值保存在 _vOptions 属性中，并根据是否存在旧节点对其进行更新（调用 componentUpdated 钩子函数）或设置初始状态（调用 setSelected 函数）。

当元素的标签名为 textarea 或者输入类型是文本时，则将修饰符保存在 _vModifiers 属性中，如果没有 lazy 修饰符，则监听 compositionstart、compositionend 和 change 事件，以支持中文输入法的输入和选择操作。

最后，在 IE9 中，还将 vmodel 属性设置为 true，以区别于其他浏览器中的行为。
 */
 
const directive = {
  inserted(el, binding, vnode, oldVnode) {
    if (vnode.tag === 'select') {
      // #6903
      if (oldVnode.elm && !oldVnode.elm._vOptions) {
        mergeVNodeHook(vnode, 'postpatch', () => {
          directive.componentUpdated(el, binding, vnode)
        })
      } else {
        setSelected(el, binding, vnode.context)
      }
      el._vOptions = [].map.call(el.options, getValue)
    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
      el._vModifiers = binding.modifiers
      if (!binding.modifiers.lazy) {
        el.addEventListener('compositionstart', onCompositionStart)
        el.addEventListener('compositionend', onCompositionEnd)
        // Safari < 10.2 & UIWebView doesn't fire compositionend when
        // switching focus before confirming composition choice
        // this also fixes the issue where some browsers e.g. iOS Chrome
        // fires "change" instead of "input" on autocomplete.
        el.addEventListener('change', onCompositionEnd)
        /* istanbul ignore if */
        if (isIE9) {
          el.vmodel = true
        }
      }
    }
  },



/**
这段代码是Vue中v-model指令的运行时实现，主要作用是在组件更新之后（componentUpdated钩子函数），检查select元素的选项是否有变化，并在必要时触发change事件。具体解释如下：

1. 首先判断当前节点是否为select元素，如果不是则直接返回。

2. 如果是select元素，则调用setSelected方法设置选择项。这个方法在同一个文件中定义，作用是根据v-model绑定的值，在options中找到相应的option并将其选中。 

3. 接着获取之前渲染出的所有选项和当前渲染出的所有选项，并对比它们是否有变化。如果有变化，则需要检测绑定的值是否还存在匹配的选项，如果没有则需要触发change事件。

4. 如果是多选模式，则需要检查每一个绑定的值是否有匹配的选项；否则只需要检查当前绑定的值是否有匹配的选项。如果没有，则需要触发change事件。

5. 最后，如果需要触发change事件，则调用trigger方法触发，这个方法也在同一个文件中定义。

总的来说，这段代码的作用是确保select元素的选项和v-model绑定的值始终保持同步，并在必要时触发change事件。
 */
 
  componentUpdated(el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context)
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      const prevOptions = el._vOptions
      const curOptions = (el._vOptions = [].map.call(el.options, getValue))
      if (curOptions.some((o, i) => !looseEqual(o, prevOptions[i]))) {
        // trigger change event if
        // no matching option found for at least one value
        const needReset = el.multiple
          ? binding.value.some(v => hasNoMatchingOption(v, curOptions))
          : binding.value !== binding.oldValue &&
            hasNoMatchingOption(binding.value, curOptions)
        if (needReset) {
          trigger(el, 'change')
        }
      }
    }
  }
}



/**
这个函数是一个用来设置select元素选中项的指令函数。它在设置select元素的选中项后，使用了一个setTimeout来强制触发浏览器重新渲染DOM树。

这段代码用到了两个函数：actuallySetSelected和setTimeout。其中，actuallySetSelected函数是用来设置select元素的选中项的，而setTimeout函数则是为了解决IE和Edge浏览器的bug而添加的一个hack，因为在这两个浏览器上，直接设置selected属性会导致一些奇怪的问题，比如不能正确地显示选中项。所以，我们需要通过setTimeout来强制刷新DOM树，以确保选中项能够正确地显示出来。

总之，这段代码就是为了解决IE和Edge浏览器中select元素不能正确显示选中项的问题而添加的一个hack。
 */
 
function setSelected(el, binding, vm) {
  actuallySetSelected(el, binding, vm)
  /* istanbul ignore if */
  if (isIE || isEdge) {
    setTimeout(() => {
      actuallySetSelected(el, binding, vm)
    }, 0)
  }
}



/**
这个函数主要是用于处理`<select>`标签的v-model指令。函数首先获取绑定的值，判断是否为数组，如果`<select>`设置了multiple属性但是绑定的值不是数组，就会打印一个警告信息并返回。

接着，函数会遍历`<select>`标签中所有的`<option>`元素，并根据`isMultiple`变量的值来进行处理。如果`isMultiple`为true，说明`<select>`设置了multiple属性，那么会检查当前的`<option>`元素的值是否在绑定值（数组）中，如果是，则将该元素的selected属性设置为true，否则设置为false。最后，如果`isMultiple`为false，说明`<select>`没有设置multiple属性，这时候只需要找到第一个与绑定值相等的选项，将其设为被选中，并返回即可。如果没有找到，则将selectedIndex设置为-1，表示没有选中任何选项。

总的来说，这个函数实现了v-model指令在`<select>`标签中的双向绑定功能。
 */
 
function actuallySetSelected(el, binding, vm) {
  const value = binding.value
  const isMultiple = el.multiple
  if (isMultiple && !Array.isArray(value)) {
    __DEV__ &&
      warn(
        `<select multiple v-model="${binding.expression}"> ` +
          `expects an Array value for its binding, but got ${Object.prototype.toString
            .call(value)
            .slice(8, -1)}`,
        vm
      )
    return
  }
  let selected, option
  for (let i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i]
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1
      if (option.selected !== selected) {
        option.selected = selected
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1
  }
}



/**
这个函数是用来判断一个值是否为select元素的选项之一，如果不是则返回true，如果是则返回false。

具体地说，这个函数接收两个参数：value和options。其中value表示一个值，options是一个数组，包含了所有的选项。

函数首先调用了options的every方法，该方法会对数组中的每一个元素执行一个回调函数，只有当每一个元素都符合条件时才会返回true，否则返回false。

在这个回调函数中，使用了looseEqual函数来比较当前元素和value是否相等。如果相等，则说明存在匹配的选项，返回false。如果循环完整个options数组后都没有找到匹配的选项，则说明不存在匹配的选项，返回true。

在Vue的v-model指令中，该函数用于判断绑定的值是否为select元素的选项之一。如果不是，则Vue会在控制台输出一个警告信息。
 */
 
function hasNoMatchingOption(value, options) {
  return options.every(o => !looseEqual(o, value))
}



/**
这个函数是用来获取v-model绑定的值的。

在Vue.js中，v-model指令会将用户的输入同步到组件的data属性中。它的语法通常为 v-model="variable"，其中 variable 是一个在 data 中定义的变量。当用户输入时，v-model 会将用户输入的值赋值给这个变量（实际上，是通过调用 $emit('input', value) 来触发了一个名为 input 的自定义事件，并且在组件中监听这个事件来更新这个变量）。

但是，有时候我们需要在组件内部控制 v-model 的值，而不是让用户来直接修改它。例如，我们可以对用户输入做一些过滤或验证，然后再更新这个变量。在这种情况下，我们就需要手动控制 v-model 绑定的值。

这个函数就是用来获取 v-model 绑定的值的，在处理双向绑定时，我们需要根据option对象中的_value属性和value属性来确定要绑定到数据对象中的值。如果 _value 存在，则使用 _value，否则使用 value。最终返回得到的值将被赋值给组件实例的 data 对象中与 v-model 绑定的变量。
 */
 
function getValue(option) {
  return '_value' in option ? option._value : option.value
}



/**
这里的 `onCompositionStart` 是一个函数，它是在 `./dist/src/platforms/web/runtime/directives/model.ts` 文件中定义的。这个函数会在输入框开始进行中文/日文等非拉丁语言输入时被调用，表示正在进行输入操作，此时应该暂停数据监听。

当浏览器接收到非 ASCII 码的字符时，会先触发 `compositionstart` 事件，然后再一次触发 `input` 事件来更新输入框的值。为了避免因为过于频繁地更新而导致性能问题，Vue 在组件生成时会通过 `addProp` 函数将 `compositionstart` 和 `compositionend` 事件添加到组件实例的 props 中。在这里，`onCompositionStart` 函数被绑定到 `compositionstart` 事件上，用来标记当前正在进行非拉丁语言的输入操作。

具体来说，当用户在输入框中输入中文/日文等非拉丁语言时，浏览器将把每个字符都拆分成一个个小的组成部分，并逐个触发 `input` 事件。由于这些组成部分并不是完整的字符，所以在这个过程中，我们并不希望 Vue 将每个部分都作为新的输入值来更新组件的状态。因此，在输入开始时，我们需要通过 `onCompositionStart` 函数来标记当前正在输入，告诉 Vue 暂时不要更新组件的状态。在输入结束时，会触发 `compositionend` 事件，此时再通过 `onCompositionEnd` 函数来清除标记，让 Vue 继续更新组件的状态。

总之，这段代码实现了一个非拉丁语言输入时暂停数据监听的功能，以及在输入完成后恢复数据监听的功能。
 */
 
function onCompositionStart(e) {
  e.target.composing = true
}



/**
这段代码是Vue在处理input事件时，针对中文输入法的一个特殊处理。由于中文输入法的特殊性，在输入汉字时会有一个compositionstart事件和一个compositionend事件，表示输入法开始和结束输入。在compositionstart事件触发时，Vue将标记当前输入框正在输入中，此时如果直接触发input事件可能会导致数据不完整或错误，因此需要在compositionend事件触发后再手动触发一次input事件，这样才能保证正常的数据双向绑定。

具体来说，onCompositionEnd函数会判断当前事件是否由中文输入法组合而成，如果不是则直接返回；如果是，则将当前输入框的composing属性设置为false，然后手动触发一个input事件以更新数据状态。
 */
 
function onCompositionEnd(e) {
  // prevent triggering an input event for no reason
  if (!e.target.composing) return
  e.target.composing = false
  trigger(e.target, 'input')
}



/**
这里的 `trigger` 函数是用于触发 `input` 事件的，它接收两个参数：元素 `el` 和事件类型 `type`。

在 Vue 中，当某个 `data` 属性绑定到了输入框（input）的 `v-model` 指令上时，当用户在输入框中输入内容时，会触发 `input` 事件，从而更新 Vue 实例中对应属性的值。

但是有些情况下，我们可能需要手动触发这个 `input` 事件，以便实现一些特殊的功能。比如，在某些特定场景下，我们需要实现输入框自动聚焦的功能，那么我们就可以在输入框的 `mounted` 钩子函数中调用 `trigger` 函数来触发 `input` 事件，从而实现自动聚焦的效果。

具体地说，`trigger` 函数内部使用 `document.createEvent` 方法创建一个 `HTMLEvents` 类型的事件对象，并通过 `initEvent` 方法初始化该事件对象的类型、是否冒泡和是否可取消等属性。最后，使用 `dispatchEvent` 方法将该事件对象分派到指定的目标元素上，从而触发相应的事件处理函数。
 */
 
function trigger(el, type) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(type, true, true)
  el.dispatchEvent(e)
}



/**
`export default directive` 是将名为 `directive` 的对象作为默认导出，这个对象的属性和方法被用来定义Vue中的指令。

在 Vue 中，指令是带有 v- 前缀的特殊属性，用于扩展模板的功能。例如，v-model 指令用于在表单元素（如 input、textarea 等）上创建双向数据绑定。

在 model.ts 文件中，该指令定义了一个处理元素值绑定的函数，它使用了一些参数（el, binding, vnode）和一些变量（value, modifiers）来实现其逻辑。通过 default 导出，这个指令可以在 Vue 实例中使用，例如：

```vue
<template>
  <input v-model="message">
</template>

<script>
import { directive } from 'vue'
import model from './model'

export default {
  directives: {
    model
  },
  data () {
    return {
      message: ''
    }
  }
}
</script>
```

这样，当用户修改输入框的值时，v-model 指令会自动更新 Vue 实例中的 message 属性，并且反之亦然。
 */
 
export default directive


