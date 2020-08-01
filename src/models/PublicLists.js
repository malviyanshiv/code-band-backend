import mongoose from "mongoose";
import { ObjectID } from "mongodb";

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

const listSchema = new mongoose.Schema(
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
        likes: {
            type: Number,
            default: 0,
        },
        reads: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

listSchema.virtual("url").get(function () {
    return `/api/public-lists/${this.id}`;
});

listSchema.virtual("item_count").get(function () {
    return this.items === undefined ? 0 : this.items.lenght;
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

listSchema.set("toObject", { virtuals: true });
listSchema.set("toJSON", { virtuals: true });

export default mongoose.model("PublicLists", listSchema);
