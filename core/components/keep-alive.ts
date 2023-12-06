/**
`keep-alive.ts` 是 Vue.js 中的核心组件之一，它主要用于缓存组件实例，以便在它们被销毁和重新创建时能够保留它们的状态。这个组件通常用于需要频繁切换显示的组件，比如 Tab 切换等场景。

具体来说，当我们第一次加载一个需要缓存的组件时，`keep-alive` 会将该组件的实例保存到内部的缓存列表中，同时从 DOM 树中移除该组件实例，但并不销毁它。当下一次需要显示该组件时，`keep-alive` 会通过 `activated` 钩子函数将该组件实例重新插入到 DOM 树中，并保留其之前的状态以供使用。

至于 `keep-alive.ts` 在整个 Vue.js 源码中的位置，它是 Vue.js 核心组件库的一部分，主要负责管理组件的生命周期，包括处理组件的挂载、更新、卸载等操作。而在其他文件中，我们可以看到很多与 `keep-alive` 相关的代码，比如在 `src/core/vdom/create-component.js` 文件中，当一个组件被渲染时，会通过 `createComponentInstanceForVnode` 方法判断该组件是否应该被缓存，如果需要，就会将它渲染到 `keep-alive` 组件中进行缓存。
 */

/**
这段代码主要是在`keep-alive.ts`中引入了一些工具方法和类型声明。我们来逐个介绍它们的作用：

1. `isRegExp`：一个判断是否为正则表达式的函数，这里可能会使用到该函数来判断路由名称是否匹配。
2. `isArray`：一个判断是否为数组的函数，这里可能会使用到该函数来判断缓存队列中是否已经存在缓存组件。
3. `remove`：一个从数组中移除某个元素的函数，这里可能会使用到该函数来从缓存队列中移除已经被缓存的组件。
4. `getFirstComponentChild`：获取第一个子组件节点的函数，它会递归地遍历子节点，直到找到第一个组件节点为止。
5. `VNode`：虚拟节点的类型声明。
6. `VNodeComponentOptions`：组件选项的类型声明。
7. `Component`：组件实例的类型声明。
8. `getComponentName`：获取组件名称的函数。

这些工具方法和类型声明都是为了让`keep-alive`组件能够更好地实现其功能。例如，`getFirstComponentChild`可以用来在缓存队列中查找已经被缓存的组件，并在需要时重新激活它们；`remove`可以用来在缓存队列中移除已经被缓存的组件；`VNode`、`VNodeComponentOptions`和`Component`等类型声明则帮助我们更好地理解虚拟DOM和组件的概念。
 */

import { isRegExp, isArray, remove } from "shared/util";
import { getFirstComponentChild } from "core/vdom/helpers/index";
import type VNode from "core/vdom/vnode";
import type { VNodeComponentOptions } from "types/vnode";
import type { Component } from "types/component";
import { getComponentName } from "../vdom/create-component";

/**
在./dist/src/core/components/keep-alive.ts中，`type CacheEntry` 定义了一个类型别名。这个类型别名包含了三个可选的属性：

- `name`：组件的名称
- `tag`：缓存的标签名称
- `componentInstance`：组件实例

这些属性用于在 `<keep-alive>` 组件内部维护一个缓存项（cache entry），以便在组件被销毁或重新创建时能够正确地保留其状态。

在 Vue 的源码中，`<keep-alive>` 组件可以将其子组件缓存起来，而不是每次重新渲染这些子组件。当这些子组件再次被渲染时，Vue 可以从缓存中恢复它们之前的状态，从而提高应用程序的性能和响应速度。

因此，在 `CacheEntry` 中定义这些属性可以帮助 Vue 正确地缓存和恢复组件的状态，并确保应用程序正常运行。
 */

type CacheEntry = {
  name?: string;
  tag?: string;
  componentInstance?: Component;
};

/**
在Vue的源码中，./dist/src/core/components/keep-alive.ts是Vue中的KeepAlive组件的实现代码。在这个文件中，定义了一个名为CacheEntryMap的类型别名。

具体来说，CacheEntryMap是由Record<string, CacheEntry | null>定义的。其中，Record表示一个对象（类似于JavaScript中的Object），string表示对象的键是字符串类型，CacheEntry | null代表值可以是CacheEntry类型或null。所以，CacheEntryMap可以理解为一个键值对集合，它的键是字符串类型，值可以是CacheEntry类型或null。

在KeepAlive组件中，会使用CacheEntryMap来缓存已经渲染过的组件实例。每次渲染时，如果需要复用之前已经创建过的组件实例，则直接从CacheEntryMap中获取该组件实例，并将其重新挂载到DOM树中，避免了重复创建组件实例，提升了性能。
 */

