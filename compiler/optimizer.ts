/**
./dist/src/compiler/optimizer.ts文件的作用是对Vue模板进行静态分析并标记静态节点，以便在后续的渲染过程中提高性能。具体来说，该文件会遍历Vue模板语法树，并将其中不需要重复计算的静态节点打上标记；同时也会将动态节点打上标记，方便后续的虚拟DOM diff算法执行。

在整个Vue源码中，./dist/src/compiler/optimizer.ts文件是编译器部分的重要组成部分之一，它与其他编译器相关的文件（如parser、codegen等）共同构成了Vue编译器的核心。在Vue.js中，编译器负责将template转换成render函数，而./dist/src/compiler/optimizer.ts则是优化这个过程的关键环节。此外，由于Vue.js可以在运行时进行编译，因此./dist/src/compiler/optimizer.ts也对Vue.js的性能有很大的影响。
 */

/**
`./dist/src/compiler/optimizer.ts` 文件是 Vue 的编译器中的优化器模块，它会对模板进行静态分析和优化，在代码生成阶段生成更加高效的渲染函数。

下面是对这些导入模块的解释：

1. `makeMap`：这是一个用于创建一个快速查找表的工具函数。它将传入的字符串以逗号为分隔符转换成一个对象，其中每个属性对应一个字符串，并且属性值都为 true。

2. `isBuiltInTag`：这是一个用于判断某个元素是否是内置标签的方法。在 Vue 中一些标签（例如 `<slot>`、`<component>`）是由 Vue 组件系统提供的，而不是 HTML 标签。

3. `cached`：这是一个创建缓存函数的高阶函数。它接受一个函数作为参数，返回一个新函数，这个新函数在第一次被调用后就会将参数和返回值缓存起来，下次再调用时直接返回缓存值。

4. `no`：表示空对象的常量。

5. `ASTElement`：表示一个 AST 元素节点的类型。

6. `CompilerOptions`：表示编译器的配置选项。

7. `ASTNode`：表示一个 AST 节点的类型，包括元素节点、文本节点等。
 */

import { makeMap, isBuiltInTag, cached, no } from "shared/util";
import { ASTElement, CompilerOptions, ASTNode } from "types/compiler";

/**
在Vue的编译过程中，`optimizer.ts`文件主要是优化模板节点，将静态节点标记为静态节点，并在后续更新时跳过这些节点的比较和渲染，以提高性能。

具体来说，`isStaticKey`是用于判断一个属性是否为静态属性的函数，其实现如下：

```typescript
const isStaticKey = (key: string): boolean => {
  return (
    key === 'type' ||
    key === 'tag' ||
    key === 'attrsList' ||
    key === 'attrsMap' ||
    key === 'plain' ||
    key === 'parent' ||
    key === 'children' ||
    key === 'start' ||
    key === 'end' ||
    key === 'rawAttrsMap'
  )
}
```

可以看到，只有当一个节点的所有属性都被判定为静态属性时，这个节点才会被标记为静态节点，以此提高静态节点的渲染效率。

而`isPlatformReservedTag`则是用于判断一个标签名是否为平台保留标签的函数。在Vue中，不同平台可能会有不同的保留标签（例如web端和weex端），因此需要通过这个函数来判断当前使用的平台是否支持某个标签名。其实现如下：

```typescript
const isPlatformReservedTag = (tag: string): boolean => {
  const isReservedTag = config.isReservedTag || no
  return !!isReservedTag(tag) || isHTMLTag(tag) || isSVGTag(tag)
}
```

其中，`config.isReservedTag(tag)`是用户可配置的函数，用于判定用户自定义标签是否为保留标签；`isHTMLTag(tag)`和`isSVGTag(tag)`则是用于判断一个标签名是否为HTML或SVG中的标签。只有当这三个函数均返回false时，该标签才被判定为非平台保留标签。
 */

let isStaticKey;
let isPlatformReservedTag;

