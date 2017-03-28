'use strict';

const CommonsChunkPlugin = require('webpack').optimize.CommonsChunkPlugin;
const util = require('./lib/util');
const Tools = require('./lib/Tools');

class ChunkWebpackPlugin extends CommonsChunkPlugin {
  constructor(options) {
    if (typeof options !== 'object')
      throw new TypeError('Argument `options` must be an object.');
    if (options.from && !util.typeOrArrayOf(options.from, 'string'))
      throw new Error('Option `from` must be either a string or an array of strings');
    if (!util.checkType(options.to, 'string'))
      throw new Error('Option `to` must be a string.');
    if (!util.typeOrArrayOf(options.test, RegExp) && !util.checkType(options.test, 'function'))
      throw new Error('Option `test` must be either a funtion, RegExp or an array of RegExp`s.');

    const targetChunkName = options.to;
    let fromChunkNameList = null;
    let testers;

    if (Array.isArray(options.from)) {
      fromChunkNameList = options.from
    } else if (typeof options.from === 'string') {
      fromChunkNameList = [options.from]
    }

    if (Array.isArray(options.test)) {
      testers = options.test
    } else if (typeof options.test === 'function') {
      testers = options.test
    } else {
      testers = [options.test]
    }


    if (fromChunkNameList && fromChunkNameList.indexOf(targetChunkName) !== -1) {
      // yeah, if this happened something is wrong
      throw new Error('The name of the target ("to") chunk cannot also be in the "from" chunk name list.');
    }

    super({ name: targetChunkName });
    this.targetChunkName = targetChunkName;
    this.fromChunkNameList = fromChunkNameList;
    this.minChunks = Infinity;
    this.testers = testers;
  }

  apply(compiler) {
    const self = this; // i lost my lambdas ;_;

    compiler.plugin('compilation', function (compilation) {
      const tools = new Tools(compilation);

      compilation.plugin('optimize-chunks', function (chunkList) {
        if (tools.compilationOptimized)
          return;
        tools.compilationOptimized = true;

        // 1. find the target chunk (and ensure it exists) before we take anything from other chunks
        let targetChunk = tools.findExistingChunk(chunkList, self.targetChunkName);
        if (!targetChunk) {
          // Create a new child chunk
          targetChunk = tools.createChildChunk(this, self.targetChunkName, chunkList)
        }
        if (!targetChunk) {
          // Fatality!
          throw new Error('Target (to) chunk "' + self.targetChunkName + '" wasn\'t found.');
        }

        // 2. filter out chunks we shouldn't be touching
        if (self.fromChunkNameList) {
          chunkList = chunkList.filter(function (chunk) {
            return self.fromChunkNameList.indexOf(chunk.name) !== -1;
          });
        }

        // 3. take all the modules that pass any of our test regex
        const takenModules = tools.takeMatchingModules(chunkList, self.testers);

        // 4. insert all taken modules into our target chunk
        tools.insertModulesIntoChunk(targetChunk, takenModules);
      });
    });
    super.apply.apply(this, arguments);
  }
}

module.exports = ChunkWebpackPlugin;
