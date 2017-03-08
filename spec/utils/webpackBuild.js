const path = require('path')
const MemoryFS = require('memory-fs')
const webpack = require('webpack')

const VIRTUAL_PATH = '/dist'

jasmine.getEnv().defaultTimeoutInterval = 10000;

function verifyExpectedContent(actualContent, expectedContent) {
  if(Array.isArray(expectedContent)) {
    expectedContent.forEach(expectation => (
      verifyExpectedContent(actualContent, expectation)
    ))
  } else if(expectedContent instanceof RegExp) {
    expect(actualContent).toMatch(expectedContent)
  } else {
    expect(actualContent).toContain(expectedContent)
  }
}

module.exports = function verifyWebpackBuild(webpackConfig) {
  webpackConfig = Object.assign({}, webpackConfig, {
    output: Object.assign({}, webpackConfig.output, {
      path: VIRTUAL_PATH
    })
  })

  const fs = new MemoryFS()

  const compiler = webpack(webpackConfig)
  compiler.outputFileSystem = fs

  const run = () => (new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if(err) {
        reject(err)
      }
      expect(err).toBeFalsy()

      resolve(stats)
    })
  }))

  const willEmit = (expectations) => {
    expectations || (expectations = {})

    return run().then((stats) => {
      const emitedFiles = Object.keys(stats.compilation.assets)

      for(const outputFile of Object.keys(expectations)) {
        const emitedFileName = emitedFiles.find(file => file.indexOf(outputFile) !== -1)
        expect(emitedFileName).not.toBeUndefined(`Expected file "${ outputFile }" are not emited`)

        const emitedFilePath = path.join(webpackConfig.output.path, emitedFileName)
        expect(fs.existsSync(emitedFilePath)).toBeTruthy(`Expected file "${ emitedFilePath }" are not exist on FS`)

        const expectedContent = expectations[outputFile]
        if(expectedContent !== null) {
          const actualContent = fs.readFileSync(emitedFilePath, 'utf-8')
          verifyExpectedContent(actualContent, expectedContent)
        }
      }

      return stats
    })
  }

  return {
    run: run,
    willEmit: willEmit,
  }
}
