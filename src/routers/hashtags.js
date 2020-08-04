import express from "express";
import authenticate from "../middleware/auth";
import HashTags from "../models/HashTags";

const router = express.Router();

router.post("/api/hashtags", authenticate, async (req, res) => {
    try {
        let tag = await HashTags.findOne({ tag: req.body.tag });
        if (tag) {
            return res.status(409).send({
                success: true,
                message: "tag already exists",
                data: {
                    tag,
                },
            });
        }
        tag = new HashTags(req.body);
        await tag.save();
        return res.status(201).send({
            success: true,
            message: "tag successfully created",
            data: {
                tag,
            },
        });
    } catch (err) {
        console.log("Error while creating a new hashtag", err);
        return res.status(500).send({
            success: false,
            message: "server error occurred",
            error: {
                general: err.message,
            },
        });
    }
});

router.get("/api/hashtags", async (req, res) => {
    const queryTerm = req.query.tag ? req.query.tag : "";
    try {
        const tags = await HashTags.find({ tag: new RegExp(queryTerm) });
        return res.send({
            success: true,
            message: "data found",
            data: {
                tags,
            },
        });
    } catch (err) {
        console.log("Error occurred while reading tags", err);
        return res.status(500).send({
            success: false,
            message: "server error occurred",
            error: {
                general: err.message,
            },
        });
    }
});

export default router;
