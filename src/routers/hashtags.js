import express from "express";
import authenticate from "../middleware/auth";
import HashTags from "../models/HashTags";

const router = express.Router();

router.post("/api/hashtags", authenticate, async (req, res) => {
    try {
        let tag = await HashTags.findOne({ tag: req.body.tag });
        if (tag) {
            return res.status(409).send(tag);
        }
        tag = new HashTags(req.body);
        await tag.save();
        return res.status(201).send(tag);
    } catch (err) {
        console.log("Error while creating a new hashtag", err);
        return res.status(500).send();
    }
});

router.get("/api/hashtags", async (req, res) => {
    const queryTerm = req.query.tag ? req.query.tag : "";
    try {
        const tags = await HashTags.find({ tag: new RegExp(queryTerm) });
        return res.send(tags);
    } catch (err) {
        console.log("Error occurred while reading tags", err);
        return res.status(500).send();
    }
});

export default router;
