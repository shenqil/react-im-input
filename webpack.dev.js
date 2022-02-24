const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './example/index.tsx',
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'build'),
    },
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './build',
        // 启动gzip 压缩
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