type CacheEntryMap = Record<string, CacheEntry | null>;

/**
这段代码是在 `keep-alive` 组件中用到的，其作用是获取组件的名称。

首先，我们可以看到这个函数接收一个可选参数 `opts`，这个参数的类型是 `VNodeComponentOptions`。然后，函数体内部有一个条件语句，判断 `opts` 是否存在并且 `opts.Ctor.options` 是否存在。如果 `opts.Ctor.options` 存在，说明组件是通过 `Vue.extend()` 方法扩展出来的，那么就调用 `getComponentName(opts.Ctor.options as any)` 获取组件名。如果 `opts.Ctor.options` 不存在，说明这个组件是通过模板编译器自动创建的，那么就使用 `opts.tag` 获取组件名。

需要注意的是，在 `getComponentName()` 函数中，也有一些特殊情况的处理，比如组件名不存在时，会返回一个空字符串。
 */

function _getComponentName(opts?: VNodeComponentOptions): string | null {
  return opts && (getComponentName(opts.Ctor.options as any) || opts.tag);
}

/**
这段代码中定义了一个名为`matches`的函数，用于判断组件名称是否匹配指定的模式，其参数包括两个：`pattern`和`name`。

`pattern`可以是一个字符串、正则表达式或者字符串数组。如果`pattern`是一个字符串，则使用逗号分隔并将其转换为字符串数组；如果`pattern`是一个正则表达式，则直接使用`test`方法进行匹配；如果`pattern`是一个字符串数组，则使用`indexOf`方法查找其中是否包含了`name`。

最终函数返回一个布尔值，表示组件名称是否与指定的模式匹配。如果`pattern`参数类型不符合上述三种情况，则返回false。该函数主要用于keep-alive组件对子组件进行缓存的判断，以确定是否需要缓存某个组件。
 */

function matches(
  pattern: string | RegExp | Array<string>,
  name: string
): boolean {
  if (isArray(pattern)) {
    return pattern.indexOf(name) > -1;
  } else if (typeof pattern === "string") {
    return pattern.split(",").indexOf(name) > -1;
  } else if (isRegExp(pattern)) {
    return pattern.test(name);
  }
  /* istanbul ignore next */
  return false;
}

/**
这段代码是 Vue 中 keep-alive 组件中清除缓存的实现函数。它接收两个参数：

- `keepAliveInstance`：这是包含缓存数据的对象，具有以下三个属性：
  - `cache`：一个键值对结构，用于存储被缓存的组件实例。
  - `keys`：一个数组，记录了缓存对象的所有键名。
  - `_vnode`：当前的虚拟节点。
- `filter`：一个用于过滤缓存数据的函数。

该函数通过遍历 `cache` 对象中的所有键，并且取出其对应的值（即缓存的组件实例），然后判断该组件实例的名称是否需要被过滤（即不满足过滤函数的条件），如果需要被过滤就将其从缓存中移除，同时更新 `keys` 数组和 `_vnode` 属性，以保证缓存的正确性。

此函数的作用是在使用 keep-alive 缓存组件时，当某个组件被销毁时，会在缓存中清除该组件实例，以避免出现内存泄漏等问题。
 */

function pruneCache(
  keepAliveInstance: { cache: CacheEntryMap; keys: string[]; _vnode: VNode },
  filter: Function
) {
  const { cache, keys, _vnode } = keepAliveInstance;
  for (const key in cache) {
    const entry = cache[key];
    if (entry) {
      const name = entry.name;
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode);
      }
    }
  }
}

/**
`pruneCacheEntry()` 是 `keep-alive` 组件的实现之一，用于卸载不需要的缓存组件实例。它接收四个参数：

- `cache: CacheEntryMap`：一个对象，保存所有被缓存的组件实例
- `key: string`：组件实例的唯一标识符
- `keys: Array<string>`：一个数组，保存了所有被缓存的组件实例的唯一标识符
- `current?: VNode`：当前激活的组件实例

在函数中，首先从 `cache` 对象中获取指定 `key` 的组件实例 `entry`，如果存在 `entry`，并且当前没有激活的组件实例，或者 `entry.tag` 不等于当前激活的组件实例的 `tag`，则表示这个组件实例不再需要被缓存了，因此需要将其销毁。具体来说，调用 `entry.componentInstance.$destroy()` 方法即可销毁该实例。

接下来，将 `cache[key]` 置为 `null`，并调用 `remove(keys, key)` 方法，将 `key` 从 `keys` 数组中移除，以便下次重新创建组件时不会使用过期的缓存实例。

需要注意的是，在调用 `$destroy()` 方法时，由于 Vue 3 中删除了 `$destroy()` 方法，因此 TypeScript 编译器可能会报错（警告信息为：“Property '$destroy' does not exist on type 'ComponentPublicInstance<{}, {}, {}, {}, {}, EmitsOptions, {}, {}, false, ComponentOptionsBase<{}, {}, {}, {}, {}, {}, {}, true, ComponentOptionsMixin, ComponentOptionsMixin, Record<string, any>, string>>'. Did you mean 'destroy'?ts(2551)”），因此需要加上 `@ts-expect-error can be undefined` 注释来避免这个问题。
 */

