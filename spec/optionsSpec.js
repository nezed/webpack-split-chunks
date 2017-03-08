const webpackBuild = require('./utils/webpackBuild')
const path = require('path')
const ChunksPlugin = require('../chunk-webpack-plugin')

const baseConfig = {
  entry: path.join(__dirname, 'fixtures/index'),
  output: {
    filename: '[name]_bundle.js'
  }
}

describe('Plugin options', () => {
  it('should extract synchronous chunk', done => {
    const config = Object.assign({
      plugins: [
        new ChunksPlugin({
            to: 'vendor',
            test: /fake_modules/,
        })
      ]
    }, baseConfig)

    webpackBuild(config)
      .willEmit({
        main_bundle: /module-common/,
        vendor_bundle: /module-a/,
      })
      .then(done)
  })

  it('should process array of chunks regexp', done => {
    const config = Object.assign({
      plugins: [
        new ChunksPlugin({
            to: 'vendor',
            test: [
              /fake_modules/,
              /common/,
            ]
        })
      ]
    }, baseConfig)

    webpackBuild(config)
      .willEmit({
        vendor_bundle: [
          /module-common/,
          /module-a/,
        ]
      })
      .then(done)
  })

  it('should split chunks by checker function', done => {
    const config = Object.assign({
      plugins: [
        new ChunksPlugin({
            to: 'common',
            test(path, module) {
                const source = module._source && module._source._value
                if(source) {
                    return source.indexOf('module-common') !== -1
                }
            }
        })
      ]
    }, baseConfig)

    webpackBuild(config)
      .willEmit({
        main_bundle: /module-a/,
        common_bundle: /module-common/,
      })
      .then(done)
  })
})
