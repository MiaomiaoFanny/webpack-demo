/* 多页面应用: webpack 开发环境配置 */

const environment = require('../config/environment')
const webpack = require('webpack') //用于获取自带插件

const webpackConfigDev = {
  // mode 开启不同的默认插件, 默认 production
  // development: 将DefinePlugtin中的process.env.NODE_DEV的值设为 development, 启用NamedChunksPlugin 和 NamedModulesPlugin
  // production: 将DefinePlugtin中的process.env.NODE_DEV的值设为 production, 启用FlagDependencyUsagePlugin, FlagIncludedChunksPlugin, ModuleConcatnationPlugin, NoEmitOnErrorsPlugin, OccurrenceOrderPlugin, sideEffectsFlagPlugin,TerserPlugin
  // none: 退出任何默认优化选项
  mode: 'development', // 通过 mode 声明开发环境, development 不会压缩文件
  devtool: "cheap-module-eval-source-map", // 开发环境推荐配置 development
  // devtool: "inline-source-map", // 开启js调试模式, 精准定位到实际所在文件的行 //?? 是否包括css
  // devtool: "source-map", // 生产单独的.map文件
  // devtool: "eval", // 使用eval包裹代码
  // devtool: "cheap",
  // devtool: "cheap-module-eval-source-map", // 开发环境推荐配置 development
  // devtool: "cheap-module-source-map", // 生产环境推荐配置 production (!!! 不推荐开启)

  plugins: [
    new webpack.HotModuleReplacementPlugin(), // 开启模块热替换 HMR
  ],
  optimization: {
      usedExports: true // 不打包没用到的代码 需要使用 export function ... 的方式导出 import { xxx } from 'yyy' 的方式导入才能实现
  },
}
module.exports = webpackConfigDev