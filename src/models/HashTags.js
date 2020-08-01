import mongoose from "mongoose";

const hashTagSchema = new mongoose.Schema({
    tag: {
        type: String,
        trim: true,
        lowercase: true,
    },
});

export default mongoose.model("HashTags", hashTagSchema);
