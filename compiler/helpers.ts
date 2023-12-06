/**
./dist/src/compiler/helpers.ts 文件是Vue的编译器部分的帮助函数集合。这些函数都是用于编译模板时生成相应的渲染函数或 vnode 的辅助函数。

这个文件是作为编译器的一个核心组成部分，在整个 Vue 源代码中被广泛地使用，比如在我们常见的 template 编译、slot 编译、指令编译等过程中，都会大量地使用到这些帮助函数。

同时，这些帮助函数也很容易被其他插件所扩展，开发者们可以根据自己的需要对这些函数进行二次封装，以完成更高级的功能需求。

总之，./dist/src/compiler/helpers.ts 文件是 Vue 编译器里面非常重要的一部分，它提供了非常丰富的函数库，使得 Vue 能够具备强大的编译能力。
 */

/**
在Vue的编译器中，helpers.ts是一个辅助函数模块，其中定义了许多编译期间会用到的工具函数。

代码中，首先通过import语句引入了两个模块。其中shared/util模块主要定义了一些与JavaScript的基本数据类型和对象操作相关的工具函数，例如isObject、remove、makeMap等。而types/compiler模块则包含了编译期间所需要用到的各种类型定义，如ASTElement（抽象语法树元素）、ASTModifiers（抽象语法树修饰符）等。

接着，代码中定义了一个名为parseFilters的函数，它被用来解析组件模板中的过滤器。在Vue中，过滤器可以看作是一种转换器，可以将数据经过一系列的处理后再显示出来。parseFilters函数的主要作用就是将组件模板中使用的过滤器进行解析，并返回一个数组，数组中包含了所有的过滤器名称以及对应的参数。

最后，代码中还定义了一个名为emptyObject的常量，它在Vue的源码中用于表示一个空对象。在Vue内部实现中，有时候我们需要创建一个空的JavaScript对象，此时就可以使用这个常量来代替花括号{}，以避免不必要的对象创建开销。
 */

import { emptyObject } from "shared/util";
import { ASTElement, ASTModifiers } from "types/compiler";
import { parseFilters } from "./parser/filter-parser";

/**
在Vue的编译器中，`helpers.ts`文件定义了一些帮助函数。其中，`Range`类型用于描述代码片段的范围（即起始位置和结束位置）。这个类型定义了一个对象，它有两个可选属性：`start`表示代码片段的起始位置，`end`表示代码片段的结束位置。

在Vue的编译过程中，经常需要对不同的代码片段进行处理，比如解析模板、生成渲染函数等。为了方便处理这些代码片段，Vue使用了`Range`类型来表示它们的位置信息。例如，在解析模板时，可以使用`Range`类型来表示每个元素或指令在模板中的位置，以便后续的处理。
 */

type Range = { start?: number; end?: number };

/**
这段代码主要是定义了一个名为 `baseWarn` 的函数，它接受两个参数 `msg` 和 `range`。其中，`msg` 是一个字符串类型的参数，表示警告信息；`range` 是一个可选的范围对象。

在这个函数内部，它利用 `console.error()` 方法将传入的警告信息打印到控制台中，并在信息前面加上 `[Vue compiler]:` 前缀，以便于开发者识别出哪些错误信息来自 Vue 编译器。

需要注意的是，在该文件中的注释 ` ` 表示禁止或允许未使用变量的警告。也就是说，如果在该文件中定义了一个未使用的变量，则不会产生警告提示。
 */

/* eslint-disable no-unused-vars */
export function baseWarn(msg: string, range?: Range) {
  console.error(`[Vue compiler]: ${msg}`);
}
/* eslint-enable no-unused-vars */

/**
这个函数的作用是从传入的模块对象数组中提取指定的属性值，并返回一个新的数组。具体来说，它接收两个参数：
- modules：一个由多个模块组成的数组
- key：要提取的属性名

函数实现过程：
1. 判断 modules 是否存在，如果不存在则返回一个空数组。
2. 如果存在，则使用 map 方法遍历每个模块对象，将每个对象的 key 属性值提取出来，最终得到一个数组。
3. 使用 filter 方法过滤掉数组中值为 undefined 的项，并强制转换类型为 any。
4. 返回过滤后的新数组。

需要注意的是，在这个函数中我们使用了 TypeScript 中的泛型和 keyof 关键字。其中，T 表示泛型类型，K 表示 T 接口中的属性名类型。通过这些特性，我们能够更加灵活地编写代码，提高代码的复用性和可读性。
 */

