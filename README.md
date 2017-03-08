# Webpack split chunks plugin &nbsp; [![Build Status](https://travis-ci.org/nezed/webpack-split-chunks.svg?branch=master)](https://travis-ci.org/nezed/webpack-split-chunks)

This plugin transfers modules whose absolute path matches your condition from a list of chunks into a single
target chunk.

### Benefits

Using this on external bundles can increase dev re-builds performance and optimize clients browser cache in production, because it includes a lot of modules that you have no intention of changing.

## Usage
```js
// webpack.config.js
const webpack = require('webpack');
const ChunksPlugin = require('webpack-split-chunks');

module.exports = {
    entry: {
        bundle: './src',
    },
    output: {
        path: './build'
    },
    plugins: [
        new ChunksPlugin({
            to: 'vendor',
            test: /node_modules/ // or an array of regex
        })
    ]
};
```
With this configuration all the modules that were `require`'d in the `bundle` chunk whose **absolute path** contains the
substring `"node_modules"` would be instead added to the `vendor` chunk – and not into the `bundle` chunk where they
would otherwise be.

### Webpack `2.x` and `1.x` compatibility
The `latest` version of this plugin is capable with `Webpack@^2.0.0` and `Webpack@^1.5.0`.<br/>
Earlier versions of `Webpack` are not supported anymore.

## API
```js
new ChunksPlugin(options)
```

**options**: `Object` (required)
* **from**: `string | Array[string]` (optional)<br/>
    Specifies name(s) of chunks which will be processed.
    If omitted, all chunks will be processed.
    > Note: omit this param if you want `webpack-split-chunks` to process your AMD-defined chunks

* **to**: `string` (required)<br/>
    The name of target chunk.

* **test**: `Function | RegExp | Array[RegExp]` (required)<br/>
    The chunks whose **absolute path** meets any of regexp will be moved to target chunk.

    You can provide your own tester function, every module will be applied to it.
    ```
      test: (resource, module) => boolean
    ```
    Where:
    * **resource**: `string`<br/>
    The absolute path to module

    * **module**: `Object`<br/>
    Webpack's [`Module`](https://github.com/webpack/webpack/blob/master/lib/Module.js) object with module meta-info


## Examples
##### Search for multiple path masks and combine into single chunk
```js
    new ChunksPlugin({
        to: 'vendor',
        test: /node_modules|bower_components/
//        or
        test: [/node_modules/, /bower_components/]
    })
```

##### Move all modules bigger than `10KB` to `large-chunk.js`
```js
    new ChunksPlugin({
        to: 'large-chunk',
        test(path, module) {
            const source = source
            if(source) {
                const size = Buffer.byteLength(source)
                return size > 10 * 1024 * 8
            }
        }
    })
```
##### Provide specific chunks/entries to extract from
```js
module.exports = {
    entry: {
        portal: './src',
        admin: './src/admin',
        app: './src/app'
    },
    output: {
        path: './build'
    },
    plugins: [
        new ChunksPlugin({
            from: ['portal', 'admin']
            to: 'vendor',
            test: /node_modules/ // or an array of regex
        })
    ]
};
```

## License

[ISC](https://opensource.org/licenses/ISC)
