
/**
./dist/src/v3/reactivity/operations.ts文件是Vue 3.x版本响应式系统中定义了一些基本的操作函数，用于修改响应式对象的值以及对其进行依赖收集和派发更新。具体包括以下几个函数:

1. `track(to: ReactiveEffect | null, type: TrackOpTypes, key: unknown)`：在访问响应式对象属性时调用该函数，用于向当前正在执行的响应式副作用函数添加这个属性的依赖关系。

2. `trigger(target: object, type: TriggerOpTypes, key?: unknown)`：在修改响应式对象属性时调用该函数，用于通知当前正在执行的响应式副作用函数或相关联的组件，这个属性已经被修改了并且需要进行更新。

3. `isReadonly(obj: any): boolean`：判断一个对象是否是只读的响应式对象。

4. `isReactive(obj: any): boolean`：判断一个对象是否是响应式对象。

5. `toRaw<T>(observed: T): T`：返回原始未被响应式代理的对象。

6. `markNonReactive(obj: any): void`：标记一个对象不为响应式对象。

7. `markReadonly(value: any): any`：将一个对象变为只读的响应式对象。

这些函数在整个响应式系统中起着重要的作用，它们实现了响应式系统的核心功能。其他与响应式系统相关的文件，例如reactivity.ts等，都会引入这些函数来实现响应式功能。
 */
 



/**
在Vue的响应式系统中，会有许多操作对数据进行修改，例如添加、删除、更新等。这些操作会触发一个叫做“Debugger Event”的事件，它可以用于调试和排查问题。

在Vue的源码中，为了更好地理解这些事件，开发者使用了字符串而不是数字来表示它们的类型。这样做有两个好处：

1. 更易于检查：如果开发者想要查看某个操作的类型，他们只需要看到相应的字符串就可以了，因为字符串比数字更容易被理解和记忆。
2. 更易于调试：使用字符串作为事件类型可以更好地阅读和调试代码，因为开发者可以通过打印或记录事件类型来确定程序中发生的特定事件，从而更轻松地检测错误或问题。

因此，在Vue中，使用字符串表示事件类型是一种最佳实践，也是为了方便调试和检查代码的一种方式。
 */
 
// using literal strings instead of numbers so that it's easier to inspect
// debugger events



/**
这段代码定义了一个 TypeScript 枚举类型 `TrackOpTypes`，它包含两个值：`GET` 和 `TOUCH`。这个枚举类型主要用于追踪响应式对象的访问（get）操作和依赖收集（touch）操作。当响应式对象被访问时，就会触发 get 操作并进行依赖收集；当响应式对象被修改时，就会触发 set 操作并通知对应的依赖更新。

在 Vue 的响应式系统中，每个响应式对象都有一个对应的 `Dep` 实例，`Dep` 实例内部维护着一组 watcher（观察者），当响应式对象的属性被访问时，就会向当前正在执行的 watcher 发送一个 addDep 的消息，并将该 Dep 实例添加到当前 watcher 的依赖列表中。这就是依赖收集的过程。当响应式对象的属性被修改时，就会触发 `setter` 函数，并通知所有依赖该响应式对象的 watcher 更新。

因此，`TrackOpTypes` 枚举类型中的 `GET` 代表了一个 get 操作，在响应式对象上读取一个属性值时会触发该操作，而 `TOUCH` 则代表了一个 touch 操作，在可能会访问响应式对象但不一定会触发 get 操作时使用。
 */
 
export const enum TrackOpTypes {
  GET = 'get',
  TOUCH = 'touch'
}



/**
在Vue中，响应式系统是非常重要的一部分。通过监听数据的变化，Vue会自动更新视图，从而实现了数据与视图的双向绑定。

在响应式系统中，触发操作类型（TriggerOpTypes）用于描述对响应式对象进行的操作类型。其中包括：

- SET：修改属性的值。
- ADD：添加新属性。
- DELETE：删除某个属性。
- ARRAY_MUTATION：数组中元素发生变化。

这些操作会被捕捉到并通知响应式系统进行相应的处理，例如更新视图或重新计算计算属性等。

在代码中，使用枚举类型（enum）定义触发操作类型，同时给每个操作类型指定一个字符串值，方便在代码中引用和传递。使用const关键字定义枚举类型，避免修改其值。
 */
 
export const enum TriggerOpTypes {
  SET = 'set',
  ADD = 'add',
  DELETE = 'delete',
  ARRAY_MUTATION = 'array mutation'
}


