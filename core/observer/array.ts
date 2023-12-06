
/**
`./dist/src/core/observer/array.ts` 文件主要实现了 Vue 的响应式数据绑定中数组的变化侦测。它是 Vue 响应式系统中的一个核心模块之一，用于跟踪数组的变化并执行更新操作。

具体来说，该文件定义了一个 `observeArray` 函数，它能够将一个普通的数组转化为 Observable 数组。在这个过程中，Vue 通过重写数组原型上的一些方法来拦截对数组的操作，然后触发相应的更新操作。

此外，该文件还与整个 Vue 源码中其他模块密切相关。比如，在 `./dist/src/core/observer/index.ts` 文件中，会调用 `./dist/src/core/observer/array.ts` 中的 `observeArray` 函数来进行数组的变化侦测。同时，`./dist/src/core/observer/watcher.ts` 文件中也会使用到数组变化侦测相关的代码。

总之，`./dist/src/core/observer/array.ts` 在 Vue 的响应式系统中扮演着非常重要的角色，它与其他模块紧密配合工作，确保 Vue 的数据绑定能够正常运行。
 */
 



/**
这段注释的意思是，在这个文件中没有使用Flow类型检查，因为Flow不能很好地处理对Array原型上方法的动态访问。

Flow是Facebook开发的一种静态类型检查工具，通过类型注解来识别代码中可能存在的类型错误，以提高代码质量和可维护性。但是在这个文件中，由于需要对数组原型进行一些动态操作，而Flow并不支持这种情况下的类型检查，因此开发者放弃了使用Flow进行类型检查。
 */
 
/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */



/**
在Vue的观察者模式中，Observer负责监听数据变化并通知Dep（依赖收集器）去更新相关的视图。在数组的响应式处理中，由于JavaScript原生的数组方法无法触发数据的响应式更新，Vue需要对数组进行重写来实现响应式。

在`./dist/src/core/observer/array.ts`文件中，`TriggerOpTypes`是一个枚举对象，包含了触发操作类型的常量，例如添加元素、删除元素等等。而`def`函数则是定义属性的工具函数，它用于给对象添加新的属性或修改已有属性，并且可以指定该属性是否可枚举、是否可配置和是否可写。

这里导入了`TriggerOpTypes`和`def`函数，是为了在后面对数组的响应式处理中使用它们。具体来说，`TriggerOpTypes`会作为参数传递到`dep.ts`文件中的`dependArray()`函数中，用于标记此次触发是添加、删除还是替换元素，从而在Dep中正确收集依赖和通知更新。而`def`函数则会被用于在数组的重写方法中添加新的属性或修改已有属性。
 */
 
import { TriggerOpTypes } from '../../v3'
import { def } from '../util/index'



/**
好的，我来解释一下。

在Vue中，当数据发生变化时，Vue会对变化部分进行重新渲染，以更新视图。其中，数组的变化是比较复杂的，例如splice、push和pop等操作都可能导致数组内容的改变。为了能够监听到这些数组变化，Vue重写了数组对象的原型方法，并赋值给了一个名为arrayMethods的对象。因为Vue不希望修改原生的Array.prototype，所以使用Object.create()方法创建了一个新的对象作为原型。这个新对象继承了Array.prototype的所有属性和方法，同时还拥有Vue自己定义的一些数组变异方法，如push、pop、shift、unshift、splice、sort、reverse。

总体来说，Vue通过重写数组原型方法并监听这些重写后的方法，实现了对数组的响应式处理。
 */
 
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)



/**
`./dist/src/core/observer/array.ts` 文件中的 `methodsToPatch` 是一个数组，里面包含了一些用来修改数组的方法名。

在Vue中，对于响应式数据（即被Vue监视的数据），当这些方法被调用时，Vue会检测到数据的变化并通知相关的视图更新。

这些方法包括：

- `push`：向数组末尾添加一个或多个元素。
- `pop`：删除并返回数组的最后一个元素。
- `shift`：删除并返回数组的第一个元素。
- `unshift`：向数组开头添加一个或多个元素。
- `splice`：删除或替换数组的某个元素。
- `sort`：对数组进行排序。
- `reverse`：颠倒数组中元素的顺序。

这些方法被称为“变异方法”，因为它们直接修改原始数组。Vue通过重写这些方法来实现响应式数据的更新。
 */
 
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]



/**
这段代码是Vue实现响应式数组的关键代码之一，主要作用是拦截 JavaScript 原生的数组方法（例如 push、pop、shift、unshift 等），并在调用这些方法时触发对应的事件，以便更新视图。下面是具体的解释：

- 首先定义了一个名为 methodsToPatch 的数组，这个数组包含了需要拦截的所有数组方法；
- 然后通过 forEach 方法遍历 methodsToPatch 数组，并为每个方法定义一个新的函数 mutator；
- 在新函数中，首先缓存原始的数组方法，然后调用该方法，并将结果缓存在 result 变量中；
- 紧接着获取当前数组对象所属的 Observer 实例 ob，并判断当前调用的是哪个方法；
- 如果是 push 或 unshift 方法，则说明有新元素被添加到了数组中，于是将这些新元素全部记录在变量 inserted 中；
- 如果是 splice 方法，则说明有元素被删除或替换了，同时也可能有新元素被添加进来，于是将添加的新元素记录在变量 inserted 中；
- 最后，如果 inserted 不为空，就调用 ob.observeArray 方法将其中的每个新元素都变成响应式对象，以便在其属性值发生改变时能够触发更新视图的操作。而后面的 ob.dep.notify() 则是用来通知所有依赖这个数组的 Watcher 对象进行更新。如果开启了开发模式，则会额外附带一些调试信息，否则只需要触发通知即可；
- 最终返回 result 变量，也就是原始方法的返回值。这样做可以确保使用数组方法时不会受到任何影响。
 */
 
/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    if (__DEV__) {
      ob.dep.notify({
        type: TriggerOpTypes.ARRAY_MUTATION,
        target: this,
        key: method
      })
    } else {
      ob.dep.notify()
    }
    return result
  })
})


