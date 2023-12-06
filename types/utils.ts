/**
./dist/src/types/utils.ts文件主要是定义了一些Vue内部使用的工具函数，例如isPrimitive、isObject等等。这些函数在Vue2源码中广泛使用，用于判断数据类型、对象是否相等等等。

此外，./dist/src/types/utils.ts文件还定义了一些 Vue 类型的别名，供其他文件引用。这些类型别名包括：

- RawComponentOptions：原始组件选项类型
- ComponentOptions：组件选项类型
- FunctionalComponentOptions：函数式组件选项类型
- RenderContext：渲染上下文类型
- PropOptions：属性选项类型
- ComputedOptions：计算属性选项类型
- MethodOptions：方法选项类型
- WatchHandler：watch回调函数类型

./dist/src/types/utils.ts文件可以说是Vue源码中与类型定义相关联的一个核心文件。其他模块的代码中都可能会用到这个文件定义的一些类型别名和工具函数。
 */

/**
这段代码定义了一个类型工具函数 IfAny，用于判断泛型类型 T 是否包含 any 类型。

其实现方式是利用了一个三目运算符，当 T 类型包含 any 时，返回类型 Y，否则返回类型 N。

具体来说，0 extends 1 & T 的结果为 true 当且仅当 T 包含 any 类型。因为 & 运算符会取两个类型公共的部分，而任何类型和 1 相与都等于 1，1 和 0 相或都等于 1，所以 1 & T 可以表示 T 中包含的所有类型。

如果 T 包含 any，那么 0 extends 1 & T 为 true，三目运算符返回类型 Y；否则为 false，返回类型 N。这样就实现了根据泛型类型中是否包含 any 来选择不同的输出类型的功能。
 */

// If the the type T accepts type "any", output type Y, otherwise output type N.
// https://stackoverflow.com/questions/49927523/disallow-call-with-any/49928360#49928360
export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
