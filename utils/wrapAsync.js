module.exports = (fn) => {
  return function (req, res, next) {
    try {
      const result = fn(req, res, next);
      if (result && typeof result.catch === 'function') {
        // If it's a promise, add error handling
        result.catch(next);
      }
    } catch (err) {
      next(err);
    }
  };
}