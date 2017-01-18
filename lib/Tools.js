'use strict';

var util = require('./util');

function Tools(compiler) {
	this.compilationOptimized = false
}

Tools.prototype.takeMatchingModules = takeMatchingModules
Tools.prototype.findExistingChunk = findExistingChunk
Tools.prototype.insertModulesIntoChunk = insertModulesIntoChunk
Tools.prototype.findEntryChunk = findEntryChunk
Tools.prototype.createChildChunk = createChildChunk

module.exports = Tools

function takeMatchingModules(chunkList, testers) {
	var takenModules = [];
	for (var i = 0; i < chunkList.length; i++) {
		var chunk = chunkList[i];
		var moduleList = chunk.modules;
		/////////////////////////////////////////////////////
		for (var k = 0; k < moduleList.length; k++) {
			var module = moduleList[k];

			// if module doesn't match any of the test criteria; ignore it
			if( !module.resource ) {
				continue;
			} else if( typeof testers === 'function' ) {
				if( !testers(module.resource, module) )
					continue;
			} else if (!util.testAny(testers, module.resource)) {
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

function findExistingChunk(chunkList, targetChunkName) {
	for (var i = 0; i < chunkList.length; i++) {
		if (chunkList[i].name === targetChunkName) {
			// found it!
			return chunkList[i];
		}
	}
	// not found
	return null;
}
function findEntryChunk(chunkList) {
	for (var i = 0; i < chunkList.length; i++) {
		if (chunkList[i].hasRuntime()) {
			return chunkList[i];
		}
	}
	// not found
	return chunkList[0];
}

function createChildChunk(compilerContext, chunkName, chunkList, parentChunk) {
	parentChunk = parentChunk || this.findEntryChunk(chunkList)
	var chunk = compilerContext.addChunk(chunkName)

	chunk.extraAsync = true
	chunk.addParent(parentChunk)
	parentChunk.addChunk(chunk)

	return chunk;
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
