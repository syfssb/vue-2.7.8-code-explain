
/**
src/core/util/props.ts 文件是 Vue.js 源码中负责处理组件 props 数据的模块。它主要提供了以下功能：

1. 定义组件 props 的类型和默认值
2. 验证组件 props 是否符合类型要求
3. 处理动态组件 props
4. 提供一些辅助函数用于处理 props 数据

该文件定义了 PropsOptions 接口，这个接口包含了很多属性，其中最重要的是 type 和 default。type 用于定义 props 的类型，可以是 String、Number、Boolean、Object 等，default 则用于定义 props 的默认值。

Props.ts 文件通过 defineReactive 方法将组件的 props 数据转换成响应式数据，并在一个 watch 函数中监听 props 数据变化，从而实现了父组件更新 props 数据时，能够重新渲染子组件的功能。

该文件与其他文件的关系紧密，因为组件 props 数据在整个 Vue.js 中都有着非常重要的作用，包括组件的初始化、数据校验等方面。在其他组件中，也会引用 props.ts 文件中的一些方法和类型定义，从而实现对 props 数据的处理和校验。
 */
 



/**
这段代码主要是引入了一些Vue源码中常用的工具函数和类型。解释如下：

1. `warn`：是Vue源码中用于打印警告信息的函数，如果开启了生产环境模式，这个函数会被替换成一个空函数。

2. `observe、toggleObserving、shouldObserve`：这三个函数都来自于Vue的响应式系统，用于实现数据的双向绑定功能。

3. `hasOwn`：判断对象自身是否拥有指定的属性。

4. `isArray`：判断传入的参数是否为数组类型。

5. `isObject`：判断传入的参数是否为对象类型。

6. `isFunction`：判断传入的参数是否为函数类型。

7. `toRawType`：获取变量的原始类型。

8. `hyphenate`：将驼峰命名转化为短横线命名。

9. `capitalize`：将字符串的首字母大写。

10. `isPlainObject`：判断传入的对象是否为普通对象（即通过字面量或Object.create(null)创建的对象）。

11. `Component`：这是一个Vue类型，在Vue源码中用于描述组件的配置项。
 */
 
import { warn } from './debug'
import { observe, toggleObserving, shouldObserve } from '../observer/index'
import {
  hasOwn,
  isArray,
  isObject,
  isFunction,
  toRawType,
  hyphenate,
  capitalize,
  isPlainObject
} from 'shared/util'
import type { Component } from 'types/component'



/**
在Vue中，组件可以通过props选项接收父组件传递过来的数据。这些数据可以是任何类型的值，例如字符串、数字、对象、数组等等。在使用props时，我们可以添加一些选项对传入的数据进行限制和校验，从而增强代码的健壮性和可维护性。

PropOptions就是用于定义这些选项的一个接口类型。具体来说，PropOptions包含以下四个选项：

1. type: 用于指定数据的类型，可以是一个函数或函数数组，也可以为null。如果指定了类型，那么Vue会在运行时检查传入的数据是否符合该类型要求；如果不指定，那么传入的数据类型可以是任何类型。

2. default: 用于指定默认值。当父组件没有传递相应的prop时，就会使用默认值。可以是一个常量，也可以是函数（当值是引用类型时推荐使用）。

3. required?: 用于指示该prop是否必须传递。如果为true，则在父组件没有传递该prop时会发出警告，并且在生产环境下会报错。默认值为false。

4. validator?: 用于自定义校验方法。可以是一个函数，它接受传入的值作为参数，返回布尔值表示是否校验成功。如果校验失败，则在控制台输出错误信息。如果未指定该选项，则Vue会使用默认的校验方法。

通过PropOptions的这些选项，我们可以在组件间传递数据时，保证数据类型、默认值和必要性的正确性，并添加自定义的校验规则。
 */
 
type PropOptions = {
  type: Function | Array<Function> | null
  default: any
  required?: boolean
  validator?: Function
}



