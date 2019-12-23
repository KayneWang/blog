# 一些常见问题

## 上传文件

```html
<input type="file" ref={fileInput} onChange={getFile} style="display:none;" />
<button onClick={selectFile}>上传文件</button>
```

```js
const fileInput = useRef(null)
const selectFile = () => {
  filtInput.current.click()
}
const getFile = e => {
  const files = e.target.files
  const filename = files[0].name
  if (filename.lastIndexOf('.') <= 0) {
    return alert("请选择有效文件")
  }
  const fd = new FormData()
  fd.append('name', files[0])
  
  // 请求 api
  xxx(fd).then(res => {......})
}
```

## HTML to Word

```html
<div id="exportContent">
    <!-- Your content here -->
</div>
<button onclick="Html2Doc('exportContent');">Export as .doc</button>
```

```js
function Html2Doc(ele, filename = '') {
  var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    var posthtml = "</body></html>";
    var html = preHtml + document.getElementById(ele).innerHTML + posthtml;
  
    var blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
  
    var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
  
    filename = filename ? filename + '.doc' : 'word.doc';
  
    var downloadLink = document.createElement('a');
  
    document.body.appendChild(downloadLink);
  
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.click();
    }
  
    document.body.removeChild(downloadLink);
  }
}
```

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

<img src="https://github.com/KayneWang/blog/blob/master/img/factorialTail.png" width="400" />

