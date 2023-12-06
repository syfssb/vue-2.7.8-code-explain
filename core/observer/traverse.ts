
/**
./dist/src/core/observer/traverse.ts文件是Vue源码中的一个关键文件，主要负责定义了遍历对象属性的方法。在整个Vue源码中，该文件被广泛使用，并且与其他几个核心模块密切相关。

在Vue中，Observer这个观察者模块是实现数据响应式的核心之一。在Observer中，traverse.ts的作用就是利用递归的方式深度遍历目标对象并对其进行响应式处理。具体而言，它的主要功能包括：

1. 遍历对象属性，获取属性值并进行响应式处理
2. 处理数组元素，使其能够响应式更新
3. 处理嵌套对象和数组，实现响应式更新的递归

除了以上几点外，traverse.ts还涉及到了几个Vue的核心模块，如Dep、Watcher等，这些模块共同协作实现了Vue的数据响应式机制。

总之，./dist/src/core/observer/traverse.ts文件是Vue数据响应式的重要组成部分，对于学习Vue源码来说，深入理解该文件的实现原理和作用非常重要。
 */
 



/**
这段代码主要是导入了一些工具函数和类型，包括：

1. `_Set`：这是一个变量，指向 `util/index.ts` 中导出的 `_Set` 类。这个类是用来实现 Set 数据结构的，它有多个方法可以操作集合中的元素。

2. `isObject`：这是一个函数，用来判断一个值是否为对象类型。如果是，则返回 `true`；否则返回 `false`。

3. `isArray`：这也是一个函数，用来判断一个值是否为数组类型。如果是，则返回 `true`；否则返回 `false`。

4. `SimpleSet`：这是一个类型，定义在 `util/index.ts` 中。它是一个简单的 Set 类型，只能存储字符串类型的值。

5. `VNode`：这是一个类，定义在 `vdom/vnode.ts` 中。它代表着一个虚拟节点，在 Vue 中用来描述 DOM 树上的节点。

6. `isRef`：这是一个函数，定义在 `v3.ts` 中。它用来判断一个值是否为响应式引用类型，如果是，则返回 `true`；否则返回 `false`。

这些工具函数和类型在 `traverse.ts` 中被用来遍历对象，并对其中的子对象进行深度遍历。具体实现过程可以查看 `traverse.ts` 中的代码。
 */
 
import { _Set as Set, isObject, isArray } from '../util/index'
import type { SimpleSet } from '../util/index'
import VNode from '../vdom/vnode'
import { isRef } from '../../v3'



/**
在Vue的响应式系统中，当一个对象被观察（即被转化成响应式数据）后，会为该对象创建一个Dep实例，用于管理与该对象相关的所有Watcher实例。每当该对象的属性值发生变化时，Dep实例都会通知所有的Watcher实例去更新视图。

然而，在观察一个对象时，如果该对象内部还包含其他对象（如数组、子对象等），这些对象同样需要被观察，并且也需要为它们创建自己的Dep实例。为了避免重复观察到同一个对象，会在观察过程中使用一个Set集合（无序且不重复的集合）来存储已经被观察过的对象。

因此，`const seenObjects = new Set()`是用来存储已经被观察过的对象的集合。在观察一个对象时，会将该对象添加到seenObjects中，以避免重复观察。同时，遍历完一个对象及其子对象后，会从seenObjects中删除该对象，以便下一次观察。
 */
 
const seenObjects = new Set()



/**
这段代码主要是用于深度遍历一个对象，以便收集对象中所有嵌套的属性作为深层次的依赖项。在Vue.js中，通过对数据进行观察来实现响应式编程，即当某个数据发生变化时，与之相关的视图会自动更新。而这个过程需要依赖于收集到的依赖项，所以需要对整个数据对象进行递归遍历，以便能够收集到所有的依赖项。

具体来说，`traverse`函数定义了一个名为`seenObjects`的Set对象，用于存储已经遍历过的对象，防止出现循环引用导致无限递归的情况。然后调用了私有方法`_traverse`，该方法用于递归地遍历一个对象，并将其内部所有的属性都添加到`seenObjects`中。最后清空`seenObjects`并返回原始数据。
 */
 
/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
export function traverse(val: any) {
  _traverse(val, seenObjects)
  seenObjects.clear()
  return val
}



/**
这段代码定义了一个内部函数`_traverse`，用于递归遍历一个对象或数组并触发它们的响应式更新。

首先，定义了两个变量：`i`和`keys`。如果对象或数组不是数组也不是普通对象、被冻结（不可修改）或者是虚拟节点 VNode，则直接返回。如果该对象上有`__ob__`属性（表示这是一个 Vue 实例的响应式数据），则获取它的依赖 id。若该id已经存在于seen集合中，则返回，否则添加进seen集合。

然后，分别处理数组、ref 和普通对象三种情况。对于数组，通过循环递归调用_traverse来处理每个元素；对于 ref，则递归处理其value属性；对于普通对象，则取出所有键值对，通过循环递归调用_traverse来处理每个值。

总之，该函数的主要作用就是遍历一个数据对象，并触发其所关联的依赖收集器中的所有 watcher 实例去更新对应的视图。
 */
 
function _traverse(val: any, seen: SimpleSet) {
  let i, keys
  const isA = isArray(val)
  if (
    (!isA && !isObject(val)) ||
    Object.isFrozen(val) ||
    val instanceof VNode
  ) {
    return
  }
  if (val.__ob__) {
    const depId = val.__ob__.dep.id
    if (seen.has(depId)) {
      return
    }
    seen.add(depId)
  }
  if (isA) {
    i = val.length
    while (i--) _traverse(val[i], seen)
  } else if (isRef(val)) {
    _traverse(val.value, seen)
  } else {
    keys = Object.keys(val)
    i = keys.length
    while (i--) _traverse(val[keys[i]], seen)
  }
}


