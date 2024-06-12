const parseValidationErrors = (e, req) => {
  if (!e || !e.errors) {
    req.flash("error", "An unknown error occurred.");
    return;
  }
  const errorMessages = {
    "username": "Username is required.",
    "password": "Password must be at least 8 characters.",
    "company": "Please provide company name.",
    "position": "Please provide position.",
    "createdBy": "Please provide a user.",
  };

  const keys = Object.keys(e.errors);
  keys.forEach((key) => {
    const message = errorMessages[key] || e.errors[key].properties.message;
    req.flash("error", key + ": " + message);
  });
};

module.exports = parseValidationErrors;