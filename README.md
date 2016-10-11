# chunk webpack plugin

## What does it do?

This plugin transfers modules whose absolute path matches a regular expression from a list of chunks into a single
target chunk. 
Coupled with other plugins – especially with webpack's built-in `CommonsChunkPlugin `– this can be quite useful.

## Usage

Example webpack config:

```javascript
const webpack = require('webpack');
const ChunkPlugin = require('chunk-webpack-plugin');

module.exports = {
    entry: {
        bundle: './src/main.js',
    },
    output: {
        path: './dist/',
        filename: 'bundle.js'
    },
    plugins: [
        new ChunkPlugin({
            from: 'bundle', // or an array of strings
            to: 'vendor',
            test: /node_modules/ // or an array of regex
        }),
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
    ]
};
```

With this configuration all the modules that were `require`'d in the `bundle` chunk whose **absolute path** contains the
substring `"node_modules"` would be instead added to the `vendor` chunk – and not into the `bundle` chunk where they
would otherwise be.

### But why?

Using this on external bundles can greatly increase re-build performance for the `bundle` chunk, especially if it
includes a lot of modules that you have no intention of changing.

### Note

The issue with using only the `CommonsChunkPlugin` plugin to achieve this behavior is that it requires that you keep 
an explicit list of modules that you want to be transferred into the the target bundle.  
This plugin tries to solve that problem by matching module paths against regular expressions and transferring the
matched modules to the target chunk (in the case of the configuration about it's the `vendor` chunk) before the
`CommonsChunkPlugin` has a chance to run, but still letting it do its magic.

## License

[ISC](https://opensource.org/licenses/ISC)