# 搜集的一些实用方案

## 避免递归栈溢出（使用尾递归）

实现一个阶乘函数（n! eg: 5! = 5 * 4 * 3 * 2 * 1）

优化前：

```js
function factorial(n) {
  if (n == 1) {
    return 1
  } else {
    return n * factorial(n - 1)
  }
}

factorial(5) // 120
```

这种方式执行之后会保存 10 条记录，很容易造成栈溢出，如下图：

<img src="https://github.com/KayneWang/blog/blob/master/img/factorial.png" width="500" />

使用尾递归优化：

```js
fucntion factorial(n, total) {
  if (n === 1) {
    return total
  }
  return factorial(n - 1, n * total)
}

factorial(5, 1) // 120
```

这样的话，执行一次只会产生一次记录，所以就避免了栈溢出，如下图：

