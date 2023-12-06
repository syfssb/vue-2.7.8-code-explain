/**
`error-detector.ts` 文件是 Vue 模板编译器的错误检测模块。它主要用于在编译模板时检测是否存在语法错误或其他问题，并返回具体的错误信息以帮助开发者进行修复。

该文件主要包含了一个 `createErrorDetector` 函数，它接收一个 `rootNode` 参数表示编译后的 AST 根节点，并返回一个函数，这个函数可以检测一个表达式节点是否合法。如果表达式不合法，则会抛出一个错误，其中包含了具体的错误信息，例如错误的行号、列号、错误类型等等。

在整个 Vue 的源码中，`error-detector.ts` 与其他模块的关系比较松散。它主要被用于支持 Vue 模板编译器的功能，而不是直接影响 Vue 运行时的行为。因此，在日常的开发中，我们通常不需要直接使用到该文件，而是通过调用 Vue 的编译器接口来间接地使用它。
 */

/**
在Vue中，编译器的作用是将模板字符串(template)转换为渲染函数(render function)。错误检测器(error detector)是编译器中的一部分，它的作用是在编译过程中检测并报告一些语法错误。

在./dist/src/compiler/error-detector.ts文件中，我们可以看到该文件导入了两个类型(ASTElement, ASTNode)和两个正则表达式(dirRE, onRE)。这些都是与编译器相关的类型和工具函数。

- ASTElement和ASTNode是Vue编译器中定义的抽象语法树节点类型，用于描述模板中的元素和节点。
- dirRE是用来匹配指令的正则表达式，在模板解析阶段中使用。例如：v-model、v-bind等指令。
- onRE是用来匹配事件绑定的正则表达式，在模板解析阶段中使用。例如：@click、@input等事件绑定。

这些类型和工具函数都是编译器中必不可少的部分，它们提供了一些必要的工具和数据结构，以便于编译器能够正确地解析和编译模板，同时确保编译过程中出现的错误能够被检测和报告。
 */

import { ASTElement, ASTNode } from "types/compiler";
import { dirRE, onRE } from "./parser/index";

/**
在Vue的编译器（compiler）中，有一个文件名为error-detector.ts，该文件主要用于检测模板中的错误。其中，定义了一个类型别名（type alias）叫做Range，它表示一个对象，可能包含两个属性：start和end，这两个属性值都是数字类型。

具体来说，Range类型的含义是表示一个范围，比如在模板中，可能会涉及到各种标签、属性、文本等内容，在解析这些内容时需要知道它们所处的位置或范围。例如，当解析模板时，如果发生语法错误，那么就需要通过Range类型中的start和end属性来指定出错的位置或范围，以便于更好地进行错误提示或者调试。

因此，Range类型在Vue的编译器中具有很重要的作用，而在error-detector.ts这个文件中，主要就是通过使用Range类型来检查各种可能的错误情况，并向开发者提供更加友好的错误提示信息。
 */

type Range = { start?: number; end?: number };

/**
在Vue的模板编译过程中，会将模板编译为渲染函数，并将渲染函数转换为可执行的JavaScript代码。其中可能会出现一些非法的JavaScript代码片段，如使用关键字作为变量名或者属性名。

prohibitedKeywordRE 是一个正则表达式，用于匹配不应该出现在JavaScript表达式中的关键字。这些关键字包括：do、if、for、let、new、try、var、case、else、with、await、break、catch、class、const、super、throw、while、yield、delete、export、import、return、switch、default、extends、finally、continue、debugger、function、arguments。

通过将这些关键字与正则表达式结合起来，我们可以检测是否有使用了这些关键字作为变量名或属性名，如果出现了，就会抛出错误。

这个检测机制可以避免一些比较难以发现的错误，提高代码的健壮性和可维护性。
 */

// these keywords should not appear inside expressions, but operators like
// typeof, instanceof and in are allowed
const prohibitedKeywordRE = new RegExp(
  "\\b" +
    (
      "do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const," +
      "super,throw,while,yield,delete,export,import,return,switch,default," +
      "extends,finally,continue,debugger,function,arguments"
    )
      .split(",")
      .join("\\b|\\b") +
    "\\b"
);

