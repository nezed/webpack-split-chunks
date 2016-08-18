'use strict';

var util = require('./util');

module.exports = {
	takeMatchingModules: takeMatchingModules,
	findTargetChunk: findTargetChunk,
	insertModulesIntoChunk: insertModulesIntoChunk
};

function takeMatchingModules(chunkList, testRegex) {
	var takenModules = [];
	for (var i = 0; i < chunkList.length; i++) {
		var chunk = chunkList[i];
		var moduleList = chunk.modules;
		/////////////////////////////////////////////////////
		for (var k = 0; k < moduleList.length; k++) {
			var module = moduleList[k];
			if (!util.testAny(testRegex, module.resource)) {
				// module doesn't match any of the test criteria; ignore it
				continue;
			}

			// take the module from the chunk
			chunk.removeModule(module);
			k--; // (forgetting this won't be pretty)
			// ..and add to our list
			takenModules.push(module);
		}
		/////////////////////////////////////////////////////
	}
	return takenModules;
}

function findTargetChunk(chunkList, targetChunkName) {
	for (var i = 0; i < chunkList.length; i++) {
		var chunk = chunkList[i];
		if (chunk.name === targetChunkName) {
			// found it!
			return chunk;
		}
	}
	// not found
	return null;
}

function insertModulesIntoChunk(targetChunk, moduleList) {
	// dump all stolen modules into chunk
	for (var i = 0; i < moduleList.length; i++) {
		var module = moduleList[i];
		targetChunk.addModule(module);
	}
	// clear the array just in case
	moduleList.length = 0;
}