/**
这段代码实现了Vue组件props的验证和类型转换功能。props是Vue组件中父组件传递给子组件的数据，通过这段代码可以对这些数据进行合法性检查并进行类型转换。

函数接受四个参数，其中key表示props的属性名，propOptions表示prop选项，propsData表示实际传递的props数据对象，vm表示当前Vue组件实例。

在函数内部，首先根据key和propOptions获取相应的prop选项，然后判断propsData中是否存在该属性，如果不存在则设置absent为true。接下来获取propsData中该属性的值，并进行一系列转换处理。

如果prop选项的type属性中包含Boolean类型，则会进行布尔转换。如果propsData中不存在该属性且prop没有设置默认值，则将该属性的值设为false。

若propsData中该属性的值为空字符串("")或者与属性名相同的连字符格式字符串（如"my-prop"）时，则判断Boolean类型是否优先级更高，并进行布尔转换。如果不是Boolean类型，或者不优先于String类型，则将该属性的值设为true。

如果propsData中该属性的值为undefined，则通过getPropDefaultValue函数从prop选项或者默认值中获取默认值，并将其观察成响应式数据。

最后，在开发环境下，调用assertProp函数对prop选项和propsData中该属性的值进行验证。最终返回经过转换后的值。

这段代码的作用是对Vue组件中的props进行验证和类型转换，保证父组件传递给子组件的数据是符合要求的。
 */
 
export function validateProp(
  key: string,
  propOptions: Object,
  propsData: Object,
  vm?: Component
): any {
  const prop = propOptions[key]
  const absent = !hasOwn(propsData, key)
  let value = propsData[key]
  // boolean casting
  const booleanIndex = getTypeIndex(Boolean, prop.type)
  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      const stringIndex = getTypeIndex(String, prop.type)
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true
      }
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key)
    // since the default value is a fresh copy,
    // make sure to observe it.
    const prevShouldObserve = shouldObserve
    toggleObserving(true)
    observe(value)
    toggleObserving(prevShouldObserve)
  }
  if (__DEV__) {
    assertProp(prop, key, value, vm, absent)
  }
  return value
}



/**
这段代码实现了获取 props 的默认值的功能。在 Vue 中，如果我们想要给一个组件传递某些数据，可以使用 props 进行传递。props 是父组件传给子组件的数据，它是不可变的，只能由父组件传入，子组件接受并使用。

当你在定义 props 时，可以为其设置默认值，如果父组件没有传入相应的 prop 值，则会使用默认值。

这个函数的作用就是获取 props 的默认值。它接收三个参数：

- vm：当前组件实例。
- prop：prop 对象，包含了 prop 的一些配置信息，如类型、默认值等。
- key：prop 的名称。

首先判断 prop 是否有 default 属性，如果没有，则返回 undefined。如果有，则将其赋值给 def 变量。

接下来，判断 def 是否为对象或数组。如果是，会输出警告信息，因为对象和数组的默认值必须以函数的形式返回，而不能直接赋值。Vue 中的 props 默认值必须是工厂函数，这是因为对象和数组是引用类型，并且将它们赋值给默认值可能导致不可预料的结果。

然后判断当前组件实例是否存在，如果存在，则判断 propsData 对象中是否存在 key 属性，并且该属性的值为 undefined 并且 _props 中存在 key 属性，则返回 _props[key]。这里的目的是避免 watcher 不必要的触发。

最后，判断 def 是否为函数类型，并且 prop 的类型不是函数类型，如果是，则调用该函数并返回其值。否则直接返回 def。

这个函数可以帮助开发者在组件中获取 props 的默认值。它是 Vue 源码中非常基础、常用的一个方法，对于理解 Vue 组件生命周期和组件通信等方面也有很大的帮助。
 */
 
/**
 * Get the default value of a prop.
 */
