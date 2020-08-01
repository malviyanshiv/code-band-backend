import express from "express";
import Bookmarks from "../models/Bookmarks";
import authenticate from "../middleware/auth";

const router = new express.Router();

router.get("/api/bookmarks/", authenticate, async (req, res) => {
    try {
        const bookmarks = await Bookmarks.find({
            userID: req.user._id,
        }).populate({
            path: "listID",
            select:
                "name description likes reads item_count author updatedAt createdAt",
            populate: {
                path: "author",
                select: "username",
            },
        });
        const result = [];
        bookmarks.forEach((bookmark) => {
            console.log(bookmark);
            const obj = bookmark.listID.toObject();
            obj.author.id = obj.id = undefined;
            result.push(obj);
        });
        return res.send(result);
    } catch (err) {
        console.log("Error while reading bookmarks", err);
        return res.status(500).send();
    }
});

export default router;
