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
            { test: /.tsx?$/, use: 'ts-loader' }
        ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
    },
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