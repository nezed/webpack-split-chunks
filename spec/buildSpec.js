const webpackBuild = require('./utils/webpackBuild')
const path = require('path')
const ChunksPlugin = require('../chunk-webpack-plugin')

const baseConfig = {
  entry: path.join(__dirname, 'fixtures/index'),
  output: {
    filename: '[name]_bundle.js',
    chunkFilename: '[id]_chunk.js'
  }
}

describe('Plugin options', () => {
  it('should not recompile if files are not changed', done => {
    const config = Object.assign({
      plugins: [
        new ChunksPlugin({
            to: 'vendor',
            test: /fake_modules/,
        })
      ]
    }, baseConfig)

    const compiler = webpackBuild(config)

    compiler.run()
      .then(() => (
        compiler.run()
      ))
      .then(stats => {
        const compiledModules = stats.toJson().modules.filter(module => module.built)

        expect(compiledModules.length).toEqual(0)
      })
      .then(done)
  })

  it('should split async chunks', done => {
    const config = Object.assign({}, baseConfig, {
      entry: path.join(__dirname, 'fixtures/async'),
      plugins: [
        new ChunksPlugin({
            to: 'vendor',
            test: /fake_modules/,
        })
      ]
    })

    webpackBuild(config)
      .willEmit({
        '0_chunk': /module-common/,
        vendor_bundle: /module-a/,
      })
      .then(done)
  })
})
