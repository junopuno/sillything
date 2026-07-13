const assert = require('assert');
const { resolveCategoryBackgroundStyle } = require('../utils/background-utils.js');

const solid = resolveCategoryBackgroundStyle({ bgColor: '#ff00aa', bgType: 'solid' });
assert.strictEqual(solid, '#ff00aa', 'solid backgrounds should return a single color');

const gradient = resolveCategoryBackgroundStyle({
  bgColor: '#ff00aa',
  bgType: 'gradient',
  bgGradientStart: '#ffffff',
  bgGradientEnd: '#123456',
  bgGradientAngle: 45
});
assert.strictEqual(gradient, 'linear-gradient(45deg, #ffffff 0%, #123456 100%)', 'gradient backgrounds should return a linear gradient string using the supplied angle');

console.log('background-utils tests passed.');
