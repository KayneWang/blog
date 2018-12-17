export default {
  format: function (money) {
    if (money && money != null) {
      money = String(money)
      var left = money.split('.')[0]
      var right = money.split('.')[1]
      var temp = left.split('').reverse().join('').match(/(\d{1,3})/g)
      var result = (Number(money) < 0 ? '-' : '') + temp.join(',').split('').reverse().join('') + '.' + right
      return result
    } else if (money === 0) {
      return '0.00'
    } else {
      return '-'
    }
  },
  reset: function (money) {
    if (money && money != null) {
      money = String(money)
      var group = money.split('.')
      var left = group[0].split(',').join('')
      return Number(left + '.' + group[1])
    } else {
      return '-'
    }
  }
}
