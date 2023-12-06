/**
./dist/src/compiler/codegen/events.ts文件主要提供了一些工具函数，用于将事件处理程序编译为字符串形式的代码，以便插入到生成的渲染函数中。该文件定义了一个名为genHandlers的函数，它接受一个v-on指令对象和一个事件名作为参数，并返回编译后的字符串代码。

在整个Vue的src中，./dist/src/compiler/codegen/events.ts文件属于编译器部分，主要用于将模板编译成渲染函数。与其他文件的关系可以说是相互依赖的，因为编译器需要使用许多工具函数来将Vue模板编译成渲染函数，而这些工具函数都定义在不同的文件中。例如，./dist/src/compiler/codegen/index.ts文件会引用./dist/src/compiler/codegen/events.ts文件中的genHandlers函数来编译v-on指令的事件处理程序。此外，./dist/src/core/vdom/create-component.js文件也可能使用genHandlers函数来编译组件事件处理程序。
 */

/**
在Vue2.7.8的源码中，`./dist/src/compiler/codegen/events.ts`是用于生成渲染函数代码字符串的模块。在 Vue 的模板解析过程中，我们会在 AST（抽象语法树）节点上找到事件处理器的信息并将其保存起来，而这些事件处理器就是由 `ASTElementHandlers` 类型来表示的。

`ASTElementHandlers` 定义了一个对象类型，它包含了一组键值对，每个键代表着一个事件名，值则是对应的事件处理器。而 `ASTElementHandler` 是一个用于描述单个事件处理器的接口类型，它包含着该处理器所需要的所有属性，如事件名、事件处理函数、是否为原生事件等等。

因此，在 `./dist/src/compiler/codegen/events.ts` 中，通过引入 `ASTElementHandler` 和 `ASTElementHandlers` 这两个类型，我们可以更加方便地操作事件处理器相关的逻辑，例如生成事件绑定代码等。
 */

import { ASTElementHandler, ASTElementHandlers } from "types/compiler";

/**
这段代码主要是定义了一些正则表达式，用于解析模板中绑定的事件处理函数。

具体来说：

1. `fnExpRE` 用于匹配箭头函数或者以 function 关键字开头的函数表达式，例如 `() => {}` 或 `function foo() {}`。
2. `fnInvokeRE` 用于匹配一个函数调用，例如 `foo()` 或 `(arg1, arg2, ...) => { ... }()`。
3. `simplePathRE` 用于匹配一个简单的 JavaScript 变量名或属性访问表达式，例如 `a`、`b.c`、`obj['prop']` 等等。

这些正则表达式在编译模板时会被用来解析事件处理函数的名称和参数，从而生成对应的代码。
 */

const fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;
const fnInvokeRE = /\([^)]*?\);*$/;
const simplePathRE =
  /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;

/**
这段代码定义了一个常量 `keyCodes`，它是一个对象字面量。它的每个属性都是一个按键的别名和对应的键码值，键码值可以是单个数字或者是由多个数字组成的数组。

这个常量主要用于处理键盘事件中的按键码（keyCode），在Vue模板中使用 `@keydown` 或 `@keyup` 绑定时，可以将别名作为参数传递给处理函数，避免直接使用数字键码造成代码难以理解。

例如，当用户按下 ESC 键时，键码为 27，如果我们直接使用 `@keydown.27` 进行绑定，则可能造成代码可读性不佳。而使用别名 `@keydown.esc` 则可以使代码更易读懂。

另外，由于有些按键拥有多个键码值（例如 Delete 键对应 8 和 46 两个键码值），使用数组来表示可以更灵活地处理这种情况。
 */

// KeyboardEvent.keyCode aliases
const keyCodes: { [key: string]: number | Array<number> } = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  delete: [8, 46],
};

/**
这段代码定义了一个对象 keyNames，它存储了键盘事件中一些按键的别名。在实际开发中，我们可能需要监听某个具体的按键操作，但不同的浏览器对于相同的按键可能会使用不同的按键名称或别名。为了方便开发者的使用，这里列举出了常见的按键别名，以供开发者在编写代码时使用。

例如，当我们需要监听 enter 键的时候，可以直接使用 "Enter" 或 "enter"，而不用去关心不同浏览器之间可能存在的差异。同样地，当我们需要监听箭头键的时候，可以使用 "ArrowUp"、"Up" 和 "up" 等别名来监听按键操作。

需要注意的是，在不同的浏览器和设备上，按键别名的使用可能会存在差异，因此在编写代码的时候，建议还是尽量使用标准的按键名称。
 */

