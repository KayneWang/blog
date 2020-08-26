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

## 获取输入框光标位置

```js
var kingwolfofsky = {
    /**
    * 获取输入光标在页面中的坐标
    * @param		{HTMLElement}	输入框元素        
    * @return		{Object}		返回left和top,bottom
    */
    getInputPositon: function (elem) {
        if (document.selection) {   //IE Support
            elem.focus();
            var Sel = document.selection.createRange();
            return {
                left: Sel.boundingLeft,
                top: Sel.boundingTop,
                bottom: Sel.boundingTop + Sel.boundingHeight
            };
        } else {
            var that = this;
            var cloneDiv = '{$clone_div}',
                cloneLeft = '{$cloneLeft}',
                cloneFocus = '{$cloneFocus}',
                cloneRight = '{$cloneRight}';
            var none = '<span style="white-space:pre-wrap;"> </span>';
            var div = elem[cloneDiv] || document.createElement('div'),
                focus = elem[cloneFocus] || document.createElement('span');
            var text = elem[cloneLeft] || document.createElement('span');
            var offset = that._offset(elem),
                index = this._getFocus(elem),
                focusOffset = { left: 0, top: 0 };

            if (!elem[cloneDiv]) {
                elem[cloneDiv] = div, elem[cloneFocus] = focus;
                elem[cloneLeft] = text;
                div.appendChild(text);
                div.appendChild(focus);
                document.body.appendChild(div);
                focus.innerHTML = '|';
                div.className = this._cloneStyle(elem);
                div.style.cssText = 'visibility:hidden;display:inline-block;position:absolute;z-index:-100;';
            };
            div.style.left = this._offset(elem).left + "px";
            div.style.top = this._offset(elem).top + "px";
            var strTmp = elem.value.substring(0, index).replace(/</g, '<').replace(/>/g, '>').replace(/\n/g, '<br/>').replace(/\s/g, none);
            text.innerHTML = strTmp;

            focus.style.display = 'inline-block';
            try { focusOffset = this._offset(focus); } catch (e) { };
            focus.style.display = 'none';
            return {
                left: focusOffset.left,
                top: focusOffset.top,
                bottom: focusOffset.bottom
            };
        }
    },

    // 克隆元素样式并返回类
    _cloneStyle: function (elem, cache) {
        if (!cache && elem['${cloneName}']) return elem['${cloneName}'];
        var className, name, rstyle = /^(number|string)$/;
        var rname = /^(content|outline|outlineWidth)$/; //Opera: content; IE8:outline && outlineWidth
        var cssText = [], sStyle = elem.style;

        for (name in sStyle) {
            if (!rname.test(name)) {
                val = this._getStyle(elem, name);
                if (val !== '' && rstyle.test(typeof val)) { // Firefox 4
                    name = name.replace(/([A-Z])/g, "-$1").toLowerCase();
                    cssText.push(name);
                    cssText.push(':');
                    cssText.push(val);
                    cssText.push(';');
                };
            };
        };
        cssText = cssText.join('');
        elem['${cloneName}'] = className = 'clone' + (new Date).getTime();
        this._addHeadStyle('.' + className + '{' + cssText + '}');
        return className;
    },

    // 向页头插入样式
    _addHeadStyle: function (content) {
        var style = this._style[document];
        if (!style) {
            style = this._style[document] = document.createElement('style');
            document.getElementsByTagName('head')[0].appendChild(style);
        };
        style.styleSheet && (style.styleSheet.cssText += content) || style.appendChild(document.createTextNode(content));
    },
    _style: {},

    // 获取最终样式
    _getStyle: 'getComputedStyle' in window ? function (elem, name) {
        return getComputedStyle(elem, null)[name];
    } : function (elem, name) {
        return elem.currentStyle[name];
    },

    // 获取光标在文本框的位置
    _getFocus: function (elem) {
        var index = 0;
        if (document.selection) {// IE Support
            elem.focus();
            var Sel = document.selection.createRange();
            if (elem.nodeName === 'TEXTAREA') {//textarea
                var Sel2 = Sel.duplicate();
                Sel2.moveToElementText(elem);
                var index = -1;
                while (Sel2.inRange(Sel)) {
                    Sel2.moveStart('character');
                    index++;
                };
            }
            else if (elem.nodeName === 'INPUT') {// input
                Sel.moveStart('character', -elem.value.length);
                index = Sel.text.length;
            }
        }
        else if (elem.selectionStart || elem.selectionStart == '0') { // Firefox support
            index = elem.selectionStart;
        }
        return (index);
    },

    // 获取元素在页面中位置
    _offset: function (elem) {
        var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement;
        var clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0;
        var top = box.top + (self.pageYOffset || docElem.scrollTop) - clientTop, left = box.left + (self.pageXOffset || docElem.scrollLeft) - clientLeft;
        return {
            left: left,
            top: top,
            right: left + box.width,
            bottom: top + box.height
        };
    }
};
```

```html
<!DOCTYPE html>
<html>
<head>
    <title>InputPostion</title>
    <script type="text/javascript" src="kingwolfofsky.js"></script>
    <script type="text/javascript">
        function show(elem) {
            var p = kingwolfofsky.getInputPositon(elem);
            var s = document.getElementById('show');
            s.style.top = p.bottom+'px';
            s.style.left = p.left + 'px';
            s.style.display = 'inherit';
        }
    </script>
</head>
<body>
    <textarea id="text" onkeyup="show(this)" style="width: 340px; height: 210px;"></textarea>    
    <div id="show" style="background: #eee; position: absolute;border:1px solid grey;font-size:13px; display:none;">
        This is tooltip
    </div>
</body>
</html>
```

