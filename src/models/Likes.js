import mongoose from "mongoose";
import { ObjectID } from "mongodb";
import PublicLists from "./PublicLists";

const likeSchema = new mongoose.Schema({
    listID: {
        type: ObjectID,
        ref: "PublicLists",
        required: true,
    },
    userID: {
        type: ObjectID,
        ref: "Users",
        required: true,
    },
});

likeSchema.pre("save", async function (next) {
    const like = this;
    try {
        const list = await PublicLists.findByIdAndUpdate(like.listID, {
            $inc: { likes: 1 },
        });
        if (list === null) {
            return next(new Error("Band with given ID doesn't exist"));
        }
        next();
    } catch (err) {
        console.log("An unexpected error occurred\n", err);
        next(err);
    }
});

likeSchema.pre("remove", async function (next) {
    const like = this;
    try {
        const list = await PublicLists.findByIdAndUpdate(like.listID, {
            $inc: { likes: -1 },
        });
        if (list === null) {
            return next(new Error("Band with given ID doesn't exist"));
        }
        next();
    } catch (err) {
        console.log("An unexpected error occurred\n", err);
        next(err);
    }
});

export default mongoose.model("Likes", likeSchema);
