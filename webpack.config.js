const { VueLoaderPlugin } = require('vue-loader')
const fs = require('fs')

const config = {
    entry: {
        background: './src/background.ts',
        content: './src/content.ts',
        options_ui: './options_ui/index.ts'
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/dist'
    },
    module: {
        rules: [
            { test: /\.tsx?$/, use: {
                loader: 'ts-loader',
                options: { appendTsSuffixTo: [/\.vue$/] } }
            },
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
    fs.copyFile('options_ui/index.html', 'dist/options_ui.html', (err) => { if (err) console.error(err); throw err; });
    console.log('copy index.html')
    if (argv.mode === 'development') {
        config.devtool = 'source-map';
    }

    if (argv.mode === 'production') {
        //...
    }

    return config
};
