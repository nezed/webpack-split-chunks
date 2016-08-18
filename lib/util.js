'use strict';

module.exports = {
	checkType: checkType,
	typeOrArrayOf: typeOrArrayOf,
	testAny: testAny
};

/**
 * Checks if a value is of the specified type (See code for more details).
 * @param {*} value The value to check.
 * @param {string|function} type The checked type of the value.
 */
function checkType(value, type) {
	return (typeof type === 'string')
			? (typeof value === type)
			: (value instanceof type);
}

/**
 * Checks if a value is of the specified type OR is an array of objects all of which are of the specified type.
 * (See `checkType()` for mor details)
 * @param {*|[]} object  The value or array of values to check.
 * @param {string|function} type The checked type of the value.
 */
function typeOrArrayOf(object, type) {
	if (!Array.isArray(object)) {
		// not an array
		return checkType(object, type);
	}

	// object is an array
	for (var i = 0; i < object.length; i++) {
		var element = object[i];
		if (!checkType(element, type)) {
			return false;
		}
	}
	return true;
}

/**
 * Checks if a string tests true for at least one of a specified array of RegExp objects.
 * @param {RegExp[]} regexArray Array of regex objects to test against.
 * @param {string} testString String to test.
 */
function testAny(regexArray, testString) {
	for (var i = 0; i < regexArray.length; i++) {
		if (regexArray[i].test(testString)) {
			return true;
		}
	}
	return false;
}