// KeyboardEvent.key aliases
const keyNames: { [key: string]: string | Array<string> } = {
  // #7880: IE11 and Edge use `Esc` for Escape key name.
  esc: ["Esc", "Escape"],
  tab: "Tab",
  enter: "Enter",
  // #9112: IE11 uses `Spacebar` for Space key name.
  space: [" ", "Spacebar"],
  // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
  up: ["Up", "ArrowUp"],
  left: ["Left", "ArrowLeft"],
  right: ["Right", "ArrowRight"],
  down: ["Down", "ArrowDown"],
  // #9112: IE11 uses `Del` for Delete key name.
  delete: ["Backspace", "Delete", "Del"],
};

/**
./dist/src/compiler/codegen/events.ts 文件的作用是将模板中绑定的事件转换成对应的JavaScript代码字符串，这些字符串最终会被编译成render函数。

具体来说，该文件主要定义了一个名为genHandlers的函数，该函数接收一个AST节点和一个字符串数组handlers作为参数，然后根据handlers数组中的事件名称生成对应的JavaScript代码字符串，并将其添加到AST节点的事件处理函数中。

在整个Vue源码中，./dist/src/compiler/codegen/events.ts 文件属于编译器相关的代码，它与其他文件的关系主要是在编译过程中被调用。例如，在 Vue 的编译器中，当遇到模板中的事件绑定时，就会调用该文件中的 genHandlers 函数来生成对应的 JavaScript 代码。同时，该文件还依赖了一些其他的编译器相关的代码，如 ./dist/src/compiler/util.js 和 ./dist/src/shared/util.js 等。
 */

/**
该段代码的作用是为事件添加修饰符，并生成相应的代码。

在Vue中，可以使用修饰符来改变事件的行为。例如，在事件处理程序中加入`.stop`可以阻止事件继续传播，加入`.prevent`可以阻止默认行为等。但有些修饰符不希望事件监听器被执行，如`.once`，表示只执行一次。

因此，该段代码的目的是为了处理这种特殊情况。如果修饰符会阻止事件监听器被执行，则需要显式地返回`null`，以便在必要时（如`.once`修饰符）移除该事件监听器。

具体而言，该段代码接受一个条件作为参数，如果该条件成立，则返回`null`。在生成事件监听器代码时，如果该修饰符需要阻止事件监听器被执行，则在生成代码时加入该判断语句。

示例：

```javascript
const code = `
  function handler($event) {
    ${genGuard('$event.stopPropagation()')}
    ${genGuard('$event.preventDefault()')}
    // 其他逻辑...
  }
`;
```

如果该事件添加了类似`.stop`或`.prevent`的修饰符，那么对应的`genGuard`函数将返回`null`，从而阻止该修饰符对应的代码被执行。
 */

// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once
const genGuard = (condition) => `if(${condition})return null;`;

/**
这段代码定义了一个名为 `modifierCode` 的对象，它包含了一些键值对。每个键表示一个事件修饰符，值则是一个字符串，该字符串是一个 JavaScript 代码片段，用于生成能够处理该事件修饰符的函数。

具体来说，这些修饰符及对应的代码片段分别是：

- stop: 阻止事件冒泡 `$event.stopPropagation();`
- prevent: 阻止事件默认行为 `$event.preventDefault();`
- self: 只有在事件真正的目标节点上触发时才触发处理函数 `genGuard(`$event.target !== $event.currentTarget`)`
- ctrl: 只有在同时按下 ctrl 键时才触发处理函数 `genGuard(`!$event.ctrlKey`)`
- shift: 只有在同时按下 shift 键时才触发处理函数 `genGuard(`!$event.shiftKey`)`
- alt: 只有在同时按下 alt 键时才触发处理函数 `genGuard(`!$event.altKey`)`
- meta: 只有在同时按下 meta 键时才触发处理函数 `genGuard(`!$event.metaKey`)`
- left: 只有在鼠标左键按下时才触发处理函数 `genGuard(`'button' in $event && $event.button !== 0`)`
- middle: 只有在鼠标中键按下时才触发处理函数 `genGuard(`'button' in $event && $event.button !== 1`)`
- right: 只有在鼠标右键按下时才触发处理函数 `genGuard(`'button' in $event && $event.button !== 2`)`

这里需要说明的是，`genGuard` 是一个用于生成带条件判断语句的函数，它接收一个字符串参数作为条件，返回一个新函数。该新函数接收一个 `$event` 参数，用于表示事件对象。当条件满足时，会执行该函数内部的代码；否则不进行任何操作。
 */

