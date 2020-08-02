import mongoose from "mongoose";
import { ObjectID } from "mongodb";
import PublicLists from "./PublicLists";

const commentSchema = new mongoose.Schema(
    {
        userID: {
            type: ObjectID,
            ref: "Users",
            required: true,
        },
        listID: {
            type: ObjectID,
            ref: "PublicLists",
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

commentSchema.pre("save", async function (next) {
    const comment = this;
    try {
        const list = await PublicLists.findByIdAndUpdate(comment.listID, {
            $inc: { commentCount: 1 },
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

commentSchema.methods.toJSON = function () {
    var comment = this.toObject();
    delete comment.listID;
    delete comment.__v;
    delete comment.userID.id;

    return comment;
};

export default mongoose.model("Comments", commentSchema);
