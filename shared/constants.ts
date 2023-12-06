
/**
`./dist/src/shared/constants.ts`文件定义了一些常量，这些常量可以在Vue的源码中被多个文件引用，并且在整个Vue的生命周期中保持不变。它起到了统一管理的作用，方便代码维护和修改。

该文件包含以下常量：

- `ASSET_TYPES`: 定义了三种资源类型：component、directive、filter。
- `SSR_ATTR`: 服务端渲染标识属性名，用于在服务端渲染时将标识添加到元素上。
- `V_MODEL`: v-model指令名称。
- `V_ON`: v-on指令名称。
- `V_PRE`: v-pre指令名称，表示跳过编译的元素。
- `V_CLOAK`: v-cloak指令名称，表示等待元素编译完成再显示。
- `V_SHOW`: v-show指令名称。
- `V_IF`: v-if指令名称。
- `V_ELSE`: v-else指令名称。
- `V_FOR`: v-for指令名称。
- `V_TEXT`: v-text指令名称。
- `V_HTML`: v-html指令名称。

这些常量在Vue的模板编译、虚拟DOM渲染、组件注册等方面都起到了关键作用，并且被多个文件引用。因此，`./dist/src/shared/constants.ts`文件是Vue源码中非常重要的一个文件，可以说是整个Vue源码的基石之一。
 */
 



/**
在Vue的源码中，SSR_ATTR是一个常量，其值为'data-server-rendered'。这个常量用于标记一个元素是否是在服务器端渲染时生成的。在服务端渲染中，Vue会将组件渲染成HTML字符串并发送到浏览器端，然后再由浏览器端的Vue实例进行激活。为了避免服务端和客户端产生不一致的结果，Vue需要在服务器端渲染的元素上添加这个属性来标记。当Vue实例在浏览器端激活时，它会识别这个属性，并且会在重新渲染时避免删除或修改该元素。
 */
 
export const SSR_ATTR = 'data-server-rendered'



/**
`ASSET_TYPES` 是一个常量数组，它定义了在 Vue.js 中可注册的三种资源类型：组件、指令和过滤器。这个数组使用 `as const` 被 TypeScript 类型推断为只读数组。

`as const` 用于告诉 TypeScript 将数组中元素的类型推断为其字面量类型（literal types），而不是普通的字符串类型。这意味着，如果你尝试给这个数组添加新的元素或修改已有元素，TypeScript 编译器将会报错。
 */
 
export const ASSET_TYPES = ['component', 'directive', 'filter'] as const



/**
这段代码定义了Vue实例生命周期钩子函数的名称，包括：

- beforeCreate: 在实例初始化之后，数据观测和事件配置之前被调用。
- created: 实例创建完成后被立即调用。在这一步，实例已完成以下的配置：数据观测(data observer)，属性和方法的运算，watch/event事件回调。然而，挂载阶段还没开始，$el属性目前不可见。
- beforeMount: 在挂载开始之前被调用：相关的render函数首次被调用。
- mounted: 实例挂载之后调用，但是在mounted的钩子函数中，组件DOM节点还没有被渲染出来。
- beforeUpdate: 数据更新时调用，发生在虚拟DOM重新渲染和打补丁之前。适合在更新之前访问现有的DOM，比如手动移除已添加的事件监听器。
- updated: 由于数据更改导致的虚拟DOM重新渲染和打补丁，在这之后会调用该钩子函数。组件DOM已更新，所以可以执行依赖于DOM的操作。
- beforeDestroy: 实例销毁之前调用。在这一步，实例仍然完全可用。
- destroyed: Vue实例销毁后调用。此时只剩下了Vue实例的空壳子，所有的DOM已经被卸载，所有的事件监听器和定时器也已被销毁。
- activated: 被keep-alive缓存的组件激活时调用。
- deactivated: 被keep-alive缓存的组件停用时调用。
- errorCaptured: 当捕获一个来自子孙组件的错误时被调用。此钩子函数可以返回false以阻止错误继续向上传播。
- serverPrefetch: 仅在服务端渲染期间调用，数据预取被解决之前，此钩子函数会被服务器端调用。
- renderTracked: 此钩子函数会在追踪组件渲染过程时被触发，在嵌套组件渲染过程中，从父到子再到孙依次触发。
- renderTriggered: 此钩子函数会在重新渲染组件时被触发，类似于watch监听器的回调。

通过这个常量数组，Vue可以判断传入的生命周期钩子是否合法，并且可以按照一定顺序执行生命周期钩子函数。
 */
 
export const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
  'serverPrefetch',
  'renderTracked',
  'renderTriggered'
] as const


