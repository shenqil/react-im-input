const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './example/index.tsx',
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'docs'),
    },
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './docs',
        // 启动gzip 压缩
        compress: true,
        // 端口号
        port: 8080,
        open: true,
        hot: true,
    },
    plugins: [
      new CleanWebpackPlugin(),
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
              use: {
                loader: 'babel-loader',
                options: {
                  // //   预设：指示babel做怎么样的兼容性处理 需要process.env.NODE_ENV 为生产环境
                  // presets: ['@babel/preset-env'],
                  presets: [
                    [
                      "@babel/preset-env",
                      {
                          "useBuiltIns": "usage",
                          "corejs": {
                              //core-js的版本
                              "version": 3
                          },
                          "targets": {
                              "edge": "17",
                              "firefox": "60",
                              "chrome": "67",
                              "safari": "11.1",
                              "ie": "8"
                          }
                      }
                    ],
                    "@babel/preset-react",
                    "@babel/preset-typescript"
                  ],
                  plugins: [
                    "@babel/plugin-proposal-class-properties"
                  ]
                },
              },
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
