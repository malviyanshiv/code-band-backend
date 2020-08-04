import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.data;
        next();
    } catch (err) {
        console.log("Error while verifying token in middleware", err);
        res.status(401).send({
            success: false,
            message: "user not authorized",
        });
    }
};

export default authenticate;