export function pluckModuleFunction<T, K extends keyof T>(
  modules: Array<T> | undefined,
  key: K
): Array<Exclude<T[K], undefined>> {
  return modules ? (modules.map((m) => m[key]).filter((_) => _) as any) : [];
}

/**
这段代码是 Vue 中编译器部分的 helper 函数之一。具体解释如下：

该函数的作用是给 AST（抽象语法树）元素 el 添加一个属性。

参数说明：

- el: ASTElement，需要添加属性的 AST 元素
- name: string，要添加的属性名
- value: string，要添加的属性值
- range?: Range，可选参数，表示属性所在的位置范围
- dynamic?: boolean，可选参数，表示是否为动态属性

函数实现：

- 首先判断 el.props 是否存在，若不存在则初始化为一个空数组。
- 接着调用 push() 方法将新属性推入 props 数组中。这里使用了 ES6 的对象字面量简写，等同于 { name: name, value: value, dynamic: dynamic }。
- 调用 rangeSetItem() 函数（这不是本文的重点，不再深入讲解）将新属性和位置信息打包成一个对象，并返回。
- 将返回值推入 props 数组中。
- 最后将 el.plain 标记为 false，表示这个元素不是纯文本节点。

总体来说，该函数是为了方便在编译过程中往 AST 元素上添加属性而设计的。
 */

export function addProp(
  el: ASTElement,
  name: string,
  value: string,
  range?: Range,
  dynamic?: boolean
) {
  (el.props || (el.props = [])).push(
    rangeSetItem({ name, value, dynamic }, range)
  );
  el.plain = false;
}

/**
这段代码定义了一个名为`addAttr`的函数，用于向AST元素（即抽象语法树）添加属性。它接收5个参数：

- `el`：AST元素对象
- `name`：属性名
- `value`：属性值
- `range`：可选参数，表示属性在模板中的位置范围
- `dynamic`：可选参数，表示该属性是否为动态绑定

函数内部首先根据`dynamic`参数判断应该将属性添加到静态属性列表(`el.attrs`)还是动态属性列表(`el.dynamicAttrs`)中，并返回对应的属性数组。

然后，使用`rangeSetItem`函数将包含属性名、属性值和是否为动态绑定的对象添加到属性数组中，同时通过设置`plain`属性为`false`告诉编译器这个元素不是纯文本节点。

最终，`addAttr`函数的作用就是将一个属性添加到AST元素的属性列表中，并标记该元素不是纯文本节点。
 */

export function addAttr(
  el: ASTElement,
  name: string,
  value: any,
  range?: Range,
  dynamic?: boolean
) {
  const attrs = dynamic
    ? el.dynamicAttrs || (el.dynamicAttrs = [])
    : el.attrs || (el.attrs = []);
  attrs.push(rangeSetItem({ name, value, dynamic }, range));
  el.plain = false;
}

/**
这段代码的作用是向AST元素节点添加一个原始属性，可以在预处理过程中使用。

具体来说，`addRawAttr`函数接收四个参数：

- `el`：AST元素节点
- `name`：属性名称
- `value`：属性值
- `range`：表示这个属性在模板源代码中的位置范围

该函数将属性名和属性值分别添加到AST元素节点的`attrsMap`和`attrsList`中，`attrsMap`是一个键值对，存储了该元素所有的属性名和属性值；`attrsList`则是一个数组，每个元素都是一个对象，包含了属性名、属性值和它们在模板源代码中的位置范围。`rangeSetItem`是一个辅助函数，它会将属性名和属性值封装成一个包含位置范围的对象。

通过调用`addRawAttr`函数，我们可以为AST元素节点添加一些额外的信息，这些信息可以在之后的编译过程中被利用。
 */

