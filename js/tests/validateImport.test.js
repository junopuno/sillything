const assert = require('assert');
const { validateImport } = require('../utils/import-utils.js');

const good = { version: 1, data: [], frontPageWidgets: [] };
const bad1 = null;
const bad2 = { data: 'no', frontPageWidgets: [] };
const bad3 = { data: [], frontPageWidgets: 'no' };

console.log('Running validateImport tests...');
assert.strictEqual(validateImport(good).valid, true, 'good import should be valid');
assert.strictEqual(validateImport(bad1).valid, false, 'null should be invalid');
assert.strictEqual(validateImport(bad2).valid, false, 'data as string should be invalid');
assert.strictEqual(validateImport(bad3).valid, false, 'frontPageWidgets as string should be invalid');
console.log('All validateImport tests passed.');
 