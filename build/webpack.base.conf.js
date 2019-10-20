/* 多页面应用: webpack 通用配置 */

const path = require('path')
const glob = require('glob')
const merge = require("webpack-merge");
const htmlWebpackPlugin = require('html-webpack-plugin') //生成html模板
const { CleanWebpackPlugin } = require('clean-webpack-plugin') // 清空output
const WebpackManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 抽离css到单独的文件
// const purifycssWebpack = require('purifycss-webpack') //消除冗余css
// const copyWebpackPlugin = require('copy-webpack-plugin') //静态资源拷贝
// const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')
let devMode = process.env.NODE_ENV != 'production'
let output = process.env.OUTPUT || 'dist'
const { log } = console
const PAGES_DIR = './www/pages'
log('devMode =', devMode, 'NODE_ENV =', process.env.NODE_ENV, 'output =', output, 'process.env.OUTPUT', process.env.OUTPUT)

// 读取所有入口
function getEntry(page_dir) {
  let entry = {};
  glob.sync(page_dir + '/**/*.js').forEach(name => {
    let subPath = name.split(page_dir)[1]
    let chunk = subPath.split('/')[1];
    entry[chunk] = [name];
  })
  return entry;
}
// 每一个入口对应一个html
function genHtmlWebpackPlugins(page_dir, entries) {
  let plugins = []
  Object.keys(entries).forEach(name => {
    let htmlConfig = {
      filename: `${name}.html`, // 生成的文件名
      template: `${page_dir}/${name}/${name}.html`, // 将在此模板中插入入口js文件
      // favicon: './favicon.ico', //?? 标签页图标
      title: name, //htmlWebpackPlugin.options.title 供模板使用的参数
      inject: 'body', // js插入的位置: true(插入body) / 'head' / 'body'/ false(不插入) default:body
      // chunks: [name], // 模板的入口代码块, 对应唯一入口文件以及一些公共模块
      chunks: ['lodash', 'vue', 'vendor', name],
      // chunks: ['vendors@color@index', 'vendors@'+name, name],
      hash: true, // 开启hash default: false 插入的chunk会 带上hash src="js/vendor.bundle.js?64330b02b5c838306217" 强制不缓存
      minify: devMode ? false : { // 根据环境决定是否压缩html
        removeComments: true, //移除HTML中的注释 default: false
        collapseWhitespace: true, //折叠空白区域(压缩代码) default: false
        removeAttributeQuotes: true, //??(未验证)去除属性引用
      },
    }
     //通过插入多个此插件实例来生成多个不同的html
    plugins.push(new htmlWebpackPlugin(htmlConfig))
  })
  return plugins
}