// add a raw attr (use this in preTransforms)
export function addRawAttr(
  el: ASTElement,
  name: string,
  value: any,
  range?: Range
) {
  el.attrsMap[name] = value;
  el.attrsList.push(rangeSetItem({ name, value }, range));
}

/**
这段代码定义了一个名为`addDirective`的函数，用于向AST元素对象(`el`)中添加指令(`directive`)。

函数接收的参数包括：
- `el`: AST元素对象
- `name`: 指令名
- `rawName`: 原始指令名
- `value`: 指令绑定的值
- `arg`：指令的参数
- `isDynamicArg`: 是否为动态参数
- `modifiers`: 修饰符对象
- `range`: 范围对象

函数首先会判断`el.directives`是否已存在，如果不存在则创建一个空数组。然后将新的指令对象放入这个数组中，并通过`rangeSetItem`方法设置范围(range)。最后将`el.plain`设置为`false`，表示该元素不是纯文本节点。

总的来说，这段代码实现了向AST元素对象中添加指令的功能，并将相应的指令信息存储在AST元素对象的`directives`属性中。
 */

export function addDirective(
  el: ASTElement,
  name: string,
  rawName: string,
  value: string,
  arg?: string,
  isDynamicArg?: boolean,
  modifiers?: ASTModifiers,
  range?: Range
) {
  (el.directives || (el.directives = [])).push(
    rangeSetItem(
      {
        name,
        rawName,
        value,
        arg,
        isDynamicArg,
        modifiers,
      },
      range
    )
  );
  el.plain = false;
}

/**
这个函数主要是用于在编译器中处理事件修饰符（modifier）。在Vue的模板语法中，我们可以使用事件修饰符来对事件进行进一步的控制，例如`.stop`、`.prevent`和`.capture`等。而这些修饰符最终都会被编译为JavaScript代码中相应的函数调用。

其中，`prependModifierMarker`函数的作用就是将事件修饰符标记为已捕获（captured），以便后续在生成JavaScript代码时能够正确地处理这些修饰符。

具体来说，当`dynamic`参数为真时，该函数会调用`_p`函数，并将事件名称和修饰符标记作为参数传递给它。而当`dynamic`参数为假时，则直接返回事件名称和修饰符标记的拼接结果。

举个例子，假设我们在模板中使用了`@click.capture.stop.prevent`这样的事件绑定，那么在经过编译器的处理后，最终生成的JavaScript代码可能会类似于以下内容：

```
_on(click, function($event) {
  $event.stopPropagation()
  $event.preventDefault()
}, _p("capture", "stop"), _p("capture", "prevent"))
```

其中，`_on`函数是Vue内部定义的一个工具函数，用于创建事件监听器。在这个示例中，我们通过传递`_p`函数返回的修饰符标记来告诉Vue这个事件是一个已捕获的事件，并且需要调用`stopPropagation`和`preventDefault`方法来阻止事件冒泡和默认行为。
 */

function prependModifierMarker(
  symbol: string,
  name: string,
  dynamic?: boolean
): string {
  return dynamic ? `_p(${name},"${symbol}")` : symbol + name; // mark the event as captured
}

/**
这个函数的作用是向AST元素中添加事件处理程序（handler）。其中，参数el表示当前的AST元素，name表示事件名称，value表示事件处理函数的字符串形式，modifiers表示修饰符对象，important表示是否为重要的属性，warn表示警告函数，range表示代码所在行数范围，dynamic表示是否动态绑定。

这个函数首先会对modifiers进行处理，将其设置为一个空对象。然后，它会检查modifiers对象是否同时包含prevent和passive。如果包含，则在开发环境下，通过调用warn函数发出警告，提示无法同时使用prevent和passive修饰符。

这段代码的注释还提到了“istanbul ignore if”，这是一个特殊的注释，用于屏蔽测试覆盖率工具对该行代码的覆盖率统计。
 */

