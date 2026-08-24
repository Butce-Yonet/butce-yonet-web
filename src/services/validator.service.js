export function createYupValidator(schema) {
  return {
    async validateForm(model, errors) {
      Object.keys(errors).forEach(k => delete errors[k]);

      try {
        await schema.validate(model, { abortEarly: false });
        return true;
      } catch (e) {
        if (e.inner) {
          e.inner.forEach(err => {
            if (err.path && !errors[err.path]) {
              errors[err.path] = err.message;
            }
          });
        }
        return false;
      }
    },

    async validateField(field, model, errors) {
      try {
        await schema.validateAt(field, model);
        delete errors[field];
      } catch (e) {
        errors[field] = e.message;
      }
    }
  };
}