/**
这段代码定义了一个正则表达式 `unaryOperatorsRE`，用于检测一元运算符在 Vue 模板中被误用作属性或方法名。

具体来说，这个正则表达式匹配以下三种一元运算符：

- delete
- typeof
- void

其中，delete、typeof 和 void 都是 JavaScript 中的一元运算符。这个正则表达式会检测这些一元运算符是否出现在模板中的属性或方法名中。

在模板中，属性和方法名应该由字母、数字、下划线和连字符组成，但不能以数字开头。如果出现了一元运算符，则需要将其放置在圆括号内，例如 `typeof(myVariable)`。

如果这些一元运算符被错误地用作属性或方法名，则会导致编译错误。因此，这个正则表达式的作用是检测这类错误并提示开发者修改代码。
 */

// these unary operators should not be used as property/method names
const unaryOperatorsRE = new RegExp(
  "\\b" +
    "delete,typeof,void".split(",").join("\\s*\\([^\\)]*\\)|\\b") +
    "\\s*\\([^\\)]*\\)"
);

/**
这段代码中的 `stripStringRE` 是一个正则表达式，用于匹配模板字符串中的文本部分并将其删除。具体来说：

- `/.../g` 中的 `g` 表示全局匹配，即找到所有匹配项而不是仅找到第一个。
- `'...'`、`"..."` 和 `` `...${...}...` `` 分别表示单引号、双引号和模板字符串（其中可能包含插值表达式 `${...}`）。
- `(?:...)` 表示非捕获组。
- `[^'\\]` 表示除了单引号和反斜杠之外的任意字符。
- `[^"\\]` 和 `[^`\\]` 同理。
- `\\.`, `\${` 和 `\}` 分别表示转义字符 `\`、`${` 和 `}`。

因此，`stripStringRE` 可以匹配模板字符串中所有的文本部分，包括单引号、双引号和反引号中的内容，以及插值表达式中的非文本部分。在编译模板时，这个正则表达式会被用来删除这些文本部分，以减少编译后的代码大小和运行时间。
 */

// strip strings in expressions
const stripStringRE =
  /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

/**
`detectErrors` 是一个函数，它的作用是检测在模板中可能存在的问题表达式。该函数接受两个参数：`ast` 和 `warn`。

`ast` 是一个 AST（抽象语法树），它表示着模板中所有节点的树形结构。`ast` 参数在这里表示整个模板的 AST 根节点。

`warn` 是一个函数类型的参数，它被用于打印警告信息。当发现有问题的表达式时，该函数会被调用，向控制台输出警告信息。

具体地说，在 `detectErrors` 函数中，会对传入的 `ast` 进行检查，一旦发现节点中存在问题表达式，就会调用 `warn` 函数输出警告信息。

需要注意的是，由于该函数调用了 `checkNode`，因此可以推断出该函数内部对 AST 进行深度优先遍历，并对每个节点进行检查。同时，在 `checkNode` 中会判断某个节点是否为文本节点，如果是文本节点，则会再次调用 `checkText` 进行检查。

总之，该函数主要是用于检查模板中可能存在的问题表达式，以便在开发环境下及时发现并修复这些问题。
 */

// detect problematic expressions in a template
export function detectErrors(ast: ASTNode | undefined, warn: Function) {
  if (ast) {
    checkNode(ast, warn);
  }
}

/**
这段代码是Vue的编译器部分的代码，主要用来检查模板中节点的属性是否合法。具体来说，这个函数接受两个参数：一个是表示节点的ASTNode对象，另一个是一个回调函数warn。其中ASTNode对象是在解析模板字符串后生成的一个抽象语法树（Abstract Syntax Tree），它表示了模板中所有节点的结构和内容。

在函数内部，首先会判断当前节点的类型，如果是元素节点（即type为1），则会遍历节点的属性，并检查每个属性的名称和值是否符合规范。具体来说，如果属性名称以v-、@或:开头，则会进行相应的检查，例如对于v-for、v-bind、v-on等指令属性，会使用checkFor、checkExpression和checkEvent等函数进行检查。如果是插槽属性（即v-slot或#开头的属性），会检查其参数表达式是否合法。如果当前节点有子元素，则会递归调用checkNode函数来检查子元素的属性。

如果当前节点是文本节点（即type为2），则会直接调用checkExpression函数来检查文本节点表达式是否合法。

总的来说，这个函数是Vue编译器中的一个重要部分，用来保证模板中的节点属性都是符合规范的，从而在运行时能够正确地解析和执行。
 */

