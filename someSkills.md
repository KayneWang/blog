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

factorial(10) // 3628800
```

这种方式执行之后会保存 10 条记录，很容易造成栈溢出。如下图：
