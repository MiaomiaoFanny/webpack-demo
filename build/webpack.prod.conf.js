/* 多页面应用: webpack 生产环境配置 */

const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 抽离css到单独的文件
// const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const webpackConfigProd = {
  mode: 'production', // 通过 mode 声明生产环境, production会压缩并优化资源
  devtool: 'none', // 生产环境不建议开启devtool
  plugins: [
    new MiniCssExtractPlugin({ // 将css抽离到单独文件
      filename: 'css/[name]-[contenthash:8].min.css'
    }),
    // new OptimizeCSSPlugin({ // 压缩css
    //   cssProcessorOptions: {
    //     safe: true
    //   }
    // }),
    //上线压缩 去除console等信息webpack4.x之后去除了webpack.optimize.UglifyJsPlugin
    //https://github.com/mishoo/UglifyJS2/tree/harmony#compress-options
    // new UglifyJSPlugin({
    //   uglifyOptions: {
    //     warnings: false,
    //     compress: {
    //       drop_debugger: false,
    //       drop_console: true
    //     }
    //   }
    // })
  ]
}

if (process.env.npm_config_report) { //打包后模块大小分析//npm run build --report
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  webpackConfigProd.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfigProd