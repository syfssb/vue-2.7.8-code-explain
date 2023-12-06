
/**
./dist/src/types/modules.d.ts 文件是 Vue.js 的源码中用来定义模块化系统的 TypeScript 类型声明文件。

在这个文件中，主要定义了 Vue.js 中使用的一些模块，并且对每个模块进行了详细的类型声明。这样我们在开发过程中就可以通过 TypeScript 强类型检查的方式来保证代码的正确性和可靠性。

这个文件在整个 Vue.js 源码中扮演着重要的角色，它被其他文件引用，使得整个代码库具有更好的可维护性和扩展性。同时，也方便了第三方开发者对 Vue.js 进行扩展和定制化开发。

总之，./dist/src/types/modules.d.ts 文件是 Vue.js 源码中非常重要的一个文件，它为整个代码库提供了强类型支持，使得开发过程更加高效、安全和可靠。
 */
 



/**
这段代码是在声明一个名为"de-indent"的模块，并向外暴露了一个名为"default"的函数。这个模块的作用是去除字符串中每行前面的空白符。

具体来说，这个模块中声明了一个名为"deindent"的默认函数，该函数接收一个字符串参数，然后使用正则表达式去除每行前面的空白符、制表符和换行符，最终返回处理过的字符串。因此，在使用这个模块时，我们可以通过引入"de-indent"模块，并调用它的"default"方法来对需要进行去除缩进的字符串进行处理。
 */
 
declare module 'de-indent' {
  export default function deindent(input: string): string
}



/**
这段代码是在声明一个命名空间（namespace）`jasmine`，其中定义了一个接口（interface）`Matchers<T>`。这个接口中又声明了两个函数 `toHaveBeenWarned()` 和 `toHaveBeenTipped()`，它们分别没有参数，返回值为 `void`。

这里的 `jasmine` 是一个测试框架，它提供了一些用于编写和运行测试的函数和方法。这个命名空间的作用是扩展`jasmine`测试框架的`Matchers`类型，使得我们可以在测试过程中使用 `toHaveBeenWarned()` 和 `toHaveBeenTipped()` 这两个自定义匹配器（matcher），以便更方便地验证 Vue.js 应用程序在发出警告（warning）或提示（tip）时的行为是否符合预期。
 */
 
declare namespace jasmine {
  interface Matchers<T> {
    toHaveBeenWarned(): void
    toHaveBeenTipped(): void
  }



/**
这段代码定义了一个泛型接口`ArrayLikeMatchers<T>`，它包含两个方法：

1. `toHaveBeenWarned()`：这个方法用于测试在执行期间Vue是否已经发出了警告。
2. `toHaveBeenTipped()`：这个方法用于测试在执行期间Vue是否已经发出了提示。

这两个方法主要用于Vue的单元测试中，可以帮助我们检查Vue是否按照预期工作。如果某个功能需要发出警告或提示，我们可以通过调用相关的函数并使用这些方法来确认Vue确实发出了相应的消息。
 */
 
  interface ArrayLikeMatchers<T> {
    toHaveBeenWarned(): void
    toHaveBeenTipped(): void
  }
}


