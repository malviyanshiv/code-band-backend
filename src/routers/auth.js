import express from "express";
import Users from "../models/Users";

const router = express.Router();

router.post("/api/auth/login", async (req, res) => {
    try {
        const user = await Users.findByCredentials(
            req.body.username,
            req.body.password
        );
        if (!user) {
            return res.status(401).send();
        }
        const token = user.generateAuthToken();
        return res.send({ user, token });
    } catch (err) {
        console.log("Error while login user", err);
        return res.status(500).send();
    }
});

export default router;
