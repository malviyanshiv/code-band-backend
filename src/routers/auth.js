import express from "express";
import Users from "../models/Users";

import { loginValidationRules, validate } from "../utils/validators/validator";

const router = express.Router();

router.post(
    "/api/auth/login",
    loginValidationRules(),
    validate,
    async (req, res) => {
        try {
            const user = await Users.findByCredentials(
                req.body.username,
                req.body.password
            );
            if (!user) {
                return res.status(401).send();
            }
            const token = user.generateAuthToken();
            return res.send({ success: true, user, token });
        } catch (err) {
            if (err.message === "Unable to login") {
                return res.status(401).send({
                    success: false,
                    errors: {
                        general: "invalid username or password",
                    },
                });
            }
            return res.status(500).send(err);
        }
    }
);

export default router;
