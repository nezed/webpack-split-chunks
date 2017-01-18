'use strict';

var CommonsChunkPlugin = require('webpack').optimize.CommonsChunkPlugin;
var util = require('./lib/util');
var Tools = require('./lib/Tools');

var base = CommonsChunkPlugin;

function ChunkWebpackPlugin(options) {
	if (!(this instanceof ChunkWebpackPlugin))
		throw new Error('Function `ChunkWebpackPlugin` is a constructor and must be instantiated with the `new` keyword.');
	if (typeof options !== 'object')
		throw new TypeError('Argument `options` must be an object.');
	if (options.from && !util.typeOrArrayOf(options.from, 'string'))
		throw new Error('Option `from` must be either a string or an array of strings');
	if (!util.checkType(options.to, 'string'))
		throw new Error('Option `to` must be a string.');
	if (!util.typeOrArrayOf(options.test, RegExp) && !util.checkType(options.test, 'function'))
		throw new Error('Option `test` must be either a funtion, RegExp or an array of RegExp`s.');

	this.targetChunkName = options.to;
	if( Array.isArray(options.from) ) {
		this.fromChunkNameList = options.from
	} else if( typeof options.from === 'string' ) {
		this.fromChunkNameList = [options.from]
	} else {
		this.fromChunkNameList = null
	}
	if( Array.isArray(options.test) ) {
		this.testers = options.test
	} else if( typeof options.test === 'function' ) {
		this.testers = options.test
	} else {
		this.testers = [options.test]
	}

	if (this.fromChunkNameList && this.fromChunkNameList.indexOf(this.targetChunkName) !== -1) {
		// yeah, if this happened something is wrong
		throw new Error('The name of the target ("to") chunk cannot also be in the "from" chunk name list.');
	}

	base.call(this, { name: this.targetChunkName, filename: this.targetChunkName + '.js' });
}

ChunkWebpackPlugin.prototype = Object.create(base.prototype);

function apply(compiler) {
	var self = this; // i lost my lambdas ;_;

	compiler.plugin('compilation', function (compilation) {
		var tools = new Tools(compilation)

		compilation.plugin('optimize-chunks', function (chunkList) {
			if( tools.compilationOptimized )
				return;
			tools.compilationOptimized = true

			// 1. find the target chunk (and ensure it exists) before we take anything from other chunks
			var targetChunk = tools.findExistingChunk(chunkList, self.targetChunkName);
			if (!targetChunk) {
				// Create a new child chunk
				targetChunk = tools.createChildChunk(this, self.targetChunkName, chunkList)
			}
			if (!targetChunk) {
				// Fatality!
				throw new Error('Target (to) chunk "' + self.targetChunkName + '" wasn\'t found.');
			}

			// 2. filter out chunks we shouldn't be touching
			if( self.fromChunkNameList ) {
				chunkList = chunkList.filter(function (chunk) {
					return self.fromChunkNameList.indexOf(chunk.name) !== -1;
				});
			}

			// 3. take all the modules that pass any of our test regex
			var takenModules = tools.takeMatchingModules(chunkList, self.testers);

			// 4. insert all taken modules into our target chunk
			tools.insertModulesIntoChunk(targetChunk, takenModules);
		});
	});

	base.prototype.apply.apply(this, arguments);
}

Object.defineProperty(ChunkWebpackPlugin.prototype, 'apply', {
	value: apply,
	enumerable: false
});

module.exports = ChunkWebpackPlugin;
