# 聊一聊 React 中 key 的作用

在开始之前，我们首先简单介绍一下 react 的 diff 策略：

- Web UI 中 DOM 跨层级节点移动操作比较少，忽略。即 tree-diff
- 拥有相同类组件生成相似的树结构，不同类组件生成不同树结构。即 component-diff
- 同一层级的子节点通过唯一 id 进行区分。即 element-diff

OK，其实看到这里，大家就已经明白 key 其实就是 element-diff 的一种优化方案，那它到底是怎么使用的呢？

首先，对于同级子节点，diff 提供了三种操作：插入、移动和删除。基于这三种操作我们分析下图：

<img src="https://github.com/KayneWang/blog/blob/master/img/element-diff-1.jpeg" width="400" />

我们发现，这种操作十分繁琐，仅仅是位置移动，却要每次都要重新创建插入和删除。有什么办法解决这种情况呢？

通过对子节点增加唯一 key 作区分后，React diff 的做法是：新旧集合都是相同的节点，所以不进行创建和删除操作，仅仅需要 B、D 进行固定操作，A、C 进行移动操作，下面我们来看一下它是怎么运作的。

首先，对新节点集合进行遍历，通过唯一 key 判断新旧集合是否存在相同节点，<b>如果存在相同节点，则进行移动操作</b>，但是移动之前需要将当前节点在旧集合中的下标与 lastIndex 进行比较。其中，lastIndex 是一个标志位，它会不断的更新，<b>表示访问过的节点在旧集合中的最大位置</b>，如果新集合中当前访问的节点大于 lastindex，则证明该节点在旧集合中比上一个节点靠后，不进行移动操作，只有小于 lastindex 时，才需要进行移动操作。

这一大段描述看起来确实有点绕，接下来我们根据上面的例子分步来分析：

<img src="https://github.com/KayneWang/blog/blob/master/img/element-diff-2.jpeg" width="400" />

- 从新集合中取出 B，判断后发现旧集合中存在 B 节点，然后通过对比节点位置判断是否需要进行移动操作。B 在旧集合中的位置 B._mountIndex = 1，此时 lastIndex = 0，不满足 B._mountIndex < lastIndex 的条件，所以不进行移动操作。更新 lastIndex = Math.max(prevChild._mountIndex, lastIndex)，其中 prevChild._mountIndex 表示 B 在旧集合中的位置，则 lastIndex = 1，同时将 B 的位置更新为新集合中的位置 prevChild._mountIndex = nextIndex，此时新集合中 B._mountIndex = 0，nextIndex++ 进入下一个节点。

- 从新集合中取出 A，A 在旧集合中的位置 A._mountIndex = 0，此时 lastIndex = 1，满足 A._mountIndex < lastIndex 的条件。进行移动操作，enqueueMove(this, child._mountIndex, toIndex)，其中 toIndex 其实就是 nextIndex，表示 A 需要移动到的位置。更新 lastIndex = Math.max(prevChild._mountIndex, lastIndex)，则 lastIndex = 1，同时将 A 的位置更新为新集合中的位置 prevChild._mountIndex = nextIndex，此时新集合中 A._mountIndex = 1，nextIndex++ 进入下一个节点。

- 从新集合中取出 D，D 在旧集合中的位置 D._mountIndex = 3，此时 lastIndex = 1，不满足 D._mountIndex < lastIndex 的条件，所以不进行移动操作。更新 lastIndex = Math.max(prevChild._mountIndex, lastIndex)，则 lastIndex = 3，同时将 D 的位置更新为新集合中的位置 prevChild._mountIndex = nextIndex，此时新集合中 D._mountIndex = 2，nextIndex++ 进入下一个节点。

- 从新集合中取出 C，C 在旧集合中的位置 C._mountIndex = 2，此时 lastIndex = 3，满足 C._mountIndex < lastIndex 的条件。进行移动操作，enqueuemove(this, child._mountIndex, toIndex)。更新 lastIndex = Math.max(prevChild._mountIndex, lastIndex)，则 lastIndex = 3，同时将 C 的位置更新为新集合中的位置 prevChild._mountIndex = nextIndex，此时新集合中 C._mountIndex = 3，nextIndex++ 进入下一个节点，当然，由于该节点是最后一个，所以 diff 结束。

上面逐步介绍了新旧集合相同情况下 diff 是如何运作的，那么如果新旧集合不同的情况下，diff 又该是怎么样运作呢？

<img src="https://github.com/KayneWang/blog/blob/master/img/element-diff-3.jpeg" width="400" />

- 从新集合中取出 B，此时 B._mountIndex = 1，lastIndex = 0，所以不进行移动操作。更新 lastIndex = 1，同时更新 B 在新集合中的位置 B._mountIndex = 0，nextIndex++ 进入下一个节点。
- 从新集合中取出 E，此时，对比发现旧集合中没有 E，所以，创建 E。更新 lastIndex = 1，同时更新 E 在新集合中的位置 E._mountIndex = 1，nextIndex++ 进入下一个节点。
- 从新集合中取出 C，此时 C._mountIndex = 2, lastIndex = 1，所以不进行移动操作。更新 lastIndex = 2，同时更新 C 在新集合中的位置 C._mountIndex = 2，nextIndex++ 进入下一个节点。
- 从新集合中取出 A，此时 A._mountIndex = 0, lastIndex = 2，对 A 进行移动操作。更新 lastIndex = 2，同时更新 A 在新集合中的位置 A._mountIndex = 3，nextIndex++ 进入下一个节点。
- 完成新集合中所有对比之后，需要对旧集合进行遍历，判断是否存在节点在新集合没有，但是旧集合仍然存在的情况，遍历发现 D，因此将 D 删除，同时 diff 结束。

至此，我们对 key 的作用应该有了一些理解，当然它还是存在一些问题，比如：

<img src="https://github.com/KayneWang/blog/blob/master/img/element-diff-4.jpeg" width="400" />

这种情况可以看出，其实只需要对 D 进行移动操作就可以完成，但是按照当前 diff 的设计，A、B、C 都满足 _mountIndex < lastIndex 的条件，所以会对它们进行移动操作。这也就是为什么 React 建议我们：

<b>在开发过程中尽量避免最后一个节点移动至列表首部的操作。</b>