/**
在Vue的编译阶段，会把模板解析成AST（抽象语法树），然后生成渲染函数。在生成过程中，Vue会对静态节点做一些优化处理，例如缓存节点，以避免重复的运算。

在optimizer.ts中，genStaticKeys是一个函数，它用于获取静态节点上的key值。cached是Vue内部提供的一个工具函数，用来缓存函数的调用结果。

因此，const genStaticKeysCached = cached(genStaticKeys) 的作用就是将genStaticKeys函数进行缓存处理，在多次使用时可以直接返回缓存的结果，避免重复计算，提高效率。
 */

const genStaticKeysCached = cached(genStaticKeys);

/**
优化器的目标是遍历生成的模板 AST 树，并检测纯静态的子树，即永远不需要更改的 DOM 部分。

一旦我们检测到这些子树，我们可以：

1. 将它们提升为常量，这样我们就不再需要在每次重新渲染时为它们创建新节点；
2. 在修补过程中完全跳过它们。

optimize 函数有两个参数：root 和 options。root 是模板 AST 树的根节点，options 是编译选项。如果 root 为空，则直接返回。

接下来，isStaticKey 和 isPlatformReservedTag 等全局变量被初始化，然后进行两个阶段的优化：

第一阶段：将所有非静态节点标记为非静态。

第二阶段：标记静态根节点。一个静态根节点是一个完全静态的子树，其中包含一个或多个静态子节点。它们的输出被缓存，因此可以跳过对它们的处理。

通过优化器的优化，可以显著提高 Vue 应用程序的性能和渲染速度。
 */

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
export function optimize(
  root: ASTElement | null | undefined,
  options: CompilerOptions
) {
  if (!root) return;
  isStaticKey = genStaticKeysCached(options.staticKeys || "");
  isPlatformReservedTag = options.isReservedTag || no;
  // first pass: mark all non-static nodes.
  markStatic(root);
  // second pass: mark static roots.
  markStaticRoots(root, false);
}

/**
该函数是用来生成一组静态节点中的键（Key），这些键用于优化虚拟DOM的渲染性能。该函数生成了以下这些键：

- type
- tag
- attrsList
- attrsMap
- plain
- parent
- children
- attrs
- start
- end
- rawAttrsMap

其中，这些键的含义如下：

- type：节点类型
- tag：标签名
- attrsList：属性列表
- attrsMap：属性映射
- plain：是否为纯文本节点
- parent：父节点
- children：子节点
- attrs：属性对象
- start：开始位置
- end：结束位置
- rawAttrsMap：未处理的属性列表

这些键可以帮助Vue在生成虚拟DOM时进行优化，从而提高渲染性能。
 */

function genStaticKeys(keys: string): Function {
  return makeMap(
    "type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap" +
      (keys ? "," + keys : "")
  );
}

/**
这段代码的作用是标记AST（抽象语法树）上的节点是否为静态节点，即不需要在每次重新渲染时重新生成的节点。在Vue中，静态节点可以提高渲染性能，因为它们只会被渲染一次并且不需要再次计算。这个函数将递归地遍历整个AST并判断每个节点是否为静态节点。

具体来说：

- 首先，它调用了一个名为`isStatic`的函数来判断当前节点是否为静态节点，并将其结果存储在节点的`static`属性中。
- 如果当前节点是元素节点（即type === 1），则会进一步检查该节点是否为组件插槽或内联模板，如果是，则不将其标记为静态节点。
- 对于所有其他类型的节点，它们都被视为非静态节点。
- 如果当前节点是元素节点，并且它的子节点包含非静态子节点，则该节点也被视为非静态节点。
- 最后，如果该节点有条件渲染（通过v-if / v-else），它还会递归该条件分支的子节点，并按照相同的方式标记它们是否为静态节点。
 */

function markStatic(node: ASTNode) {
  node.static = isStatic(node);
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== "slot" &&
      node.attrsMap["inline-template"] == null
    ) {
      return;
    }
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i];
      markStatic(child);
      if (!child.static) {
        node.static = false;
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block;
        markStatic(block);
        if (!block.static) {
          node.static = false;
        }
      }
    }
  }
}

