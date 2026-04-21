// src/middleware/validate.js

export function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      // Only override safe properties
      if (result.body) {
        req.body = result.body;
      }

      if (result.params) {
        req.params = result.params;
      }

    
      if (result.query) {
        req.validatedQuery = result.query;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}