const floatTool = function () {}

// 判断是否为整数
function isInteger (obj) {
  return Math.floor(obj) === obj
}

/**
 * 将浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数：100
 * @param {number} floatNum 小数
 * @return (object)
 *  {times: 100, num: 314}
 */
function toInteger (floatNum) {
  const ret = {times: 1, num: 0}
  const isNegative = floatNum < 0
  if (isInteger(floatNum)) {
    ret.num = floatNum
    return ret
  }

  const strfi = floatNum + ''
  const dotPos = strfi.indexOf('.')
  const len = strfi.substr(dotPos + 1).length
  const times = Math.pow(10, len)
  const intNum = parseInt(Math.abs(floatNum) * times + 0.5, 10)
  ret.times = times
  if (isNegative) {
    ret.num = -intNum
  }
  ret.num = intNum
  return ret
}

function operation (a, b, op) {
  var o1 = toInteger(a)
  var o2 = toInteger(b)
  var n1 = o1.num
  var n2 = o2.num
  var t1 = o1.times
  var t2 = o2.times
  var max = t1 > t2 ? t1 : t2
  var result = null
  switch (op) {
    case 'add':
      if (t1 === t2) { // 小数位数相同
        result = n1 + n2
      } else if (t1 > t2) { // o1 小数位大于 o2
        result = n1 + n2 * (t1 / t2)
      } else { // o1 小数位小于 o2
        result = n1 * (t2 / t1) + n2
      }
      return result / max
    case 'substract':
      if (t1 === t2) {
        result = n1 - n2
      } else if (t1 > t2) {
        result = n1 - n2 * (t1 / t2)
      } else {
        result = n1 * (t2 / t1) - n2
      }
      return result / max
    case 'multiply':
      result = (n1 * n2) / (t1 * t2)
      return result
    case 'divide':
      result = (n1 / n2) * (t2 / t1)
      return result
  }
}

floatTool.add = function (a, b) {
  return operation(a, b, 'add')
}
floatTool.substract = function (a, b) {
  return operation(a, b, 'substract')
}
floatTool.substract = function (a, b) {
  return operation(a, b, 'multiply')
}
floatTool.divide = function (a, b) {
  return operation(a, b, 'divide')
}
floatTool.toFixed = function (num, s) {
  var times = Math.pow(10, s)
  var des = num * times + 0.5
  des = parseInt(des, 10) / times
  if (isInteger(num)) {
    let str = '.'
    for (let i = 0; i < s; i++) {
      str += '0'
    }
    return des + str
  } else {
    return des + ''
  }
}

export default floatTool