let entries = getEntry(PAGES_DIR)
const config = {
  // mode: 'none', // production, development, none(default)
  entry: {
    // vendor: ['lodash'], // 打包公共模块
    ...entries, // 多页面应用根据pages文件夹结构生成多个入口文件
  },
  output: {
    /* <script src = "publicPath + filename ? htmlWebpackPluginHash"></script> */
    path: path.resolve(__dirname, '../'+output), //output文件所在目录
    publicPath: './', //生成output文件的所在路径 要正确指定才能拿到文件 default: ''
    // hash: 每次打包的hash
    // chunkhash: (js模块使用)每一个chunk变化的hash, 只有chunk文件改变了才会改变哈希值
    // contenthash: (css等模块使用) 基于内容变化的hash, 只有内容改变了才会改变哈希值
    // filename: "[name]-[hash:8].js",
    filename: devMode ? 'js/[name].bundle.js' : 'js/[name].[chunkhash:8].js', // 生成的文件名和路径 开发环境不需要hash
    // (production)生产环境中, 连续多次生成的hash相同 ???
  },

  // watch: true, // 默认false
  watchOptions: { // 當watch為true時生效
    ignored: /node_modules/, // 不监听的文件,
    aggregateTimeout: 3000, // 监听到文件变化后, 等待300ms后再执行
    poll: 1000, // 判断文件是否发生变化, 是通过不断地询问系统指定文件文件有无变化, 默认每秒问1000此,
  },

  module: {
    rules: [
      /* 1. Load CSS */
      {
        test: /\.(css)$/, //以.css结尾的文件, 交由以下指定的loader处理
        /* 不分离 css */
        // css-loader: 使js文件能够处理 import('./style.css')
        // style-loader: 在未加其他插件的情况下, 将css文件内容插入到head <style> 标签中
        use: [ 'style-loader', 'css-loader' ], // 顺序:从右到左 从下到上, 先css-loader, 后style-loader
        /* 分离css */
        // use: ExtractTextWebpackPlugin.extract({
        //   fallback: 'style-loader',
        //   use: ['css-loader'],
        //   // publicPath: '../',
        // }),
      },
      {
        test: /\.(less)$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
          'postcss-loader'
        ],
      },

      /* 2. Load Image */ /* 优先前面的规则(rule) */
      {
        /* 使js文件能够处理 import Icon from '../../images/icon.png'
          icon.png打包入output, Icon 处理成 icon.png的实际url <img src="cb0093496837d3dc43dfae5a9104d663.png" />
        */
        test: /\.(png|svg|jpe?g|gif)$/,
        use: [{
          loader: "url-loader",
          options: {
            name: "[name]-[hash:6].[ext]", // 图片文件输出的文件名, 默认 cb0093496837d3dc43dfae5a9104d663.png
            limit: 10 * 1024, //小于这个大小(10kb)时将会以base64位图片字符串格式打包处理, 内联在js文件里, 可减少请求, 适用于小图标, 小文件
            outputPath: "images", // 图片文件输出的文件夹
          }
        }]
      },
      {
        // test: /\.(png|svg|jpe?g|gif)$/,
        // use: [
        //   {
        //     loader: 'file-loader',
        //     options: {
        //       name: "[name]-[hash:8].[ext]", // 打包后的文件名, 默认 cb0093496837d3dc43dfae5a9104d663.png
        //       outputPath: "images" // 打包后放入的文件夹
        //     }
        //   },
        // ]
      },

      /* 3. Load Font */
      {
        /* 将css中引用的字体文件输出至output, 并替换url
            src: url('../../assets/fontawesome-webfont.woff2') format('woff2');
          > src: url(af7ae505a9eed503f8b8e6982036873e.woff2) format('woff2');
         */
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [ // file-loader 和 url-loader  可接受并加载任何文件, 并输出至output
          {
            loader: 'file-loader',
            options: {
              name: "[name]-[hash:8].[ext]",
              outputPath: "fonts"
            }
          },
        ]
      },
      // {
      //   test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      //   loader: 'url-loader',
      //   options: {
      //     limit: 10000,
      //   }
      // },

      /* 4. Load Data */
      /* 加载JSON 文件是默认支持的, 加载CSV TSV XML 数据需要loader */
      {
        test: /\.(csv|tsv)$/,
        use: [ 'csv-loader' ]
      },
      {
        test: /\.xml$/,
        use: [ 'xml-loader' ]
      },

      /* 5. HTML */
      // {
      //   test: /\.html$/,
      //   // html中的img标签
      //   use: ["html-withimg-loader"]
      // },

      /* 6. TS */
      // {
      //   test: /\.tsx?$/,
      //   use: 'ts-loader',
      //   exclude: /node_modules/
      // },

      /* 7. JS */
      {
        test: /\.js$/,
        // enforce: 'pre',
        exclude: /(node_modules|bower_components)/, //不检查node_modules下的js文件
        use: ['babel-loader'],
        // use: ['jslint-loader'],
      },
      // {
      //   test: /\.(css|scss|sass)$/,
      //   use: [
      //     devMode ? 'style-loader' : {
      //       loader: MiniCssExtractPlugin.loader,
      //       options: {
      //         // you can specify a publicPath here by default it use publicPath in webpackOptions.output
      //         publicPath: '../'
      //       }
      //     },
      //     'css-loader',
      //     'postcss-loader',
      //     'sass-loader',
      //   ]
      // }, {
      //   test: /\.less$/,
      //   use: [
      //     devMode ? 'style-loader' : {
      //       loader: MiniCssExtractPlugin.loader,
      //       options: {
      //         // you can specify a publicPath here
      //         // by default it use publicPath in webpackOptions.output
      //         publicPath: '../'
      //       }
      //     },
      //     'css-loader',
      //     'postcss-loader',
      //     'less-loader',
      //   ]
      // },
      //     {
      //       loader: 'image-webpack-loader',
      //       options: {
      //         // disable: true // newer
      //         mozjpeg: { progressive: true, quality: 65 },
      //         optipng: { enabled: false, }, // optipng.enabled: false will disable optipng
      //         pngquant: { quality: '65-90', speed: 4 },
      //         gifsicle: { interlaced: false, },
      //         webp: { quality: 75 } // the webp option will enable WEBP
      //       }
      //     }
    ]
  },

  /* Plugin 类似于生命周期扩展, 作用于整个构建过程 , 没有顺序*/
  plugins: [
    new CleanWebpackPlugin({ // 每次构件之前将output清空
    //   verbose: true, //??开启在控制台输出信息 // verbose Write logs to console.
    //   // dry Use boolean "true" to test/emulate delete. (will not remove files).
    //   // Default: false - remove files
    //   dry: false, //??
    }),
    // new webpack.HashedModuleIdsPlugin(),
    // new webpack.NamedModulesPlugin(), // 模块热替换 看要patch的依赖
    /* 生成manifest.json文件 http: //127.1.1.1:8000/manifest.json */
    new WebpackManifestPlugin({
      fileName: 'manifest-fanny.json', // 自定义文件名 default manifest.json
      basePath: PAGES_DIR+'/', //input文件所在目录前缀 //??A path prefix for all keys. Useful for including your output path in the manifest.
      publicPath: './'+output+'/', //output文件所在目录前缀 Default: output.publicPath
      writeToFileEmit: true, // 使用devServer时也会在output目录生成文件 default: false (使用devServer时一般看不到output)
      serialize: (manifest) => JSON.stringify(manifest, null, 8), //定义数据的格式
      FileDescriptor: { //??
        // path: 'string',//??
        // name: 'string | null',//??
        // isChunk: 'boolean',//?? 可作为代码块引用?
        // isInitial: 'boolean',//?? Cannot be true if isChunk is false.
        // chunk: true,//?? Only available is isChunk is true
        // isAsset: 'boolean',//??
        // isModuleAsset: 'boolean',//?? Cannot be true if isAsset is false.
      },
    }),
    // // 全局暴露统一入口
    // new webpack.ProvidePlugin({
    //   $: 'jquery',
    //   jQuery: 'jquery',
    //   'window.jQuery': 'jquery',
    // }),
    // //静态资源输出
		// new copyWebpackPlugin([{
		// 	from: path.resolve(__dirname, "../www/assets"),
		// 	to: './assets',
		// 	ignore: ['.*']
		// }]),
		// // 消除冗余的css代码
		// new purifyCssWebpack({
		// 	paths: glob.sync(path.join(__dirname, "../www/pages/**/*.html"))
    // }),
    // new ExtractTextWebpackPlugin({ //分离 chunk中引用的 *.css文件
    //   filename: 'css/[name].[hash:8].min.css'
    // }),
    ...genHtmlWebpackPlugins(PAGES_DIR, entries), // 动态生成HTML, 自动将output插入html
  ],
  // webpack4里面移除了commonChunksPulgin插件，放在了config.optimization里面,提取js， vendor名字可改

  // resolve: {
  //   extensions: ['.tsx', '.ts', '.js'] //??
  // },
  //将外部变量或者模块加载进来 //??
  externals: {
    // 'jquery': 'window.jQuery'
  },
  optimization: {
    splitChunks: { //??
      chunks: 'initial', // async(仅分割异步模块) initial all 
      automaticNameDelimiter: '@', //分割模块打包连接符 默认 ~
      minSize: 30000, //当模块大于30kb才进行分割
      minChunks: 1, // 至少有1处地方引用了同一个模块才会分割
  		cacheGroups: {
  			vendor: {
  				test: path.resolve(__dirname, '../node_modules'),
  				// chunks: "initial", //表示显示块的范围，有三个可选值：initial(初始块)、async(按需加载块)、all(全部块)，默认为all;
  				name: "vendor", //拆分出来块的名字(Chunk Names)，默认由块名和hash值自动生成；
          minChunks: 1,
          priority: -10,
  				// reuseExistingChunk: true,
  				// enforce: true
        },
        lodash: {
          test: /lodash/,
          name: 'lodash',
          minChunks: 1,
        },
        vue: {
          test: /vue/,
          name: 'vue',
          minChunks: 1,
        },
  		}
    }
  },
}

module.exports = () => {
  if (process.env.NODE_ENV === 'development') {
    return merge(config, require('./webpack.dev.conf'))
  } else if (process.env.NODE_ENV === 'production') {
    return merge(config, require('./webpack.prod.conf'))
  } else {
    return config
  }
}
