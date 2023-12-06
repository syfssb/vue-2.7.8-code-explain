/**
./dist/src/global.d.ts文件是Vue的全局类型声明文件，它定义了一些全局的类型和接口，用于在开发过程中进行静态类型检查。这个文件的作用是让IDE或编辑器能够正确地识别Vue的API，并提供相应的代码提示和自动补全功能，从而提高开发效率。

在整个Vue源码中，./dist/src/global.d.ts文件起到了非常重要的作用。由于Vue框架本身的复杂性以及其包含的大量的API，在开发过程中，我们很难记住所有的API和参数含义。因此，./dist/src/global.d.ts文件中定义的各种全局类型和接口，能够帮助我们更好地理解和使用Vue框架，并避免一些类型错误和语法错误。

此外，./dist/src/global.d.ts文件还与其他文件密切相关，例如Component、Directive、Filter、Mixin等，都会用到其中定义的类型和接口。因此，./dist/src/global.d.ts文件可以说是Vue源码中至关重要的一个文件之一。
 */

/**
在Vue的源码中，./dist/src/global.d.ts文件定义了一些全局变量，其中包括：

- `__DEV__`：表示是否为开发环境，其值为布尔类型；
- `__TEST__`：表示是否为测试环境，其值也是布尔类型；
- `__GLOBAL__`：表示是否为全局环境，其值同样为布尔类型。

这些变量在Vue的代码中被广泛使用，例如，在开发模式下会有一些额外的检查和报错；在测试模式下会加入一些额外的测试代码，而在全局环境下可能需要做一些特殊的处理。通过定义这些全局变量，Vue可以更好地控制其行为，并提供更好的开发、测试和使用体验。
 */

declare const __DEV__: boolean;
declare const __TEST__: boolean;
declare const __GLOBAL__: boolean;

/**
`./dist/src/global.d.ts` 中的代码定义了一个全局接口 `Window`，它是所有浏览器窗口中的顶层对象。这个接口里面有一个属性 `__VUE_DEVTOOLS_GLOBAL_HOOK__`，它是 Vue 开发者工具的一个钩子。

`DevtoolsHook` 是一个类型，它是 Vue 开发者工具的接口类型。开发者工具通过这个钩子来与 Vue 应用程序通信，可以实现一些高级的功能，如组件调试和性能分析等。

因此，如果你在使用 Vue 开发者工具时，在控制台中输入 `window.__VUE_DEVTOOLS_GLOBAL_HOOK__`，你将会看到这个对象的值。如果你没有使用 Vue 开发者工具，则这个对象将为空。
 */

interface Window {
  __VUE_DEVTOOLS_GLOBAL_HOOK__: DevtoolsHook;
}

/**
这段代码定义了一个名为DevtoolsHook的接口，该接口包含以下属性和方法：

1. emit: (event: string, ...payload: any[]) => void
该方法用于向开发者工具发送事件，并可携带任意数量的参数。

2. on: (event: string, handler: Function) => void
该方法用于在开发者工具上监听指定事件，并执行对应的回调函数。

3. once: (event: string, handler: Function) => void
与on方法类似，但是只会执行一次回调函数。

4. off: (event?: string, handler?: Function) => void
用于取消指定事件的监听。

5. Vue?: any
Vue属性存储了当前页面中使用的Vue实例。

6. apps: AppRecordOptions[]
apps属性则可能是个注释掉的未使用属性，无法确定其作用。

这些方法和属性主要是用于Vue开发者工具与Vue框架之间的通信，方便开发者进行调试和调优。
 */

// from https://github.com/vuejs/vue-devtools/blob/bc719c95a744614f5c3693460b64dc21dfa339a8/packages/app-backend-api/src/global-hook.ts#L3
interface DevtoolsHook {
  emit: (event: string, ...payload: any[]) => void;
  on: (event: string, handler: Function) => void;
  once: (event: string, handler: Function) => void;
  off: (event?: string, handler?: Function) => void;
  Vue?: any;
  // apps: AppRecordOptions[]
}