const modifierCode: { [key: string]: string } = {
  stop: "$event.stopPropagation();",
  prevent: "$event.preventDefault();",
  self: genGuard(`$event.target !== $event.currentTarget`),
  ctrl: genGuard(`!$event.ctrlKey`),
  shift: genGuard(`!$event.shiftKey`),
  alt: genGuard(`!$event.altKey`),
  meta: genGuard(`!$event.metaKey`),
  left: genGuard(`'button' in $event && $event.button !== 0`),
  middle: genGuard(`'button' in $event && $event.button !== 1`),
  right: genGuard(`'button' in $event && $event.button !== 2`),
};

/**
这段代码是用来生成事件监听器的代码字符串的函数。它接受两个参数：事件处理程序对象 `events` 和一个布尔值 `isNative`，该布尔值指示是否为原生事件。

首先声明了一个前缀常量 `prefix`，如果 `isNative` 为 `true`，则为 'nativeOn:'，否则为 'on:'。

然后使用 `for...in` 循环遍历事件处理程序对象中的每个属性，即每个事件类型，同时生成其对应的处理函数代码字符串，并根据是否为动态处理程序进行分类：若 `dynamic` 属性存在，则表示为动态处理程序，将其加入动态处理程序字符串 `dynamicHandlers` 中，否则加入静态处理程序字符串 `staticHandlers` 中。

最后将静态处理程序和动态处理程序拼接成一个完整的对象字符串，并返回添加了前缀的字符串形式。如果存在动态处理程序，则使用 `_d` 函数包裹静态和动态处理程序。这个 `_d` 函数是 Vue 编译器内部的函数，负责将静态和动态事件处理程序组合成一个数组，方便在运行时按顺序调用。
 */

export function genHandlers(
  events: ASTElementHandlers,
  isNative: boolean
): string {
  const prefix = isNative ? "nativeOn:" : "on:";
  let staticHandlers = ``;
  let dynamicHandlers = ``;
  for (const name in events) {
    const handlerCode = genHandler(events[name]);
    //@ts-expect-error
    if (events[name] && events[name].dynamic) {
      dynamicHandlers += `${name},${handlerCode},`;
    } else {
      staticHandlers += `"${name}":${handlerCode},`;
    }
  }
  staticHandlers = `{${staticHandlers.slice(0, -1)}}`;
  if (dynamicHandlers) {
    return prefix + `_d(${staticHandlers},[${dynamicHandlers.slice(0, -1)}])`;
  } else {
    return prefix + staticHandlers;
  }
}

/**
这段代码的作用是生成事件处理函数的字符串形式。`genHandler`函数接受一个`handler`参数，它可以是一个单一的`ASTElementHandler`对象或者是一个由多个`ASTElementHandler`对象组成的数组。

如果`handler`为空或未定义，那么函数将返回一个空的函数字符串：`'function(){}'`。这种情况通常发生在没有给元素绑定任何事件处理器的情况下。

如果`handler`不为空，那么会生成一个完整的事件处理函数的字符串形式，并返回。在Vue中，事件处理函数支持三种写法：

1. 直接传入一个函数：`@click="handleClick"`
2. 传入一个对象，对象含有`handler`属性表示实际的处理函数，还可能含有`modifiers`属性用于指定事件修饰符：`@click.prevent="handleClick"`
3. 传入一个数组，数组中包含多种写法的对象：`@click="[handleClick, {handler: handleClick, modifiers: {prevent: true}}]"`

`genHandler`函数能够处理以上三种写法，并根据不同的情况生成相应的事件处理函数字符串。
 */

