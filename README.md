# chunk plugin for webpack

Transfers modules specified chunks into a target chunk.

## What is that good for?

This may not sound like much, but coupled with other plugins–especially with the built-in `CommonsChunkPlugin`–it can
do something quite useful.

## Usage

Example webpack config:

```javascript
const webpack = require('webpack');
const ChunkPlugin = require('../chunk-webpack-plugin');

module.exports = {
    entry: {
        bundle: './src/main.js',
        vendor: []
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

What would happen with this configuration is that all the modules that were `require`'d in the `bundle` chunk whose
**absolute path** contains the substring `"node_modules"`would be bundled into the `vendor` chunk – and not into the `bundle` chunk.

The problem that this plugin tries to solve is that while the `CommonsChunkPlugin` works as advertised, it requires that
you keep an explicit list of modules that you want to be transferred into the vendor bundle. This is both tedious and error prone. 
 
This plugin tries to solve that problem by matching module paths against regular expressions and transferring the matched
modules to the target chunk (in this case its the `vendor` chunk) before the `CommonsChunkPlugin` has a chance to run.