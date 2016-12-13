# webpack split chunks plugin

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

### API
```js
new ChunksPlugin( options )
```

**options**: `Object` (required)
* **from**: `string | Array[string]` (optional)<br/>
    Specifies name(s) of chunks which will be processed.
    If omitted, all chunks will be processed.
    > Note: omit this param if you want `webpack-split-chunks` to process your AMD-defined chunks

* **to**: `string` (required)<br/>
    The name of target chunk.

* **test**: `function | RegExp | Array[RegExp]` (required)<br/>
    The chunks whose **absolute path** meets any of regexp will be moved to target chunk.

    You can provide your own tester function, every module will be applied to it.

    Arguments:
    * **resource**: `string`<br/>
    The absolute path to module

    * **module**: `Object`<br/>
    Webpack's [`Module`](https://github.com/webpack/webpack/blob/master/lib/Module.js) object with module meta-info


#### Examples
```js
    new ChunksPlugin({
        to: 'vendor',
        test: /node_modules|bower_components/
//        or
        test: [/node_modules/, /bower_components/]
    })
```

**Move to `large-chunk.js` all modules bigger than `10KB`**
```js
    new ChunksPlugin({
        to: 'large-chunk',
        test(path, module) {
            const source = module._source && module._source._value
            if(source) {
                const size = Buffer.byteLength(module._source._value)
                return size > 10 * 1024 * 8
            }
        }
    })
```

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