export function addHandler(
  el: ASTElement,
  name: string,
  value: string,
  modifiers?: ASTModifiers | null,
  important?: boolean,
  warn?: Function,
  range?: Range,
  dynamic?: boolean
) {
  modifiers = modifiers || emptyObject;
  // warn prevent and passive modifier
  /* istanbul ignore if */
  if (__DEV__ && warn && modifiers.prevent && modifiers.passive) {
    warn(
      "passive and prevent can't be used together. " +
        "Passive handler can't prevent default event.",
      range
    );
  }

  /**
这段代码主要是用于规范化click.right和click.middle事件的处理。由于right和middle点击并不会真正触发click事件，所以需要对它们进行特殊处理。

如果事件修饰符中包含right，则需要判断是否为动态绑定，如果是动态绑定，则需要在运行时判断事件名是否为'click'，如果是则将事件名更改为'contextmenu'，否则保持不变。如果事件名本来就是'click'，则将事件名更改为'contextmenu'，并从修饰符中删除right。

同样的，如果事件修饰符中包含middle，则也需要对它进行类似的处理，如果动态绑定且事件名为'click'，则将事件名更改为'mouseup'，否则保持不变。如果事件名本来就是'click'，则将事件名更改为'mouseup'。

总之，这段代码的作用是保证right和middle点击事件能够正确地被处理。
 */

  // normalize click.right and click.middle since they don't actually fire
  // this is technically browser-specific, but at least for now browsers are
  // the only target envs that have right/middle clicks.
  if (modifiers.right) {
    if (dynamic) {
      name = `(${name})==='click'?'contextmenu':(${name})`;
    } else if (name === "click") {
      name = "contextmenu";
      delete modifiers.right;
    }
  } else if (modifiers.middle) {
    if (dynamic) {
      name = `(${name})==='click'?'mouseup':(${name})`;
    } else if (name === "click") {
      name = "mouseup";
    }
  }

  /**
这段代码主要是针对事件修饰符（event modifiers）的处理。事件修饰符是指在Vue中使用@事件名时，可以通过添加一些特殊的修饰符来控制事件触发的行为。常用的事件修饰符包括`.stop`、`.prevent`、`.capture`、`.once`和`.passive`等。

这段代码首先判断是否有`capture`修饰符，如果有，则将其从`modifiers`对象中删除，并调用`prependModifierMarker`函数在事件名称前加上感叹号"!"，表示该事件采用捕获模式（capture）。同理，如果存在`once`修饰符，则将其从`modifiers`对象中删除，并在事件名称前加上波浪线"~"，表示该事件只会触发一次。最后，如果存在`passive`修饰符，则将其从`modifiers`对象中删除，并在事件名称前加上"&"，表示该事件不会调用`preventDefault()`，可以提高滚动的流畅度。

综上，这段代码主要负责解析并处理事件修饰符，将其转换成相应的事件名称。
 */

  // check capture modifier
  if (modifiers.capture) {
    delete modifiers.capture;
    name = prependModifierMarker("!", name, dynamic);
  }
  if (modifiers.once) {
    delete modifiers.once;
    name = prependModifierMarker("~", name, dynamic);
  }
  /* istanbul ignore if */
  if (modifiers.passive) {
    delete modifiers.passive;
    name = prependModifierMarker("&", name, dynamic);
  }

  /**
这段代码的作用是根据传入的modifiers对象来决定将事件绑定到el.nativeEvents或者el.events上。

首先判断modifiers中是否有native属性，如果有，则删除该属性，并把events引用指向el.nativeEvents（如果el.nativeEvents不存在则创建它）。因为native属性表示这个事件是原生DOM事件，应该使用el.nativeEvents进行绑定。

如果modifiers中没有native属性，则把events引用指向el.events（如果el.events不存在则创建它）。因为没有native属性，说明这个事件不是原生DOM事件，应该使用el.events进行绑定。

总的来说，这段代码的作用就是根据传入的参数来确定事件绑定到哪个对象上。这样可以方便地在组件的模板中使用各种事件修饰符来绑定事件。
 */

  let events;
  if (modifiers.native) {
    delete modifiers.native;
    events = el.nativeEvents || (el.nativeEvents = {});
  } else {
    events = el.events || (el.events = {});
  }

  /**
这段代码定义了一个名为`newHandler`的变量，并将其赋值给一个函数调用结果。该函数是`rangeSetItem({ value: value.trim(), dynamic }, range)`，它的作用是返回一个新的对象。这个新对象有一个`value`属性，它的值是去掉首尾空格后的`value`参数；还有一个`dynamic`属性，它的值是`dynamic`参数。

接下来，如果`modifiers`不是一个空对象，则将`modifiers`赋值给`newHandler.modifiers`属性。

该代码片段的目的是创建一个新的事件处理程序，该事件处理程序包含了`value`和`dynamic`属性，并且可以选择性地包含其他属性（即`modifiers`）。此代码片段用于编译器辅助函数中，以生成编译后的渲染函数。
 */

  const newHandler: any = rangeSetItem({ value: value.trim(), dynamic }, range);
  if (modifiers !== emptyObject) {
    newHandler.modifiers = modifiers;
  }

  /**
这段代码主要是处理事件相关的辅助函数，它接收三个参数：`events`，`name`和`newHandler`。其中，`events`是一个对象，包含了不同事件类型对应的回调函数数组。

首先通过 `events[name]` 取出当前事件类型下的回调函数数组，赋值给 `handlers`。

如果 `handlers` 为数组，说明该事件类型下已经有其它回调函数了，并且这些回调函数都需要被执行，所以需要根据 `important` 参数（是否重要）来决定新的回调函数是插入到数组头部还是尾部。

如果 `handlers` 存在但不是数组，说明该事件类型下只有一个回调函数，因此需要将当前回调和原始回调组合成数组并存储到 `events[name]` 中。

最后，如果 `handlers` 不存在，则说明该事件类型下还没有任何回调函数，直接将 `newHandler` 赋值给 `events[name]` 即可。

总之，这段代码实现了将新的回调函数添加到指定的事件类型中，并确保所有回调函数按照指定顺序执行。
 */

  const handlers = events[name];
  /* istanbul ignore if */
  if (Array.isArray(handlers)) {
    important ? handlers.unshift(newHandler) : handlers.push(newHandler);
  } else if (handlers) {
    events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
  } else {
    events[name] = newHandler;
  }

  /**
在Vue的编译器中，el是一个AST节点（抽象语法树节点），用于表示模板中的HTML元素。el.plain是一个布尔属性，用于表示当前节点是否应该被视为“纯文本”节点。

当el节点包含子节点时，Vue会将其视为非纯文本节点，因为它包含了子节点，需要处理这些子节点的渲染逻辑。

而当el节点不包含子节点时，Vue会将其视为纯文本节点，因为它只包含了文本内容，不需要做额外的渲染处理。所以，在helpers.ts中，我们需要将el.plain设置为false，以确保在处理AST节点时正确地标记它是否为纯文本节点。
 */

  el.plain = false;
}

