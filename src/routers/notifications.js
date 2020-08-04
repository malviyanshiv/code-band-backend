import express from "express";
import Notifications from "../models/Notifications";
import authenticate from "../middleware/auth";

const router = new express.Router();

/* Notification API
/notifications?type={}&...
/notifications/:id

-> creating new notifications on updating a list
*/

router.get("/api/notifications", authenticate, async (req, res) => {
    const limit =
        req.query.limit === undefined ? 10 : parseInt(req.query.limit);
    const skip =
        req.query.page === undefined
            ? 0
            : (parseInt(req.query.page) - 1) * limit;
    const filters =
        req.query.type === undefined ? {} : { type: parseInt(req.query.type) };

    try {
        const notifications = await Notifications.find({
            ...filters,
            owner: req.user._id,
        })
            .limit(limit)
            .skip(skip)
            .exec();
        return res.send({
            success: true,
            message: "data found",
            data: {
                notifications,
            },
        });
    } catch (err) {
        console.log("Error occurred while reading notifications", err);
        return res.status(500).send({
            success: false,
            message: "server error occurred",
            error: {
                general: err.message,
            },
        });
    }
});

router.get("/api/notifications/:id", authenticate, async (req, res) => {
    try {
        const notification = await Notifications.findById(req.params.id);
        if (notification === null) {
            return res.status(404).send({
                success: false,
                message: "notification not found",
            });
        }
        if (notification.owner.toString() !== req.user._id) {
            return res.status(401).send({
                success: false,
                message: "user not authorized",
            });
        }

        return res.send({
            success: true,
            message: "data found",
            data: {
                notification,
            },
        });
    } catch (err) {
        console.log(
            "Error occurred while reading a specific notification",
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

export default router;
