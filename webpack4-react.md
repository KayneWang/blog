## 使用 webpack4 配置 react 开发依赖

源码地址：[https://github.com/KayneWang/react-webpack-boilerplate](https://github.com/KayneWang/react-webpack-boilerplate)

### 前言

大家肯定很好奇，现在关于webpack的配置文章铺天盖地，我为什么还要再写一遍，因为webpack4配置还是存在一些坑（主要是插件兼容性的问题），网上的答案也非常的碎片化，没有找到一个能解决所有问题的地方（也可能是我的搜索功底太弱，哈哈）所以，我觉得还是整理一下比较好，一来方便自己总结归纳，二来希望真正能帮到大家熟悉webpack的配置。

### 目标

通过这边文章，可以学到：

- 了解webpack4的基础配置
- 了解如何区分环境进行打包
- 学会如何自定义输出层级结构
- 终端如何友好提示
- 等等一些小细节

### 版本介绍

- webpack 4.38.0
- react 16.8.6
- react-router-dom 5.0.0

### 项目初始化

找到合适的目录执行

```shell
$ mkdir react-webpack4 && cd react-webpack4
$ npm init -y
```

### 安装webpack

1. 安装

```shell
npm install webpack@4 webpack-cli --save-dev
```

webpack-cli 是官方推荐 webpack 4+ 版本需要安装的一个包。

2. 根据webpack官方指南编写基础配置，更多内容参考[webpack指南](https://www.webpackjs.com/guides/)

```shell
$ touch webpack.config.js
```

webpack.config.js

```js
const path = require('path')

module.exports = {
  // 入口
  entry: './src/index.js',
  // 将文件打包成bundle.js输出到dist文件夹
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
}
```

问题：path.resolve() 是什么，与path.join() 有什么区别？

答案：resolve是把路径或路径片段序列解析为一个<b>绝对路径</b>。而join是把path片段<b>连接</b>到一起，并<b>规范化</b>生成的路径。详细可以参考知乎[解答](https://zhuanlan.zhihu.com/p/27798478)

3. 测试打包

新建src文件夹并编写index.js

```shell
$ mkdir src && cd src
$ touch index.js
```

src/index.js

```js
function component() {
  var element = document.createElement('div');
  element.innerHTML = 'Hello webpack';

  return element;
}

document.body.appendChild(component());
```

修改package.json，增加build命令，webpack4 打包是根据 mode 来区分，我们这边直接设定 build 为 production 环境（不设置会提示一些warning）

package.json

```json
...
"scripts": {
  "build": "webpack --mode production --config webpack.config.js"
}
...
```

执行

```shell
$ npm run build
```

这时候我们发现，生成了一个dist文件夹，并且里面有我们命名好的bundle.js

在dist文件夹下创建index.html

dist/index.html

```html
<!doctype html>
<html>
 <head>
  <title>起步</title>
 </head>
 <body>
   <script src="bundle.js"></script>
 </body>
</html>
```

使用浏览器打开index.html我们应该可以看到:

![avatar](webpack_init_1)

现在的目录结构如下：

```shell
|- dist
|  |- bundle.js
|  |- index.html
|- src
|  |--index.js
|- package.json
```

ok，webpack已经可以正常工作了。

### 管理输出

1. html-webpack-plugin

这个插件相比大家已经十分了解了，它可以将打包好的js文件自动引入事先定义好的模板。

```shell
$ npm install html-webpack-plugin --save-dev
```

修改 webpack.config.js

```js
...
const HtmlWebPackPlugin = require('html-webpack-plugin')

module.exports = {
  ...
  plugins: [
    new HtmlWebPackPlugin({
      // 模板位置
      template: './src/index.html',
      filename: 'index.html'
    }),
  ]
}
```

下面，<b>删除</b>原来在 dist 下创建的 index.html 文件。

新增 src/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>react-webpack4</title>
</head>
<body>
  <!-- 这个 id 用于后续 react render -->
  <div id="app"></div>
</body>
</html>
```

修改 src/index.js

```js
function component() {
  var element = document.createElement('div');
  element.innerHTML = '我使用了html-webpack-plugin';

  return element;
}

document.body.appendChild(component());
```
执行

```shell
$ npm run build
```

打开 dist/index.html 查看，我们可以看到：

![avatar](webpack_init_2)

2. clean-webpack-plugin

这个插件肯定也不陌生，主要是用于清理打包生成的历史文件，用法上在 webpack4 稍有不同。

```shell
$ npm install clean-webpack-plugin --save-dev
```

注意：
- clean-webpack-plugin 3+ 版本的导出方式由原来的 <b>export default</b> 修改为 <b>export { CleanWebpackPlugin }</b> 所以，我们在引入的时候需要注意。
- 我们不需要像原来一样 例如：<b>new CleanWebpackPlugin(['dist'])</b> 指定所需要清空的目标文件夹，因为在 3+ 版本，该插件会将 webpack output.path 文件全部删除，可以查看[文档](https://github.com/johnagan/clean-webpack-plugin#usage)。

修改 webpack.config.js 
 

```js
...
// 这里需要注意一下
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  ...
  plugins:[
    ...
    new CleanWebpackPlugin()
  ],
}
```

如果顺利的话，我们再次执行 npm run build 之后将不会看到历史文件，只有构建生成的最新文件。

当前的目录结构为：

```shell
|- dist
|- src
|  |--index.js
|  |--index.html
|- package.json
```

### 管理资源

1. 安装 css、less 依赖

我们由于要引入 antd 组件，所以这里只配置了 css 和 less。sass 的配置跟这两个差不多，只是需要多安装一个 node-sass 包。

执行

```shell
$ npm install style-loader css-loader less-loader --save-dev
```

2. 使用 <b>extract-text-webpack-plugin</b> 进行 css 代码分离。
 
该插件可以将 css 从 js 中分离出来，从而实现 js 与 css 并行加载，提高加载速度。

执行

```shell
npm install extract-text-webpack-plugin@next --save-dev
```

注意：我们这里使用 <b>@next</b> 后缀安装，因为该插件稳定版目前还无法与 webpack4 一起使用，所以我们使用 beta 版本来进行配置。


修改 webpack.config.js

```js
...
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const extractCSS = new ExtractTextPlugin({
  // 输出结果为 dist/css/[name].css
  filename: 'css/[name].css',
  allChunks: true
})

module.exports = {
  ...
  plugins: [
    ...
    extractCSS
  ],
  module: {
    rules: [
      {
        test: /\.(le|c)ss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true
              }
            }
          ],
        })
      }
    ]
  }
}
```

其中，less-loader 的配置是为了解决 antd 按需引入样式的[问题](https://segmentfault.com/q/1010000013723957)。

3. 加载图片和字体

使用 [file-loader](https://github.com/webpack-contrib/file-loader) 插件

```shell
$ npm install file-loader --save-dev
```

修改 webpack.config.js

```js
...
module.exports = {
  ...
  module: {
    rules: [
      ...
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images/',
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      }
    ]
  }
}
```

下面，我们开始测试，给 index.html 加上一个 icon

首先，在 src 下新建一个 assets 文件夹，assets 下新建一个 img 文件夹，添加一个 favicon.ico 图标。

修改 src/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="shortcut icon" href="images/favicon.ico">
  <title>react-webpack4</title>
</head>
<body>
  <!-- 这个 id 用于后续 react render -->
  <div id="app"></div>
</body>
</html>
```

