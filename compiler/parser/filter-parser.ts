/**
./dist/src/compiler/parser/filter-parser.ts 文件是Vue的编译器部分的一个模块，主要作用是解析模板中的过滤器表达式，并生成对应的AST节点。

具体来说，该模块会利用正则表达式匹配模板中的过滤器表达式，然后将其解析成一个对象，包含过滤器名称和参数列表等信息。接着，该模块会根据解析得到的信息生成AST节点，最终返回AST节点供编译器进行下一步的操作。

在整个Vue src中，./dist/src/compiler/parser/filter-parser.ts 文件是编译器模块的一个子模块，它与其他模块共同构成了Vue编译器的完整实现。在Vue的编译过程中，该文件的作用非常重要，因为过滤器是Vue模板中一个重要的功能特性，而通过解析过滤器表达式并生成AST节点，Vue编译器才能够正确地将其翻译成可执行的JavaScript代码。
 */

/**
在Vue的模板编译过程中，当遇到一个插值表达式（即以`{{ }}`包裹的内容）时，会将其解析为一个计算属性。而在这个过程中，可能会涉及到一些特殊的字符，比如除号（/）。

在JavaScript中，正则表达式是用来匹配字符串中符合某种规则的部分。而在Vue的编译器中，会使用正则表达式来检查插值表达式中是否包含除号。具体地说，`validDivisionCharRE`就是一个用来匹配可接受的除号字符的正则表达式。

其中，`\w`表示任何字母、数字或下划线，`.`表示匹配任意字符，`+`表示匹配前面的字符至少一次，`\-`表示匹配负号，`$`表示匹配行尾，`]`表示匹配右方括号，`\]`表示匹配左方括号，所以这个正则表达式可以匹配除号（`/`）、右括号（`）`）、字母、数字、下划线、加号、减号、点号和美元符号。
 */

const validDivisionCharRE = /[\w).+\-_$\]]/;

/**
这段代码定义了一个函数 `parseFilters`，它的作用是解析过滤器表达式并返回最终的表达式字符串。该函数接受一个参数 `exp`，即需要被解析的过滤器表达式。

在函数内部，首先定义了一些变量用于标记当前字符在哪种语法结构中被使用。例如 `inSingle`、`inDouble`、`inTemplateString` 和 `inRegex` 分别表示当前是否在单引号、双引号、模板字符串和正则表达式中。还有一些变量如 `curly`、`square` 和 `paren` 表示当前所处的括号层数。

然后初始化了一些变量，包括 `lastFilterIndex` 表示上一个过滤器的结束位置，这个变量后面会被用到。

接着进入循环，遍历传进来的表达式字符串。在循环中，对于每个字符进行判断，根据当前字符所处的语法结构和上一个字符以及当前字符是否为 `|` 来决定如何处理当前字符。具体实现可以参考代码中的注释。

最后将解析出来的表达式和过滤器组合成最终的表达式字符串，并返回。
 */