function genHandler(
  handler: ASTElementHandler | Array<ASTElementHandler>
): string {
  if (!handler) {
    return "function(){}";
  }

  /**
在Vue的模板编译过程中，如果我们在模板中使用了事件绑定语法，如`@click="handleClick"`，则在编译器中会将其转换为可执行的JavaScript代码。而这段代码中的`events.ts`文件就是负责生成事件处理函数的代码。

当我们在模板中使用事件修饰符时，如`@click.stop`、`@click.prevent`等，Vue会将其转换为一个对象作为事件处理函数的第二个参数，例如`{stop: true, prevent: true}`。而在这个`genHandlers`函数中，当发现传入的事件处理函数是一个数组时，说明此时同时存在多个事件修饰符，那么此时就需要为每一个修饰符都创建一个处理函数，并将它们存储在一个数组中返回（例如`[{stop: true}, {prevent: true}]`）。因此，这里使用了`map`方法遍历所有的修饰符，再使用`join`方法将它们组合成一个字符串数组，最后使用方括号将所有的修饰符处理函数包裹起来。
 */

  if (Array.isArray(handler)) {
    return `[${handler.map((handler) => genHandler(handler)).join(",")}]`;
  }

  /**
代码的作用是判断当前事件处理函数 `handler` 是否为方法调用或者函数表达式，以及是否存在函数调用。下面对代码进行详细解释：

1. `const isMethodPath = simplePathRE.test(handler.value)`

该行代码使用正则表达式 `simplePathRE` 检查 `handler.value` 是否是一个简单路径。简单路径指只有字母、数字、下划线和点号（`.`）组成的路径，例如 `foo.bar`。

如果 `handler.value` 是一个简单路径，则说明它是一个对象的属性名或者方法名。在 Vue 模板编译器中，事件处理函数可以直接调用组件实例上的方法，例如 `@click="handleClick"`，这里的 `handleClick` 就是组件实例上的一个方法，所以可以使用 `this.handleClick()` 调用它。

2. `const isFunctionExpression = fnExpRE.test(handler.value)`

该行代码使用正则表达式 `fnExpRE` 检查 `handler.value` 是否是一个函数表达式。函数表达式指使用 `function` 关键字定义的匿名函数，例如 `@click="function() { console.log('Clicked!') }"`。

如果 `handler.value` 是一个函数表达式，则说明需要通过 `Function` 构造函数将其转换为可执行的函数代码。

3. `const isFunctionInvocation = simplePathRE.test(
    handler.value.replace(fnInvokeRE, '')
  )`

该行代码使用正则表达式 `simplePathRE` 和 `fnInvokeRE` 检查 `handler.value` 是否存在函数调用。其中 `fnInvokeRE` 匹配的是函数调用表达式，例如 `foo()`。

如果 `handler.value` 存在函数调用，则说明事件处理函数需要执行一个函数并将其结果作为参数传递给另一个函数或者方法。这种情况下需要使用 `Function` 构造函数创建一个新的函数来实现。

总之，在 Vue 模板编译器中，事件处理函数可以是简单路径（对象属性名或方法名）、函数表达式或者函数调用，根据不同的情况需要进行不同的处理。以上三行代码就是判断事件处理函数类型的逻辑。
 */

  const isMethodPath = simplePathRE.test(handler.value);
  const isFunctionExpression = fnExpRE.test(handler.value);
  const isFunctionInvocation = simplePathRE.test(
    handler.value.replace(fnInvokeRE, "")
  );

  /**
这段代码是用来生成事件处理函数的代码的。首先通过判断 `handler` 对象是否具有 `modifiers` 属性，决定生成何种类型的处理函数。

如果没有 `modifiers`，就根据 `handler` 的 `value` 属性生成一个函数字符串，该函数接受一个 `$event` 参数，并在内部执行 `handler.value` 语句（如果 `handler.value` 是方法调用或函数表达式，则返回 `handler.value`；否则将其嵌入到一个 `function($event){...}` 中）。

如果有 `modifiers`，则需要对它们进行遍历，根据不同的修饰符生成对应的代码。这里使用了一个名为 `modifierCode` 的对象，其中包含了不同修饰符对应的代码片段，例如：

```js
const modifierCode = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: `if($event.target !== $event.currentTarget){return null;}`,
  ctrl: 'if(!$event.ctrlKey){return null;}', // check event.ctrlKey
  ...
}
```

生成修饰符代码后，再根据 `handler` 类型生成处理函数的代码。如果 `handler` 是方法路径，则可直接返回 `handler.value` 执行结果；如果是函数表达式，则需要使用 `apply()` 方法来传递参数并执行；如果是函数调用，则直接返回结果；否则将 `handler.value` 嵌入到一个 `function($event){...}` 中。

最后，将生成的代码和修饰符代码拼接起来，返回一个完整的事件处理函数字符串。
 */

  if (!handler.modifiers) {
    if (isMethodPath || isFunctionExpression) {
      return handler.value;
    }
    return `function($event){${
      isFunctionInvocation ? `return ${handler.value}` : handler.value
    }}`; // inline statement
  } else {
    let code = "";
    let genModifierCode = "";
    const keys: string[] = [];
    for (const key in handler.modifiers) {
      if (modifierCode[key]) {
        genModifierCode += modifierCode[key];
        // left/right
        if (keyCodes[key]) {
          keys.push(key);
        }
      } else if (key === "exact") {
        const modifiers = handler.modifiers;
        genModifierCode += genGuard(
          ["ctrl", "shift", "alt", "meta"]
            .filter((keyModifier) => !modifiers[keyModifier])
            .map((keyModifier) => `$event.${keyModifier}Key`)
            .join("||")
        );
      } else {
        keys.push(key);
      }
    }
    if (keys.length) {
      code += genKeyFilter(keys);
    }
    // Make sure modifiers like prevent and stop get executed after key filtering
    if (genModifierCode) {
      code += genModifierCode;
    }
    const handlerCode = isMethodPath
      ? `return ${handler.value}.apply(null, arguments)`
      : isFunctionExpression
      ? `return (${handler.value}).apply(null, arguments)`
      : isFunctionInvocation
      ? `return ${handler.value}`
      : handler.value;
    return `function($event){${code}${handlerCode}}`;
  }
}

