exports.createPostValidator = (req, res, next) => {
  // title
  req.check("title", "Write a title").notEmpty();
  req.check("title", "Title must be between 4 to 150 characters").isLength({
    min: 4,
    max: 150,
  });
  //   body
  req.check("body", "Write a body").notEmpty();
  req.check("body", "Body must be between 4 to 2000 characters").isLength({
    min: 4,
    max: 150,
  });
  //   Check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  // proceed to next middleware
  next();
};

exports.userSignupValidator = (req, res, next) => {
  // name is not not null and between 4-10 character
  req.check("name", "Name is required").notEmpty();
  // username check
  req
    .check("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({
      min: 5,
      max: 2000,
    })
    .withMessage("Minimum 5 alphanumeric characters")
    .matches(/^[a-zA-Z0-9_.]+$/)
    .withMessage(
      "Username is not valid: Alphanumeric characters and Special characters: '.', '_' are only allowed"
    );
  // email is not null, valid and normalized
  req
    .check("email", "Email must be between 3 to 32 characters")
    .matches(/.\@.+\..+/)
    .withMessage("Email must contain @")
    .isLength({
      min: 4,
      max: 2000,
    });
  // check for password
  req.check("password", "Password is not empty").notEmpty();
  req
    .check("password")
    .isLength({ min: 6 })
    .withMessage("Password must contain atleast 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number");

  //   Check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  // proceed to next middleware
  next();
};

exports.createProjectValidator = (req, res, next) => {
  // title
  req.check("title", "Write a project title").notEmpty();
  req.check("title", "Title must be between 4 to 150 characters").isLength({
    min: 4,
    max: 150,
  });
  //   body
  req.check("description", "Write a description").notEmpty();
  req
    .check("description", "Description must be between 4 to 2000 characters")
    .isLength({
      min: 4,
      max: 2000,
    });
  req.check("skills", "Enter skills").notEmpty();
  // req
  //   .check(
  //     "roleDetails",
  //     "Fill in Role Title and Skills required for each role"
  //   )
  //   .notEmpty();
  //   Check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  // proceed to next middleware
  next();
};
