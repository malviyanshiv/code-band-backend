import mongoose from "mongoose";
import { ObjectID } from "mongodb";

// can be refactored
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    url: {
        type: String,
        required: true,
    },
    icon_url: {
        type: String,
    },
});

export const listSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        description: {
            type: String,
            maxlength: 200,
            trim: true,
        },
        author: {
            type: ObjectID,
            ref: "Users",
            required: true,
        },
        items: {
            type: [itemSchema],
        },
        tags: [
            {
                type: ObjectID,
                ref: "HashTags",
                select: false,
            },
        ],
    },
    {
        timestamps: true,
    }
);

listSchema.virtual("url").get(function () {
    return `/api/private-lists/${this.id}`;
});

listSchema.method("fullList", function () {
    const obj = this.toObject();
    obj.author.id = obj.__v = obj.id = undefined;
    return obj;
});

listSchema.method("partialList", function () {
    const obj = this.toObject();
    obj.author.id = undefined;
    obj.id = undefined;
    return obj;
});

listSchema.set("toObject", { virtual: true });
listSchema.set("toJSON", { virtual: true });

export default mongoose.model("PrivateLists", listSchema);
