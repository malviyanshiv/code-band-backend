import { body } from "express-validator";

export const createListValidationRules = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("name field is required")
            .bail()
            .isLength({ min: 5, max: 20 })
            .withMessage("password should be 5 to 20 characters long"),
    ];
};

export const updateListValidationRules = () => {
    return [
        body("name")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("name field is required"),
    ];
};

export const listItemValidationRules = () => {
    return [
        body("url").trim().notEmpty().withMessage("url field is required"),
        body("name")
            .trim()
            .customSanitizer((value, { req }) => {
                if (value.length === 0) {
                    return req.body.url;
                }
                return req.body.name;
            }),
    ];
};

export const listItemUpdateValidationRules = () => {
    return [
        body("url")
            .trim()
            .optional()
            .notEmpty()
            .withMessage("url field is required"),
        body("name")
            .optional()
            .trim()
            .customSanitizer((value, { req }) => {
                if (value.length === 0) {
                    return req.body.url;
                }
                return req.body.name;
            }),
    ];
};

export const commentValidationRules = () => {
    return [
        body("body").trim().notEmpty().withMessage("body field is requred"),
    ];
};
