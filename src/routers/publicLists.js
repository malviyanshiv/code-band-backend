import express from "express";
import PublicLists from "../models/PublicLists";
import Likes from "../models/Likes";
import Bookmarks from "../models/Bookmarks";
import authenticate from "../middleware/auth";
import Comments from "../models/Comments";

import {
    createListValidationRules,
    updateListValidationRules,
    listItemValidationRules,
    listItemUpdateValidationRules,
    commentValidationRules,
} from "../utils/validators/list";
import { validate } from "../utils/validators/validator";

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
        return res.send({
            success: true,
            message: "data found",
            data: {
                lists,
            },
        });
    } catch (err) {
        console.log("Error in reading public lists", err);
        return res.status(500).send({
            success: false,
            message: "server error occurred",
            error: {
                general: err.message,
            },
        });
    }
});

router.post(
    "/api/public-lists",
    authenticate,
    createListValidationRules(),
    validate,
    async (req, res) => {
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
            return res.status(201).send({
                success: true,
                message: "list created successfully",
                data: {
                    list: list.fullList(),
                },
            });
        } catch (err) {
            console.log("Error occurred while creating a public lists", err);
            return res.status(500).send({
                success: false,
                message: "server error occurred",
                error: {
                    general: err.message,
                },
            });
        }
    }
);

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
            return res.status(404).send({
                success: false,
                message: "list not found",
            });
        }
        return res.send({
            success: true,
            message: "data found",
            data: {
                list: list.fullList(),
            },
        });
    } catch (err) {
        console.log("Error while reading a particular list", err);
        return res.status(500).send({
            success: false,
            message: "server error occurred",
            error: {
                general: err.message,
            },
        });
    }
});

router.patch(
    "/api/public-lists/:id",
    authenticate,
    updateListValidationRules(),
    validate,
    async (req, res) => {
        const updates = Object.keys(req.body);
        const allowedUpdates = ["name", "description", "tags"];
        const updateValid = updates.every((update) =>
            allowedUpdates.includes(update)
        );
        if (!updateValid) {
            return res.status(422).send({
                success: false,
                errors: {
                    general: "some updates are not allowed",
                },
            });
        }
        try {
            let list = await PublicLists.findOne({
                _id: req.params.id,
            });

            if (!list) {
                return res.status(404).send({
                    success: false,
                    message: "list not found",
                });
            }

            if (list.author.toString() !== req.user._id) {
                return res.status(401).send({
                    success: false,
                    message: "user not authorized",
                });
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

            return res.send({
                success: true,
                message: "list updated successfully",
                data: {
                    list: list.fullList(),
                },
            });
        } catch (err) {
            console.log("Error occurred while updating the user", err);
            return res.status(500).send({
                success: false,
                message: "server error occurred",
                error: {
                    general: err.message,
                },
            });
        }
    }
);

router.get("/api/public-lists/:id/items", async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id, "items");
        if (list === null) {
            return res.status(404).send({
                success: false,
                message: "list not found",
            });
        }

        return res.send({
            success: true,
            message: "data found",
            data: {
                items: list.items,
            },
        });
    } catch (err) {
        console.log(
            `Error occurred while reading items for ${req.params.id}\n`,
            err
        );
        return res.status(500).send({
            success: false,
            message: "server error occurred",
            error: {
                general: err.message,
            },
        });
    }
});

router.post(
    "/api/public-lists/:id/items",
    authenticate,
    listItemValidationRules(),
    validate,
    async (req, res) => {
        try {
            const list = await PublicLists.findById(req.params.id);
            if (list === null) {
                return res.status(404).send({
                    success: false,
                    message: "list not found",
                });
            }
            if (list.author.toString() !== req.user._id) {
                return res.status(401).send({
                    success: false,
                    message: "user not authorized",
                });
            }
            const item = list.items.create({ ...req.body });
            list.items.push(item);
            await list.save();
            return res.status(201).send({
                success: true,
                message: "item created successfully",
                data: {
                    item,
                },
            });
        } catch (err) {
            console.log("Error occurred while adding a new item", err);
            return res.status(500).send({
                success: false,
                message: "server error occurred",
                error: {
                    general: err.message,
                },
            });
        }
    }
);