function pruneCacheEntry(
  cache: CacheEntryMap,
  key: string,
  keys: Array<string>,
  current?: VNode
) {
  const entry = cache[key];
  if (entry && (!current || entry.tag !== current.tag)) {
    // @ts-expect-error can be undefined
    entry.componentInstance.$destroy();
  }
  cache[key] = null;
  remove(keys, key);
}

/**
在 Vue.js 的源码中，./dist/src/core/components/keep-alive.ts 是用于实现组件缓存的核心代码。在这个文件中，定义了一个变量 patternTypes，它是一个包含三种不同类型的函数的数组。

这个数组的作用是指定可以被缓存的组件的 key 值的数据类型。在 keep-alive 组件中，使用了一个属性叫做 include，用来指定哪些组件需要被缓存。这个属性的值可以是字符串、正则表达式或者是字符串数组。因此，为了确保 include 属性的值符合要求，需要判断其数据类型是否属于 patternTypes 中所指定的三种类型之一。

总之，patternTypes 数组就是为了限制 include 属性的值类型而存在的，这样就可以确保组件缓存的正确性和可靠性了。
 */

const patternTypes: Array<Function> = [String, RegExp, Array];

/**
在Vue.js中，组件是一个非常重要的概念。在组件的生命周期中，有时候我们需要缓存某些组件的状态和数据，以便后续再次使用时不需要重新生成和渲染。这就是keep-alive组件所负责的任务。它提供了一种简单的方式来缓存已经创建过的组件实例，并在需要时重新渲染。

在具体到源码实现中，./dist/src/core/components/keep-alive.ts定义了keep-alive组件的行为逻辑。其中，TODO defineComponent表示该组件还未被Vue 3.0的defineComponent函数封装成标准的组件。而name属性表示组件的名称为'keep-alive'，abstract属性则表示该组件为抽象组件，在使用时不会被直接渲染到页面中。
 */