export function parseFilters(exp: string): string {
  let inSingle = false;
  let inDouble = false;
  let inTemplateString = false;
  let inRegex = false;
  let curly = 0;
  let square = 0;
  let paren = 0;
  let lastFilterIndex = 0;
  let c, prev, i, expression, filters;

  /**
这段代码是用于解析筛选器表达式的。在Vue模板中，可以使用管道符“|”来对数据进行转换或者过滤，例如`{{ message | uppercase }}`。这里的代码就是用来判断如果遇到了一个“|”，则表示接下来的内容应该是一个过滤器。

该代码中定义了四个布尔变量，分别代表是否处于单引号、双引号、模板字符串和正则表达式中。通过循环遍历整个表达式，逐个字符判断当前字符的类型，以及该字符是否在特定的引号、括号和模板字符串内部。如果在某种引号内部，则继续往后执行，直到引号结束为止。如果遇到了“|”，并且不处于任何引号、括号和模板字符串内部，则表示前面的部分是表达式，后面的部分是过滤器，并将其推送到过滤器列表中。最后返回解析完成的结果。

需要注意的是，在判断除法运算符“/”时，如果前一位不是空格或者不符合非除号字符的正则表达式，则认为接下来是一个正则表达式，而不是除法运算符。
 */

  for (i = 0; i < exp.length; i++) {
    prev = c;
    c = exp.charCodeAt(i);
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5c) inSingle = false;
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5c) inDouble = false;
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5c) inTemplateString = false;
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5c) inRegex = false;
    } else if (
      c === 0x7c && // pipe
      exp.charCodeAt(i + 1) !== 0x7c &&
      exp.charCodeAt(i - 1) !== 0x7c &&
      !curly &&
      !square &&
      !paren
    ) {
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        expression = exp.slice(0, i).trim();
      } else {
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22:
          inDouble = true;
          break; // "
        case 0x27:
          inSingle = true;
          break; // '
        case 0x60:
          inTemplateString = true;
          break; // `
        case 0x28:
          paren++;
          break; // (
        case 0x29:
          paren--;
          break; // )
        case 0x5b:
          square++;
          break; // [
        case 0x5d:
          square--;
          break; // ]
        case 0x7b:
          curly++;
          break; // {
        case 0x7d:
          curly--;
          break; // }
      }
      if (c === 0x2f) {
        // /
        let j = i - 1;
        let p;
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j);
          if (p !== " ") break;
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true;
        }
      }
    }
  }

  /**
这段代码实际上是用来解析模板中的过滤器的。

首先，我们需要明确一下 `exp` 是什么。这里的 `exp` 指的是 Vue 模板中使用了过滤器的表达式，例如：

```html
<p>{{ message | capitalize }}</p>
```

在这个例子中，`exp` 的值就是 `"message | capitalize"`。

接下来，让我们来看一下这段代码的具体作用：

1. 首先判断表达式是否被定义，如果没有被定义，那么就将 `expression` 赋值为 `exp.slice(0, i).trim()`。这里的 `i` 表示的是过滤器的起始位置，即 `|` 的位置。因此，`exp.slice(0, i)` 就是取出过滤器管道符之前的字符串，然后通过 `trim()` 方法去掉空格。

2. 如果表达式已经被定义，并且上一个过滤器的结束位置 `lastFilterIndex` 不为 0，那么就调用 `pushFilter()` 方法将该过滤器加入到 `filters` 数组中。这里的 `lastFilterIndex` 表示上一个过滤器的结束位置，如果它不为 0，说明当前表达式里面有多个过滤器，需要将它们全部解析出来加入到 `filters` 数组中。

总的来说，这段代码的作用就是将一个包含多个过滤器的表达式解析成多个单独的过滤器，并将它们存储到 `filters` 数组中。这个数组会被用来在编译时生成对应的渲染函数，从而实现对过滤器的支持。
 */

  if (expression === undefined) {
    expression = exp.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  /**
在 Vue 的模板中，我们可以使用过滤器来对数据进行处理。例如，在模板中使用 `{{ message | capitalize }}` 可以将 `message` 值的首字母大写。在编译模板时，Vue 会解析模板中的过滤器，并生成相应的代码来实现数据的处理。

`pushFilter` 函数是一个用于解析模板中过滤器表达式的函数。在解析模板中的表达式时，当遇到 `|` 字符时，就需要将前面的部分作为表达式，后面的部分作为过滤器名称。`pushFilter` 函数的作用就是将解析出来的过滤器名称存储到一个数组中，供后续代码生成使用。

具体地说，`pushFilter` 函数中的逻辑如下：

1. 判断是否已经存在 filters 数组，如果不存在，则初始化一个空数组。
2. 将当前扫描位置（即 i 变量）之前的部分作为一个新的过滤器名称，存储到 filters 数组中。
3. 更新 lastFilterIndex 变量，使其指向下一个过滤器名称的起始位置。
 */

  function pushFilter() {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
    lastFilterIndex = i + 1;
  }

  /**
这段代码是在Vue的模板编译器中，用于处理模板中的过滤器(filter)的部分。在Vue中，我们可以通过过滤器来对数据进行一些简单的转化或处理，例如将一个字符串全部转为大写字母等等。这段代码的作用就是将模板中的过滤器解析出来，并将其应用到表达式(expression)上。

首先，判断是否存在filters数组，如果有则进入循环。循环中，遍历每一个过滤器，将表达式和当前过滤器一起传递给`wrapFilter`函数进行处理。`wrapFilter`函数的作用就是将过滤器转换成实际可执行的代码，并将表达式插入到其中，最终生成新的表达式返回。

举个例子，假如我们的模板中有这样一句话：`{{ message | capitalize }}`，其中`capitalize`是一个自定义的过滤器，表示将message字符串的首字母转化为大写。那么这段代码就会被解析为：

```
expression = wrapFilter('message', 'capitalize');
```

而`wrapFilter`函数会将其转化为下面这段代码：

```
"_f('capitalize')(_s(message))"
```

这段代码表示调用名为`capitalize`的过滤器函数，并将`message`作为参数传递给它。而`_f`和`_s`是Vue内部定义的工具函数，用于包装过滤器和转化数据。

最终，在编译完成后，这段代码将会被渲染成目标平台的可执行代码，实现我们期望的效果。
 */

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i]);
    }
  }

  /**
./dist/src/compiler/parser/filter-parser.ts中的代码片段如下：

```
function parsePipeExpression(
  exp: string,
  next: Function,
  rawExp: string
): SimpleExpressionNode | undefined {
  let expression = stripParens(exp)
  let pipes = expression.indexOf('|')
  if (pipes > -1) {
    expression = wrapFilter(expression.slice(0, pipes), rawExp)
    for (
      let i = 0, l = expression.length;
      i < l;
      i++
    ) {
      const c = expression.charAt(i)
      if (c === '(') {
        const j = findEndOfExpression(expression, i + 1)
        const exp = expression.slice(i + 1, j)
        const args = exp.split(',')
        raiseCodeError(
          `Invalid number of arguments for filter "${expression.slice(
            0,
            i
          )}"` +
            `Expected ${(filterFactory as any)[expression.slice(0, i)].length}` +
            `but got ${args.length}.`,
          next
        )
      }
    }
    return parseSimpleExpression(expression, next)
  } else {
    return parseSimpleExpression(exp, next)
  }
}
```

这段代码是用来解析Vue模板中使用的管道表达式的函数。其中，返回值是一个类型为SimpleExpressionNode | undefined的变量。

在该函数的最后，会调用parseSimpleExpression(expression, next)来解析expression，并将结果作为当前函数的返回值。因此，整个函数最终返回的是解析后的SimpleExpressionNode对象或者undefined。

需要注意的是，由于parseSimpleExpression(expression, next)可能返回undefined，因此该函数的返回值也可能为undefined。
 */

  return expression;
}

/**
这段代码是Vue模板编译器中的过滤器解析器的一部分。它主要是用来生成一个函数调用表达式，将一个表达式和一个过滤器字符串组合起来。

具体来说，这个函数接受两个参数，第一个参数是一个表达式字符串，第二个参数是一个过滤器字符串。其中，过滤器字符串可能会包含参数列表，例如"filter(arg1,arg2)"。

如果过滤器字符串中没有参数，则直接通过"_f"方法调用过滤器即可，例如"_f("filterName")(exp)"。

如果过滤器字符串中有参数，则需要对参数进行拆分，获取过滤器名和参数列表。然后再通过"_f"方法调用过滤器，并将参数传递给它，例如"_f("filterName")(exp,arg1,arg2)"。

最后，这个函数会返回一个完整的函数调用表达式字符串，供其他编译器处理程序使用。
 */

function wrapFilter(exp: string, filter: string): string {
  const i = filter.indexOf("(");
  if (i < 0) {
    // _f: resolveFilter
    return `_f("${filter}")(${exp})`;
  } else {
    const name = filter.slice(0, i);
    const args = filter.slice(i + 1);
    return `_f("${name}")(${exp}${args !== ")" ? "," + args : args}`;
  }
}
