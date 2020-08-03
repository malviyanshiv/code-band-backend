import { body } from "express-validator";
import Users from "../../models/Users";

const checkEmailExistence = async (value) => {
    const user = await Users.findOne({ email: value });
    if (user !== null) {
        return Promise.reject();
    }
};

const checkUsernameExistence = async (value) => {
    const user = await Users.findOne({ username: value });
    console.log(user);
    if (user !== null) {
        return Promise.reject();
    }
};

export const userValidationRules = () => {
    return [
        body("email")
            .notEmpty()
            .withMessage("email field is required")
            .bail()
            .isEmail()
            .withMessage("email should be valid")
            .bail()
            .custom(checkEmailExistence)
            .withMessage("email already in use"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username field is required")
            .bail()
            .isLength({ min: 5, max: 20 })
            .withMessage("username should be 5 to 20 characters long")
            .bail()
            .custom(checkUsernameExistence)
            .withMessage("username already in use"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password field is required")
            .bail()
            .isLength({ min: 5, max: 20 })
            .withMessage("password should be 5 to 20 characters long"),
        body("name").trim().notEmpty(),
    ];
};

export const updateUserValidationRules = () => {
    return [
        body("password")
            .optional()
            .isLength({ min: 5, max: 20 })
            .withMessage("password should be 5 to 20 characters long"),
    ];
};
