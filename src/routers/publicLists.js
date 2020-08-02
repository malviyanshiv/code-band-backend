import express from "express";
import PublicLists from "../models/PublicLists";
import Likes from "../models/Likes";
import Bookmarks from "../models/Bookmarks";
import authenticate from "../middleware/auth";
import Comments from "../models/Comments";

const router = new express.Router();

router.get("/api/public-lists", async (req, res) => {
    const limit =
        req.query.limit === undefined ? 10 : parseInt(req.query.limit);
    const skip =
        req.query.page === undefined
            ? 0
            : (parseInt(req.query.page) - 1) * limit;
    try {
        let lists = await PublicLists.find({})
            .limit(limit)
            .skip(skip)
            .select(
                "name description likes reads item_count updatedAt createdAt"
            )
            .populate({
                path: "author",
                select: "username",
            })
            .exec();

        lists = lists.map((list) => list.partialList());
        return res.send(lists);
    } catch (err) {
        console.log("Error in reading public lists", err);
        return res.status(500).send();
    }
});

router.post("/api/public-lists", authenticate, async (req, res) => {
    try {
        let list = new PublicLists({
            ...req.body,
            author: req.user._id,
        });
        await list.save();

        list = await PublicLists.findById(list._id)
            .populate({
                path: "tags",
                select: "tag",
            })
            .populate({
                path: "author",
                select: "username",
            });
        return res.status(201).send(list.fullList());
    } catch (err) {
        console.log("Error occurred while creating a public lists", err);
        res.status(500).send();
    }
});

router.get("/api/public-lists/:id", async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id)
            .populate({
                path: "tags",
                select: "tag",
            })
            .populate({
                path: "author",
                select: "username",
            });
        if (list === null) {
            return res.status(404).send();
        }
        return res.send(list.fullList());
    } catch (err) {
        console.log("Error while reading a particular list", err);
        return res.status(500).send();
    }
});

router.patch("/api/public-lists/:id", authenticate, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "description", "items", "tags"];
    const updateValid = updates.every((update) =>
        allowedUpdates.includes(update)
    );
    if (!updateValid) {
        return res.status(422).send();
    }
    try {
        let list = await PublicLists.findOne({
            _id: req.params.id,
        });

        if (!list) {
            return res.status(404).send();
        }

        if (list.author.toString() !== req.user._id) {
            return res.status(401).send();
        }

        updates.forEach((update) => (list[update] = req.body[update]));
        list = await list.save();

        list = await list
            .populate({
                path: "tags",
                select: "tag",
            })
            .populate({
                path: "author",
                select: "username",
            })
            .execPopulate();

        return res.send(list.fullList());
    } catch (err) {
        console.log("Error occurred while updating the user", err);
        res.status(500).send({ error: err.message });
    }
});

router.get("/api/public-lists/:id/items", async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id, "items");
        if (list === null) {
            return res.status(404).send();
        }

        return res.send(list.items);
    } catch (err) {
        console.log(
            `Error occurred while reading items for ${req.params.id}\n`,
            err
        );
        return res.status(500).send();
    }
});

router.post("/api/public-lists/:id/items", authenticate, async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id);
        if (list === null) {
            return res.status(404).send();
        }
        if (list.author.toString() !== req.user._id) {
            return res.status(401).send();
        }
        const item = list.items.create({ ...req.body });
        list.items.push(item);
        await list.save();
        return res.status(201).send(item);
    } catch (err) {
        console.log("Error occurred while adding a new item", err);
        return res.status(500).send();
    }
});

router.get("/api/public-lists/:id/items/:itemId", async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id);
        if (list === null) {
            return res.status(404).send();
        }

        const item = list.items.id(req.params.itemId);
        if (item === null) {
            return res.status(404).send();
        }
        return res.send(item);
    } catch (err) {
        console.log("Error occurred while reading a list item", err);
        return res.status(500).send();
    }
});

router.patch(
    "/api/public-lists/:id/items/:itemId",
    authenticate,
    async (req, res) => {
        const updates = Object.keys(req.body);
        const allowedUpdates = ["name", "url", "icon_url"];
        const updateValid = updates.every((update) =>
            allowedUpdates.includes(update)
        );
        if (!updateValid) {
            return res.status(422).send();
        }
        try {
            const list = await PublicLists.findById(req.params.id);
            if (list === null) {
                return res.status(404).send();
            }
            if (list.author.toString() !== req.user._id) {
                return res.status(401).send();
            }
            const item = list.items.id(req.params.itemId);
            if (item === null) {
                return res.status(404).send();
            }
            item.set(req.body);
            await list.save();
            return res.send(item);
        } catch (err) {
            console.log("Error while updating list item", err);
            return res.status(500).send();
        }
    }
);

