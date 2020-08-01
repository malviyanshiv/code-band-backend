import mongoose from "mongoose";

const mongodb_url =
    process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/code-band-api";
mongoose.connect(mongodb_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});