/**
./dist/src/compiler/codegen/events.ts文件是Vue的编译器部分的代码，作用是处理模板中的事件绑定，并生成对应的DOM节点事件监听函数。

具体来说，该文件中定义了一个名为`genHandlers`的函数，它接收两个参数：`events` 和 `isNative`。其中 `events` 是一个键值对对象，表示模板中需要绑定的事件和对应的处理函数；`isNative` 表示是否原生标签。

`genHandlers` 函数内部会遍历 `events` 对象，对每个事件按照一定的规则生成相应的 DOM 节点事件监听函数，并将这些函数组合成一个字符串返回，最终由 Vue 的 render 函数调用。

在整个 Vue 源码中，./dist/src/compiler/codegen/events.ts 文件是编译器部分的一部分，属于编译器的功能模块之一。它与其他模块的关系是通过 Vue 编译器的模块系统进行协作，共同实现 Vue 的编译功能。
 */

/**
这里的函数 `genKeyFilter` 是用来生成一个字符串，这个字符串是一个动态的 JavaScript 代码片段。这个代码片段会在渲染 Vue 模板时被注入到组件的渲染函数里，并且在事件处理函数中使用。

这个代码片段的作用是用来过滤一些按键事件（KeyboardEvent）。传入的参数 `keys` 是一个字符串数组，它包含了需要过滤的按键列表。

首先，这个代码片段会检查当前事件是否是一个按键事件，通过判断事件类型的前缀是否为 `'key'`。如果不是按键事件，则直接返回 `null`，表示不做任何处理。

如果是按键事件，则会依次遍历 `keys` 数组中的每个元素，并调用另外一个函数 `genFilterCode` 来生成一个布尔表达式。最后，所有生成的布尔表达式会被拼接起来，并使用逻辑与运算符连接起来，作为整个代码片段的返回值。这个代码片段将会被插入到事件处理函数中，在用户触发事件时执行，用于过滤指定的按键事件并阻止默认行为。
 */

function genKeyFilter(keys: Array<string>): string {
  return (
    // make sure the key filters only apply to KeyboardEvents
    // #9441: can't use 'keyCode' in $event because Chrome autofill fires fake
    // key events that do not have keyCode property...
    `if(!$event.type.indexOf('key')&&` +
    `${keys.map(genFilterCode).join("&&")})return null;`
  );
}

/**
这段代码是 Vue 的编译器中用来生成事件过滤器的函数。它主要根据传入的 `key` 参数来生成相应的过滤器代码。

首先，函数会将 `key` 转成十进制整数类型，并判断是否为真值。如果为真值，说明传入的 `key` 是一个数字，那么就返回 `$event.keyCode!==${keyVal}`，即当键码不等于该数字时过滤掉该事件。

如果传入的 `key` 不是数字，则需要从 keyCodes 和 keyNames 两个对象中查找对应的键码和键名。在生成过滤器代码时，会调用 `_k` 函数来进行比较操作，具体参数含义如下：

- 第一个参数 `$event.keyCode` 表示当前事件的键码；
- 第二个参数 `JSON.stringify(key)` 表示传入的 `key` 的值；
- 第三个参数 `JSON.stringify(keyCode)` 表示从 keyCodes 对象中查找到的键码；
- 第四个参数 `$event.key` 表示当前事件的键名；
- 第五个参数 `JSON.stringify(keyName)` 表示从 keyNames 对象中查找到的键名。

最终生成的过滤器代码如下所示：

```
_k($event.keyCode, JSON.stringify(key), JSON.stringify(keyCode), $event.key, JSON.stringify(keyName))
```

其中 `_k` 函数的实现在另外一个文件中，用于比较上述参数的值是否相等。
 */

function genFilterCode(key: string): string {
  const keyVal = parseInt(key, 10);
  if (keyVal) {
    return `$event.keyCode!==${keyVal}`;
  }
  const keyCode = keyCodes[key];
  const keyName = keyNames[key];
  return (
    `_k($event.keyCode,` +
    `${JSON.stringify(key)},` +
    `${JSON.stringify(keyCode)},` +
    `$event.key,` +
    `${JSON.stringify(keyName)}` +
    `)`
  );
}
