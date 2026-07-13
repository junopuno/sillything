function resolveCategoryBackgroundStyle(category = {}) {
  const bgType = category.bgType || 'solid';
  const bgColor = category.bgColor || '#f8fafc';
  const start = category.bgGradientStart || '#ffffff';
  const end = category.bgGradientEnd || '#e0f2fe';
  const angle = category.bgGradientAngle || 135;

  if (bgType === 'gradient') {
    return `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;
  }

  return bgColor;
}

if (typeof module !== 'undefined') {
  module.exports = { resolveCategoryBackgroundStyle };
}