/**
这段代码的作用是获取AST节点元素el上某个属性name的原始绑定值。在Vue编译过程中，会将HTML模板解析成AST语法树，其中每个节点元素都有一个名为rawAttrsMap的属性，该属性存储了该节点元素上所有原始属性的键值对（包括动态绑定的属性）。

getRawBindingAttr函数首先尝试获取“:”加上属性名的形式的绑定值，如果找不到，则尝试获取“v-bind:”加上属性名的形式的绑定值，最后再尝试获取该属性名的静态值。这样做的目的是为了兼容多种绑定方式，保证能够正确地获取到属性的值。
 */

export function getRawBindingAttr(el: ASTElement, name: string) {
  return (
    el.rawAttrsMap[":" + name] ||
    el.rawAttrsMap["v-bind:" + name] ||
    el.rawAttrsMap[name]
  );
}

/**
这段代码定义了一个名为`getBindingAttr`的函数，它接收三个参数：`el`, `name`, `getStatic`。该函数的作用是从元素节点`el`中获取指定属性名`name`的值，并进行一些处理后返回。

首先，函数会尝试从`el`中获取动态绑定的属性值，即`:name`或`v-bind:name`。如果存在这样的属性，则通过`parseFilters`函数解析它的过滤器并返回结果。

如果不存在动态绑定的属性，函数会根据`getStatic`参数的值来决定是否获取静态属性值。如果`getStatic`为`false`，则不会获取静态属性值。否则，函数会从`el`中获取指定属性名`name`的静态值，并以JSON字符串的形式返回。

需要注意的是，该函数并不会直接返回属性值，而是对其进行了一些处理后再返回。此外，该函数是编译器中的帮助程序函数，通常情况下不需要手动调用。
 */