router.get("/api/public-lists/:id/items/:itemId", async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id);
        if (list === null) {
            return res.status(404).send({
                success: false,
                message: "list not found",
            });
        }

        const item = list.items.id(req.params.itemId);
        if (item === null) {
            return res.status(404).send({
                success: false,
                message: "item not found",
            });
        }
        return res.send({
            success: true,
            message: "data found",
            data: {
                item,
            },
        });
    } catch (err) {
        console.log("Error occurred while reading a list item", err);
        return res.status(500).send({
            success: false,
            message: "server error occurred",
            error: {
                general: err.message,
            },
        });
    }
});

router.patch(
    "/api/public-lists/:id/items/:itemId",
    authenticate,
    listItemUpdateValidationRules(),
    validate,
    async (req, res) => {
        const updates = Object.keys(req.body);
        const allowedUpdates = ["name", "url", "icon_url"];
        const updateValid = updates.every((update) =>
            allowedUpdates.includes(update)
        );
        if (!updateValid) {
            return res.status(422).send({
                success: false,
                errors: {
                    general: "some updates are not allowed",
                },
            });
        }
        try {
            const list = await PublicLists.findById(req.params.id);
            if (list === null) {
                return res.status(404).send({
                    success: false,
                    message: "list not found",
                });
            }
            if (list.author.toString() !== req.user._id) {
                return res.status(401).send({
                    success: false,
                    message: "user not authorized",
                });
            }
            const item = list.items.id(req.params.itemId);
            if (item === null) {
                return res.status(404).send({
                    success: false,
                    message: "item not found",
                });
            }
            item.set(req.body);
            await list.save();
            return res.send({
                success: true,
                message: "item updated successfully",
                data: {
                    item,
                },
            });
        } catch (err) {
            console.log("Error while updating list item", err);
            return res.status(500).send({
                success: false,
                message: "server error occurred",
                error: {
                    general: err.message,
                },
            });
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
                return res.status(404).send({
                    success: false,
                    message: "list not found",
                });
            }
            if (list.author.toString() !== req.user._id) {
                return res.status(401).send({
                    success: false,
                    message: "user not authorized",
                });
            }
            const item = list.items.id(req.params.itemId);
            if (item === null) {
                return res.status(404).send({
                    success: false,
                    message: "item not found",
                });
            }
            item.remove();
            await list.save();

            return res.send({
                success: true,
                message: "item deleted successfully",
                data: {
                    item,
                },
            });
        } catch (err) {
            console.log(
                `Error occurred while deleting item ${req.params.itemId} in list ${req.params.id}\n`,
                err
            );
            return res.status(500).send({
                success: false,
                message: "server error occurred",
                error: {
                    general: err.message,
                },
            });
        }
    }
);

router.post(
    "/api/public-lists/:id/comments",
    authenticate,
    commentValidationRules(),
    validate,
    async (req, res) => {
        try {
            const list = await PublicLists.findById(req.params.id);
            if (list === null) {
                return res.status(404).send({
                    success: false,
                    message: "list not found",
                });
            }

            const body = req.body.body;

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
            return res.send({
                success: true,
                message: "comment created successfully",
                data: {
                    comment,
                },
            });
        } catch (err) {
            console.log(
                `Error while saving a comment for ${req.params.id}`,
                err
            );
            return res.status(500).send({
                success: false,
                message: "server error occurred",
                error: {
                    general: err.message,
                },
            });
        }
    }
);

router.get("/api/public-lists/:id/comments", async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id);
        if (list === null) {
            return res.status(404).send({
                success: false,
                message: "list not found",
            });
        }
        const comments = await Comments.find({ listID: list._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "userID",
                select: "username",
            });
        return res.send({
            success: true,
            message: "data found",
            data: {
                comments,
            },
        });
    } catch (err) {
        console.log(
            `Error occurred while reading comments ${req.params.id}`,
            err
        );
        return res.status(500).send({
            success: false,
            message: "server error occurred",
            error: {
                general: err.message,
            },
        });
    }
});