function getPropDefaultValue(
  vm: Component | undefined,
  prop: PropOptions,
  key: string
): any {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  const def = prop.default
  // warn against non-factory defaults for Object & Array
  if (__DEV__ && isObject(def)) {
    warn(
      'Invalid default value for prop "' +
        key +
        '": ' +
        'Props with type Object/Array must use a factory function ' +
        'to return the default value.',
      vm
    )
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  if (
    vm &&
    vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined
  ) {
    return vm._props[key]
  }
  // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context
  return isFunction(def) && getType(prop.type) !== 'Function'
    ? def.call(vm)
    : def
}



/**
这段代码主要是用来验证传入组件的props属性是否合法。在Vue中，我们可以通过在组件中定义props来接收来自父组件的数据。

首先，这个函数会接收四个参数：prop、name、value和vm。其中，prop是一个对象，存储了在组件中定义的当前prop的所有选项；name是当前prop的名称；value是父组件传递给当前组件的值；vm是当前组件实例。

如果prop是必须的（即required为true），同时父组件没有传递对应的值，那么就会调用warn函数输出一个警告信息，表示缺少必须的prop属性。如果value的值为null并且prop不是必须的，那么直接返回。

接下来，函数会获取prop的类型，并将其赋值给变量type。如果type不存在或者它的值是true，那么valid就会被设置为true，表示验证成功。如果type存在，那么就需要进一步进行类型验证。

如果type不是数组，那么将其包装成数组。然后，遍历type数组中的每一个元素，调用assertType函数进行类型判断。assertType函数会返回一个对象，该对象有两个属性：valid和expectedType。如果valid为true，表示验证成功；否则，将会将该元素的expectedType属性加入到expectedTypes数组中，用于输出警告信息。

最终，valid表示该prop是否验证成功。如果验证成功，则返回undefined；否则，将会输出一个警告信息，该信息中包含了当前prop的名称和期望的类型。
 */
 
/**
 * Assert whether a prop is valid.
 */
function assertProp(
  prop: PropOptions,
  name: string,
  value: any,
  vm?: Component,
  absent?: boolean
) {
  if (prop.required && absent) {
    warn('Missing required prop: "' + name + '"', vm)
    return
  }
  if (value == null && !prop.required) {
    return
  }
  let type = prop.type
  let valid = !type || (type as any) === true
  const expectedTypes: string[] = []
  if (type) {
    if (!isArray(type)) {
      type = [type]
    }
    for (let i = 0; i < type.length && !valid; i++) {
      const assertedType = assertType(value, type[i], vm)
      expectedTypes.push(assertedType.expectedType || '')
      valid = assertedType.valid
    }
  }



/**
这段代码的作用是验证传递给组件的prop是否符合预期的类型和规则，如果不符合，则会发出警告并返回。 

首先，该代码检查了expectedTypes数组中是否有任何值，并将结果存储在haveExpectedTypes变量中。如果没有，则跳过类型验证。 

然后，如果传递给组件的prop的值无效且haveExpectedTypes为true，则会触发一个警告。getInvalidTypeMessage函数将返回一个字符串，其中包含prop名称、传递的值和预期类型。 

最后，如果prop定义了一个validator函数，则验证器将被调用以检查传递给prop的值是否符合自定义规则。如果未通过验证，则会发出另一个警告。 

总之，这段代码的作用是确保传递给组件的prop值符合预期的类型和自定义规则，以便组件可以按照预期工作。
 */
 
  const haveExpectedTypes = expectedTypes.some(t => t)
  if (!valid && haveExpectedTypes) {
    warn(getInvalidTypeMessage(name, value, expectedTypes), vm)
    return
  }
  const validator = prop.validator
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      )
    }
  }
}



/**
这行代码定义了一个正则表达式 `simpleCheckRE`，用于检查一个 JavaScript 变量的类型是否属于 `String`、`Number`、`Boolean`、`Function`、`Symbol` 或 `BigInt` 中的一种。这些类型被称为基本数据类型（Primitive）。

在 Vue 的属性校验系统中，当我们使用 `props` 定义组件的属性时，可以给每个属性指定一个类型。如果属性的值不符合该类型，则会发出警告信息。而对于基本数据类型，Vue 提供了一种简便的方式来检查其类型，就是使用上述的正则表达式。

举个例子，在以下代码中：

```
props: {
  name: String,
  age: Number,
  married: Boolean
},
```

当传入的 `name` 不是字符串类型、`age` 不是数字类型、`married` 不是布尔类型时，就会发出警告信息。而这些基本数据类型的检查就是通过 `simpleCheckRE` 正则表达式实现的。
 */
 
const simpleCheckRE = /^(String|Number|Boolean|Function|Symbol|BigInt)$/



/**
这个函数是用来对传入的props的值进行类型校验的，它接受三个参数：value表示要校验的prop的值，type表示该prop的类型（可以是一个构造函数、一个字符串或者一个数组），vm表示组件实例，在出现错误时会使用该实例来打印警告信息。

函数内部首先通过getType函数将type转换为字符串格式的类型名expectedType。然后根据不同的类型进行不同的校验：

1. 如果expectedType是简单类型，那么直接比较value的typeof和expectedType是否相等即可，如果value是一个包装对象，还需要判断其是否是该包装对象的实例。
2. 如果expectedType是'Object'，那么校验value是否是一个纯对象（即没有继承其他对象并且拥有自己的属性）。
3. 如果expectedType是'Array'，那么校验value是否是一个数组。
4. 如果expectedType是其他构造函数类型，那么尝试使用instanceof运算符进行校验，如果校验失败，则说明该type不是一个构造函数，打印警告信息并返回false。

最后返回一个对象，其中valid表示校验结果，expectedType表示期望的类型名。
 */
 