export function getBindingAttr(
  el: ASTElement,
  name: string,
  getStatic?: boolean
): string | undefined {
  const dynamicValue =
    getAndRemoveAttr(el, ":" + name) || getAndRemoveAttr(el, "v-bind:" + name);
  if (dynamicValue != null) {
    return parseFilters(dynamicValue);
  } else if (getStatic !== false) {
    const staticValue = getAndRemoveAttr(el, name);
    if (staticValue != null) {
      return JSON.stringify(staticValue);
    }
  }
}

/**
这段代码是定义了一个名为`getAndRemoveAttr`的函数，它用于获取并删除元素节点上指定名称的属性值，并从元素节点的属性列表数组中删除该属性。如果`removeFromMap`参数为真，则还会从元素节点的属性映射对象中删除该属性。

在Vue源码中，编译器将模板解析为AST树，并最终将其转换为JavaScript代码。在此过程中，需要处理元素节点的属性信息，例如获取属性值、检查属性是否存在等。`getAndRemoveAttr`函数就是用来帮助处理元素节点属性的工具函数之一。

具体实现中，首先通过`el.attrsMap[name]`获取到指定名称的属性值，如果该值不为null或undefined，则将其赋给变量`val`。然后，遍历元素节点的属性列表数组`el.attrsList`，找到对应属性并使用Array.prototype.splice方法将其删除。最后，如果需要从属性映射对象中删除该属性，则使用delete操作符删除掉。

需要注意的是，该函数只会从属性列表数组中删除属性，而不会从属性映射对象中删除属性。因为属性映射对象在生成代码时也会用到，所以不能轻易删除其中的属性。
 */

// note: this only removes the attr from the Array (attrsList) so that it
// doesn't get processed by processAttrs.
// By default it does NOT remove it from the map (attrsMap) because the map is
// needed during codegen.
export function getAndRemoveAttr(
  el: ASTElement,
  name: string,
  removeFromMap?: boolean
): string | undefined {
  let val;
  if ((val = el.attrsMap[name]) != null) {
    const list = el.attrsList;
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break;
      }
    }
  }
  if (removeFromMap) {
    delete el.attrsMap[name];
  }
  return val;
}

/**
这段代码是用于从AST元素的属性列表中获取并移除匹配给定正则表达式的属性的方法。通过传入一个AST元素和一个正则表达式，可以在该元素的属性列表中查找是否有属性名称与正则表达式匹配的属性，并返回该属性对象，同时将其从属性列表中移除。

实现方式是遍历属性列表，对于每个属性对象，检测其名称是否与正则表达式匹配，如果匹配，则将其从属性列表中移除，并返回该属性对象。如果遍历完整个属性列表后没有找到任何匹配项，则返回undefined。

对于Vue编译器而言，这段代码的作用是帮助解析模板中的动态绑定属性，例如v-bind、v-on等指令。它可以快速地获取并移除这些动态绑定属性，以方便后续的编译工作。
 */

export function getAndRemoveAttrByRegex(el: ASTElement, name: RegExp) {
  const list = el.attrsList;
  for (let i = 0, l = list.length; i < l; i++) {
    const attr = list[i];
    if (name.test(attr.name)) {
      list.splice(i, 1);
      return attr;
    }
  }
}

/**
这是一个辅助函数，用于设置一个节点的范围位置。该函数接受两个参数：

1. item: any，表示要设置范围位置的节点。
2. range?: { start?: number; end?: number }，表示范围的起始和结束位置。

如果传入了范围参数，则会根据范围参数来设置节点的位置信息。如果范围参数包含起始位置(start)则将这个值赋给节点的start属性；同理，如果范围参数包含结束位置(end)则将这个值赋给节点的end属性，最后返回这个节点。
 */

function rangeSetItem(item: any, range?: { start?: number; end?: number }) {
  if (range) {
    if (range.start != null) {
      item.start = range.start;
    }
    if (range.end != null) {
      item.end = range.end;
    }
  }
  return item;
}
