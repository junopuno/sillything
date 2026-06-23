/* Lightweight import validation utility
   Works in browser (exposes window.validateImport) and in Node (module.exports)
*/
(function(){
  function validateImport(obj) {
    const errors = [];
    if (!obj || typeof obj !== 'object') {
      errors.push('Import must be a JSON object.');
      return { valid: false, errors };
    }
    if (!('data' in obj)) errors.push('Missing "data" property.');
    else if (!Array.isArray(obj.data)) errors.push('Property "data" must be an array.');
    if (!('frontPageWidgets' in obj)) errors.push('Missing "frontPageWidgets" property.');
    else if (!Array.isArray(obj.frontPageWidgets)) errors.push('Property "frontPageWidgets" must be an array.');
    if ('version' in obj && typeof obj.version !== 'number') errors.push('Property "version" must be a number.');
    return { valid: errors.length === 0, errors };
  }

  if (typeof window !== 'undefined') window.validateImport = validateImport;
  if (typeof module !== 'undefined' && module.exports) module.exports = { validateImport };
})();
 