注意，其中 images/favicon.ico 是打包之后图片的位置。

修改 src/index.js

```js
...
import './assets/img/favicon.ico'
...
```

执行

```shell
npm run build
```

顺利的话，我们打开 dist/index.html 可以发现已经多了一个图标

![avatar](webpack_init_3)

当前的文件夹结构如下：

```shell
|-- dist
|   |-- images
|   |-- bundle.js
|   |-- index.html
|-- src
|   |-- index.js
|   |-- index.html
|   |-- assets
|   |   |-- img
|   |   |   |-- favicon.ico
|-- package.json
```

### webpack-dev-server

该插件是一个静态文件小型代理服务，方便本地开发调试。

```shell
$ npm install webpack-dev-server --save-dev
```

修改 webpack.config.js

```js
...
module.exports = {
  ...
  devServer: {
    port: 1234, // 监听端口
    contentBase: './dist', // 静态资源位置
    compress: true, // 使用压缩
    hot: true, // 启动热更新
    clientLogLevel: 'none', // 客户端日志关闭
  }
}
```

注意：我们只配置了 devServer 的一部分功能，更多请查看[官方文档](https://www.webpackjs.com/configuration/dev-server/)。

修改 package.json

```js
{
  ...
  "scripts": {
    ...
    "start": "webpack-dev-server --mode development --config webpack.config.js"
  },
  ...
}
```

执行

```shell
npm start
```

访问 localhost:1234 端口，可以看到我们的页面已经成功代理，并且修改 src/index.js 文件后，页面可以自动刷新。

### React 依赖

目前为止，我们的准备工作已经做完了，下面开始正式安装 react 依赖。

1. 安装 babel

```shell
$ npm install babel-loader @babel/core @babel/preset-env @babel/preset-react --save-dev
```

大家知道，我们为了代码的兼容性，一般都会引入 @babel/polyfill，但是全局引入的话会显得有点臃肿，毕竟我们还是希望 babel 在编译的时候只加载使用的 polyfills，这样能够减少打包后的文件大小。

下面，我们使用 <b>plugin-transform-runtime</b> 来动态引入 polyfills，使用 corejs 来支持低版本浏览器。

```shell
npm install @babel/runtime @babel/plugin-transform-runtime @babel/runtime-corejs2 --save-dev
```

问题：@babel/plugin-transform-runtime 和 @babel/runtime 的区别？（[参考](https://www.cnblogs.com/htoooth/p/9724609.html)）

答案：
- 第一个是开发时引入，第二个是运行时引入。
- plugin-transform-runtime 默认包含了 @babel/polyfill，不需要在独立引入。
 
为了支持类（class）的属性写法，我们引入 <b>@babel/plugin-proposal-class-properties</b> [插件](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)。

```shell
$ npm install @babel/plugin-proposal-class-properties --save-dev
```

在根目录新建 .babelrc

```js
{
  "presets": [["@babel/preset-env", {
    "useBuiltIns": "usage",
    "corejs": 2
  }], "@babel/preset-react"],
  "plugins":[
    "@babel/plugin-transform-runtime",
    "@babel/plugin-proposal-class-properties",
  ]
}
```

修改 webpack.config.js

```js
...
module.exports={
  ...
  module:{
    ...
    rules:[
      ...
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  }
}
...
```

2. 安装 react

```shell
$ npm install react react-dom --save
```

修改 src/index.js

```js
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app';
import './assets/img/favicon.ico'

const mountNode = document.getElementById('app');
ReactDOM.render(<App />, mountNode);
```

新建 src/app.js

```js
import React from 'react';

class App extends React.Component {
  render() {
    return (
      <div>hello react.</div>
    )
  }
}

export default App;
```

执行

```shell
$ npm start
```

正常的话，可以看到：

![avatar](react_init_1)

ok，现在我们的 react 配置已经完成，当前的目录结构如下：

```shell
|-- dist
|-- src
|   |-- index.js
|   |-- index.html
|   |-- app.js
|   |-- assets
|-- package.json
|-- .babelrc
|-- webpack.config.js
```

### webpack 配置分离

我们发现，webpack 的配置全部都写在一个文件里面会很难以区分，所以我们根据 dev 和 prod 进行配置拆分。

1. 安装 webpack-merge

```shell
$ npm install webpack-merge --save-dev
```

2. 编写 webpack.common.js

```js
const HtmlWebPackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const extractCSS = new ExtractTextPlugin({
  // 输出结果为 dist/css/[name].css
  filename: 'css/[name].css',
  allChunks: true
})

module.exports = {
  // 入口
  entry: './src/index.js',
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebPackPlugin({
      // 模板位置
      template: './src/index.html',
      filename: 'index.html'
    }),
    extractCSS
  ],
  module: {
    rules: [
      {
        test: /\.(le|c)ss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true
              }
            }
          ],
        })
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images/',
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  }
}
```

3. 编写 webpack.dev.js

关于 devtool 可以查看[文档](https://www.webpackjs.com/configuration/devtool/#devtool)

```js
const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common')

module.exports = merge(common, {
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
    chunkFilename: '[name].js'
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 1234,
    contentBase: './dist',
    compress: true,
    hot: true,
    clientLogLevel: 'none'
  }
})
```

4. 编写 webpack.prod.js

开始之前我们需要做到
- 代码压缩
- 提取公共代码
- 避免公共代码 hash 后缀变更

```shell
$ npm install terser-webpack-plugin --save-dev
```

使用 terser-webpack-plugin 来压缩 js 代码。

webpack.prod.js

```js
const webpack = require('webpack')
const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = merge(common, {
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[name].[chunkhash].js',
  },
  optimization: {
    usedExports: true,
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          test: path.resolve(__dirname, 'node_modules'),
          name: 'vendor',
          enforce: true
        }
      }
    },
    minimizer: [new TerserPlugin({
      sourceMap: true
    })]
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.HashedModuleIdsPlugin(),
  ]
})
```

问题：使用 webpack.DefinePlugin 指定环境的作用？

答案：许多 library 将通过与 process.env.NODE_ENV 环境变量关联，以决定 library 中应该引用哪些内容。例如，当不处于生产环境中时，某些 library 为了使调试变得容易，可能会添加额外的日志记录(log)和测试(test)。其实，当使用 process.env.NODE_ENV === 'production' 时，一些 library 可能针对具体用户的环境进行代码优化，从而删除或添加一些重要代码。

问题：webpack.HashedModuleIdsPlugin 的作用？

答案：由于每个 module.id 会基于默认的解析顺序进行增量，但是我们不希望公共库每次打包之后 hash 后缀变更。生产环境推荐使用该插件。[了解更多](https://www.webpackjs.com/guides/caching/)

ok，我们现在已经把配置拆分完毕，删除原来的 webpack.config.js 并修改 package.json

```js
{
  ...
  "scripts": {
    "start": "cross-env NODE_ENV=development webpack-dev-server --mode development --progress --config webpack.dev.js",
    "build": "cross-env NODE_ENV=production webpack --mode production --progress --config webpack.prod.js",
  }
  ...
}
```

```shell
$ npm install cross-env --save-dev
```

注意：<b>cross-env</b> 是用于解决跨平台设置 NODE_ENV 的问题。[详情](https://www.npmjs.com/package/cross-env)

最后，分别执行

```shell
$ npm start
$ npm run build
```

不出意外，应该没有什么问题。当前的目录结构为：

```shell
|-- dist
|-- src
|-- package.json
|-- .babelrc
|-- webpack.common.js
|-- webpack.dev.js
|-- webpack.prod.js
```

### 代码分割

根据 react 官方文档，我们可以使用 [React.lazy](https://react.docschina.org/docs/code-splitting.html#reactlazy) 来进行代码分割。

为了满足动态引入，我们需要用到 <b>@babel/plugin-syntax-dynamic-import</b>

```shell
$ npm install @babel/plugin-syntax-dynamic-import --save-dev
```

修改 .babelrc

```js
{
  ...
  "plugins": [
    ...
    "@babel/plugin-syntax-dynamic-import"
  ]
}
```

新建 src/HelloReact.js

```js
import React from 'react';

export default function HelloReact() {
  return (
    <div>Hello React by dynamic import.</div>
  )
}
```

编辑 src/app.js

```js
import React, { Suspense } from 'react';
const HelloReact = React.lazy(() => import('./HelloReact'))

class App extends React.Component {
  render() {
    return (
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <HelloReact />
        </Suspense>
      </div>
    )
  }
}

export default App;
```

执行

```shell
$ npm start
```

如果没什么问题我们可以看到

![avatar](react_init_2)

### 友好提示

我们发现，当前配置的 webpack 终端输出的日志比较多

![avatar](webpack_init_4)

可是很多脚手架并不是这样，下面我们使用 <b>friendly-errors-webpack-plugin</b> 进行优化，并通过 <b>node-notifier</b> 将错误信息抛出。

```shell
$ npm install friendly-errors-webpack-plugin node-notifier --save-dev
```

修改 webpack.dev.js

```js
...
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const notifier = require('node-notifier')

module.exports = merge(common, {
  ...
  devServer: {
    ...
    quiet: true,
    overlay: true,
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin({
      compilationSuccessInfo: {
        messages: ['You application is running http://localhost:1234']
      },
      onErrors: (severity, errors) => {
        if (severity !== 'error') {
          return;
        }
        const error = errors[0];
        notifier.notify({
          title: 'Webpack error',
          message: severity + ': ' + error.name,
          subtitle: error.file || ''
        });
      }
    }),
  ]
})
```

执行

```shell
$ npm start
```

可以看到，是不是清爽了很多。

![avatar](webpack_init_5)

报错之后也能够正常抛出错误

![avatar](webpack_init_6)

### 结尾

到此我们就配置了一个相当基础的 webpack4+react 的开发依赖，还有很多的东西值得去完善，比如 postcss、react 的热更新等等。

最后，希望这个小教程能帮助大家理解 webpack 的配置，有问题还请大家随时通过 issue 沟通，当然更希望大家 fork 并一起去完善这个配置，共同学习进步。最后希望大家能够工作顺利，在前端之路越走越好。
