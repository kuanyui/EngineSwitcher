const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const config = {
    entry: {
        background: './src/background.ts',
        content: './src/content.ts',
        options_ui: './src/options_ui/options_ui.ts'
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
            {
                test: /\.pug$/,
                // use: [
                //     // 'html-loader',
                //     'pug-html-loader'
                // ],
                use: [
                    //{
                    //    loader: 'html-loader',
                    //    options: { minimize: false }
                    //},
                    {
                        loader: 'raw-loader',
                    },
                    {
                        loader: 'pug-html-loader',
                        options: { pretty: true }
                    }
                ]
            },
            { test: /\.styl(us)?$/, use: ['vue-style-loader', 'css-loader', 'stylus-loader'] },
            { test: /\.(gif|svg|jpg|png)$/, loader: "file-loader" },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] }
        ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/options_ui/options_ui.pug',
            filename: 'options_ui.html',
            chunks: [],  // 'options_ui'  // IMPORTANT: If you don't add this manually, this shitty HtmlWebpackPlugin will add ALL entries into options_ui.html...
        }),
        new CopyPlugin([
            // { from: 'img/', to: 'img/', force: true, toType: 'dir' },
            // { from: 'manifest.json', to: 'manifest.json', force: true, toType: 'file' },
          { from: 'src/options_ui/style/', to: 'options_ui_style/', force: true, toType: 'dir' },
          { from: 'node_modules/tippy.js/dist/tippy.css', to: 'content_tippy.css', force: true, toType: 'file' }
        ]),
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