router.get("/api/public-lists/:id/likes", async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id, "likes");
        if (list === null) {
            return res.status(404).send({
                success: false,
                message: "list not found",
            });
        }
        return res.send({
            success: true,
            message: "data found",
            data: {
                likes: list.likes,
            },
        });
    } catch (err) {
        console.log(
            `Error occurred while reading likes for ${req.params.id}\n`,
            err
        );
        return res.status(500).send({
            success: false,
            message: "server error occurred",
            error: {
                general: err.message,
            },
        });
    }
});

router.post("/api/public-lists/:id/likes", authenticate, async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id);
        if (list === null) {
            return res.status(404).send({
                success: false,
                message: "list not found",
            });
        }

        const count = await Likes.countDocuments({
            listID: req.params.id,
            userID: req.user._id,
        });
        if (count > 0) {
            return res.status(409).send({
                success: false,
                message: "user has already liked",
            });
        }
        const like = new Likes({
            userID: req.user._id,
            listID: req.params.id,
        });

        await like.save();
        return res.status(204).send({
            success: true,
            message: "user has liked successfully",
        });
    } catch (err) {
        console.log(`Error occurred while liking ${req.params.id}`, err);
        return res.status(500).send({
            success: false,
            message: "server error occurred",
            error: {
                general: err.message,
            },
        });
    }
});

router.delete("/api/public-lists/:id/likes", authenticate, async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id);
        if (list === null) {
            return res.status(404).send({
                success: false,
                message: "list not found",
            });
        }

        const like = await Likes.findOne({
            listID: req.params.id,
            userID: req.user._id,
        });

        if (like === null) {
            return res.status(409).send({
                success: false,
                message: "user has not liked this list",
            });
        }

        await like.remove();
        return res.status(204).send({
            success: true,
            message: "like removed successfully",
        });
    } catch (err) {
        console.log(`Error while disliking list ${req.params.id}`, err);
        return res.status(500).send({
            success: false,
            message: "server error occurred",
            error: {
                general: err.message,
            },
        });
    }
});

router.post("/api/public-lists/:id/follow", authenticate, async (req, res) => {
    try {
        const list = await PublicLists.findById(req.params.id);
        if (list === null) {
            return res.status(404).send({
                success: false,
                message: "list not found",
            });
        }
        const count = await Bookmarks.countDocuments({
            listID: req.params.id,
            userID: req.user._id,
        });
        if (count > 0) {
            return res.status(409).send({
                success: false,
                message: "user has already followed",
            });
        }
        const bookmark = new Bookmarks({
            userID: req.user._id,
            listID: req.params.id,
        });

        await bookmark.save();
        return res.status(204).send({
            success: true,
            message: "successfully followed list",
        });
    } catch (err) {
        console.log("Error occurred while adding a bookmark", err);
        return res.status(500).send({
            success: false,
            message: "server error occurred",
            error: {
                general: err.message,
            },
        });
    }
});

router.delete(
    "/api/public-lists/:id/follow",
    authenticate,
    async (req, res) => {
        try {
            const list = await PublicLists.findById(req.params.id);
            if (list === null) {
                return res.status(404).send({
                    success: false,
                    message: "list not found",
                });
            }

            const bookmark = await Bookmarks.findOne({
                listID: req.params.id,
                userID: req.user._id,
            });

            if (bookmark === null) {
                return res.status(409).send({
                    success: false,
                    message: "user has not followed the list",
                });
            }

            await bookmark.remove();
            return res.status(204).send({
                success: true,
                message: "successfully unfollowed the list",
            });
        } catch (err) {
            console.log("Error occurred while deleting a bookmark", err);
            return res.status(500).send({
                success: false,
                message: "server error occurred",
                error: {
                    general: err.message,
                },
            });
        }
    }
);

export default router;
