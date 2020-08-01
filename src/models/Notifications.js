import mongoose from "mongoose";
import { ObjectID } from "mongodb";

const notificationSchema = new mongoose.Schema({
    owner: {
        type: ObjectID,
        ref: "Users",
    },
    type: {
        type: Number,
        required: true,
        enum: [0, 1, 2, 3],
    },
    description: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

//add a virtual property url

export default mongoose.model("Notifications", notificationSchema);
