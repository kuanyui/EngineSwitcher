const { VueLoaderPlugin } = require('vue-loader')

const config = {
    entry: {
        background: './src/background.ts',
        content: './src/content.ts',      
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/dist'
    },
    module: {
        rules: [
            { test: /\.tsx?$/, use: 'ts-loader', options: { appendTsSuffixTo: [/\.vue$/] } },
            { test: /\.vue$/, use: 'vue-loader' },
            { test: /\.pug$/, loader: 'pug-plain-loader' },
            { test: /\.styl(us)?$/, use: [ 'vue-style-loader', 'css-loader', 'stylus-loader' ]
            }
        ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
      new VueLoaderPlugin()
    ]
}

module.exports = (env, argv) => {
    console.log('mode =', argv.mode)
  if (argv.mode === 'development') {
    config.devtool = 'source-map';
  }

  if (argv.mode === 'production') {
    //...
  }

  return config
};