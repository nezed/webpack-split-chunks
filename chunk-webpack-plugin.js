'use strict';

var util = require('./lib/util');
var tools = require('./lib/tools');

/**
 * Creates a new instance of the plugin.
 * @param options Plugin options.
 * @param {string|string[]} options.from A name or an array of names of chunks from which modules should be taken.
 * @param {string} options.to The name of the target chunk into which the taken modules should be added.
 * @param {RegExp|RegExp[]} options.test A regex or an array of regex objects against which the full path (and NOT the
 * module name) of modules will be tested. If a module in one of the "from" chunks matches any of these regex rules it
 * will be copied over to the "target" module.
 * @constructor
 */
function VendorWebpackPlugin(options) {
	// tedious type checking...
	if (!(this instanceof VendorWebpackPlugin)) throw new Error('Function `VendorWebpackPlugin` is a constructor and must be instantiated with the `new` keyword.');
	if (typeof options !== 'object') throw new TypeError('Argument `options` must be an object.');
	if (!util.typeOrArrayOf(options.from, 'string')) throw new Error('Option `from` must be either a string or an array of strings');
	if (!util.checkType(options.to, 'string')) throw new Error('Option `to` must be a string.');
	if (!util.typeOrArrayOf(options.test, RegExp)) throw new Error('Option `test` must be either a RegExp object or an array of such objects.');

	this.fromChunkNameList = Array.isArray(options.from) ? options.from : [options.from];
	this.targetChunkName = options.to;
	this.testRegex = Array.isArray(options.test) ? options.test : [options.test];

	if (this.fromChunkNameList.indexOf(this.targetChunkName) !== -1) {
		// yeah, if this happened something is wrong
		throw new Error('The name of the target ("to") chunk cannot also be in the "from" chunk name list.');
	}
}

function apply(compiler) {
	var self = this; // i lost my lambdas ;_;

	compiler.plugin('compilation', function (compilation) {
		compilation.plugin('optimize-chunks', function (chunkList) {
			// 1. find the target chunk (and ensure it exists) before we take anything from other chunks
			var targetChunk = tools.findTargetChunk(chunkList, self.targetChunkName);
			if (!targetChunk) {
				// uh-oh! (perhaps this should just be a warning?)
				throw new Error('Target (to) chunk "' + self.targetChunkName + '" wasn\'t found.');
			}

			// 2. filter out chunks we shouldn't be touching
			chunkList = chunkList.filter(function (chunk) {
				return self.fromChunkNameList.indexOf(chunk.name) !== -1;
			});

			// 3. take all the modules that pass any of our test regex
			var takenModules = tools.takeMatchingModules(chunkList, self.testRegex);

			// 4. insert all taken modules into our target chunk
			tools.insertModulesIntoChunk(targetChunk, takenModules);
		});
	});
}

Object.defineProperty(VendorWebpackPlugin.prototype, 'apply', {
	value: apply,
	enumerable: false
});

module.exports = VendorWebpackPlugin;

// note: this code could be so much shorter with ES6...