// TODO defineComponent
export default {
  name: "keep-alive",
  abstract: true,

  /**
在 ./dist/src/core/components/keep-alive.ts 中，这个代码块定义了 `KeepAlive` 组件的 props 属性。

`KeepAlive` 是一个高阶组件，它可以缓存已经渲染过的组件实例，以便下次再需要时可以直接复用。这个组件非常有用，可以大幅提升应用的性能和响应速度。

这个代码块中，props 定义了三个属性：

1. `include`: 字符串或正则表达式类型。只有匹配此属性值的组件才会被缓存。
2. `exclude`: 字符串或正则表达式类型。与 include 相反，匹配此属性值的组件不会被缓存。
3. `max`: 字符串或数字类型。表示最多可以缓存的组件实例数量。

这些属性可以通过在 `KeepAlive` 组件中设置来控制缓存的行为。例如，我们可以通过 `include` 属性来指定只缓存特定的组件，并使用 `max` 属性来限制缓存的数量，从而避免缓存过多组件导致内存泄漏。

这些属性的作用可以帮助我们更好地优化应用性能和用户体验。
 */

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number],
  },

  /**
这段代码是 Vue 中 Keep-Alive 组件的实现部分。这个组件可以缓存子组件的状态，以便在下一次渲染时可以直接使用之前保存的状态，从而提高渲染效率。

这个方法 `cacheVNode` 的作用就是把当前的 vnode（虚拟 DOM 节点）缓存起来。具体实现如下：

1. 首先获取到当前组件中定义的一些数据，包括 `cache`（缓存对象）、`keys`（缓存键数组）、`vnodeToCache`（要缓存的 vnode 对象）和 `keyToCache`（要缓存的 vnode 对应的键名）。

2. 接着判断一下 `vnodeToCache` 是否存在，如果存在则进行缓存操作。具体地，将 `vnodeToCache` 中的一些信息（如组件名称、标签名、组件实例等）存入 `cache` 对应的位置，并把 `keyToCache` 存入 `keys` 数组中。

3. 如果定义了 `max` 属性，则判断当前缓存数量是否超出了最大值。如果超出了，则调用 `pruneCacheEntry` 方法清除掉最早加入的缓存数据。

4. 最后将 `vnodeToCache` 置为 null，表示缓存完成。

总的来说，这个方法的作用就是将 vnode 缓存起来，方便在需要时能够快速恢复它的状态。
 */

  methods: {
    cacheVNode() {
      const { cache, keys, vnodeToCache, keyToCache } = this;
      if (vnodeToCache) {
        const { tag, componentInstance, componentOptions } = vnodeToCache;
        cache[keyToCache] = {
          name: _getComponentName(componentOptions),
          tag,
          componentInstance,
        };
        keys.push(keyToCache);
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode);
        }
        this.vnodeToCache = null;
      }
    },
  },

  /**
在 Vue 的源码中，KeepAlive 组件是用来缓存组件的。它会在组件被激活和失活时缓存和销毁这些组件。其中 `created()` 是一个 Vue 实例创建之后，但尚未挂载到 DOM 中时调用的钩子函数。

在 KeepAlive 组件的 created() 钩子函数中，它初始化了两个属性：`cache` 和 `keys`。

- `cache`：一个空对象，用来缓存已经创建过的组件实例；
- `keys`：一个空数组，用来记录已经创建过的组件的 key 值。

这两个属性都是用 `Object.create(null)` 创建的，而不是使用原型链继承自 Object.prototype，因为这样可以确保它们不会继承任何原型属性和方法，也就不会出现命名冲突的问题，同时可以提高访问它们的速度。
 */

  created() {
    this.cache = Object.create(null);
    this.keys = [];
  },

  /**
在Vue中，`<keep-alive>`组件是用来缓存动态组件或者组件的实例的。当一个 `<keep-alive>` 内部的组件切换时，它不会被销毁，而是被缓存起来，以便稍后重新使用。

在这段代码中，`destroyed()` 是一个生命周期函数，在组件销毁时被调用。这个函数的作用是遍历当前缓存中的所有组件，并调用 `pruneCacheEntry()` 函数来删除那些无用的组件实例。

具体地说，`this.cache` 是一个缓存对象，它包含了当前已经缓存的所有组件实例。而 `this.keys` 则是一个数组，用来记录每个组件实例对应的 key 值。当一个组件需要被缓存时，它的 key 值会被添加到 keys 数组中。

在组件销毁时，我们需要遍历 cache 对象中的所有组件实例，并调用 `pruneCacheEntry()` 函数来删除那些无用的组件实例。`pruneCacheEntry()` 接收三个参数：cache 对象、组件实例的 key 值以及 keys 数组。它的作用是检查当前的组件实例是否应该被删除，并在需要删除时进行清理操作，包括从缓存中删除该实例以及从 keys 数组中删除对应的 key 值。最终，缓存中只会保留那些当前正在使用的组件实例，而其他的实例则会被清理掉。
 */

  destroyed() {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },

  /**
这段代码中的 `mounted()` 方法是在组件挂载完成后被调用的生命周期钩子函数。在这个方法中，有三个操作：

1. `this.cacheVNode()`：缓存当前组件的 vnode 对象。在后面的 `pruneCache` 方法中需要使用 vnode 的 key 属性来判断是否缓存过该组件。

2. `this.$watch('include', val => {...})`：监听组件实例的 'include' 属性，当该属性发生变化时触发函数。这里使用了 Vue 的 `$watch` 方法，它会返回一个 unwatch 函数，可以用于取消监听。

   在函数内部，我们使用 `pruneCache(this, name => matches(val, name))` 方法来清理缓存中不包含 include 值的组件。

3. `this.$watch('exclude', val => {...})`：同样是监听组件实例的 'exclude' 属性，当该属性发生变化时触发函数，使用了和上面相同的 `$watch` 方法和 `pruneCache` 方法，不过这里是清理 cache 中包含 exclude 值的组件。

总结来说，这段代码的作用就是在组件挂载完成后，监听 include 和 exclude 两个属性的变化，并在变化后根据属性值清理缓存中对应的组件。这样做的好处是可以及时地更新缓存中的组件，避免出现问题。
 */

  mounted() {
    this.cacheVNode();
    this.$watch("include", (val) => {
      pruneCache(this, (name) => matches(val, name));
    });
    this.$watch("exclude", (val) => {
      pruneCache(this, (name) => !matches(val, name));
    });
  },

  /**
在 Vue.js 中，Keep-Alive 组件是一个抽象组件，它的作用是缓存动态组件或是组件的状态，以便在后续渲染时可以直接使用缓存中的数据，而不必重新创建。

在 `./dist/src/core/components/keep-alive.ts` 文件中，这段代码的作用是在组件更新时调用 `cacheVNode()` 方法，将当前的 vnode（虚拟节点）缓存起来。这样，在下一次需要渲染该组件时，如果数据没有变化，就可以直接复用缓存中的 vnode，避免了不必要的重新渲染。

具体来说，当 Keep-Alive 组件里的子组件被激活（activated）时，Keep-Alive 会通过 `cacheVNode()` 方法将子组件的 vnode 缓存起来；当子组件被停用（deactivated）时，Keep-Alive 将会清除该子组件的缓存。这样，每当组件需要重新渲染时，都会先从缓存中查找是否已经存在对应的 vnode，如果存在，则直接使用缓存中的 vnode 进行渲染，否则才会重新创建 vnode 进行渲染。
 */

  updated() {
    this.cacheVNode();
  },

  /**
这段代码是 `keep-alive` 组件的 `render` 方法。它的主要作用是通过判断子组件是否需要缓存，来决定是否将子组件挂载到 DOM 上。

首先，该方法从 `$slots.default` 中获取一个插槽节点，并通过 `getFirstComponentChild` 方法获取插槽中的第一个子组件节点，存储在变量 `vnode` 中。接着，它会从 `vnode` 中获取组件选项 `componentOptions`。

然后，它会判断 `componentOptions` 是否存在。如果不存在，则代表没有找到组件。否则，就需要根据 `include` 和 `exclude` 的配置来判断是否需要缓存。

这里的 `include` 和 `exclude` 是指定需要或不需要缓存的组件名称。如果 `include` 存在且当前组件名称和 `include` 不匹配，或者 `exclude` 存在且当前组件名称和 `exclude` 匹配，那么就返回 `vnode`（即不进行缓存）；否则，就继续执行下一步操作。

最后，该方法返回 `vnode`，表示需要进行缓存。
 */

  render() {
    const slot = this.$slots.default;
    const vnode = getFirstComponentChild(slot);
    const componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      // check pattern
      const name = _getComponentName(componentOptions);
      const { include, exclude } = this;
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode;
      }

      /**
这段代码是 KeepAlive 组件的核心功能代码，其作用是缓存组件并在需要时复用它们。

首先从 this 对象中获取 cache 和 keys 属性。cache 是一个对象，用于存储组件实例；keys 则是一个数组，用于存储组件的 key 值。

接着，判断 vnode 是否有 key 值。如果没有，则生成一个 key。这个 key 是由组件的 cid（组件的唯一标识符）和 tag（组件的标签名）拼接而成的。如果有 key 值，则使用 vnode 的 key。

然后检查 cache 对象中是否已经存在该 key 的组件实例。如果存在，则将 cache 中相应的组件实例赋值给 vnode 的 componentInstance 属性，并将该 key 从 keys 数组中移除，再将其添加到数组末尾，以确保最近使用的组件排在最后。

如果不存在，则需要将 vnode 和 key 缓存在 KeepAlive 实例中，等待下一次更新时再进行缓存操作。

这样在组件被激活时就可以直接从缓存中取出组件实例，而不需要重新渲染，提高了应用的性能。
 */

      const { cache, keys } = this;
      const key =
        vnode.key == null
          ? // same constructor may get registered as different local components
            // so cid alone is not enough (#3269)
            componentOptions.Ctor.cid +
            (componentOptions.tag ? `::${componentOptions.tag}` : "")
          : vnode.key;
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance;
        // make current key freshest
        remove(keys, key);
        keys.push(key);
      } else {
        // delay setting the cache until update
        this.vnodeToCache = vnode;
        this.keyToCache = key;
      }

      /**
这段代码是Vue中Keep-Alive（缓存组件）的实现，其作用是将需要缓存的组件渲染到虚拟DOM中，并在下次重新渲染时直接使用缓存中的组件。

具体来说，这段代码中的注释@ts-expect-error表示该语句可能会引起TypeScript类型检查错误，即vnode.data属性可能未定义。然后，将vnode.data.keepAlive设置为true，表示当前组件需要被缓存。最后，返回vnode或者slot[0]以供下一步处理。

总体来说，这段代码是Vue Keep-Alive 实现的核心代码片段，负责标记需要缓存的组件，并将其缓存到虚拟DOM中，以便在下一次重新渲染时直接使用缓存中的组件，从而提高性能。
 */

      // @ts-expect-error can vnode.data can be undefined
      vnode.data.keepAlive = true;
    }
    return vnode || (slot && slot[0]);
  },
};