/**
在Vue中，静态节点是指在渲染过程中不会改变的节点，每次重新渲染时，这些节点都可以被直接复用，而无需重新创建。由于静态节点只需要被创建一次，因此在大型应用中使用它们可以提高应用的性能。

optimizer.ts中的markStaticRoots函数的作用就是标记出哪些节点是静态根节点。一个节点被认为是静态根节点，当且仅当以下条件都满足：

1. 节点本身是静态的。
2. 节点有子节点，并且这些子节点不仅仅是纯文本节点。
3. 节点不是v-for的模板。
4. 如果节点是一个带条件的节点，则它的块节点也必须是静态根节点。

该函数递归遍历AST树，并为每个节点设置staticInFor、staticRoot属性。其中，staticInFor属性表示该节点是否处于v-for指令中；staticRoot属性表示该节点是否是静态根节点。

通过标记静态根节点，Vue编译器可以将这些静态节点提取出来，从而在每次重新渲染时可以直接复用它们。这样可以避免重复创建和销毁节点，提高应用的性能。
 */

function markStaticRoots(node: ASTNode, isInFor: boolean) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor;
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    if (
      node.static &&
      node.children.length &&
      !(node.children.length === 1 && node.children[0].type === 3)
    ) {
      node.staticRoot = true;
      return;
    } else {
      node.staticRoot = false;
    }
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for);
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor);
      }
    }
  }
}

/**
这段代码是用来判断一个AST节点是否为静态节点的函数。AST（Abstract Syntax Tree）是Vue在编译模板时生成的抽象语法树，它将模板转换为一组由JS对象构成的抽象语法树，每个节点代表着模板中的一个标签、指令或文本。

静态节点是指在渲染过程中不需要改变的节点。如果一个节点是静态的，那么在渲染过程中可以省略它的遍历和比对，从而提高渲染性能。

这段代码首先判断节点是否为一个表达式，如果是表达式则不是静态节点。接下来判断节点的类型是否为文本节点，如果是则是静态节点。最后，通过一系列条件判断，包括节点没有动态绑定、不是v-if、v-for、v-else等动态节点、不是内置组件、不是被template for包裹等条件，返回一个布尔值表示节点是否为静态节点。
 */

function isStatic(node: ASTNode): boolean {
  if (node.type === 2) {
    // expression
    return false;
  }
  if (node.type === 3) {
    // text
    return true;
  }
  return !!(
    node.pre ||
    (!node.hasBindings && // no dynamic bindings
      !node.if &&
      !node.for && // not v-if or v-for or v-else
      !isBuiltInTag(node.tag) && // not a built-in
      isPlatformReservedTag(node.tag) && // not a component
      !isDirectChildOfTemplateFor(node) &&
      Object.keys(node).every(isStaticKey))
  );
}

/**
这个函数的作用是判断一个 AST 元素节点是否为 `<template>` 标签元素的直接子元素，并且该 `<template>` 标签元素使用了 `v-for` 指令。

这个函数通过循环遍历当前节点的父级节点，如果父级节点不是 `<template>` 标签元素，则返回 false。如果父级节点是 `<template>` 标签元素，但是没有使用 `v-for` 指令，则继续往上遍历父级节点。如果父级节点是 `<template>` 标签元素并且使用了 `v-for` 指令，则返回 true。如果已经遍历到了根节点还没有找到符合要求的节点，则返回 false。

这个函数主要用于编译优化阶段，当 Vue 编译模板时，会对模板进行静态分析和优化，其中一项优化是将一些静态节点提升出来，以减少运行时的计算量。而对于使用了 `v-for` 的节点，由于它们会根据数据动态生成多个子节点，因此不能被视为静态节点，需要在运行时动态地生成子节点。所以这个函数用于排除掉那些使用 `v-for` 的 `<template>` 标签的子节点，以保证这些节点能够在运行时正确地处理。
 */

function isDirectChildOfTemplateFor(node: ASTElement): boolean {
  while (node.parent) {
    node = node.parent;
    if (node.tag !== "template") {
      return false;
    }
    if (node.for) {
      return true;
    }
  }
  return false;
}