router.delete(
    "/api/public-lists/:id/items/:itemId",
    authenticate,
    async (req, res) => {
        try {
            const list = await PublicLists.findById(req.params.id);
            if (list === null) {
                return res.status(404).send();
            }
            if (list.author.toString() !== req.user._id) {
                return res.status(401).send();
            }
            const item = list.items.id(req.params.itemId);
            if (item === null) {
                return res.status(404).send();
            }
            item.remove();
            await list.save();

            return res.send(item);
        } catch (e) {
            console.log(
                `Error occurred while deleting item ${req.params.itemId} in list ${req.params.id}\n`,
                e
            );
            return res.status(500).send();
        }
    }
);

router.post(
    "/api/public-lists/:id/comments",
    authenticate,
    async (req, res) => {
        try {
            const list = await PublicLists.findById(req.params.id);
            if (list === null) {
                return res.status(404).send();
            }

            const body = req.body.body ? req.body.body.trim() : "";
            if (body.length === 0) {
                return res.status(400).send({
                    error: "body is required",
                });
            }
            let comment = new Comments({
                listID: req.params.id,
                userID: req.user._id,
                body,
            });

            await comment.save();

            comment = await Comments.findById(comment._id).populate({
                path: "userID",
                select: "username",
            });
            return res.send(comment);
        } catch (err) {
            console.log(
                `Error while saving a comment for ${req.params.id}`,
                err
            );
            return res.status(500).send();
        }
    }
);

router.get("/api/public-lists/:id/comments", async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id);
        if (list === null) {
            return res.status(404).send();
        }
        const comments = await Comments.find({ listID: list._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "userID",
                select: "username",
            });
        return res.send(comments);
    } catch (err) {
        console.log(
            `Error occurred while reading comments ${req.params.id}`,
            err
        );
        return res.status(500).send();
    }
});

router.get("/api/public-lists/:id/likes", async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id, "likes");
        if (list === null) {
            return res.status(404).send();
        }
        return res.send({ likes: list.likes });
    } catch (err) {
        console.log(
            `Error occurred while reading likes for ${req.params.id}\n`,
            err
        );
        return res.status(500).send();
    }
});

router.post("/api/public-lists/:id/likes", authenticate, async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id);
        if (list === null) {
            return res.status(404).send();
        }

        const count = await Likes.countDocuments({
            listID: req.params.id,
            userID: req.user._id,
        });
        if (count > 0) {
            return res.status(409).send();
        }
        const like = new Likes({
            userID: req.user._id,
            listID: req.params.id,
        });

        await like.save();
        return res.status(204).send();
    } catch (err) {
        console.log(`Error occurred while liking ${req.params.id}`, err);
        return res.status(404).send();
    }
});

router.delete("/api/public-lists/:id/likes", authenticate, async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id);
        if (list === null) {
            return res.status(404).send();
        }

        const like = await Likes.findOne({
            listID: req.params.id,
            userID: req.user._id,
        });

        if (like === null) {
            return res.status(409).send();
        }

        await like.remove();
        return res.status(204).send();
    } catch (err) {
        console.log(`Error while disliking list ${req.params.id}`, err);
        return res.status(404).send();
    }
});

router.post("/api/public-lists/:id/follow", authenticate, async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id);
        if (list === null) {
            return res.status(404).send();
        }
        const count = await Bookmarks.countDocuments({
            listID: req.params.id,
            userID: req.user._id,
        });
        if (count > 0) {
            return res.status(409).send();
        }
        const bookmark = new Bookmarks({
            userID: req.user._id,
            listID: req.params.id,
        });

        await bookmark.save();
        return res.status(204).send();
    } catch (err) {
        console.log("Error occurred while adding a bookmark", err);
        return res.status(500).send();
    }
});

router.delete(
    "/api/public-lists/:id/follow",
    authenticate,
    async (req, res) => {
        try {
            const list = await PublicLists.findById(req.params.id);
            if (list === null) {
                return res.status(404).send();
            }

            const bookmark = await Bookmarks.findOne({
                listID: req.params.id,
                userID: req.user._id,
            });

            if (bookmark === null) {
                return res.status(409).send();
            }

            await bookmark.remove();
            return res.status(204).send();
        } catch (err) {
            console.log("Error occurred while deleting a bookmark", err);
            return res.status(500).send();
        }
    }
);

export default router;