function assertType(
  value: any,
  type: Function,
  vm?: Component
): {
  valid: boolean
  expectedType: string
} {
  let valid
  const expectedType = getType(type)
  if (simpleCheckRE.test(expectedType)) {
    const t = typeof value
    valid = t === expectedType.toLowerCase()
    // for primitive wrapper objects
    if (!valid && t === 'object') {
      valid = value instanceof type
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value)
  } else if (expectedType === 'Array') {
    valid = isArray(value)
  } else {
    try {
      valid = value instanceof type
    } catch (e: any) {
      warn('Invalid prop type: "' + String(type) + '" is not a constructor', vm)
      valid = false
    }
  }
  return {
    valid,
    expectedType
  }
}



/**
这个正则表达式`/^\s*function (\w+)/`的作用是检查一个字符串是否是以"function"开头，后面紧跟着一个或多个空格，然后是一个或多个字符（这里使用了`\w+`匹配任意单词字符）。如果符合这个模式，那么这个字符串就被认为是一个函数。 

在Vue源码的props.ts文件中，这个正则表达式被用来判断一个对象属性值的类型是否是函数类型。在Vue中，props是组件的属性，每个组件都有自己的props选项，用于定义组件接受的数据。当我们定义一个prop时，可以指定它的类型是一个函数，这个函数会被用来对传入的数据进行处理和验证。这里的正则表达式就是通过匹配这个函数的名称来确定这个属性值是否是一个函数类型的。

举个例子，当我们使用Vue开发一个组件，并声明一个props选项如下：

```
props: {
  someProp: {
    type: Function,
    default: function () {}
  }
}
```

在这个props定义中，type指定了这个属性的类型是一个函数类型。当组件使用者传入一个someProp属性时，Vue会先检查这个值是否符合Function类型，这个正则表达式就是用来完成这个工作的。
 */
 
const functionTypeCheckRE = /^\s*function (\w+)/



/**
这段代码中的`getType()`函数是用于获取一个函数的类型名称的，主要用于在处理组件的 props 时检查其数据类型。

其中，这里使用了 `fn.toString()` 方法来将传入的函数转换为字符串形式，然后通过正则表达式 `functionTypeCheckRE` 匹配该字符串中的函数名。这样做的原因是：如果直接使用 `typeof` 或者简单的等值判断来检查数据类型，可能会因为跨 iframe 或者不同的 VMs 而导致判断失败，而使用字符串匹配的方式则可以避免这种问题。

需要注意的是，这里返回的函数类型名称并不完全准确，因为有些内置类型（如 Object、Array 等）虽然是函数，但是它们的函数名并不是其对应的类型名称，所以需要特殊处理。
 */
 
/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType(fn) {
  const match = fn && fn.toString().match(functionTypeCheckRE)
  return match ? match[1] : ''
}



/**
在Vue源码中，./dist/src/core/util/props.ts定义了一些与组件属性相关的方法。其中，isSameType函数用于判断传入的两个参数类型是否相同。

它通过调用另一个函数getType来获取a和b的类型，然后比较它们是否相等。如果相等，则返回true，表示这两个参数的类型相同；否则返回false，表示这两个参数的类型不同。

值得注意的是，getType函数在props.ts中并未给出具体的实现，因为它是一个被挂载到全局环境上的方法，其实现细节在shared/util.js中。该函数可以获取任何类型的变量所对应的构造函数名称，例如"String"、"Object"、"Array"等。因此，isSameType函数可以判断任何类型的参数是否相等。
 */
 
function isSameType(a, b) {
  return getType(a) === getType(b)
}



/**
这是一个在 Vue 源码中用于处理 props 类型校验的辅助函数。

该函数接收两个参数：type 和 expectedTypes。其中，type 表示需要校验的类型；expectedTypes 为期望的类型，可以是数组或者单个类型。

如果 expectedTypes 不是数组，则直接判断 type 是否和 expectedTypes 相同（isSameType 函数用于判断类型是否相同），如果相同则返回 0，不相同则返回 -1。这里的 -1 表示校验失败。

如果 expectedTypes 是数组，则遍历数组中的每个元素，判断是否和 type 相同，如果找到了相同的类型，则返回其在数组中的索引值，否则返回 -1。

总之，该函数主要实现了对期望类型和实际类型进行匹配的功能，帮助我们更方便地进行 props 类型校验。
 */
 
function getTypeIndex(type, expectedTypes): number {
  if (!isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1
  }
  for (let i = 0, len = expectedTypes.length; i < len; i++) {
    if (isSameType(expectedTypes[i], type)) {
      return i
    }
  }
  return -1
}



