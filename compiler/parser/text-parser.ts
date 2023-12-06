/**
./dist/src/compiler/parser/text-parser.ts文件的作用是将模板中的文本节点解析成对应的AST节点。在Vue中，模板被编译成一个渲染函数，而渲染函数就是由一系列的AST节点构成的。

具体来说，text-parser.ts文件里的parseText函数会接收到一个文本内容，它会通过正则表达式匹配出其中的动态绑定和静态文本，并生成对应的AST节点。这些AST节点最终会传递给compileTemplate函数，被合并到渲染函数的AST树中。

在整个Vue的src中，text-parser.ts文件主要是被compiler/parser/index.ts引用，后者是Vue的编译器的入口文件之一。text-parser.ts还可能被其他的编译相关文件引用，例如compiler/codegen/index.ts，用于生成代码。

总之，text-parser.ts文件是Vue编译器中非常重要的一个组成部分，它能够帮助我们将模板中的文本节点转换成可执行的AST节点，从而实现Vue的数据响应和视图更新机制。
 */

/**
在Vue的模板编译阶段，模板字符串需要被转换成AST（抽象语法树）以便于后续的生成render函数。而TextParser就是负责将模板中的文本节点解析成AST节点的解析器。

在这个文件中，通过import语句引入了shared/util模块中的cached方法，用于缓存已经处理过的表达式，避免重复解析。同时，还通过import语句引入了./filter-parser模块中的parseFilters方法，用于解析模板中的过滤器表达式。

总之，TextParser主要负责将模板中的文本节点解析出来，并处理其中包含的变量和过滤器等信息，最终转换为AST节点，用于生成render函数。而cached和parseFilters则是在这个过程中用到的工具函数。
 */

import { cached } from "shared/util";
import { parseFilters } from "./filter-parser";

/**
这两个常量是用于解析模板中的文本节点，将其中的插值表达式提取出来。

`defaultTagRE`是用于匹配默认的插值表达式（即双花括号包裹的表达式），它的正则表达式为`/\{\{((?:.|\r?\n)+?)\}\}/g`。这个正则表达式可以分为以下几部分：

- `\{\{`：匹配左花括号
- `((?:.|\r?\n)+?)`：匹配插值表达式内的内容，其中`\r?\n`表示匹配可能存在的换行符，加上`?`表示匹配最短的字符串。
- `\}\}`：匹配右花括号
- `g`：全局匹配

例如，当我们使用`{{message}}`表示一个插值表达式时，就可以通过该正则表达式匹配出`message`这个变量名。

`regexEscapeRE`是用于转义用户在模板中可能会输入的特殊字符，例如`/`、`.`、`[`等。这样做的目的是为了防止这些特殊字符在正则表达式中产生影响，导致解析错误。
 */

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

/**
这段代码定义了一个名为`buildRegex`的函数，该函数接收一个参数`delimiters`，返回一个正则表达式对象。

首先，在函数内部使用了`cached`函数对`buildRegex`进行了缓存处理。`cached`函数是在Vue源码中定义的工具函数，用于缓存函数的执行结果，避免重复计算。具体实现可以参考`./shared/util.js`文件中的相关代码。

接着，将传入的分隔符`delimiters`数组中的第一个元素作为开头标记，并使用`replace`函数对其进行转义处理，使得其可以被正则表达式识别。同样的，将第二个元素作为结尾标记进行转义处理。

然后，使用ES6模板字符串拼接出一个正则表达式字符串，其中`(?:.|\\n)`表示非捕获分组，匹配任意字符或换行符。正则表达式的全局匹配标志`g`表示匹配多个符合条件的字符串片段。

最后，使用`new RegExp()`构造函数将拼接好的字符串转换成一个正则表达式对象并返回。这个正则表达式对象可以用于解析文本节点中包含的插值表达式。
 */

const buildRegex = cached((delimiters) => {
  const open = delimiters[0].replace(regexEscapeRE, "\\$&");
  const close = delimiters[1].replace(regexEscapeRE, "\\$&");
  return new RegExp(open + "((?:.|\\n)+?)" + close, "g");
});

/**
在Vue编译器中，文本节点可能包含绑定表达式（如`{{msg}}`）或纯文本内容。`TextParseResult`类型是用于在解析过程中保存文本节点的结果的类型。该类型包含两个属性：

1. `expression`: 一个字符串，表示文本节点中有绑定表达式时的表达式字符串，如果文本节点中没有绑定表达式，则为空字符串。
2. `tokens`: 一个数组，表示文本节点中的所有文本片段和绑定表达式的引用。其中每个元素可以是一个字符串（表示文本片段），或者是一个对象，该对象只有一个`@binding`属性，其值为绑定表达式的字符串。

例如，对于`Hello {{msg}}, welcome to {{location}}!`这个文本节点，它的`TextParseResult`对象将如下所示：

```js
{
  expression: 'msg + location',
  tokens: [
    'Hello ',
    { '@binding': 'msg' },
    ', welcome to ',
    { '@binding': 'location' },
    '!'
  ]
}
```

这个类型的定义使得编译器能够将文本节点正确地转换为渲染函数，在渲染时处理绑定表达式和纯文本内容。
 */

type TextParseResult = {
  expression: string;
  tokens: Array<string | { "@binding": string }>;
};

/**
这段代码是Vue模板编译过程中的一个步骤，用于解析文本节点中的绑定表达式，并生成对应的数据格式。

具体来说，这个函数接受两个参数：文本字符串和可选的分隔符数组。它首先根据分隔符构建一个正则表达式，然后通过正则表达式匹配文本中的绑定表达式，最终生成一组 tokens 数组，每个元素代表一个绑定表达式或普通文本。

在代码实现上，这个函数利用了正则表达式的 lastIndex 属性，每次匹配时从上一次匹配结束的位置开始查找，以保证不会重复匹配。

tokens 数组中的每个元素可以是纯文本（使用 JSON.stringify 包裹），也可以是绑定表达式（使用 _s 函数进行字符串化）。rawTokens 数组则记录了每个元素的原始类型和值，以便在渲染时做出正确的操作。

最终，该函数返回一个对象，包含两个属性：expression 和 tokens。expression 是生成的表达式字符串，tokens 是对应的 token 列表，这些信息可以传递给下一个编译阶段进行处理。
 */

export function parseText(
  text: string,
  delimiters?: [string, string]
): TextParseResult | void {
  //@ts-expect-error
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) {
    return;
  }
  const tokens: string[] = [];
  const rawTokens: any[] = [];
  let lastIndex = (tagRE.lastIndex = 0);
  let match, index, tokenValue;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      rawTokens.push((tokenValue = text.slice(lastIndex, index)));
      tokens.push(JSON.stringify(tokenValue));
    }
    // tag token
    const exp = parseFilters(match[1].trim());
    tokens.push(`_s(${exp})`);
    rawTokens.push({ "@binding": exp });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    rawTokens.push((tokenValue = text.slice(lastIndex)));
    tokens.push(JSON.stringify(tokenValue));
  }
  return {
    expression: tokens.join("+"),
    tokens: rawTokens,
  };
}
