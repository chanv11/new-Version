# webpack
   - 一个模块化打包工具
   - 在前端项目中更高效地管理和维护项目中的每一个资源
   - 能够编译代码中的新特性
   - 能够支持不同种类的前端资源模块

### 1.entry
   - 这个属性的作用就是指定 Webpack 打包的入口文件路径

### 2.output
   - output 属性设置输出文件的位置,必须是一个对象，通过这个对象的`filename`指定输出文件的文件名称，`path`指定输出的目录

### 3.Webpack工作模式

   - production 模式下，启动内置优化插件，自动优化打包结果，打包速度偏慢
   - development 模式下，自动优化打包速度，添加一些调试过程中的辅助插件
   - none 模式下，运行最原始的打包，不做任何额外处理
    - 通过配置`mode`属性

### 4.Loader
   - 在配置对象的 module 属性中添加一个 rules 数组。这个数组就是我们针对资源模块的加载规则配置，其中的每个规则对象都需要设置两个属性
      - 首先是 test 属性，它是一个正则表达式，用来匹配打包过程中所遇到文件路径
      - 然后是 use 属性，它用来指定匹配到的文件需要使用的 loader
      - 一旦配置多个 Loader，执行顺序是从后往前执行的
         - 例如第一个是`style-loader`,第二个是`css-loader`

### 5.Plugin

   - 实现自动在打包之前清除 dist 目录（上次的打包结果）
   - 自动生成应用所需要的 HTML 文件
   - 根据不同环境为代码注入类似 API 地址这种可能变化的部分
   - 拷贝不需要参与打包的资源文件到输出目录
   - 压缩 Webpack 打包完成后输出的文件
   - 自动发布打包结果到服务器实现自动部署

### 6.项目优化

   - Tree Shaking
      - `UglifyJsPlugin`
      - ```
            // ./webpack.config.js
            module.exports = {
                // ... 其他配置项
                optimization: {
                    // 模块只导出被使用的成员
                    usedExports: true,
                    // 压缩输出结果
                    minimize: true,
                    // 尽可能合并每一个模块到一个函数中
                    concatenateModules: true,
                }
            }
        ```
     - Code Splitting
        - 根据业务不同配置多个打包入口，输出多个打包结果
        - 结合 ES Modules 的动态导入（Dynamic Imports）特性，按需加载模块
           - ```
                // ./webpack.config.js
                const HtmlWebpackPlugin = require('html-webpack-plugin')
                module.exports = {
                entry: {
                    index: './src/index.js',
                    album: './src/album.js'
                },
                output: {
                    filename: '[name].bundle.js' // [name] 是入口名称
                },
                optimization: {
                    splitChunks: {
                    // 自动提取所有公共模块到单独 bundle
                    chunks: 'all'
                    }
                }
                // ... 其他配置
                plugins: [
                    new HtmlWebpackPlugin({
                        title: 'Multi Entry',
                        template: './src/index.html',
                        filename: 'index.html',
                        chunks: ['index'] // 指定使用 index.bundle.js
                    }),
                    new HtmlWebpackPlugin({
                        title: 'Multi Entry',
                        template: './src/album.html',
                        filename: 'album.html',
                        chunks: ['album'] // 指定使用 album.bundle.js
                    })
                ]
                }
             ```

### 7.不同环境下的配置
   - 为不同环境单独添加一个配置文件，一个环境对应一个配置文件
      - ```
        // ./webpack.common.js
        module.exports = {
            // ... 公共配置
        }
        // ./webpack.prod.js
        const merge = require('webpack-merge')
        const common = require('./webpack.common')
        module.exports = merge(common, {
            // 生产模式配置
        })
        // ./webpack.dev.jss
        const merge = require('webpack-merge')
        const common = require('./webpack.common')
            module.exports = merge(common, {
            // 开发模式配置
        })

        ```
   - Define Plugin
      - 代码中注入全局成员
         - ```
            new webpack.DefinePlugin({
                'process.env': env
            }),
           ```
  - Mini CSS Extract Plugin
     - CSS 代码从打包结果中提取出来的插件
        - ```
            // ./webpack.config.js
            const MiniCssExtractPlugin = require('mini-css-extract-plugin')
            module.exports = {
                mode: 'none',
                entry: {
                    main: './src/index.js'
                },
                output: {
                    filename: '[name].bundle.js'
                },
                module: {
                    rules: [
                    {
                        test: /\.css$/,
                        use: [
                            // 'style-loader', // 将样式通过 style 标签注入
                            MiniCssExtractPlugin.loader,
                            'css-loader'
                        ]
                    }
                    ]
                },
                plugins: [
                    new MiniCssExtractPlugin()
                ]
            }
          ```
   - Optimize CSS Assets Webpack Plugin
      - 压缩CSS文件
      - ```
        plugins: [
            new MiniCssExtractPlugin(),
            new OptimizeCssAssetsWebpackPlugin()
        ]
        ```
   - externals
      - 通过配置`externals`选项，防止某些package打包到bundle,而是在运行时(runtime)再去从外部获取这些扩展依赖
      - 在`index.html`模板文件中，添加相关库的`cdn`引用

   - source map
      - eval
         - 打包后每个模块的代码包裹到了一个 eval 函数中， 通过sourceURL 的方式声明这个模块对应的源文件路径
      - cheap
         - 阉割版，比如eval-source-map只能定位到行
      - module
         - 带有 module 的模式，解析出来的源代码是没有经过 Loader 加工的
         