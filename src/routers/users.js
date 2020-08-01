import express from "express";
import multer from "multer";
import sharp from "sharp";
import { sendWelcomeEmail, sendCancelationEmail } from "../emails/account";
import Users from "../models/Users";
import PublicLists from "../models/PublicLists";
import PrivateLists from "../models/PrivateLists";
import authenticate from "../middleware/auth";

const router = new express.Router();

router.post("/api/users", async (req, res) => {
    try {
        const user = new Users({
            ...req.body,
            isVerified: true, // to be change later
        });
        await user.save();
        const token = await user.generateAuthToken();
        //sendWelcomeEmail(user.email, user.username);
        return res.status(201).send({ user: user.toClient(), token });
    } catch (err) {
        console.log("Error occurred while creating a new user", err);
        res.status(500).send({ error: err.message });
    }
});

// Update User
router.patch("/api/users/", authenticate, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["password", "name"];
    const updateValid = updates.every((update) =>
        allowedUpdates.includes(update)
    );
    if (!updateValid) {
        return res.status(422).send();
    }
    try {
        const user = await Users.findById(req.user._id).select("+password");
        updates.forEach((update) => (user[update] = req.body[update]));
        await user.save();
        return res.send(user.toClient());
    } catch (err) {
        console.log("Error occurred while updating the user", err);
        res.status(500).send({ error: err.message });
    }
});

router.get("/api/users/:username", async (req, res) => {
    try {
        const user = await Users.findOne({
            username: req.params.username,
        });

        if (user === null) {
            return res.status(404).send();
        }

        return res.send(user.toClient());
    } catch (err) {
        console.log(`Error occurred while reading user ${username}`, err);
        return res.status(500).send({ error: err.message });
    }
});

router.get(
    "/api/users/:username/private-lists",
    authenticate,
    async (req, res) => {
        if (req.params.username !== req.user.username) {
            return res.status(401).send();
        }
        const limit =
            req.query.limit === undefined ? 10 : parseInt(req.query.limit);
        const skip =
            req.query.page === undefined
                ? 0
                : (parseInt(req.query.page) - 1) * limit;
        try {
            let lists = await PrivateLists.find({
                author: req.user._id,
            })
                .limit(limit)
                .skip(skip)
                .select("name description item_count updatedAt createdAt")
                .populate({
                    path: "author",
                    select: "username",
                })
                .exec();

            lists = lists.map((list) => list.partialList());
            return res.send(lists);
        } catch (err) {
            console.log("error occurred while fetching private lists", err);
            return res.status(500).send();
        }
    }
);

router.get("/api/users/:username/public-lists", async (req, res) => {
    const limit =
        req.query.limit === undefined ? 10 : parseInt(req.query.limit);
    const skip =
        req.query.page === undefined
            ? 0
            : (parseInt(req.query.page) - 1) * limit;
    try {
        const user = await Users.findOne({
            username: req.params.username,
        }).select("_id");

        if (!user) {
            return res.status(404).send();
        }
        let lists = await PublicLists.find({
            author: user._id,
        })
            .limit(limit)
            .skip(skip)
            .select(
                "name description reads likes item_count updatedAt createdAt"
            )
            .populate({
                path: "author",
                select: "username",
            })
            .exec();

        lists = lists.map((list) => list.partialList());
        return res.send(lists);
    } catch (err) {
        console.log(
            `Error occurred while reading public list for ${req.params.username}`,
            err
        );
        return res.status(500).send();
    }
});

const upload = multer({
    limits: {
        fileSize: 500000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("please upload a image file"));
        }

        cb(undefined, true);
    },
});
router.post(
    "/api/users/:username/avatar",
    authenticate,
    upload.single("avatar"),
    async (req, res) => {
        if (req.params.username !== req.user.username) {
            return res.status(401).send();
        }
        try {
            const user = await Users.findByIdAndUpdate(req.user._id, {
                $set: {
                    avatar: await sharp(req.file.buffer)
                        .resize({ height: 250, width: 250 })
                        .png()
                        .toBuffer(),
                },
            });

            if (!user) {
                return res.status(404).send();
            }

            res.status(204).send();
        } catch (err) {
            console.log("Error occured while uploading a image", eff);
            res.status(500).send();
        }
    }
);

router.get("/api/users/:username/avatar", async (req, res) => {
    try {
        const user = await Users.findOne({
            username: req.params.username,
        }).select("+avatar");
        if (!user || !user.avatar) {
            return res.status(404).send();
        }
        res.header("Content-Type", "image/png");
        res.send(user.avatar);
    } catch (err) {
        console.log("Error occurred while reading avatar", err);
        res.status(500).send();
    }
});

export default router;