function checkNode(node: ASTNode, warn: Function) {
  if (node.type === 1) {
    for (const name in node.attrsMap) {
      if (dirRE.test(name)) {
        const value = node.attrsMap[name];
        if (value) {
          const range = node.rawAttrsMap[name];
          if (name === "v-for") {
            checkFor(node, `v-for="${value}"`, warn, range);
          } else if (name === "v-slot" || name[0] === "#") {
            checkFunctionParameterExpression(
              value,
              `${name}="${value}"`,
              warn,
              range
            );
          } else if (onRE.test(name)) {
            checkEvent(value, `${name}="${value}"`, warn, range);
          } else {
            checkExpression(value, `${name}="${value}"`, warn, range);
          }
        }
      }
    }
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        checkNode(node.children[i], warn);
      }
    }
  } else if (node.type === 2) {
    checkExpression(node.expression, node.text, warn, node);
  }
}

/**
这段代码的作用是在编译模板时，检查绑定在事件上的表达式是否合法。

其中，checkEvent函数接收四个参数：

- exp: string - 绑定在事件上的表达式
- text: string - 事件绑定的文本内容
- warn: Function - 警告信息的输出函数
- range?: Range - 可选的范围参数

在该函数中，首先使用正则表达式stripStringRE去除exp字符串中的空格和引号等字符，生成一个新的stripped字符串。然后使用正则表达式unaryOperatorsRE匹配出stripped字符串中的一元运算符，并且判断该一元运算符前面是否是$符号。如果不是，则在编译时会将一元运算符当做属性名进行处理，这样会导致编译错误。因此，在此情况下会通过warn函数输出警告信息，提示开发者避免使用JavaScript一元运算符作为事件绑定的属性名。

最后，checkEvent函数调用checkExpression函数来检查表达式exp的语法是否正确。checkExpression函数是Vue模板编译器中的另一个函数，它会在编译过程中检查所有的表达式。
 */

function checkEvent(exp: string, text: string, warn: Function, range?: Range) {
  const stripped = exp.replace(stripStringRE, "");
  const keywordMatch: any = stripped.match(unaryOperatorsRE);
  if (keywordMatch && stripped.charAt(keywordMatch.index - 1) !== "$") {
    warn(
      `avoid using JavaScript unary operator as property name: ` +
        `"${keywordMatch[0]}" in expression ${text.trim()}`,
      range
    );
  }
  checkExpression(exp, text, warn, range);
}

/**
这段代码的作用是检测`v-for`指令中的语法错误。在Vue的模板编译过程中，当解析到`v-for`指令时，会把该指令所在的节点转换成一个ASTElement对象。这个ASTElement对象包含了`v-for`指令的各个属性（如`alias`、`for`、`iterator1`等）。

这个函数的参数`node`就是一个ASTElement对象，`text`是指令所在节点的文本内容，`warn`是一个警告函数，`range`是一个范围对象，用于记录该指令所在节点在模板字符串中的位置信息。

函数中依次调用了`checkExpression`、`checkIdentifier`方法来检查`v-for`指令中的表达式和标识符是否合法。其中：

- `checkExpression`函数用于检查`v-for`指令中的迭代表达式是否合法；
- `checkIdentifier`则用于检查`v-for`指令中的变量名、索引名是否合法。

如果检测到错误，则会通过调用`warn`函数来发出警告，提示用户修正错误。
 */

function checkFor(
  node: ASTElement,
  text: string,
  warn: Function,
  range?: Range
) {
  checkExpression(node.for || "", text, warn, range);
  checkIdentifier(node.alias, "v-for alias", text, warn, range);
  checkIdentifier(node.iterator1, "v-for iterator", text, warn, range);
  checkIdentifier(node.iterator2, "v-for iterator", text, warn, range);
}

