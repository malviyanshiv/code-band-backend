const { body, validationResult } = require("express-validator");

export const loginValidationRules = () => {
    return [
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username field is required"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password field is required"),
    ];
};

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = {};
    errors.array().map((err) => (extractedErrors[err.param] = err.msg));

    return res.status(422).json({
        success: "false",
        errors: extractedErrors,
    });
};
