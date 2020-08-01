import mongoose from "mongoose";
import { ObjectID } from "mongodb";

const bookmarkSchema = new mongoose.Schema({
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

// bookmarkSchema.pre("save", async function (next) {
//     const bookmark = this;
//     try {
//         const band = await Bands.findByIdAndUpdate(bookmark.bandID, {
//             $inc: { follow: 1 },
//         });
//         if (band === null) {
//             return next(new Error("Band with given ID doesn't exist"));
//         }
//         next();
//     } catch (e) {
//         console.log("An unpexpected error occurred\n", e);
//         next(err);
//     }
// });

// bookmarkSchema.pre("remove", async function (next) {
//     const bookmark = this;
//     try {
//         const band = await Bands.findByIdAndUpdate(bookmark.bandID, {
//             $inc: { follow: -1 },
//         });
//         if (band === null) {
//             return next(new Error("Band with given ID doesn't exists"));
//         }
//         next();
//     } catch (e) {
//         console.log("An unexpected error occurred\n", e);
//         next(e);
//     }
// });

export default mongoose.model("Bookmarks", bookmarkSchema);
