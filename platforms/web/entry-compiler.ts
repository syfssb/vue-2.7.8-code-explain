
/**
`./dist/src/platforms/web/entry-compiler.ts` 是Vue编译器的入口文件。它的作用是将template模板编译成渲染函数(render function)。

在整个Vue的src中，`entry-compiler.ts`是位于`platforms/web`目录下的，它主要处理针对web平台的编译工作。它依赖于其他Vue核心模块，如`core/index.ts`和`compiler/index.ts`等等。同时，它也会被其他模块所引用，例如当我们使用Vue的单文件组件时，就需要借助于该文件来进行模板的编译。

总之，`entry-compiler.ts`作为Vue编译器的入口，起到了关键的作用，是Vue框架中非常重要的一个文件。
 */
 



/**
在Vue的源码中，`./dist/src/platforms/web/entry-compiler.ts` 文件是 Vue 在浏览器环境下编译模板的入口文件。它主要通过以下方式导出几个核心模块：

1. `parseComponent`：来自 `sfc/parseComponent` 模块，这个模块用于解析 `.vue` 单文件组件并返回一个对象，包含了组件的各种信息，例如组件的 `<template>`、`<script>` 和 `<style>` 标签内容等等。

2. `compile` 和 `compileToFunctions`：来自 `./compiler/index` 模块，这些模块用于把模板编译成渲染函数，`compile` 编译成字符串形式的代码，`compileToFunctions` 则把字符串形式的代码转换为可执行的函数。

3. `ssrCompile` 和 `ssrCompileToFunctions`：来自 `server/compiler` 模块，这些模块用于在服务端中编译模板，生成 HTML 字符串。

4. `generateCodeFrame`：来自 `compiler/codeframe` 模块，这个模块用于生成语法错误的提示信息，包括错误所在代码行及附近的上下文代码片段。
 */
 
export { parseComponent } from 'sfc/parseComponent'
export { compile, compileToFunctions } from './compiler/index'
export { ssrCompile, ssrCompileToFunctions } from 'server/compiler'
export { generateCodeFrame } from 'compiler/codeframe'