/**
这段代码是用来生成一个类型检查错误的提示信息。在Vue中，我们可以使用props属性来定义组件的属性，包括类型、默认值等。当我们通过props属性传递的值的类型不符合要求时，就会抛出一个类型检查错误。

这个函数接受三个参数：属性名、属性值和期望的属性类型。它首先创建了一个基本的错误提示信息，包含了期望的属性类型。然后，它通过toRawType函数获取到属性值的实际类型，并将其添加到错误提示信息中。如果期望的属性类型只有一种，并且该类型可以被解释说明，同时实际的属性类型也可以被解释说明，那么它还会将属性值添加到错误提示信息中，以便更好地表明错误的原因。

最后，它返回生成的错误提示信息。这个函数是在Vue中用于类型检查的一个重要工具函数之一。
 */
 
function getInvalidTypeMessage(name, value, expectedTypes) {
  let message =
    `Invalid prop: type check failed for prop "${name}".` +
    ` Expected ${expectedTypes.map(capitalize).join(', ')}`
  const expectedType = expectedTypes[0]
  const receivedType = toRawType(value)
  // check if we need to specify expected value
  if (
    expectedTypes.length === 1 &&
    isExplicable(expectedType) &&
    isExplicable(typeof value) &&
    !isBoolean(expectedType, receivedType)
  ) {
    message += ` with value ${styleValue(value, expectedType)}`
  }
  message += `, got ${receivedType} `
  // check if we need to specify received value
  if (isExplicable(receivedType)) {
    message += `with value ${styleValue(value, receivedType)}.`
  }
  return message
}



/**
这个函数的作用是将传入的value值根据type类型进行处理，并返回一个字符串。在Vue中，styleValue函数通常用于处理组件的props属性中的style属性。

当type为String时，将value值加上双引号并返回，例如：

```js
styleValue('font-size: 16px', 'String') // => '"font-size: 16px"'
```

当type为Number时，将value转换成数字并返回，例如：

```js
styleValue('16', 'Number') // => '16'
```

其他情况下，直接返回value值的字符串形式，例如：

```js
styleValue(true, 'Boolean') // => 'true'
```

该函数主要用于在处理组件的props样式属性时，将其转换为正确的格式，以便在渲染实例时正确应用样式。
 */
 
function styleValue(value, type) {
  if (type === 'String') {
    return `"${value}"`
  } else if (type === 'Number') {
    return `${Number(value)}`
  } else {
    return `${value}`
  }
}



/**
在Vue中，props指的是组件接收的外部参数，这些参数可以在父组件中被绑定并通过props传递到子组件中。在./dist/src/core/util/props.ts文件中，isExplicable函数的作用是判断一个值是否为string、number或boolean类型。

isExplicable函数中使用了Array.prototype.some()方法，该方法会迭代数组中的所有元素，并返回一个布尔值，表示当前元素是否满足某种条件。在这里，some方法用来迭代EXPLICABLE_TYPES数组中的每个元素（即'string', 'number', 'boolean'），并检查传入的value是否为其中的一种类型。

通过调用字符串对象的toLowerCase()方法，我们将传入的value转换为小写字母，以便与EXPLICABLE_TYPES数组中的元素进行比较。

如果传入的value是string、number或boolean类型之一，则isExplicable函数会返回true，否则返回false。在Vue组件中使用props时，我们通常会定义prop类型，以确保传入的值符合预期的类型，isExplicable函数提供了一种判断值类型的通用方法。
 */
 
const EXPLICABLE_TYPES = ['string', 'number', 'boolean']
function isExplicable(value) {
  return EXPLICABLE_TYPES.some(elem => value.toLowerCase() === elem)
}



/**
这段代码是一个用于判断是否为布尔类型的工具函数，它接收任意数量的参数，并使用 `some` 方法来遍历这些参数，如果有任何一个参数的值转换成小写后等于 'boolean'，则返回 true，否则返回 false。

例如，我们可以使用它来检查一个属性是否为布尔类型：

```javascript
import { isBoolean } from '@/core/util/props'

const props = {
  checked: Boolean
}

console.log(isBoolean(props.checked)) // true
console.log(isBoolean(props.foo)) // false
```

在上述代码中，我们定义了一个名为 `props` 的对象，它包含一个键为 `checked`，值为 `Boolean` 的属性。调用 `isBoolean` 函数并传入 `props.checked` 参数，即可得出该属性为布尔类型。
 */
 
function isBoolean(...args) {
  return args.some(elem => elem.toLowerCase() === 'boolean')
}


