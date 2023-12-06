/**
`./dist/src/compiler/codeframe.ts` 文件是 Vue.js 编译器的代码行号错误提示工具，主要用于在编译过程中，当出现代码错误时，提供详细的错误信息和错误位置。

这个文件主要定义了 `CodeFrame` 类和一些与之相关的函数和常量。其中，`CodeFrame` 类封装了对错误位置进行处理和错误提示的方法，它接受一条错误消息、错误代码、源代码以及错误位置信息作为参数，并生成一段具有可读性的错误提示信息。

在整个 Vue.js src 源码中，`./dist/src/compiler/codeframe.ts` 文件主要被用于以下几个方面：

- 在编译器中，当遇到语法错误时，会使用该文件来生成更加友好和详细的错误提示信息。
- 在测试用例中，也会使用该文件来生成包含错误信息和位置的代码片段，以便于测试结果的验证和调试。
- 在开发者开发自己的插件或者拓展时，也可以使用该文件来进行错误信息提示和位置标记等操作。

总之，`./dist/src/compiler/codeframe.ts` 文件虽然只是一个辅助性的工具类，但却在 Vue.js 编译器的功能实现和开发者的开发过程中起到了重要的作用。
 */

/**
在 `./dist/src/compiler/codeframe.ts` 中，定义了一个名为 `range` 的常量，并赋值为 2。

这个常量的作用是指示代码错误时在错误行附近打印多少行代码。例如，如果 `range` 值为 2，则在错误行的前后各打印两行代码。

这个常量通常不需要修改，因为它已经被设置为一个合理的默认值。但如果你希望在打印错误信息时显示更多或更少的代码行数，就可以修改这个常量的值来实现自定义配置。
 */

const range = 2;

/**
`generateCodeFrame` 函数用于生成代码框架，其参数包括 `source`、`start`、`end`。其中 `source` 是一个字符串类型的源代码，`start` 和 `end` 则是数字类型，表示某段代码的起始和结束位置。

该函数首先将 `source` 按照 `\r?\n` 进行分割，获得每一行的内容。然后通过循环遍历这些行，并根据 `start` 和 `end` 的值来判断需要输出哪些内容。

最后，返回一个字符串数组 `res`，其中保存了该段代码的代码框架。其中，每一行都以行号和 "|" 开头，然后是该行的具体内容。如果该行包含了起始点和结束点之间的代码，则在该行的末尾添加 "^" 符号标记出相应的位置。特别地，如果该行本身就是起始点和结束点所在的行，则在相应的位置添加 "^" 符号。

需要注意的是，在代码框架中，只有与起始点和结束点在同一行或者在相邻行的部分才会被标记出来，其他部分则不会显示。
 */

export function generateCodeFrame(
  source: string,
  start: number = 0,
  end: number = source.length
): string {
  const lines = source.split(/\r?\n/);
  let count = 0;
  const res: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + 1;
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length) continue;
        res.push(
          `${j + 1}${repeat(` `, 3 - String(j + 1).length)}|  ${lines[j]}`
        );
        const lineLength = lines[j].length;
        if (j === i) {
          // push underline
          const pad = start - (count - lineLength) + 1;
          const length = end > count ? lineLength - pad : end - start;
          res.push(`   |  ` + repeat(` `, pad) + repeat(`^`, length));
        } else if (j > i) {
          if (end > count) {
            const length = Math.min(end - count, lineLength);
            res.push(`   |  ` + repeat(`^`, length));
          }
          count += lineLength + 1;
        }
      }
      break;
    }
  }
  return res.join("\n");
}

/**
这段代码定义了一个repeat函数，用于将一个字符串重复n次。下面是具体的实现：

1. 首先定义一个空字符串result，作为函数返回值。
2. 然后判断n是否大于0，如果不是，则直接返回空字符串。
3. 如果n大于0，则进入while循环。
4. 在循环中，首先判断n的二进制最低位是否为1，如果为1，则将str添加到结果字符串result中。
5. 然后将n右移一位（相当于除以2）。
6. 接着判断n是否小于等于0，如果是，则跳出循环。
7. 否则，将传入的字符串参数str加倍，继续进行循环。
8. 最后返回结果字符串result。

这个函数的主要作用是用来生成错误提示信息的代码框架，其中的repeat函数就是用来将“^”符号或者空格字符串重复多次，从而形成错误提示信息的上下文。
 */

function repeat(str: string, n: number) {
  let result = "";
  if (n > 0) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-line
      if (n & 1) result += str;
      n >>>= 1;
      if (n <= 0) break;
      str += str;
    }
  }
  return result;
}
