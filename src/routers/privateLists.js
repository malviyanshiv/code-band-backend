import express from "express";
import PrivateLists from "../models/PrivateLists";
import authenticate from "../middleware/auth";

import {
    createListValidationRules,
    updateListValidationRules,
    listItemValidationRules,
    listItemUpdateValidationRules,
} from "../utils/validators/list";
import { validate } from "../utils/validators/validator";

const router = express.Router();

router.post(
    "/api/private-lists",
    authenticate,
    createListValidationRules(),
    validate,
    async (req, res) => {
        try {
            let list = new PrivateLists({
                ...req.body,
                author: req.user._id,
            });
            await list.save();
            list = await PrivateLists.findById(list._id)
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
                    lists: list.fullList(),
                },
            });
        } catch (err) {
            console.log("Error occurred while creating a private lists", err);
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

router.get("/api/private-lists/:id", authenticate, async (req, res) => {
    try {
        const list = await PrivateLists.findById(req.params.id)
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
        if (list.author._id.toString() !== req.user._id) {
            return res.status(401).send({
                success: false,
                message: "user not authorized",
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
    "/api/private-lists/:id",
    authenticate,
    updateListValidationRules,
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
                message: "some updates not allowed",
            });
        }
        try {
            let list = await PrivateLists.findOne({
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
            console.log("Error occurred while updating the private lists", err);
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

router.get("/api/private-lists/:id/items", async (req, res) => {
    try {
        const list = await PrivateLists.findById(req.params.id, "items");
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
    "/api/private-lists/:id/items",
    authenticate,
    listItemValidationRules(),
    validate,
    async (req, res) => {
        try {
            const list = await PrivateLists.findById(req.params.id);
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
            console.log(
                "Error occurred while adding a new item in private lists",
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

router.get(
    "/api/private-lists/:id/items/:itemId",
    authenticate,
    async (req, res) => {
        try {
            const list = await PrivateLists.findById(req.params.id);
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
            return res.send({
                success: true,
                message: "data found",
                data: {
                    item,
                },
            });
        } catch (err) {
            console.log(
                "Error occurred while reading a private lists item",
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

router.patch(
    "/api/private-lists/:id/items/:itemId",
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
                message: "some updated are not allowed",
            });
        }
        try {
            const list = await PrivateLists.findById(req.params.id);
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
    "/api/private-lists/:id/items/:itemId",
    authenticate,
    async (req, res) => {
        try {
            const list = await PrivateLists.findById(req.params.id);
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
                `Error occurred while deleting item ${req.params.itemId} in private list ${req.params.id}\n`,
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

export default router;
