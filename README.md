# 1.拉取一份 react创建的工程 [地址](https://github.com/shenqil/webpack5-reactExp/tree/main)
***

# 2. 开发 思路
+ 分两个文件夹
+ dev 开启一个react开发项目
+ src 为具体库的实现代码
+ 然webpack配置一个正常的react项目，入口设置为dev下面的index
+ 这样启动这个webpack，就可以在线开发src下面的库了

# 2.1  以实现一个react弹窗组件为例，先写一个弹窗组件
```
// src\index.tsx

import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import './index.scss';

export interface IDialogProps{
  hideDialog:Function
}
export default class Dialog extends Component<IDialogProps> {
  node:HTMLElement;

  constructor(props:IDialogProps) {
    super(props);

    this.node = document.createElement('div');
    this.node.classList.add('dialog');
  }

  componentDidMount() {
    document.body.appendChild(this.node);
  }

  componentWillUnmount() {
    document.body.removeChild(this.node);
  }

  render() {
    const { hideDialog, children } = this.props;
    return createPortal(
      <div className="dialog-model">
        {children}
        {typeof hideDialog === 'function' && (
        <button onClick={() => hideDialog()} type="button">关闭窗口</button>
        )}
      </div>, this.node,
    );
  }
}

```

# 2.2 在example开启react开发项目，并且使用src导出的Dialog 
```
// example\index.tsx

import React, {  useState } from 'react'
import ReactDOM from 'react-dom';

import Diallog from '../src/index'

function App(){
  const [isShowDialog,setIsShowDialog] = useState(false)
  return (
    <div>
      <h3>DialogPage</h3>
      <button onClick={() => setIsShowDialog(true)}>
          toggle
      </button>
      {isShowDialog && <Diallog children="hello" hideDialog={() => setIsShowDialog(false)} />}
    </div>
    )
}


ReactDOM.render(<App />,document.getElementById('root'));
```

# 2.3 配置 example 的webpack
```
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './dev/index.tsx',
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'build'),
    },
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './build',
        // 启动gzip 压缩0
        compress: true,
        // 端口号
        port: 8080,
        open: true,
        hot: true,
    },
    plugins: [
      new HtmlWebpackPlugin({ template: './index.html' }),
    ],
    module: {
        rules: [
            {
              test: /\.html$/i,
              // 处理html文件的img图片(负责引入img,从而能被url-loader进行处理)
              loader: 'html-loader',
            },
            {
              test: /\.(ts|js)x?$/,
              exclude: /node_modules/,
              loader: 'babel-loader',
            },
            {
              test: /\.(png|svg|jpg|jpeg|gif)$/i,
              type: 'asset/resource',
              generator: {
                filename: 'static/images/[hash][ext][query]',
              },
            },
            {
              test: /\.(woff|woff2|eot|ttf|otf)$/i,
              type: 'asset/resource',
              generator: {
                filename: 'static/font/[hash][ext][query]',
              },
            },
            {
                test: /\.((c|sa|sc)ss)$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    'sass-loader'
                ]
            }
        ]
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
    resolve: {
      // 配置省略文件路径的后缀名
      extensions: ['.tsx', '.ts', '.js'],
    },
}
```
# 2.4 最后 `npm run start` 就可以愉快的开发自己的库了
***

# 3.打包思路
+ 开启一个`webpack`,配置为`library`
+ 排除用到的 `react`
+ 去掉corejs
# 3.1 配置一个生产环境的webpack
```
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/index.tsx',
    mode: 'production',
    devtool: 'source-map',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
      library:'react-dialog',
      libraryTarget: 'umd'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'style.css',
            chunkFilename: '[id].css',
        }),
    ],
    module: {
        rules: [
            {
              test: /\.(ts|js)x?$/,
              exclude: /node_modules/,
              loader: 'babel-loader',
            },
            {
              test: /\.(png|svg|jpg|jpeg|gif)$/i,
              type: 'asset/resource',
              generator: {
                filename: 'static/images/[hash][ext][query]',
              },
            },
            {
              test: /\.(woff|woff2|eot|ttf|otf)$/i,
              type: 'asset/resource',
              generator: {
                filename: 'static/font/[hash][ext][query]',
              },
            },
            {
                test: /\.((c|sa|sc)ss)$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    // 将css文件变成commonjs模块加载js中，里面内容是样式字符串
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                        }
                    },
                    'postcss-loader',
                    'sass-loader'
                ],
            },
        ]
    },
    resolve: {
      // 配置省略文件路径的后缀名
      extensions: ['.tsx', '.ts', '.js'],
    },
    externals:{
      react:'react',
      'react-dom':'react-dom'
    }
}

```
+  `library:'react-dialog'`是库名称,`libraryTarget: 'umd'`编译库的目标,umd 代表`ES2015`,`CommonJS `可以使用
+ `externals`,用户会导入的库，这里不用引入，减少打包体积

# 3.2 去掉corejs,这里不引入减少打包体积，放给用户去引入
```
// .babelrc

{
    "presets": [
        "@babel/env",
        "@babel/preset-react",
        "@babel/preset-typescript"
    ],
    "plugins": [
        "@babel/plugin-proposal-class-properties"
    ]
}
```

# 3.3  运行`npm run build`，会打包我们的组件库
***

# 4. 推送到npm
## 4.1 修改`package.json`
```
  "name": "@shen9401/react-dialog",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "style": "dist/style.css",
  "files": [
    "dist"
  ],
```
+ `main` node和浏览器所需要的文件 ; `module` 是node和浏览器ES模块需要的文件
+   `"sideEffects": false` ,会忽略css

## 4.2 登录到自己的npm账户
```
npm adduser --registry=https://registry.npmjs.org/
```
+ 会提示输入用户名，密码，邮箱，以及注册邮箱的验证码
## 4.3 使用 ` nrm use npm` 切换到npm 源
## 4.4 `npm publish --access public` 发布公共包
***

# 5.新建一个react项目
## 5.1 执行 `npm i @shen9401/react-dialog` 按照包
## 5.2 引入并使用
```
import Diallog from '@shen9401/react-dialog'
import '@shen9401/react-dialog/dist/style.css'
function App() {
  const [isShowDialog,setIsShowDialog] = useState(false)
  return (
    <div className="App">
      <button onClick={() => setIsShowDialog(true)}>
          toggle
      </button>
      {isShowDialog && <Diallog children="hello" hideDialog={() => setIsShowDialog(false)} />}
    </div>
  );
}
```
*** 
# 6. 合并js和css, 修改webpack 配置，避免引入组件之后还要引入样式
```
            {
                test: /\.((c|sa|sc)ss)$/i,
                use: [
                  "style-loader",
                    // 将css文件变成commonjs模块加载js中，里面内容是样式字符串
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                        }
                    },
                    'postcss-loader',
                    'sass-loader'
                ],
            },
```
+ 去掉 `MiniCssExtractPlugin`,改用`style-loader`
***