/**
这段代码的作用是检查表达式中是否存在无效的标识符（identifier），如果存在，就会发出警告。其中传入的参数含义如下：

- ident：表示要检查的标识符，它可以为字符串、null 或 undefined。
- type：表示该标识符所属类型，比如是变量名还是函数名等。
- text：表示包含该标识符的表达式文本。
- warn：表示警告信息的处理函数。
- range：表示标识符所在的位置范围。

具体实现是通过使用 JavaScript 的 new Function() 构造函数，对表达式进行求值。如果标识符不合法，就会抛出异常，此时我们就可以捕获这个异常，然后发出警告。

需要注意的是，使用 new Function() 构造函数具有一定的安全风险，因为它可以执行任何 JavaScript 代码。因此，在使用它时必须小心谨慎，避免被恶意代码利用。
 */

function checkIdentifier(
  ident: string | null | undefined,
  type: string,
  text: string,
  warn: Function,
  range?: Range
) {
  if (typeof ident === "string") {
    try {
      new Function(`var ${ident}=_`);
    } catch (e: any) {
      warn(`invalid ${type} "${ident}" in expression: ${text.trim()}`, range);
    }
  }
}

/**
这段代码的作用是检测 Vue 模板表达式中是否存在语法错误或不合法的 JavaScript 代码。它接受四个参数：

- exp：一个字符串，表示待检测的表达式。
- text：一个字符串，表示整个模板中的文本内容。
- warn：一个函数，用于在检测到错误时发出警告消息。
- range：一个可选的范围对象，表示表达式在文本中的位置范围。

这个函数的核心是使用 `try...catch` 来尝试将表达式转换为函数。如果转换失败，则说明表达式有语法错误，此时会根据具体情况发出相应的警告消息。如果表达式成功转换为函数，则说明表达式本身是合法的 JavaScript 代码，只需要做一些额外的检查。

具体来说，这个函数会先使用正则表达式去除字符串常量，然后再尝试匹配一些禁止使用的关键字，例如 delete、typeof 等等。如果匹配到了禁止使用的关键字，则会发出警告消息。否则，就说明表达式没有语法错误，但仍可能存在其他问题，例如访问不存在的属性等等，这些问题会在后续的运行时阶段被捕获并处理。
 */

function checkExpression(
  exp: string,
  text: string,
  warn: Function,
  range?: Range
) {
  try {
    new Function(`return ${exp}`);
  } catch (e: any) {
    const keywordMatch = exp
      .replace(stripStringRE, "")
      .match(prohibitedKeywordRE);
    if (keywordMatch) {
      warn(
        `avoid using JavaScript keyword as property name: ` +
          `"${keywordMatch[0]}"\n  Raw expression: ${text.trim()}`,
        range
      );
    } else {
      warn(
        `invalid expression: ${e.message} in\n\n` +
          `    ${exp}\n\n` +
          `  Raw expression: ${text.trim()}\n`,
        range
      );
    }
  }
}

/**
该函数用于检查一个函数的参数是否为合法的表达式，如果不合法，则会发出警告信息。该函数接收四个参数：

- exp: string：表示待检查的参数表达式。
- text: string：表示原始的参数文本。
- warn: Function：表示发出警告信息的函数。
- range?: Range：表示可选的代码范围。

这个函数的主要作用是使用 `new Function(exp, '')` 尝试创建一个新的函数，并通过 try-catch 语句来捕获任何可能出现的异常。 如果 try 块中的代码抛出了任何异常，则 catch 块中将会调用 warn 函数发出一条警告信息，其中包含了错误信息和相关的代码信息以便进行排查。

这个函数通常在编译模板时使用，在处理函数参数表达式时会被调用。因为在模板编译期间，很容易出现拼写错误或语法错误等问题，所以该函数可以帮助开发者及时地发现这些问题，从而提高代码的质量和健壮性。
 */

function checkFunctionParameterExpression(
  exp: string,
  text: string,
  warn: Function,
  range?: Range
) {
  try {
    new Function(exp, "");
  } catch (e: any) {
    warn(
      `invalid function parameter expression: ${e.message} in\n\n` +
        `    ${exp}\n\n` +
        `  Raw expression: ${text.trim()}\n`,
      range
    );
  }
}
